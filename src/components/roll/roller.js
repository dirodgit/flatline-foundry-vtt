import { FLATLINE } from '@system/config.js';
import { ATTRIBUTES, DIE_SCORES } from '@system/constants.js';

/**
 * Motor de rolagem YZE para o FLATLINE.
 * Gerencia rolagens de Atributo + Perícia + Equipamento,
 * Forçar, glitches e geração de card de chat.
 */
export class FlatlineRoll {

  /**
   * @param {FlatlineActor} actor
   * @param {string} attributeKey   - ex: 'forca'
   * @param {string|null} skillKey  - ex: 'lutar' (null = sem perícia)
   * @param {Object} options
   * @param {number}  [options.modifier=0]      - modificador total (+/- passos no dado)
   * @param {number}  [options.equipBonus=0]    - tamanho do dado de equipamento (ex: 8)
   * @param {boolean} [options.canPush=true]    - se pode Forçar
   * @param {string}  [options.flavor]          - texto extra no chat
   */
  constructor(actor, attributeKey, skillKey = null, options = {}) {
    this.actor        = actor;
    this.attributeKey = attributeKey;
    this.skillKey     = skillKey;
    this.modifier     = options.modifier     ?? 0;
    this.equipBonus   = options.equipBonus   ?? 0;
    this.canPush      = options.canPush      ?? true;
    this.flavor       = options.flavor       ?? '';
    this._pushed      = false;
    this._dice        = [];     // resultado dos dados
    this._successes   = 0;
    this._glitches    = { attribute: 0, skill: 0, equip: 0 };
  }

  /* ------------------------------------------ */
  /*  Propriedades derivadas                    */
  /* ------------------------------------------ */

  /** Tamanho do dado de atributo, após modificador */
  get attributeDieSize() {
    const base = this.actor.system.attributes[this.attributeKey]?.value ?? 6;
    return this._applyModifier(base, this.modifier);
  }

  /** Tamanho do dado de perícia (0 se não tem perícia) */
  get skillDieSize() {
    if (!this.skillKey) return 0;
    return this.actor.system.skills[this.skillKey]?.value ?? 0;
  }

  /* ------------------------------------------ */
  /*  Execução                                  */
  /* ------------------------------------------ */

  /**
   * Executa a rolagem e exibe o diálogo se necessário.
   * @returns {Promise<FlatlineRoll>}
   */
  async execute() {
    await this._roll();
    await this._toChat();
    return this;
  }

  /**
   * Rola os dados e calcula sucessos/glitches.
   * @private
   */
  async _roll() {
    const attrSize  = this.attributeDieSize;
    const skillSize = this.skillDieSize;
    const equipSize = this.equipBonus;

    const formula = this._buildFormula(attrSize, skillSize, equipSize);
    const roll    = await new Roll(formula).evaluate();

    this._rawRoll = roll;
    this._parse(roll, attrSize, skillSize, equipSize);
  }

  /**
   * Constrói a fórmula de dados para o Roll da Foundry.
   * @private
   */
  _buildFormula(attrSize, skillSize, equipSize) {
    const parts = [];
    if (attrSize  > 0) parts.push(`1d${attrSize}`);
    if (skillSize > 0) parts.push(`1d${skillSize}`);
    if (equipSize > 0) parts.push(`1d${equipSize}`);
    return parts.length ? parts.join(' + ') : '1d6';
  }

  /**
   * Lê os resultados dos dados e calcula sucessos e glitches.
   * @param {Roll} roll
   * @param {number} attrSize
   * @param {number} skillSize
   * @param {number} equipSize
   * @private
   */
  _parse(roll, attrSize, skillSize, equipSize) {
    this._dice = [];
    this._successes = 0;
    this._glitches  = { attribute: 0, skill: 0, equip: 0 };

    const terms = roll.terms.filter(t => t instanceof foundry.dice.terms.Die || t.faces);
    let idx = 0;

    const processDie = (die, type) => {
      for (const result of die.results) {
        const val     = result.result;
        const isGlitch   = val === 1;
        const successes  = val >= 10 ? 2 : val >= 6 ? 1 : 0;
        this._dice.push({ type, value: val, successes, isGlitch, size: die.faces });
        this._successes += successes;
        if (isGlitch) this._glitches[type]++;
      }
    };

    if (attrSize  > 0 && terms[idx]) { processDie(terms[idx], 'attribute'); idx++; }
    if (skillSize > 0 && terms[idx]) { processDie(terms[idx], 'skill');     idx++; }
    if (equipSize > 0 && terms[idx]) { processDie(terms[idx], 'equip');     idx++; }
  }

  /* ------------------------------------------ */
  /*  Forçar                                    */
  /* ------------------------------------------ */

  /**
   * Permite ao jogador Forçar a rolagem — re-rola dados que não mostraram 1.
   * Glitches geram Condições ou dano ao equipamento.
   * Também concede +1 RAM ao ator.
   * @returns {Promise<FlatlineRoll>}
   */
  async push() {
    if (!this.canPush || this._pushed) return this;
    this._pushed = true;

    // +1 RAM ao Forçar
    await this.actor.addRam(1);

    // Aplica custo de glitches da rolagem ANTERIOR
    await this._applyGlitchCosts();

    // Re-rola dados que não mostraram 1 (exceto equipamento que já teve glitch)
    const newDice = [];
    for (const die of this._dice) {
      if (die.isGlitch) {
        newDice.push(die); // mantém glitches
      } else {
        const reroll = await new Roll(`1d${die.size}`).evaluate();
        const val    = reroll.terms[0].results[0].result;
        const successes  = val >= 10 ? 2 : val >= 6 ? 1 : 0;
        const isGlitch   = val === 1;
        newDice.push({ ...die, value: val, successes, isGlitch });
      }
    }

    this._dice = newDice;
    this._successes = newDice.reduce((sum, d) => sum + d.successes, 0);
    this._glitches  = { attribute: 0, skill: 0, equip: 0 };
    for (const d of newDice) {
      if (d.isGlitch) this._glitches[d.type]++;
    }

    // Aplica custo de glitches da nova rolagem
    await this._applyGlitchCosts();

    await this._toChat(true);
    return this;
  }

  /**
   * Aplica o custo de glitches:
   * - dado de Força/Agilidade → Condição Física
   * - dado de Astúcia/Empatia → Condição Mental
   * - dado de Equipamento → -1 Confiabilidade no item
   * @private
   */
  async _applyGlitchCosts() {
    const physAttrs = [ATTRIBUTES.FORCA, ATTRIBUTES.AGILIDADE];
    const mentAttrs = [ATTRIBUTES.ASTUCIA, ATTRIBUTES.EMPATIA];
    const linkedAttr = FLATLINE.skillMap[this.skillKey] ?? null;

    // Glitch no dado de Atributo
    if (this._glitches.attribute > 0) {
      const tipo = physAttrs.includes(this.attributeKey) ? 'fisica' : 'mental';
      await this.actor.applyCondition(tipo, game.i18n.localize('FLATLINE.Condition.FromForce'));
    }
    // Glitch no dado de Perícia — usa o atributo vinculado à perícia
    if (this._glitches.skill > 0 && linkedAttr) {
      const tipo = physAttrs.includes(linkedAttr) ? 'fisica' : 'mental';
      await this.actor.applyCondition(tipo, game.i18n.localize('FLATLINE.Condition.FromForce'));
    }
    // Glitch no dado de Equipamento — notifica (item tratado externamente)
    if (this._glitches.equip > 0) {
      ui.notifications.warn(game.i18n.format('FLATLINE.Item.DurabilityLost', { actor: this.actor.name }));
    }
  }

  /* ------------------------------------------ */
  /*  Chat Card                                 */
  /* ------------------------------------------ */

  /**
   * Envia o resultado para o chat do Foundry.
   * @param {boolean} [isPush=false]
   * @private
   */
  async _toChat(isPush = false) {
    const template = 'systems/flatline/templates/chat/roll-card.hbs';
    const attrLabel  = game.i18n.localize(FLATLINE.attributeLabels[this.attributeKey] ?? this.attributeKey);
    const skillLabel = this.skillKey
      ? game.i18n.localize(FLATLINE.skillLabels[this.skillKey] ?? this.skillKey)
      : null;

    const html = await renderTemplate(template, {
      actor:      this.actor,
      dice:       this._dice,
      successes:  this._successes,
      glitches:   this._glitches,
      attrLabel,
      skillLabel,
      modifier:   this.modifier,
      flavor:     this.flavor,
      isPush,
      canPush:    this.canPush && !this._pushed,
      rollId:     this._rollId ?? (this._rollId = foundry.utils.randomID()),
    });

    const msg = await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content: html,
      type:    CONST.CHAT_MESSAGE_TYPES?.OTHER ?? 0,
      flags:   {
        flatline: {
          rollData: {
            rollId:       this._rollId,
            actorId:      this.actor.id,
            attributeKey: this.attributeKey,
            skillKey:     this.skillKey,
            modifier:     this.modifier,
            equipBonus:   this.equipBonus,
            pushed:       isPush,
          },
        },
      },
    });
    this._chatMessage = msg;
  }

  /* ------------------------------------------ */
  /*  Utilitários                               */
  /* ------------------------------------------ */

  /**
   * Ajusta o tamanho do dado conforme modificador.
   * Escala: 6→8→10→12 (passos positivos) / 12→10→8→6 (passos negativos).
   * @param {number} baseSize
   * @param {number} modifier
   * @returns {number}
   * @private
   */
  _applyModifier(baseSize, modifier) {
    const scale = [6, 8, 10, 12];
    let idx = scale.indexOf(baseSize);
    if (idx === -1) idx = 0;
    idx = Math.max(0, Math.min(scale.length - 1, idx + modifier));
    return scale[idx];
  }
}

/* ------------------------------------------ */
/*  Chat Button Handler                       */
/* ------------------------------------------ */

/**
 * Intercepta cliques no botão "Forçar" no chat.
 * @param {ChatMessage} message
 * @param {jQuery} html
 */
export function activateRollChatListeners(message, html) {
  html.on('click', '.flatline-push-btn', async (event) => {
    event.preventDefault();
    const flags = message.flags?.flatline?.rollData;
    if (!flags) return;

    const actor = game.actors.get(flags.actorId);
    if (!actor) return;
    if (!actor.isOwner) return;

    const roll = new FlatlineRoll(actor, flags.attributeKey, flags.skillKey, {
      modifier:   flags.modifier,
      equipBonus: flags.equipBonus,
    });
    // Reconstrói o estado para Forçar a partir do push
    roll._pushed   = false;
    roll._rollId   = flags.rollId;
    // Re-rola e marca como Forçada
    await roll._roll();
    await roll.push();
  });
}

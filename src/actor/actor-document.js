import { FLATLINE } from '@system/config.js';
import { ACTOR_TYPES, ATTRIBUTES, SKILLS, SKILL_ATTRIBUTE_MAP, DIE_SCORES } from '@system/constants.js';

/**
 * Documento de Actor do sistema FLATLINE.
 * @extends {Actor}
 */
export default class FlatlineActor extends Actor {

  /* ------------------------------------------ */
  /*  Propriedades                              */
  /* ------------------------------------------ */

  get attributes() { return this.system.attributes; }
  get skills()     { return this.system.skills; }
  get conditions() { return this.system.conditions; }
  get degradation(){ return this.system.degradation; }

  get isVeiculo()   { return this.type === ACTOR_TYPES.VEICULO; }
  get isCorredor()  { return this.type === ACTOR_TYPES.CORREDOR; }

  /**
   * Penalidade total de Condições Físicas.
   * @type {number}
   */
  get physicalPenalty() {
    if (!this.system.conditions?.fisica) return 0;
    const f = this.system.conditions.fisica;
    let pen = 0;
    if (f.leve?.active)     pen += 1;
    if (f.moderada?.active) pen += 2;
    if (f.severa?.active)   pen += 3;
    return pen;
  }

  /**
   * Penalidade total de Condições Mentais.
   * @type {number}
   */
  get mentalPenalty() {
    if (!this.system.conditions?.mental) return 0;
    const m = this.system.conditions.mental;
    let pen = 0;
    if (m.leve?.active)     pen += 1;
    if (m.moderada?.active) pen += 2;
    if (m.severa?.active)   pen += 3;
    return pen;
  }

  /**
   * Se o ator está Quebrado (física ou mentalmente).
   * @type {boolean}
   */
  get isBroken() {
    const c = this.system.conditions;
    if (!c) return false;
    return c.fisica?.broken || c.mental?.broken;
  }

  /**
   * Dado de Degradação atual (D6–D12) baseado no nível da trilha.
   * @type {number}
   */
  get degradationDie() {
    const level = this.system.degradation?.value ?? 0;
    return FLATLINE.degradationDie[Math.min(level, 12)];
  }

  /**
   * Limiar de RAM — maior valor entre Força e Astúcia naturais.
   * @type {number}
   */
  get ramThreshold() {
    const forca   = this.system.attributes?.forca?.value   ?? 6;
    const astucia = this.system.attributes?.astucia?.value ?? 6;
    const maior   = Math.max(forca, astucia);
    return FLATLINE.ramThreshold[maior] ?? 6;
  }

  /* ------------------------------------------ */
  /*  Preparação de Dados                       */
  /* ------------------------------------------ */

  /** @override */
  prepareData() {
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    super.prepareBaseData();
  }

  /** @override */
  prepareDerivedData() {
    super.prepareDerivedData();
    if (this.type === ACTOR_TYPES.CORREDOR) this._prepareCorredorData();
    if (this.type === ACTOR_TYPES.VEICULO)  this._prepareVeiculoData();
  }

  /**
   * Prepara dados derivados do Corredor.
   * @private
   */
  _prepareCorredorData() {
    // Capacidade de carga = tamanho do dado de Força
    const forcaVal = this.system.attributes?.forca?.value ?? 6;
    this.system.carga = { max: forcaVal };

    // Limiar de RAM derivado
    this.system.ramThreshold = this.ramThreshold;

    // Penalidades de Condição nos atributos efetivos
    this._applyConditionPenalties();
  }

  /**
   * Aplica penalidades de Condição aos atributos efetivos.
   * @private
   */
  _applyConditionPenalties() {
    const attrs = this.system.attributes;
    if (!attrs) return;
    const phys = this.physicalPenalty;
    const ment = this.mentalPenalty;

    const physAttrs = [ATTRIBUTES.FORCA, ATTRIBUTES.AGILIDADE];
    const mentAttrs = [ATTRIBUTES.ASTUCIA, ATTRIBUTES.EMPATIA];

    for (const attr of physAttrs) {
      if (attrs[attr]) attrs[attr].penalty = phys;
    }
    for (const attr of mentAttrs) {
      if (attrs[attr]) attrs[attr].penalty = ment;
    }
  }

  /**
   * Prepara dados derivados do Veículo.
   * @private
   */
  _prepareVeiculoData() {
    // nada especial por agora
  }

  /* ------------------------------------------ */
  /*  Métodos de Jogo                           */
  /* ------------------------------------------ */

  /**
   * Aplica uma Condição ao ator.
   * @param {'fisica'|'mental'} tipo
   * @param {string} label  - Descrição narrativa da condição
   * @returns {Promise}
   */
  async applyCondition(tipo, label = '') {
    const conditions = foundry.utils.deepClone(this.system.conditions);
    const cond = conditions[tipo];
    const grades = ['leve', 'moderada', 'severa'];

    // Encontra o próximo grau vazio
    let applied = null;
    for (const grade of grades) {
      if (!cond[grade].active) {
        cond[grade].active = true;
        cond[grade].label  = label || game.i18n.localize(`FLATLINE.Condition.${grade}`);
        applied = grade;
        break;
      }
    }

    // Se todos os graus estão ativos → Quebrado
    if (!applied) {
      cond.broken = true;
      // Notifica para rolar Lesão Crítica
      ui.notifications.warn(game.i18n.format('FLATLINE.Broken', { name: this.name, tipo }));
      await this._onBroken(tipo);
    }

    return this.update({ [`system.conditions`]: conditions });
  }

  /**
   * Remove a Condição mais severa ativa de um tipo.
   * @param {'fisica'|'mental'} tipo
   * @returns {Promise}
   */
  async removeCondition(tipo) {
    const conditions = foundry.utils.deepClone(this.system.conditions);
    const cond = conditions[tipo];
    const grades = ['severa', 'moderada', 'leve'];

    for (const grade of grades) {
      if (cond[grade].active) {
        cond[grade].active = false;
        cond[grade].label  = '';
        break;
      }
    }

    return this.update({ 'system.conditions': conditions });
  }

  /**
   * Callback quando o ator fica Quebrado — rola Lesão Crítica.
   * @param {'fisica'|'mental'} tipo
   * @private
   */
  async _onBroken(tipo) {
    // Incrementa Degradação
    const currentDeg = this.system.degradation?.value ?? 0;
    await this.update({ 'system.degradation.value': currentDeg + 1 });
    // Lança chat card para Lesão Crítica
    const d66 = await new Roll('1d6*10 + 1d6').evaluate();
    const result = Math.min(d66.total, 66);
    const msg = await d66.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor:  game.i18n.format('FLATLINE.CriticalInjury.Roll', { tipo }),
    });
  }

  /**
   * Adiciona RAM ao ator.
   * @param {number} amount
   * @returns {Promise}
   */
  async addRam(amount = 1) {
    const current = this.system.resources?.ram?.value ?? 0;
    const max     = FLATLINE.ramMax;
    const newVal  = Math.min(current + amount, max);
    return this.update({ 'system.resources.ram.value': newVal });
  }

  /**
   * Gasta RAM do ator.
   * @param {number} amount
   * @returns {Promise}
   */
  async spendRam(amount) {
    const current = this.system.resources?.ram?.value ?? 0;
    if (amount > current) {
      ui.notifications.warn(game.i18n.localize('FLATLINE.RAM.Insufficient'));
      return false;
    }
    await this.update({ 'system.resources.ram.value': current - amount });

    // Verifica se ultrapassou o Limiar
    const threshold = this.ramThreshold;
    if (amount > threshold) {
      const excess = amount - threshold;
      const points = Math.floor(excess / 4);
      if (points > 0) {
        ui.notifications.warn(game.i18n.format('FLATLINE.RAM.ThresholdExceeded', { points }));
        await this._rollDegradation(points);
      }
    }
    return true;
  }

  /**
   * Rola o Dado de Degradação e aplica efeitos.
   * @param {number} [times=1]
   * @returns {Promise}
   */
  async _rollDegradation(times = 1) {
    const die = this.degradationDie;
    for (let i = 0; i < times; i++) {
      const roll = await new Roll(`1d${die}`).evaluate();
      await roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        flavor:  game.i18n.localize('FLATLINE.Degradation.Roll'),
      });
    }
  }

  /**
   * Rola atributo + perícia, com suporte a Forçar.
   * Retorna o resultado para ser exibido no chat.
   *
   * @param {string} attribute  - chave do atributo (ex: 'forca')
   * @param {string} [skill]    - chave da perícia (opcional)
   * @param {Object} [options]
   * @param {number} [options.modifier=0]
   * @param {boolean} [options.canPush=true]
   * @returns {Promise<FlatlineRoll>}
   */
  async rollSkill(attribute, skill = null, options = {}) {
    const { FlatlineRoll } = await import('@components/roll/roller.js');
    const roll = new FlatlineRoll(this, attribute, skill, options);
    return roll.execute();
  }
}

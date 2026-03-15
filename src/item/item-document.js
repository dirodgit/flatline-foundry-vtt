import { ITEM_TYPES } from '@system/constants.js';

/**
 * Documento de Item do sistema FLATLINE.
 * @extends {Item}
 */
export default class FlatlineItem extends Item {

  /* ------------------------------------------ */
  /*  Propriedades                              */
  /* ------------------------------------------ */

  get isArma()       { return this.type === ITEM_TYPES.ARMA; }
  get isArmadura()   { return this.type === ITEM_TYPES.ARMADURA; }
  get isCyberware()  { return this.type === ITEM_TYPES.CYBERWARE; }
  get isPrograma()   { return this.type === ITEM_TYPES.PROGRAMA; }
  get isEspecialidade() { return this.type === ITEM_TYPES.ESPECIALIDADE; }
  get isLesao()      { return this.type === ITEM_TYPES.LESAO; }

  get confiabilidade() {
    return this.system.confiabilidade ?? null;
  }

  /* ------------------------------------------ */
  /*  Preparação de Dados                       */
  /* ------------------------------------------ */

  /** @override */
  prepareDerivedData() {
    super.prepareDerivedData();
    if (this.isArma) this._prepareArmaData();
  }

  _prepareArmaData() {
    // Nada por agora — expansível
  }

  /* ------------------------------------------ */
  /*  Métodos de Jogo                           */
  /* ------------------------------------------ */

  /**
   * Reduz a Confiabilidade do item em 1.
   * @returns {Promise}
   */
  async loseConfiabilidade() {
    if (!this.system.confiabilidade) return;
    const current = this.system.confiabilidade.value ?? 0;
    const newVal  = Math.max(0, current - 1);
    await this.update({ 'system.confiabilidade.value': newVal });

    if (newVal === 0) {
      ui.notifications.warn(
        game.i18n.format('FLATLINE.Item.Broken', { name: this.name })
      );
    }
  }

  /**
   * Rola o uso desta arma — delega para o sistema de rolagem do ator.
   * @returns {Promise}
   */
  async rollAttack() {
    const actor = this.actor;
    if (!actor) return;

    const attribute = this.system.atributo ?? 'agilidade';
    const skill     = this.system.pericia  ?? 'atirar';
    const equipSize = this.system.confiabilidade?.value >= 1
      ? (this.system.dadoEquipamento ?? 0)
      : 0;

    return actor.rollSkill(attribute, skill, {
      equipBonus: equipSize,
      flavor:     this.name,
    });
  }

  /* ------------------------------------------ */
  /*  Chat Description                         */
  /* ------------------------------------------ */

  /** @override */
  async toMessage(options = {}) {
    const template = `systems/flatline/templates/chat/item-card.hbs`;
    const html = await renderTemplate(template, {
      item:  this,
      actor: this.actor,
      data:  this.system,
    });
    return ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content: html,
      ...options,
    });
  }
}

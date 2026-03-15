import { FLATLINE } from '@system/config.js';

/**
 * Ficha de Veículo do FLATLINE.
 * @extends {ActorSheet}
 */
export default class VeiculoSheet extends ActorSheet {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes:  ['flatline', 'sheet', 'actor', 'veiculo'],
      template: 'systems/flatline/templates/actor/veiculo-sheet.hbs',
      width:    520,
      height:   420,
    });
  }

  async getData() {
    const context = await super.getData();
    context.system   = this.actor.system;
    context.FLATLINE = FLATLINE;
    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);
    if (!this.isEditable) return;
  }
}

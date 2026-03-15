import { FLATLINE } from '../system/config.js';
import { ITEM_TYPES, RANGES } from '../system/constants.js';

/**
 * Ficha de Item do sistema FLATLINE.
 * @extends {ItemSheet}
 */
export default class FlatlineItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes:  ['flatline', 'sheet', 'item'],
      width:    520,
      height:   420,
      tabs: [{
        navSelector:    '.sheet-tabs',
        contentSelector:'.sheet-body',
        initial:        'desc',
      }],
    });
  }

  /** @override */
  get template() {
    return `systems/flatline/templates/item/${this.item.type}-sheet.hbs`;
  }

  /** @override */
  async getData() {
    const context = await super.getData();
    context.system   = this.item.system;
    context.FLATLINE = FLATLINE;
    context.ranges   = Object.entries(FLATLINE.rangeLabels).map(([k, v]) => ({
      value: k, label: game.i18n.localize(v),
    }));
    context.archetypes = Object.entries(FLATLINE.archetypeLabels).map(([k, v]) => ({
      value: k, label: game.i18n.localize(v),
    }));
    context.isArma      = this.item.isArma;
    context.isCyberware = this.item.isCyberware;
    context.isPrograma  = this.item.isPrograma;
    context.isLesao     = this.item.isLesao;
    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    if (!this.isEditable) return;
    // Extensível por item type
  }
}
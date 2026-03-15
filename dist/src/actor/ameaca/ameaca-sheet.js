import { FLATLINE } from '../../system/config.js';
import { SKILL_ATTRIBUTE_MAP, ITEM_TYPES } from '../../system/constants.js';

/**
 * Ficha de Ameaça (PNJ/Inimigo) do FLATLINE.
 * @extends {ActorSheet}
 */
export default class AmeacaSheet extends ActorSheet {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes:  ['flatline', 'sheet', 'actor', 'ameaca'],
      template: 'systems/flatline/templates/actor/ameaca-sheet.hbs',
      width:    600,
      height:   500,
      tabs: [{
        navSelector:    '.sheet-tabs',
        contentSelector:'.sheet-body',
        initial:        'stats',
      }],
    });
  }

  async getData() {
    const context = await super.getData();
    const actor   = this.actor;
    context.system   = actor.system;
    context.FLATLINE = FLATLINE;

    context.attributes = this._prepareAttributes(actor.system.attributes);
    context.skillsByAttribute = this._prepareSkills(actor.system.skills);
    context.conditions = actor.system.conditions;
    context.armas = actor.items.filter(i => i.type === ITEM_TYPES.ARMA);

    return context;
  }

  _prepareAttributes(attributes) {
    const result = {};
    for (const [key, data] of Object.entries(attributes ?? {})) {
      result[key] = {
        ...data,
        label:     game.i18n.localize(FLATLINE.attributeLabels[key] ?? key),
        dieLetter: FLATLINE.dieMap.get(data.value) ?? 'D',
      };
    }
    return result;
  }

  _prepareSkills(skills) {
    const grouped = { forca: [], agilidade: [], astucia: [], empatia: [] };
    for (const [key, data] of Object.entries(skills ?? {})) {
      const attr = SKILL_ATTRIBUTE_MAP[key] ?? 'forca';
      grouped[attr].push({
        key,
        label:    game.i18n.localize(FLATLINE.skillLabels[key] ?? key),
        value:    data.value ?? 0,
        dieLetter:data.value ? (FLATLINE.dieMap.get(data.value) ?? '—') : '—',
      });
    }
    return grouped;
  }

  activateListeners(html) {
    super.activateListeners(html);
    if (!this.isEditable) return;
    html.on('click', '.roll-skill',     this._onRollSkill.bind(this));
    html.on('click', '.roll-attribute', this._onRollAttribute.bind(this));
    html.on('click', '.item-create',    this._onItemCreate.bind(this));
    html.on('click', '.item-edit',      this._onItemEdit.bind(this));
    html.on('click', '.item-delete',    this._onItemDelete.bind(this));
  }

  async _onRollSkill(event) {
    event.preventDefault();
    const skill = event.currentTarget.dataset.skill;
    const attr  = SKILL_ATTRIBUTE_MAP[skill] ?? 'forca';
    return this.actor.rollSkill(attr, skill);
  }

  async _onRollAttribute(event) {
    event.preventDefault();
    const attr = event.currentTarget.dataset.attribute;
    return this.actor.rollSkill(attr, null);
  }

  async _onItemCreate(event) {
    event.preventDefault();
    const type = event.currentTarget.dataset.type ?? 'arma';
    await this.actor.createEmbeddedDocuments('Item', [{
      name: game.i18n.format('FLATLINE.Item.New', {
        type: game.i18n.localize(`FLATLINE.ItemType.${type}`)
      }),
      type,
    }]);
  }

  async _onItemEdit(event) {
    event.preventDefault();
    const id = event.currentTarget.closest('[data-item-id]').dataset.itemId;
    this.actor.items.get(id)?.sheet.render(true);
  }

  async _onItemDelete(event) {
    event.preventDefault();
    const id   = event.currentTarget.closest('[data-item-id]').dataset.itemId;
    const item = this.actor.items.get(id);
    if (!item) return;
    const ok = await Dialog.confirm({
      title:   game.i18n.localize('FLATLINE.Item.DeleteTitle'),
      content: game.i18n.format('FLATLINE.Item.DeleteContent', { name: item.name }),
    });
    if (ok) await item.delete();
  }
}
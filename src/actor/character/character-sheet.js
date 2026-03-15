import { FLATLINE } from '@system/config.js';
import { ATTRIBUTES, SKILLS, SKILL_ATTRIBUTE_MAP, ITEM_TYPES, ARCHETYPES } from '@system/constants.js';

/**
 * Ficha do Corredor — Actor Sheet principal do FLATLINE.
 * Usa a API de ApplicationV2 / HandlebarsApplicationMixin do Foundry v13.
 * @extends {ActorSheet}
 */
export default class CorredorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes:   ['flatline', 'sheet', 'actor', 'corredor'],
      template:  'systems/flatline/templates/actor/corredor-sheet.hbs',
      width:     820,
      height:    680,
      tabs: [{
        navSelector:    '.sheet-tabs',
        contentSelector:'.sheet-body',
        initial:        'stats',
      }],
      dragDrop: [{ dragSelector: '.item-list .item', dropSelector: null }],
    });
  }

  /* ------------------------------------------ */
  /*  getData                                   */
  /* ------------------------------------------ */

  /** @override */
  async getData() {
    const context = await super.getData();
    const actor   = this.actor;
    const system  = actor.system;

    context.system    = system;
    context.FLATLINE  = FLATLINE;
    context.config    = FLATLINE;
    context.isOwner   = actor.isOwner;
    context.isEditable= this.isEditable;

    // Atributos enriquecidos com label e dado
    context.attributes = this._prepareAttributes(system.attributes);

    // Perícias agrupadas por atributo
    context.skillsByAttribute = this._prepareSkills(system.skills);

    // Condições
    context.conditions = system.conditions;
    context.physicalPenalty = actor.physicalPenalty;
    context.mentalPenalty   = actor.mentalPenalty;
    context.isBroken        = actor.isBroken;

    // Degradação
    context.degradation     = system.degradation;
    context.degradationDie  = actor.degradationDie;
    context.degradationTrail= this._prepareDegradationTrail(system.degradation?.value ?? 0);

    // Recursos
    context.resources = system.resources;
    context.carga     = system.carga;
    context.ramThreshold = actor.ramThreshold;

    // Arquétipo
    context.archetypeLabel = game.i18n.localize(
      FLATLINE.archetypeLabels[system.archetype] ?? system.archetype
    );
    context.archetypes = Object.entries(FLATLINE.archetypeLabels).map(([k, v]) => ({
      value: k, label: game.i18n.localize(v),
    }));

    // Itens por categoria
    context.armas         = actor.items.filter(i => i.type === ITEM_TYPES.ARMA);
    context.armaduras     = actor.items.filter(i => i.type === ITEM_TYPES.ARMADURA);
    context.cyberwares    = actor.items.filter(i => i.type === ITEM_TYPES.CYBERWARE);
    context.programas     = actor.items.filter(i => i.type === ITEM_TYPES.PROGRAMA);
    context.especialidades= actor.items.filter(i => i.type === ITEM_TYPES.ESPECIALIDADE);
    context.equipamentos  = actor.items.filter(i => i.type === ITEM_TYPES.EQUIPAMENTO);
    context.lesoes        = actor.items.filter(i => i.type === ITEM_TYPES.LESAO);

    // Bio / Traços
    context.bio = system.bio ?? {};

    return context;
  }

  /* ------------------------------------------ */
  /*  Helpers de contexto                       */
  /* ------------------------------------------ */

  _prepareAttributes(attributes) {
    const result = {};
    for (const [key, data] of Object.entries(attributes ?? {})) {
      result[key] = {
        ...data,
        label:   game.i18n.localize(FLATLINE.attributeLabels[key] ?? key),
        dieLetter: FLATLINE.dieMap.get(data.value) ?? 'D',
        penalty:   data.penalty ?? 0,
        effective: Math.max(6, (data.value ?? 6) - (data.penalty ?? 0)),
      };
    }
    return result;
  }

  _prepareSkills(skills) {
    const grouped = {
      forca:    [],
      agilidade:[],
      astucia:  [],
      empatia:  [],
    };
    for (const [key, data] of Object.entries(skills ?? {})) {
      const attr = SKILL_ATTRIBUTE_MAP[key] ?? 'forca';
      grouped[attr].push({
        key,
        label:    game.i18n.localize(FLATLINE.skillLabels[key] ?? key),
        value:    data.value ?? 0,
        used:     data.used  ?? false,
        dieLetter:data.value ? (FLATLINE.dieMap.get(data.value) ?? '—') : '—',
      });
    }
    return grouped;
  }

  _prepareDegradationTrail(value) {
    return Array.from({ length: 13 }, (_, i) => ({
      index:  i,
      active: i <= value,
      level:  i === 0 ? '' : i <= 3 ? 'cicatriz' : i <= 6 ? 'falha' : i <= 9 ? 'colapso' : i <= 11 ? 'falencia' : 'flatline',
    }));
  }

  /* ------------------------------------------ */
  /*  Listeners                                 */
  /* ------------------------------------------ */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    if (!this.isEditable) return;

    // Rolar perícia
    html.on('click', '.roll-skill',     this._onRollSkill.bind(this));
    html.on('click', '.roll-attribute', this._onRollAttribute.bind(this));

    // Condições
    html.on('click', '.condition-add',    this._onAddCondition.bind(this));
    html.on('click', '.condition-remove', this._onRemoveCondition.bind(this));
    html.on('change','.condition-label',  this._onConditionLabelChange.bind(this));

    // Degradação
    html.on('click', '.degradation-step', this._onDegradationStep.bind(this));
    html.on('click', '.roll-degradation', this._onRollDegradation.bind(this));

    // RAM
    html.on('click', '.ram-add',   () => this.actor.addRam(1));
    html.on('click', '.ram-spend', this._onSpendRam.bind(this));
    html.on('click', '.ram-reset', () => this.actor.update({ 'system.resources.ram.value': 0 }));

    // Itens
    html.on('click', '.item-create', this._onItemCreate.bind(this));
    html.on('click', '.item-edit',   this._onItemEdit.bind(this));
    html.on('click', '.item-delete', this._onItemDelete.bind(this));
    html.on('click', '.item-roll',   this._onItemRoll.bind(this));
    html.on('click', '.item-post',   this._onItemPost.bind(this));

    // Perícias — marcar como "usada"
    html.on('click', '.skill-used-toggle', this._onSkillUsedToggle.bind(this));

    // Drag/drop de itens
    html.find('.items-list').each((i, el) => {
      el.addEventListener('dragover', this._onDragOver.bind(this));
    });
  }

  /* ------------------------------------------ */
  /*  Handlers de rolagem                       */
  /* ------------------------------------------ */

  async _onRollSkill(event) {
    event.preventDefault();
    const el     = event.currentTarget;
    const skill  = el.dataset.skill;
    const attr   = SKILL_ATTRIBUTE_MAP[skill] ?? 'forca';
    return this.actor.rollSkill(attr, skill);
  }

  async _onRollAttribute(event) {
    event.preventDefault();
    const attr = event.currentTarget.dataset.attribute;
    return this.actor.rollSkill(attr, null);
  }

  /* ------------------------------------------ */
  /*  Handlers de Condição                      */
  /* ------------------------------------------ */

  async _onAddCondition(event) {
    event.preventDefault();
    const tipo = event.currentTarget.dataset.tipo;
    // Abre mini-dialog para escrever o rótulo narrativo
    const label = await Dialog.prompt({
      title:   game.i18n.localize('FLATLINE.Condition.AddTitle'),
      content: `<input type="text" name="label" placeholder="${game.i18n.localize('FLATLINE.Condition.LabelPlaceholder')}" style="width:100%">`,
      callback: html => html.find('[name="label"]').val(),
    });
    if (label !== undefined) {
      await this.actor.applyCondition(tipo, label);
    }
  }

  async _onRemoveCondition(event) {
    event.preventDefault();
    const tipo = event.currentTarget.dataset.tipo;
    await this.actor.removeCondition(tipo);
  }

  async _onConditionLabelChange(event) {
    const input = event.currentTarget;
    const tipo  = input.dataset.tipo;
    const grade = input.dataset.grade;
    const conditions = foundry.utils.deepClone(this.actor.system.conditions);
    conditions[tipo][grade].label = input.value;
    await this.actor.update({ 'system.conditions': conditions });
  }

  /* ------------------------------------------ */
  /*  Handlers de Degradação                    */
  /* ------------------------------------------ */

  async _onDegradationStep(event) {
    event.preventDefault();
    const idx = parseInt(event.currentTarget.dataset.index);
    await this.actor.update({ 'system.degradation.value': idx });
  }

  async _onRollDegradation(event) {
    event.preventDefault();
    await this.actor._rollDegradation(1);
  }

  /* ------------------------------------------ */
  /*  Handlers de RAM                           */
  /* ------------------------------------------ */

  async _onSpendRam(event) {
    event.preventDefault();
    const amount = parseInt(event.currentTarget.dataset.amount ?? '1');
    await this.actor.spendRam(amount);
  }

  /* ------------------------------------------ */
  /*  Handlers de Itens                         */
  /* ------------------------------------------ */

  async _onItemCreate(event) {
    event.preventDefault();
    const type = event.currentTarget.dataset.type ?? ITEM_TYPES.EQUIPAMENTO;
    const name = game.i18n.format('FLATLINE.Item.New', {
      type: game.i18n.localize(`FLATLINE.ItemType.${type}`)
    });
    await this.actor.createEmbeddedDocuments('Item', [{ name, type }]);
  }

  async _onItemEdit(event) {
    event.preventDefault();
    const id   = event.currentTarget.closest('[data-item-id]').dataset.itemId;
    const item = this.actor.items.get(id);
    item?.sheet.render(true);
  }

  async _onItemDelete(event) {
    event.preventDefault();
    const id   = event.currentTarget.closest('[data-item-id]').dataset.itemId;
    const item = this.actor.items.get(id);
    if (!item) return;
    const confirmed = await Dialog.confirm({
      title:   game.i18n.localize('FLATLINE.Item.DeleteTitle'),
      content: game.i18n.format('FLATLINE.Item.DeleteContent', { name: item.name }),
    });
    if (confirmed) await item.delete();
  }

  async _onItemRoll(event) {
    event.preventDefault();
    const id   = event.currentTarget.closest('[data-item-id]').dataset.itemId;
    const item = this.actor.items.get(id);
    if (item?.rollAttack) await item.rollAttack();
  }

  async _onItemPost(event) {
    event.preventDefault();
    const id   = event.currentTarget.closest('[data-item-id]').dataset.itemId;
    const item = this.actor.items.get(id);
    if (item) await item.toMessage();
  }

  async _onSkillUsedToggle(event) {
    event.preventDefault();
    const skill   = event.currentTarget.dataset.skill;
    const current = this.actor.system.skills[skill]?.used ?? false;
    await this.actor.update({ [`system.skills.${skill}.used`]: !current });
  }

  /* ------------------------------------------ */
  /*  Drag & Drop                              */
  /* ------------------------------------------ */

  _onDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }
}

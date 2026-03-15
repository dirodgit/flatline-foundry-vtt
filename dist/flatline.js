/**
 * FLATLINE RPG — Sistema para Foundry VTT v13
 * v0.1.0 | Cyberpunk brasileiro 2099 | Year Zero Engine
 *
 * NOTA: Este bundle foi gerado sem esbuild (sem acesso à rede no momento do build).
 * Para o bundle de produção, clone o repositório e execute:
 *   npm install && npm run build && node tools/bundle.mjs
 */

/* ============================================================
   CONSTANTS
   ============================================================ */
const SYSTEM_ID = 'flatline';

const DIE_SCORES = { A: 12, B: 10, C: 8, D: 6 };

const ATTRIBUTES = {
  FORCA:     'forca',
  AGILIDADE: 'agilidade',
  ASTUCIA:   'astucia',
  EMPATIA:   'empatia',
};

const SKILLS = {
  LUTAR: 'lutar', ATIRAR: 'atirar', SUPORTAR: 'suportar',
  MOVER: 'mover', ESGUEIRAR: 'esgueirar', PILOTAR: 'pilotar',
  CONSTRUIR: 'construir', HACKEAR: 'hackear', OBSERVAR: 'observar',
  SOBREVIVER: 'sobreviver', PERSUADIR: 'persuadir', INTUIR: 'intuir',
  CURAR: 'curar', MANOBRAR: 'manobrar',
};

const SKILL_ATTRIBUTE_MAP = {
  lutar: 'forca', suportar: 'forca',
  atirar: 'agilidade', mover: 'agilidade', esgueirar: 'agilidade', pilotar: 'agilidade', manobrar: 'agilidade',
  construir: 'astucia', hackear: 'astucia', observar: 'astucia', sobreviver: 'astucia',
  persuadir: 'empatia', intuir: 'empatia', curar: 'empatia',
};

const ACTOR_TYPES = { CORREDOR: 'corredor', VEICULO: 'veiculo', AMEACA: 'ameaca' };
const ITEM_TYPES  = { ARMA: 'arma', ARMADURA: 'armadura', CYBERWARE: 'cyberware',
                      PROGRAMA: 'programa', ESPECIALIDADE: 'especialidade',
                      EQUIPAMENTO: 'equipamento', LESAO: 'lesao' };
const SETTINGS_KEYS = { SHOW_DEGRADATION_DIALOG: 'showDegradationDialog', AUTO_CONDITIONS: 'autoConditions' };

/* ============================================================
   CONFIG
   ============================================================ */
const FLATLINE = {};
FLATLINE.scoreMap = new Map([['–',0],['D',6],['C',8],['B',10],['A',12]]);
FLATLINE.dieMap   = new Map([[6,'D'],[8,'C'],[10,'B'],[12,'A']]);
FLATLINE.attributes = Object.values(ATTRIBUTES);
FLATLINE.skillMap   = SKILL_ATTRIBUTE_MAP;
FLATLINE.skills     = Object.keys(SKILL_ATTRIBUTE_MAP);

FLATLINE.attributeLabels = {
  forca:'FLATLINE.Attribute.Forca', agilidade:'FLATLINE.Attribute.Agilidade',
  astucia:'FLATLINE.Attribute.Astucia', empatia:'FLATLINE.Attribute.Empatia',
};
FLATLINE.skillLabels = {
  lutar:'FLATLINE.Skill.Lutar', atirar:'FLATLINE.Skill.Atirar', suportar:'FLATLINE.Skill.Suportar',
  mover:'FLATLINE.Skill.Mover', esgueirar:'FLATLINE.Skill.Esgueirar', pilotar:'FLATLINE.Skill.Pilotar',
  construir:'FLATLINE.Skill.Construir', hackear:'FLATLINE.Skill.Hackear', observar:'FLATLINE.Skill.Observar',
  sobreviver:'FLATLINE.Skill.Sobreviver', persuadir:'FLATLINE.Skill.Persuadir',
  intuir:'FLATLINE.Skill.Intuir', curar:'FLATLINE.Skill.Curar', manobrar:'FLATLINE.Skill.Manobrar',
};
FLATLINE.archetypeLabels = {
  mercenario:'FLATLINE.Archetype.Mercenario', negociante:'FLATLINE.Archetype.Negociante',
  holomante:'FLATLINE.Archetype.Holomante', tecnico:'FLATLINE.Archetype.Tecnico',
  piloto:'FLATLINE.Archetype.Piloto', policial:'FLATLINE.Archetype.Policial',
  executivo:'FLATLINE.Archetype.Executivo', influencer:'FLATLINE.Archetype.Influencer',
  medico:'FLATLINE.Archetype.Medico',
};
FLATLINE.rangeLabels = {
  0:'FLATLINE.Range.0',1:'FLATLINE.Range.1',2:'FLATLINE.Range.2',3:'FLATLINE.Range.3',4:'FLATLINE.Range.4',
};
FLATLINE.conditionPenalties = { leve:-1, moderada:-2, severa:-3 };
FLATLINE.degradationDie = {0:6,1:6,2:6,3:6,4:8,5:8,6:8,7:10,8:10,9:10,10:12,11:12,12:12};
FLATLINE.ramThreshold   = {6:6,8:8,10:10,12:12};
FLATLINE.ramMax = 10;

/* ============================================================
   FLATLINE ACTOR
   ============================================================ */
class FlatlineActor extends Actor {
  get physicalPenalty() {
    const f = this.system.conditions?.fisica;
    if (!f) return 0;
    return (f.leve?.active?1:0) + (f.moderada?.active?2:0) + (f.severa?.active?3:0);
  }
  get mentalPenalty() {
    const m = this.system.conditions?.mental;
    if (!m) return 0;
    return (m.leve?.active?1:0) + (m.moderada?.active?2:0) + (m.severa?.active?3:0);
  }
  get isBroken() {
    return this.system.conditions?.fisica?.broken || this.system.conditions?.mental?.broken;
  }
  get degradationDie() {
    return FLATLINE.degradationDie[Math.min(this.system.degradation?.value ?? 0, 12)];
  }
  get ramThreshold() {
    const f = this.system.attributes?.forca?.value ?? 6;
    const a = this.system.attributes?.astucia?.value ?? 6;
    return FLATLINE.ramThreshold[Math.max(f,a)] ?? 6;
  }
  prepareDerivedData() {
    super.prepareDerivedData();
    if (this.type === ACTOR_TYPES.CORREDOR) {
      const forcaVal = this.system.attributes?.forca?.value ?? 6;
      this.system.carga = { max: forcaVal };
      this.system.ramThreshold = this.ramThreshold;
      // penalidades
      const attrs = this.system.attributes;
      if (attrs) {
        const ph = this.physicalPenalty, pm = this.mentalPenalty;
        for (const k of ['forca','agilidade']) if (attrs[k]) attrs[k].penalty = ph;
        for (const k of ['astucia','empatia'])  if (attrs[k]) attrs[k].penalty = pm;
      }
    }
  }
  async applyCondition(tipo, label='') {
    const conditions = foundry.utils.deepClone(this.system.conditions);
    const cond = conditions[tipo];
    let applied = null;
    for (const grade of ['leve','moderada','severa']) {
      if (!cond[grade].active) { cond[grade].active=true; cond[grade].label=label||grade; applied=grade; break; }
    }
    if (!applied) {
      cond.broken = true;
      ui.notifications.warn(game.i18n.format('FLATLINE.Broken', {name:this.name, tipo}));
      const deg = this.system.degradation?.value ?? 0;
      await this.update({'system.degradation.value': deg+1});
    }
    return this.update({'system.conditions': conditions});
  }
  async removeCondition(tipo) {
    const conditions = foundry.utils.deepClone(this.system.conditions);
    const cond = conditions[tipo];
    for (const grade of ['severa','moderada','leve']) {
      if (cond[grade].active) { cond[grade].active=false; cond[grade].label=''; break; }
    }
    return this.update({'system.conditions': conditions});
  }
  async addRam(amount=1) {
    const cur = this.system.resources?.ram?.value ?? 0;
    return this.update({'system.resources.ram.value': Math.min(cur+amount, FLATLINE.ramMax)});
  }
  async spendRam(amount) {
    const cur = this.system.resources?.ram?.value ?? 0;
    if (amount > cur) { ui.notifications.warn(game.i18n.localize('FLATLINE.RAM.Insufficient')); return false; }
    await this.update({'system.resources.ram.value': cur - amount});
    if (amount > this.ramThreshold) {
      const pts = Math.floor((amount - this.ramThreshold) / 4);
      if (pts > 0) {
        ui.notifications.warn(game.i18n.format('FLATLINE.RAM.ThresholdExceeded',{points:pts}));
        await this._rollDegradation(pts);
      }
    }
    return true;
  }
  async _rollDegradation(times=1) {
    const die = this.degradationDie;
    for (let i=0;i<times;i++) {
      const roll = await new Roll(`1d${die}`).evaluate();
      await roll.toMessage({
        speaker: ChatMessage.getSpeaker({actor:this}),
        flavor:  game.i18n.localize('FLATLINE.Degradation.Roll'),
      });
    }
  }
  async rollSkill(attribute, skill=null, options={}) {
    return new FlatlineRoll(this, attribute, skill, options).execute();
  }
}

/* ============================================================
   FLATLINE ITEM
   ============================================================ */
class FlatlineItem extends Item {
  get isArma()       { return this.type === ITEM_TYPES.ARMA; }
  get isArmadura()   { return this.type === ITEM_TYPES.ARMADURA; }
  get isCyberware()  { return this.type === ITEM_TYPES.CYBERWARE; }
  get isPrograma()   { return this.type === ITEM_TYPES.PROGRAMA; }
  get isEspecialidade(){ return this.type === ITEM_TYPES.ESPECIALIDADE; }
  get isLesao()      { return this.type === ITEM_TYPES.LESAO; }
  async loseConfiabilidade() {
    if (!this.system.confiabilidade) return;
    const v = Math.max(0,(this.system.confiabilidade.value??1)-1);
    await this.update({'system.confiabilidade.value':v});
    if (v===0) ui.notifications.warn(game.i18n.format('FLATLINE.Item.Broken',{name:this.name}));
  }
  async rollAttack() {
    if (!this.actor) return;
    return this.actor.rollSkill(
      this.system.atributo ?? 'agilidade',
      this.system.pericia  ?? 'atirar',
      { flavor: this.name }
    );
  }
  async toMessage(options={}) {
    const html = await renderTemplate(`systems/flatline/templates/chat/item-card.hbs`,{
      item: this, actor: this.actor, data: this.system,
      isArma: this.isArma, isCyberware: this.isCyberware,
      isPrograma: this.isPrograma, isLesao: this.isLesao,
    });
    return ChatMessage.create({
      speaker: ChatMessage.getSpeaker({actor:this.actor}),
      content: html, ...options,
    });
  }
}

/* ============================================================
   ROLL ENGINE
   ============================================================ */
class FlatlineRoll {
  constructor(actor, attributeKey, skillKey=null, options={}) {
    this.actor        = actor;
    this.attributeKey = attributeKey;
    this.skillKey     = skillKey;
    this.modifier     = options.modifier   ?? 0;
    this.equipBonus   = options.equipBonus ?? 0;
    this.canPush      = options.canPush    ?? true;
    this.flavor       = options.flavor     ?? '';
    this._pushed      = false;
    this._dice        = [];
    this._successes   = 0;
    this._glitches    = {attribute:0,skill:0,equip:0};
    this._rollId      = foundry.utils.randomID();
  }
  _scaleDir(base, mod) {
    const s=[6,8,10,12]; let i=s.indexOf(base); if(i<0)i=0;
    return s[Math.max(0,Math.min(3,i+mod))];
  }
  get attrSize()  { return this._scaleDir(this.actor.system.attributes?.[this.attributeKey]?.value??6, this.modifier); }
  get skillSize() { return this.skillKey ? (this.actor.system.skills?.[this.skillKey]?.value??0) : 0; }
  async execute() { await this._roll(); await this._toChat(); return this; }
  async _roll() {
    const parts = [];
    if (this.attrSize  > 0) parts.push(`1d${this.attrSize}`);
    if (this.skillSize > 0) parts.push(`1d${this.skillSize}`);
    if (this.equipBonus> 0) parts.push(`1d${this.equipBonus}`);
    const formula = parts.length ? parts.join('+') : '1d6';
    const roll    = await new Roll(formula).evaluate();
    this._rawRoll = roll;
    this._dice=[]; this._successes=0; this._glitches={attribute:0,skill:0,equip:0};
    const terms = roll.terms.filter(t=>t.results);
    const types = [];
    if (this.attrSize >0) types.push('attribute');
    if (this.skillSize>0) types.push('skill');
    if (this.equipBonus>0)types.push('equip');
    terms.forEach((t,i)=>{
      const type = types[i]??'attribute';
      t.results.forEach(r=>{
        const v=r.result, s=v>=10?2:v>=6?1:0, g=v===1;
        this._dice.push({type,value:v,successes:s,isGlitch:g,size:t.faces});
        this._successes+=s; if(g)this._glitches[type]++;
      });
    });
  }
  async push() {
    if (!this.canPush||this._pushed) return this;
    this._pushed=true;
    await this.actor.addRam(1);
    await this._applyGlitchCosts();
    const newDice=[];
    for (const d of this._dice) {
      if (d.isGlitch) { newDice.push(d); continue; }
      const r=await new Roll(`1d${d.size}`).evaluate();
      const v=r.terms[0].results[0].result, s=v>=10?2:v>=6?1:0, g=v===1;
      newDice.push({...d,value:v,successes:s,isGlitch:g});
    }
    this._dice=newDice;
    this._successes=newDice.reduce((sum,d)=>sum+d.successes,0);
    this._glitches={attribute:0,skill:0,equip:0};
    newDice.forEach(d=>{ if(d.isGlitch)this._glitches[d.type]++; });
    await this._applyGlitchCosts();
    await this._toChat(true);
    return this;
  }
  async _applyGlitchCosts() {
    const phys=['forca','agilidade'], ment=['astucia','empatia'];
    const linked=SKILL_ATTRIBUTE_MAP[this.skillKey]??null;
    if (this._glitches.attribute>0) {
      const tipo=phys.includes(this.attributeKey)?'fisica':'mental';
      await this.actor.applyCondition(tipo, game.i18n.localize('FLATLINE.Condition.FromForce'));
    }
    if (this._glitches.skill>0 && linked) {
      const tipo=phys.includes(linked)?'fisica':'mental';
      await this.actor.applyCondition(tipo, game.i18n.localize('FLATLINE.Condition.FromForce'));
    }
    if (this._glitches.equip>0) {
      ui.notifications.warn(game.i18n.format('FLATLINE.Item.DurabilityLost',{actor:this.actor.name}));
    }
  }
  async _toChat(isPush=false) {
    const attrLabel  = game.i18n.localize(FLATLINE.attributeLabels[this.attributeKey]??this.attributeKey);
    const skillLabel = this.skillKey ? game.i18n.localize(FLATLINE.skillLabels[this.skillKey]??this.skillKey) : null;
    const html = await renderTemplate('systems/flatline/templates/chat/roll-card.hbs',{
      actor:this.actor, dice:this._dice, successes:this._successes,
      glitches:this._glitches, attrLabel, skillLabel,
      modifier:this.modifier, flavor:this.flavor,
      isPush, canPush:this.canPush&&!this._pushed, rollId:this._rollId,
    });
    this._chatMessage = await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({actor:this.actor}),
      content: html,
      flags: { flatline: { rollData:{
        rollId:this._rollId, actorId:this.actor.id,
        attributeKey:this.attributeKey, skillKey:this.skillKey,
        modifier:this.modifier, equipBonus:this.equipBonus, pushed:isPush,
      }}},
    });
  }
}

/* ============================================================
   ACTOR SHEET — CORREDOR
   ============================================================ */
class CorredorSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions,{
      classes:['flatline','sheet','actor','corredor'],
      template:'systems/flatline/templates/actor/corredor-sheet.hbs',
      width:820, height:680,
      tabs:[{navSelector:'.sheet-tabs',contentSelector:'.sheet-body',initial:'stats'}],
    });
  }
  async getData() {
    const ctx=await super.getData(), sys=this.actor.system;
    ctx.system=sys; ctx.FLATLINE=FLATLINE; ctx.isOwner=this.actor.isOwner; ctx.isEditable=this.isEditable;
    ctx.attributes=this._prepareAttributes(sys.attributes);
    ctx.skillsByAttribute=this._prepareSkills(sys.skills);
    ctx.conditions=sys.conditions;
    ctx.physicalPenalty=this.actor.physicalPenalty;
    ctx.mentalPenalty=this.actor.mentalPenalty;
    ctx.isBroken=this.actor.isBroken;
    ctx.degradation=sys.degradation;
    ctx.degradationDie=this.actor.degradationDie;
    ctx.degradationTrail=Array.from({length:13},(_,i)=>({
      index:i, active:i<=(sys.degradation?.value??0),
      level:i===0?'':i<=3?'cicatriz':i<=6?'falha':i<=9?'colapso':i<=11?'falencia':'flatline',
    }));
    ctx.resources=sys.resources; ctx.carga=sys.carga; ctx.ramThreshold=this.actor.ramThreshold;
    ctx.archetypeLabel=game.i18n.localize(FLATLINE.archetypeLabels[sys.archetype]??sys.archetype);
    ctx.archetypes=Object.entries(FLATLINE.archetypeLabels).map(([k,v])=>({value:k,label:game.i18n.localize(v)}));
    ctx.armas        =this.actor.items.filter(i=>i.type===ITEM_TYPES.ARMA);
    ctx.armaduras    =this.actor.items.filter(i=>i.type===ITEM_TYPES.ARMADURA);
    ctx.cyberwares   =this.actor.items.filter(i=>i.type===ITEM_TYPES.CYBERWARE);
    ctx.programas    =this.actor.items.filter(i=>i.type===ITEM_TYPES.PROGRAMA);
    ctx.especialidades=this.actor.items.filter(i=>i.type===ITEM_TYPES.ESPECIALIDADE);
    ctx.equipamentos =this.actor.items.filter(i=>i.type===ITEM_TYPES.EQUIPAMENTO);
    ctx.lesoes       =this.actor.items.filter(i=>i.type===ITEM_TYPES.LESAO);
    ctx.bio=sys.bio??{};
    return ctx;
  }
  _prepareAttributes(attrs) {
    const r={};
    for (const [k,d] of Object.entries(attrs??{})) {
      r[k]={...d, label:game.i18n.localize(FLATLINE.attributeLabels[k]??k),
                  dieLetter:FLATLINE.dieMap.get(d.value)??'D', penalty:d.penalty??0};
    }
    return r;
  }
  _prepareSkills(skills) {
    const g={forca:[],agilidade:[],astucia:[],empatia:[]};
    for (const [k,d] of Object.entries(skills??{})) {
      const attr=SKILL_ATTRIBUTE_MAP[k]??'forca';
      g[attr].push({key:k, label:game.i18n.localize(FLATLINE.skillLabels[k]??k),
                    value:d.value??0, used:d.used??false,
                    dieLetter:d.value?(FLATLINE.dieMap.get(d.value)??'—'):'—'});
    }
    return g;
  }
  activateListeners(html) {
    super.activateListeners(html);
    if (!this.isEditable) return;
    html.on('click','.roll-skill',    e=>{ e.preventDefault(); const sk=e.currentTarget.dataset.skill; this.actor.rollSkill(SKILL_ATTRIBUTE_MAP[sk]??'forca',sk); });
    html.on('click','.roll-attribute',e=>{ e.preventDefault(); this.actor.rollSkill(e.currentTarget.dataset.attribute,null); });
    html.on('click','.condition-add', e=>{ e.preventDefault(); this._onAddCondition(e); });
    html.on('click','.condition-remove',e=>{ e.preventDefault(); this.actor.removeCondition(e.currentTarget.dataset.tipo); });
    html.on('change','.condition-label',e=>{
      const {tipo,grade}=e.currentTarget.dataset;
      const c=foundry.utils.deepClone(this.actor.system.conditions);
      c[tipo][grade].label=e.currentTarget.value;
      this.actor.update({'system.conditions':c});
    });
    html.on('click','.degradation-step',e=>{ e.preventDefault(); this.actor.update({'system.degradation.value':parseInt(e.currentTarget.dataset.index)}); });
    html.on('click','.roll-degradation',e=>{ e.preventDefault(); this.actor._rollDegradation(1); });
    html.on('click','.ram-add',  ()=>this.actor.addRam(1));
    html.on('click','.ram-spend',e=>this.actor.spendRam(parseInt(e.currentTarget.dataset.amount??'1')));
    html.on('click','.ram-reset',()=>this.actor.update({'system.resources.ram.value':0}));
    html.on('click','.item-create',e=>{ e.preventDefault(); const t=e.currentTarget.dataset.type??ITEM_TYPES.EQUIPAMENTO; this.actor.createEmbeddedDocuments('Item',[{name:game.i18n.format('FLATLINE.Item.New',{type:game.i18n.localize(`FLATLINE.ItemType.${t}`)}),type:t}]); });
    html.on('click','.item-edit',  e=>{ e.preventDefault(); this.actor.items.get(e.currentTarget.closest('[data-item-id]').dataset.itemId)?.sheet.render(true); });
    html.on('click','.item-delete',e=>{ e.preventDefault(); this._onItemDelete(e); });
    html.on('click','.item-roll',  e=>{ e.preventDefault(); this.actor.items.get(e.currentTarget.closest('[data-item-id]').dataset.itemId)?.rollAttack?.(); });
    html.on('click','.item-post',  e=>{ e.preventDefault(); this.actor.items.get(e.currentTarget.closest('[data-item-id]').dataset.itemId)?.toMessage?.(); });
    html.on('click','.skill-used-toggle',e=>{ const sk=e.currentTarget.dataset.skill; this.actor.update({[`system.skills.${sk}.used`]:!(this.actor.system.skills[sk]?.used)}); });
  }
  async _onAddCondition(e) {
    const tipo=e.currentTarget.dataset.tipo;
    const label=await Dialog.prompt({
      title:game.i18n.localize('FLATLINE.Condition.AddTitle'),
      content:`<input type="text" name="label" placeholder="${game.i18n.localize('FLATLINE.Condition.LabelPlaceholder')}" style="width:100%;margin-top:8px"/>`,
      callback:html=>html.find('[name="label"]').val(),
    });
    if (label!==undefined) await this.actor.applyCondition(tipo, label);
  }
  async _onItemDelete(e) {
    const item=this.actor.items.get(e.currentTarget.closest('[data-item-id]').dataset.itemId);
    if (!item) return;
    const ok=await Dialog.confirm({title:game.i18n.localize('FLATLINE.Item.DeleteTitle'),content:game.i18n.format('FLATLINE.Item.DeleteContent',{name:item.name})});
    if (ok) await item.delete();
  }
}

/* ============================================================
   ITEM SHEET
   ============================================================ */
class FlatlineItemSheet extends ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions,{
      classes:['flatline','sheet','item'], width:520, height:420,
      tabs:[{navSelector:'.sheet-tabs',contentSelector:'.sheet-body',initial:'details'}],
    });
  }
  get template() { return `systems/flatline/templates/item/${this.item.type}-sheet.hbs`; }
  async getData() {
    const ctx=await super.getData();
    ctx.system=this.item.system; ctx.FLATLINE=FLATLINE;
    ctx.ranges=Object.entries(FLATLINE.rangeLabels).map(([k,v])=>({value:k,label:game.i18n.localize(v)}));
    ctx.archetypes=Object.entries(FLATLINE.archetypeLabels).map(([k,v])=>({value:k,label:game.i18n.localize(v)}));
    ctx.isArma=this.item.isArma; ctx.isCyberware=this.item.isCyberware;
    ctx.isPrograma=this.item.isPrograma; ctx.isLesao=this.item.isLesao;
    return ctx;
  }
  activateListeners(html) { super.activateListeners(html); }
}

/* ============================================================
   NPC / VEÍCULO SHEETS (mínimas)
   ============================================================ */
class AmeacaSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions,{
      classes:['flatline','sheet','actor','ameaca'],
      template:'systems/flatline/templates/actor/ameaca-sheet.hbs',
      width:600, height:500,
      tabs:[{navSelector:'.sheet-tabs',contentSelector:'.sheet-body',initial:'stats'}],
    });
  }
  async getData() {
    const ctx=await super.getData(), a=this.actor;
    ctx.system=a.system; ctx.FLATLINE=FLATLINE;
    ctx.attributes={}; for (const [k,d] of Object.entries(a.system.attributes??{})) ctx.attributes[k]={...d,label:game.i18n.localize(FLATLINE.attributeLabels[k]??k),dieLetter:FLATLINE.dieMap.get(d.value)??'D'};
    ctx.skillsByAttribute={forca:[],agilidade:[],astucia:[],empatia:[]};
    for (const [k,d] of Object.entries(a.system.skills??{})) { const at=SKILL_ATTRIBUTE_MAP[k]??'forca'; ctx.skillsByAttribute[at].push({key:k,label:game.i18n.localize(FLATLINE.skillLabels[k]??k),value:d.value??0,dieLetter:d.value?(FLATLINE.dieMap.get(d.value)??'—'):'—'}); }
    ctx.conditions=a.system.conditions;
    ctx.armas=a.items.filter(i=>i.type===ITEM_TYPES.ARMA);
    return ctx;
  }
  activateListeners(html) {
    super.activateListeners(html); if (!this.isEditable) return;
    html.on('click','.roll-skill',    e=>{ e.preventDefault(); const sk=e.currentTarget.dataset.skill; this.actor.rollSkill(SKILL_ATTRIBUTE_MAP[sk]??'forca',sk); });
    html.on('click','.roll-attribute',e=>{ e.preventDefault(); this.actor.rollSkill(e.currentTarget.dataset.attribute,null); });
    html.on('click','.item-create',   e=>{ e.preventDefault(); const t=e.currentTarget.dataset.type??'arma'; this.actor.createEmbeddedDocuments('Item',[{name:'Nova '+t,type:t}]); });
    html.on('click','.item-edit',     e=>{ e.preventDefault(); this.actor.items.get(e.currentTarget.closest('[data-item-id]').dataset.itemId)?.sheet.render(true); });
    html.on('click','.item-delete',   e=>{ e.preventDefault(); this.actor.items.get(e.currentTarget.closest('[data-item-id]').dataset.itemId)?.delete(); });
  }
}
class VeiculoSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions,{
      classes:['flatline','sheet','actor','veiculo'],
      template:'systems/flatline/templates/actor/veiculo-sheet.hbs',
      width:520, height:420,
    });
  }
  async getData() { const ctx=await super.getData(); ctx.system=this.actor.system; ctx.FLATLINE=FLATLINE; return ctx; }
}

/* ============================================================
   HANDLEBARS HELPERS
   ============================================================ */
function registerHandlebarsHelpers() {
  Handlebars.registerHelper('selected', (v,c)=>String(v)===String(c)?'selected':'');
  Handlebars.registerHelper('checked',  v=>v?'checked':'');
  Handlebars.registerHelper('eq',  (a,b)=>a===b);
  Handlebars.registerHelper('neq', (a,b)=>a!==b);
  Handlebars.registerHelper('gt',  (a,b)=>a>b);
  Handlebars.registerHelper('gte', (a,b)=>a>=b);
  Handlebars.registerHelper('lt',  (a,b)=>a<b);
  Handlebars.registerHelper('lte', (a,b)=>a<=b);
  Handlebars.registerHelper('add', (a,b)=>Number(a)+Number(b));
  Handlebars.registerHelper('sub', (a,b)=>Number(a)-Number(b));
  Handlebars.registerHelper('abs', v=>Math.abs(v));
  Handlebars.registerHelper('concat', (...a)=>{ a.pop(); return a.join(''); });
  Handlebars.registerHelper('times', function(n,o){ let r=''; for(let i=1;i<=n;i++) r+=o.fn(i); return r; });
  Handlebars.registerHelper('capitalize', s=>s?String(s).charAt(0).toUpperCase()+String(s).slice(1):'');
  Handlebars.registerHelper('dieLabel', v=>({6:'D',8:'C',10:'B',12:'A'})[v]??'—');
  Handlebars.registerHelper('enrichHTML', (c,o)=>new Handlebars.SafeString(TextEditor.enrichHTML(c??'',{async:false})));
}

async function preloadHandlebarsTemplates() {
  return loadTemplates([
    `systems/${SYSTEM_ID}/templates/actor/corredor-sheet.hbs`,
    `systems/${SYSTEM_ID}/templates/actor/sheet-tabs/stats-tab.hbs`,
    `systems/${SYSTEM_ID}/templates/actor/sheet-tabs/combat-tab.hbs`,
    `systems/${SYSTEM_ID}/templates/actor/sheet-tabs/inventory-tab.hbs`,
    `systems/${SYSTEM_ID}/templates/actor/sheet-tabs/holomancia-tab.hbs`,
    `systems/${SYSTEM_ID}/templates/actor/sheet-tabs/bio-tab.hbs`,
    `systems/${SYSTEM_ID}/templates/actor/partials/resources-bar.hbs`,
    `systems/${SYSTEM_ID}/templates/actor/ameaca-sheet.hbs`,
    `systems/${SYSTEM_ID}/templates/actor/veiculo-sheet.hbs`,
    `systems/${SYSTEM_ID}/templates/item/arma-sheet.hbs`,
    `systems/${SYSTEM_ID}/templates/item/armadura-sheet.hbs`,
    `systems/${SYSTEM_ID}/templates/item/cyberware-sheet.hbs`,
    `systems/${SYSTEM_ID}/templates/item/programa-sheet.hbs`,
    `systems/${SYSTEM_ID}/templates/item/especialidade-sheet.hbs`,
    `systems/${SYSTEM_ID}/templates/item/equipamento-sheet.hbs`,
    `systems/${SYSTEM_ID}/templates/item/lesao-sheet.hbs`,
    `systems/${SYSTEM_ID}/templates/chat/roll-card.hbs`,
    `systems/${SYSTEM_ID}/templates/chat/item-card.hbs`,
    `systems/${SYSTEM_ID}/templates/chat/degradation-card.hbs`,
  ]);
}

/* ============================================================
   SETTINGS
   ============================================================ */
function registerSystemSettings() {
  game.settings.register(SYSTEM_ID, SETTINGS_KEYS.SHOW_DEGRADATION_DIALOG, {
    name:'FLATLINE.Settings.ShowDegradationDialog', hint:'FLATLINE.Settings.ShowDegradationDialogHint',
    scope:'world', config:true, type:Boolean, default:true,
  });
  game.settings.register(SYSTEM_ID, SETTINGS_KEYS.AUTO_CONDITIONS, {
    name:'FLATLINE.Settings.AutoConditions', hint:'FLATLINE.Settings.AutoConditionsHint',
    scope:'world', config:true, type:Boolean, default:true,
  });
}

/* ============================================================
   CHAT LISTENERS (botão Forçar)
   ============================================================ */
function activateRollChatListeners(message, html) {
  html.on('click', '.flatline-push-btn', async e => {
    e.preventDefault();
    const flags = message.flags?.flatline?.rollData;
    if (!flags) return;
    const actor = game.actors.get(flags.actorId);
    if (!actor?.isOwner) return;
    const roll = new FlatlineRoll(actor, flags.attributeKey, flags.skillKey, {
      modifier: flags.modifier, equipBonus: flags.equipBonus,
    });
    roll._rollId = flags.rollId;
    await roll._roll();
    await roll.push();
  });
}

/* ============================================================
   INIT
   ============================================================ */
Hooks.once('init', async () => {
  console.log('FLATLINE | Inicializando o sistema');
  game.flatline = { config: FLATLINE, actor: FlatlineActor, item: FlatlineItem };
  CONFIG.Actor.documentClass = FlatlineActor;
  CONFIG.Item.documentClass  = FlatlineItem;
  CONFIG.FLATLINE = FLATLINE;
  CONFIG.Combat.initiative = { formula:'1d10', decimals:0 };

  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet(SYSTEM_ID, CorredorSheet, { types:[ACTOR_TYPES.CORREDOR], makeDefault:true, label:'FLATLINE.ActorType.corredor' });
  Actors.registerSheet(SYSTEM_ID, AmeacaSheet,   { types:[ACTOR_TYPES.AMEACA],   makeDefault:true, label:'FLATLINE.ActorType.ameaca'   });
  Actors.registerSheet(SYSTEM_ID, VeiculoSheet,  { types:[ACTOR_TYPES.VEICULO],  makeDefault:true, label:'FLATLINE.ActorType.veiculo'  });

  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet(SYSTEM_ID, FlatlineItemSheet, { types:Object.values(ITEM_TYPES), makeDefault:true });

  registerHandlebarsHelpers();
  await preloadHandlebarsTemplates();
  registerSystemSettings();
  console.log('FLATLINE | Sistema inicializado');
});

Hooks.once('ready', () => console.log('FLATLINE | Pronto'));
Hooks.on('renderChatMessage', (msg, html) => activateRollChatListeners(msg, html));

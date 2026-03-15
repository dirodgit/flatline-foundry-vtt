import * as FL from './constants.js';

/**
 * Configuração global do sistema FLATLINE.
 * @constant
 * @enum {any}
 */
export const FLATLINE = {};

// --- Escala de Dados ---
/** @type {Map.<string, number>} Letra → tamanho do dado */
FLATLINE.scoreMap = new Map();
FLATLINE.scoreMap.set('–', 0);
for (const [k, v] of Object.entries(FL.DIE_SCORES)) {
  FLATLINE.scoreMap.set(k, v);
}

/** @type {Map.<number, string>} Tamanho do dado → letra */
FLATLINE.dieMap = new Map(Array.from(FLATLINE.scoreMap, ([n, v]) => [v, n]));

// --- Atributos ---
FLATLINE.attributes = Object.values(FL.ATTRIBUTES);

/** @type {Object.<string, string>} atributo → chave de tradução */
FLATLINE.attributeLabels = {
  [FL.ATTRIBUTES.FORCA]:    'FLATLINE.Attribute.Forca',
  [FL.ATTRIBUTES.AGILIDADE]:'FLATLINE.Attribute.Agilidade',
  [FL.ATTRIBUTES.ASTUCIA]:  'FLATLINE.Attribute.Astucia',
  [FL.ATTRIBUTES.EMPATIA]:  'FLATLINE.Attribute.Empatia',
};

// --- Perícias ---
FLATLINE.skillMap = FL.SKILL_ATTRIBUTE_MAP;
FLATLINE.skills   = Object.keys(FLATLINE.skillMap);

/** @type {Object.<string, string>} perícia → chave de tradução */
FLATLINE.skillLabels = {
  lutar:     'FLATLINE.Skill.Lutar',
  atirar:    'FLATLINE.Skill.Atirar',
  suportar:  'FLATLINE.Skill.Suportar',
  mover:     'FLATLINE.Skill.Mover',
  esgueirar: 'FLATLINE.Skill.Esgueirar',
  pilotar:   'FLATLINE.Skill.Pilotar',
  construir: 'FLATLINE.Skill.Construir',
  hackear:   'FLATLINE.Skill.Hackear',
  observar:  'FLATLINE.Skill.Observar',
  sobreviver:'FLATLINE.Skill.Sobreviver',
  persuadir: 'FLATLINE.Skill.Persuadir',
  intuir:    'FLATLINE.Skill.Intuir',
  curar:     'FLATLINE.Skill.Curar',
  manobrar:  'FLATLINE.Skill.Manobrar',
};

// --- Arquétipos ---
FLATLINE.archetypeLabels = {
  [FL.ARCHETYPES.MERCENARIO]: 'FLATLINE.Archetype.Mercenario',
  [FL.ARCHETYPES.NEGOCIANTE]: 'FLATLINE.Archetype.Negociante',
  [FL.ARCHETYPES.HOLOMANTE]:  'FLATLINE.Archetype.Holomante',
  [FL.ARCHETYPES.TECNICO]:    'FLATLINE.Archetype.Tecnico',
  [FL.ARCHETYPES.PILOTO]:     'FLATLINE.Archetype.Piloto',
  [FL.ARCHETYPES.POLICIAL]:   'FLATLINE.Archetype.Policial',
  [FL.ARCHETYPES.EXECUTIVO]:  'FLATLINE.Archetype.Executivo',
  [FL.ARCHETYPES.INFLUENCER]: 'FLATLINE.Archetype.Influencer',
  [FL.ARCHETYPES.MEDICO]:     'FLATLINE.Archetype.Medico',
};

// --- Atributo-chave por Arquétipo ---
FLATLINE.archetypeKeyAttribute = {
  [FL.ARCHETYPES.MERCENARIO]: FL.ATTRIBUTES.FORCA,
  [FL.ARCHETYPES.NEGOCIANTE]: FL.ATTRIBUTES.EMPATIA,
  [FL.ARCHETYPES.HOLOMANTE]:  FL.ATTRIBUTES.ASTUCIA,
  [FL.ARCHETYPES.TECNICO]:    FL.ATTRIBUTES.ASTUCIA,
  [FL.ARCHETYPES.PILOTO]:     FL.ATTRIBUTES.AGILIDADE,
  [FL.ARCHETYPES.POLICIAL]:   FL.ATTRIBUTES.FORCA,
  [FL.ARCHETYPES.EXECUTIVO]:  FL.ATTRIBUTES.EMPATIA,
  [FL.ARCHETYPES.INFLUENCER]: FL.ATTRIBUTES.EMPATIA,
  [FL.ARCHETYPES.MEDICO]:     FL.ATTRIBUTES.EMPATIA,
};

// --- Alcances ---
FLATLINE.rangeLabels = {
  [FL.RANGES.ENGAJADO]: 'FLATLINE.Range.Engajado',
  [FL.RANGES.CURTO]:    'FLATLINE.Range.Curto',
  [FL.RANGES.MEDIO]:    'FLATLINE.Range.Medio',
  [FL.RANGES.LONGO]:    'FLATLINE.Range.Longo',
  [FL.RANGES.EXTREMO]:  'FLATLINE.Range.Extremo',
};

// --- Condições ---
FLATLINE.conditionPenalties = {
  leve:     -1,
  moderada: -2,
  severa:   -3,
};

// --- Degradação ---
/** Dado de Degradação por nível da trilha */
FLATLINE.degradationDie = {
  0: 6, 1: 6, 2: 6, 3: 6,
  4: 8, 5: 8, 6: 8,
  7: 10, 8: 10, 9: 10,
  10: 12, 11: 12, 12: 12,
};

// --- RAM ---
FLATLINE.ramProgramCost = { 1: 1, 2: 2, 3: 3 };
FLATLINE.ramCyberwareCost = 1;
FLATLINE.ramSkillChipCost = 1;
FLATLINE.ramSuppressConditionCost = 2;
FLATLINE.ramMax = 10;

/** Limiar de RAM por tamanho de dado do maior atributo */
FLATLINE.ramThreshold = {
  6: 6, 8: 8, 10: 10, 12: 12,
};

// --- CRED inicial por arquétipo ---
FLATLINE.archetypeStartingCred = {
  [FL.ARCHETYPES.MERCENARIO]: 2,
  [FL.ARCHETYPES.NEGOCIANTE]: 5,
  [FL.ARCHETYPES.HOLOMANTE]:  3,
  [FL.ARCHETYPES.TECNICO]:    3,
  [FL.ARCHETYPES.PILOTO]:     3,
  [FL.ARCHETYPES.POLICIAL]:   3,
  [FL.ARCHETYPES.EXECUTIVO]:  6,
  [FL.ARCHETYPES.INFLUENCER]: 4,
  [FL.ARCHETYPES.MEDICO]:     4,
};

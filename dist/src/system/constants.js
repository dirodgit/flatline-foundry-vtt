/**
 * FLATLINE — Constantes do Sistema
 * Estes valores não devem ser alterados.
 */

/** @type {string} */
export const SYSTEM_ID = 'flatline';

/**
 * Escala de dados YZE — letra → tamanho do dado
 * @enum {number}
 */
export const DIE_SCORES = {
  /** @type {12} */ A: 12,
  /** @type {10} */ B: 10,
  /** @type {8}  */ C: 8,
  /** @type {6}  */ D: 6,
};

/**
 * Atributos do Corredor
 * @enum {string}
 */
export const ATTRIBUTES = {
  FORCA:    'forca',
  AGILIDADE: 'agilidade',
  ASTUCIA:  'astucia',
  EMPATIA:  'empatia',
};

/**
 * Perícias do sistema
 * @enum {string}
 */
export const SKILLS = {
  LUTAR:     'lutar',
  ATIRAR:    'atirar',
  SUPORTAR:  'suportar',
  MOVER:     'mover',
  ESGUEIRAR: 'esgueirar',
  PILOTAR:   'pilotar',
  CONSTRUIR: 'construir',
  HACKEAR:   'hackear',
  OBSERVAR:  'observar',
  SOBREVIVER:'sobreviver',
  PERSUADIR: 'persuadir',
  INTUIR:    'intuir',
  CURAR:     'curar',
  MANOBRAR:  'manobrar', // perícia de veículo
};

/**
 * Mapeamento Perícia → Atributo
 * @type {Object.<string,string>}
 */
export const SKILL_ATTRIBUTE_MAP = {
  lutar:     ATTRIBUTES.FORCA,
  atirar:    ATTRIBUTES.AGILIDADE,
  suportar:  ATTRIBUTES.FORCA,
  mover:     ATTRIBUTES.AGILIDADE,
  esgueirar: ATTRIBUTES.AGILIDADE,
  pilotar:   ATTRIBUTES.AGILIDADE,
  construir: ATTRIBUTES.ASTUCIA,
  hackear:   ATTRIBUTES.ASTUCIA,
  observar:  ATTRIBUTES.ASTUCIA,
  sobreviver:ATTRIBUTES.ASTUCIA,
  persuadir: ATTRIBUTES.EMPATIA,
  intuir:    ATTRIBUTES.EMPATIA,
  curar:     ATTRIBUTES.EMPATIA,
  manobrar:  ATTRIBUTES.AGILIDADE,
};

/**
 * Arquétipos disponíveis
 * @enum {string}
 */
export const ARCHETYPES = {
  MERCENARIO: 'mercenario',
  NEGOCIANTE: 'negociante',
  HOLOMANTE:  'holomante',
  TECNICO:    'tecnico',
  PILOTO:     'piloto',
  POLICIAL:   'policial',
  EXECUTIVO:  'executivo',
  INFLUENCER: 'influencer',
  MEDICO:     'medico',
};

/**
 * Graus de Condição
 * @enum {string}
 */
export const CONDITION_GRADES = {
  LEVE:     'leve',
  MODERADA: 'moderada',
  SEVERA:   'severa',
};

/**
 * Tipos de Condição
 * @enum {string}
 */
export const CONDITION_TYPES = {
  FISICA:  'fisica',
  MENTAL:  'mental',
};

/**
 * Categorias de alcance
 * @enum {number}
 */
export const RANGES = {
  ENGAJADO: 0,
  CURTO:    1,
  MEDIO:    2,
  LONGO:    3,
  EXTREMO:  4,
};

/**
 * Tipos de Actor
 * @enum {string}
 */
export const ACTOR_TYPES = {
  CORREDOR: 'corredor',
  VEICULO:  'veiculo',
  AMEACA:   'ameaca',
};

/**
 * Tipos de Item
 * @enum {string}
 */
export const ITEM_TYPES = {
  ARMA:        'arma',
  ARMADURA:    'armadura',
  CYBERWARE:   'cyberware',
  PROGRAMA:    'programa',
  ESPECIALIDADE:'especialidade',
  EQUIPAMENTO: 'equipamento',
  LESAO:       'lesao',
};

/**
 * Chaves de configuração do sistema
 * @enum {string}
 */
export const SETTINGS_KEYS = {
  SHOW_DEGRADATION_DIALOG: 'showDegradationDialog',
  AUTO_CONDITIONS:         'autoConditions',
};

/**
 * Níveis de dano e condição correspondente
 */
export const DAMAGE_TO_CONDITION = {
  1: CONDITION_GRADES.LEVE,
  2: CONDITION_GRADES.MODERADA,
  3: CONDITION_GRADES.SEVERA,
};

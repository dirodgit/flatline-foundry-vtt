/**
 * ============================================================================
 * FLATLINE RPG — Sistema para Foundry VTT v13
 * ============================================================================
 * Cyberpunk brasileiro. 2099. Você faz corres. As corporações fazem leis.
 * ============================================================================
 * Baseado no Year Zero Engine SRD (CC-BY 4.0 — Free League Publishing)
 * ============================================================================
 */

import { FLATLINE }    from './system/config.js';
import { ACTOR_TYPES, ITEM_TYPES, SETTINGS_KEYS, SYSTEM_ID } from './system/constants.js';
import FlatlineActor    from './actor/actor-document.js';
import FlatlineItem     from './item/item-document.js';
import CorredorSheet    from './actor/character/character-sheet.js';
import FlatlineItemSheet from './item/item-sheet.js';
import { activateRollChatListeners } from './components/roll/roller.js';
import { registerHandlebarsHelpers, preloadHandlebarsTemplates } from './system/handlebars.js';
import { registerSystemSettings } from './system/settings.js';

/* ------------------------------------------ */
/*  Inicialização                             */
/* ------------------------------------------ */

Hooks.once('init', async () => {
  console.log('FLATLINE | Inicializando o sistema');

  // Namespace global
  game.flatline = {
    config: FLATLINE,
    actor:  FlatlineActor,
    item:   FlatlineItem,
  };

  // Registra classes de documento
  CONFIG.Actor.documentClass = FlatlineActor;
  CONFIG.Item.documentClass  = FlatlineItem;

  // Registra CONFIG global
  CONFIG.FLATLINE = FLATLINE;

  // Iniciativa: compra de cartas — sem fórmula automática
  CONFIG.Combat.initiative = {
    formula:  '1d10',
    decimals: 0,
  };

  // Registra sheets
  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet(SYSTEM_ID, CorredorSheet, {
    types:   [ACTOR_TYPES.CORREDOR],
    makeDefault: true,
    label:   'FLATLINE.ActorType.corredor',
  });

  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet(SYSTEM_ID, FlatlineItemSheet, {
    types:   Object.values(ITEM_TYPES),
    makeDefault: true,
  });

  // Helpers e templates Handlebars
  registerHandlebarsHelpers();
  await preloadHandlebarsTemplates();

  // Configurações do sistema
  registerSystemSettings();

  console.log('FLATLINE | Sistema inicializado');
});

/* ------------------------------------------ */
/*  Ready                                     */
/* ------------------------------------------ */

Hooks.once('ready', () => {
  console.log('FLATLINE | Pronto');
});

/* ------------------------------------------ */
/*  Chat Messages                             */
/* ------------------------------------------ */

Hooks.on('renderChatMessage', (message, html) => {
  activateRollChatListeners(message, html);
});

/* ------------------------------------------ */
/*  Canvas Ready                              */
/* ------------------------------------------ */

Hooks.on('canvasReady', () => {
  // Hook de canvas — expandível
});
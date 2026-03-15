import { SYSTEM_ID, ACTOR_TYPES, ITEM_TYPES } from './constants.js';
import CorredorSheet     from '../actor/character/character-sheet.js';
import AmeacaSheet       from '../actor/ameaca/ameaca-sheet.js';
import VeiculoSheet      from '../actor/vehicle/vehicle-sheet.js';
import FlatlineItemSheet from '../item/item-sheet.js';

/**
 * Registra todas as sheets do sistema.
 * Chamado durante o hook 'init'.
 */
export function registerSheets() {
  Actors.unregisterSheet('core', ActorSheet);

  Actors.registerSheet(SYSTEM_ID, CorredorSheet, {
    types:       [ACTOR_TYPES.CORREDOR],
    makeDefault: true,
    label:       'FLATLINE.ActorType.corredor',
  });

  Actors.registerSheet(SYSTEM_ID, AmeacaSheet, {
    types:       [ACTOR_TYPES.AMEACA],
    makeDefault: true,
    label:       'FLATLINE.ActorType.ameaca',
  });

  Actors.registerSheet(SYSTEM_ID, VeiculoSheet, {
    types:       [ACTOR_TYPES.VEICULO],
    makeDefault: true,
    label:       'FLATLINE.ActorType.veiculo',
  });

  Items.unregisterSheet('core', ItemSheet);

  Items.registerSheet(SYSTEM_ID, FlatlineItemSheet, {
    types:       Object.values(ITEM_TYPES),
    makeDefault: true,
  });

  console.log('FLATLINE | Sheets registradas');
}
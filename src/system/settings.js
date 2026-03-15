import { SYSTEM_ID, SETTINGS_KEYS } from '@system/constants.js';

/**
 * Registra as configurações do sistema FLATLINE no Foundry.
 */
export function registerSystemSettings() {

  game.settings.register(SYSTEM_ID, SETTINGS_KEYS.SHOW_DEGRADATION_DIALOG, {
    name:    'FLATLINE.Settings.ShowDegradationDialog',
    hint:    'FLATLINE.Settings.ShowDegradationDialogHint',
    scope:   'world',
    config:  true,
    type:    Boolean,
    default: true,
  });

  game.settings.register(SYSTEM_ID, SETTINGS_KEYS.AUTO_CONDITIONS, {
    name:    'FLATLINE.Settings.AutoConditions',
    hint:    'FLATLINE.Settings.AutoConditionsHint',
    scope:   'world',
    config:  true,
    type:    Boolean,
    default: true,
  });

  console.log('FLATLINE | Configurações registradas');
}

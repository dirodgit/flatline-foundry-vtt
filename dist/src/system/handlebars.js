import { SYSTEM_ID } from './constants.js';

/**
 * Registra helpers Handlebars customizados para o FLATLINE.
 */
export function registerHandlebarsHelpers() {

  // {{#each-in obj}} — itera chaves/valores de objeto (removido no Foundry v13)
  Handlebars.registerHelper('each-in', function(obj, options) {
    if (!obj) return options.inverse(this);
    let result = '';
    for (const [key, value] of Object.entries(obj)) {
      const data = Handlebars.createFrame(options.data);
      data.key = key;
      result += options.fn(value, { data });
    }
    return result || options.inverse(this);
  });


  // {{selected value compare}} — equivale a selected="selected"
  Handlebars.registerHelper('selected', (value, compare) =>
    String(value) === String(compare) ? 'selected' : ''
  );

  // {{checked bool}} — equivale a checked
  Handlebars.registerHelper('checked', (value) =>
    value ? 'checked' : ''
  );

  // {{eq a b}} — igualdade estrita
  Handlebars.registerHelper('eq', (a, b) => a === b);

  // {{neq a b}}
  Handlebars.registerHelper('neq', (a, b) => a !== b);

  // {{gt a b}}
  Handlebars.registerHelper('gt', (a, b) => a > b);

  // {{gte a b}}
  Handlebars.registerHelper('gte', (a, b) => a >= b);

  // {{lt a b}}
  Handlebars.registerHelper('lt', (a, b) => a < b);

  // {{lte a b}}
  Handlebars.registerHelper('lte', (a, b) => a <= b);

  // {{add a b}}
  Handlebars.registerHelper('add', (a, b) => Number(a) + Number(b));

  // {{sub a b}}
  Handlebars.registerHelper('sub', (a, b) => Number(a) - Number(b));

  // {{abs value}}
  Handlebars.registerHelper('abs', (v) => Math.abs(v));

  // {{concat a b}} — concatena strings
  Handlebars.registerHelper('concat', (...args) => {
    args.pop(); // remove o options object do Handlebars
    return args.join('');
  });

  // {{times n block}} — loop de n vezes (1-indexed)
  Handlebars.registerHelper('times', function (n, options) {
    let result = '';
    for (let i = 1; i <= n; i++) {
      result += options.fn(i);
    }
    return result;
  });

  // {{capitalize str}} — primeira letra maiúscula
  Handlebars.registerHelper('capitalize', (str) => {
    if (!str) return '';
    return String(str).charAt(0).toUpperCase() + String(str).slice(1);
  });

  // {{dieLabel value}} — valor numérico → letra do dado (6→D, 8→C, 10→B, 12→A)
  Handlebars.registerHelper('dieLabel', (value) => {
    const map = { 6: 'D', 8: 'C', 10: 'B', 12: 'A' };
    return map[value] ?? '—';
  });

  // {{dieClass value}} — valor numérico → classe CSS do dado
  Handlebars.registerHelper('dieClass', (value) => {
    const map = { 6: 'die-d', 8: 'die-c', 10: 'die-b', 12: 'die-a' };
    return map[value] ?? '';
  });

  // {{localizeAttr key}} — localiza atributo pelo key
  Handlebars.registerHelper('localizeAttr', (key) =>
    game.i18n.localize(`FLATLINE.Attribute.${key.charAt(0).toUpperCase() + key.slice(1)}`)
  );

  // {{enrichHTML content}} — renderiza HTML enriquecido
  Handlebars.registerHelper('enrichHTML', (content, options) => {
    return new Handlebars.SafeString(
      TextEditor.enrichHTML(content ?? '', { async: false })
    );
  });

  // {{numberInput name value options}} — input numérico
  Handlebars.registerHelper('numberInput', (name, value, options) => {
    const hash = options?.hash ?? {};
    const min  = hash.min ?? 0;
    const max  = hash.max ?? 999;
    const step = hash.step ?? 1;
    return new Handlebars.SafeString(
      `<input type="number" name="${name}" value="${value}" min="${min}" max="${max}" step="${step}"/>`
    );
  });

  console.log('FLATLINE | Helpers Handlebars registrados');
}

/**
 * Pré-carrega todos os templates Handlebars do sistema.
 * @returns {Promise}
 */
export async function preloadHandlebarsTemplates() {
  const paths = [
    // Ficha do Corredor
    `systems/${SYSTEM_ID}/templates/actor/corredor-sheet.hbs`,
    `systems/${SYSTEM_ID}/templates/actor/sheet-tabs/stats-tab.hbs`,
    `systems/${SYSTEM_ID}/templates/actor/sheet-tabs/combat-tab.hbs`,
    `systems/${SYSTEM_ID}/templates/actor/sheet-tabs/inventory-tab.hbs`,
    `systems/${SYSTEM_ID}/templates/actor/sheet-tabs/holomancia-tab.hbs`,
    `systems/${SYSTEM_ID}/templates/actor/sheet-tabs/bio-tab.hbs`,
    // Fichas de NPC / Veículo
    `systems/${SYSTEM_ID}/templates/actor/ameaca-sheet.hbs`,
    `systems/${SYSTEM_ID}/templates/actor/veiculo-sheet.hbs`,
    // Partials
    `systems/${SYSTEM_ID}/templates/actor/partials/resources-bar.hbs`,
    // Itens
    `systems/${SYSTEM_ID}/templates/item/arma-sheet.hbs`,
    `systems/${SYSTEM_ID}/templates/item/armadura-sheet.hbs`,
    `systems/${SYSTEM_ID}/templates/item/cyberware-sheet.hbs`,
    `systems/${SYSTEM_ID}/templates/item/programa-sheet.hbs`,
    `systems/${SYSTEM_ID}/templates/item/especialidade-sheet.hbs`,
    `systems/${SYSTEM_ID}/templates/item/equipamento-sheet.hbs`,
    `systems/${SYSTEM_ID}/templates/item/lesao-sheet.hbs`,
    // Chat cards
    `systems/${SYSTEM_ID}/templates/chat/roll-card.hbs`,
    `systems/${SYSTEM_ID}/templates/chat/item-card.hbs`,
    `systems/${SYSTEM_ID}/templates/chat/degradation-card.hbs`,
  ];

  return loadTemplates(paths);
}
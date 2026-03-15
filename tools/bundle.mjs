/**
 * tools/bundle.mjs
 * Monta o pacote final em dist/ copiando:
 *   - dist/flatline.js   (gerado pelo esbuild)
 *   - dist/flatline.css  (gerado pelo sass)
 *   - static/**          (system.json, template.json, assets, lang)
 *   - templates/**       (todos os .hbs, espelhando estrutura src)
 *
 * Executar APÓS `npm run build`.
 */

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root      = path.join(__dirname, '..');
const dist      = path.join(root, 'dist');

/* ---- helpers ---- */
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

/* ---- Copia static/ → dist/ ---- */
console.log('📦 Copiando static/ → dist/');
copyDir(path.join(root, 'static'), dist);

/* ---- Copia lang compilada ---- */
// Converte src/lang/pt-BR.yml → dist/lang/pt-BR.json
// (como usamos JSON diretamente, vamos copiar o arquivo que já está em static/lang)
// Se quiser YAML → JSON, descomente o bloco abaixo e instale js-yaml:
// import YAML from 'js-yaml';
// const yml = fs.readFileSync(path.join(root,'src/lang/pt-BR.yml'), 'utf8');
// fs.writeFileSync(path.join(dist,'lang/pt-BR.json'), JSON.stringify(YAML.load(yml), null, 2));

/* ---- Copia templates HBS: src → dist/templates ---- */
console.log('📄 Copiando templates HBS…');

const templateMap = [
  // Actor: corredor
  {
    src:  'src/actor/character/templates/character-sheet.hbs',
    dest: 'dist/templates/actor/corredor-sheet.hbs',
  },
  {
    src:  'src/actor/character/templates/sheet-tabs/stats-tab.hbs',
    dest: 'dist/templates/actor/sheet-tabs/stats-tab.hbs',
  },
  {
    src:  'src/actor/character/templates/sheet-tabs/combat-tab.hbs',
    dest: 'dist/templates/actor/sheet-tabs/combat-tab.hbs',
  },
  {
    src:  'src/actor/character/templates/sheet-tabs/inventory-tab.hbs',
    dest: 'dist/templates/actor/sheet-tabs/inventory-tab.hbs',
  },
  {
    src:  'src/actor/character/templates/sheet-tabs/holomancia-tab.hbs',
    dest: 'dist/templates/actor/sheet-tabs/holomancia-tab.hbs',
  },
  {
    src:  'src/actor/character/templates/sheet-tabs/bio-tab.hbs',
    dest: 'dist/templates/actor/sheet-tabs/bio-tab.hbs',
  },
  // Actor: ameaça
  {
    src:  'src/actor/ameaca/templates/ameaca-sheet.hbs',
    dest: 'dist/templates/actor/ameaca-sheet.hbs',
  },
  // Actor: veículo
  {
    src:  'src/actor/vehicle/templates/vehicle-sheet.hbs',
    dest: 'dist/templates/actor/veiculo-sheet.hbs',
  },
  // Partials
  {
    src:  'src/actor/templates/partials/resources-bar.hbs',
    dest: 'dist/templates/actor/partials/resources-bar.hbs',
  },
  // Items
  {
    src:  'src/item/templates/arma-sheet.hbs',
    dest: 'dist/templates/item/arma-sheet.hbs',
  },
  {
    src:  'src/item/templates/armadura-sheet.hbs',
    dest: 'dist/templates/item/armadura-sheet.hbs',
  },
  {
    src:  'src/item/templates/cyberware-sheet.hbs',
    dest: 'dist/templates/item/cyberware-sheet.hbs',
  },
  {
    src:  'src/item/templates/programa-sheet.hbs',
    dest: 'dist/templates/item/programa-sheet.hbs',
  },
  {
    src:  'src/item/templates/especialidade-sheet.hbs',
    dest: 'dist/templates/item/especialidade-sheet.hbs',
  },
  {
    src:  'src/item/templates/equipamento-sheet.hbs',
    dest: 'dist/templates/item/equipamento-sheet.hbs',
  },
  {
    src:  'src/item/templates/lesao-sheet.hbs',
    dest: 'dist/templates/item/lesao-sheet.hbs',
  },
  // Chat cards
  {
    src:  'src/components/chat/roll-card.hbs',
    dest: 'dist/templates/chat/roll-card.hbs',
  },
  {
    src:  'src/components/chat/item-card.hbs',
    dest: 'dist/templates/chat/item-card.hbs',
  },
  {
    src:  'src/components/chat/degradation-card.hbs',
    dest: 'dist/templates/chat/degradation-card.hbs',
  },
];

for (const { src, dest } of templateMap) {
  const srcPath  = path.join(root, src);
  const destPath = path.join(root, dest);
  if (fs.existsSync(srcPath)) {
    copyFile(srcPath, destPath);
    console.log(`  ✓ ${dest}`);
  } else {
    console.warn(`  ⚠ Não encontrado: ${src}`);
  }
}

console.log('\n✅ Bundle completo em dist/');
console.log('   Execute `npm run release` para gerar o .zip\n');

/**
 * tools/release.mjs
 * Gera flatline-fvtt_vX.Y.Z.zip a partir de dist/
 * Executar APÓS `npm run build && node tools/bundle.mjs`
 */

import fs       from 'fs';
import path     from 'path';
import archiver from 'archiver';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root      = path.join(__dirname, '..');
const dist      = path.join(root, 'dist');

// Lê versão do system.json
const systemJson = JSON.parse(
  fs.readFileSync(path.join(dist, 'system.json'), 'utf8')
);
const version  = systemJson.version;
const zipName  = `flatline-fvtt_v${version}.zip`;
const zipPath  = path.join(root, zipName);

console.log(`📦 Gerando ${zipName}…`);

const output  = fs.createWriteStream(zipPath);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  const kb = (archive.pointer() / 1024).toFixed(1);
  console.log(`✅ ${zipName} (${kb} KB)`);
  console.log(`\n🚀 Próximos passos:`);
  console.log(`   1. git tag v${version}`);
  console.log(`   2. git push origin v${version}`);
  console.log(`   3. Crie o Release no GitHub e anexe ${zipName}`);
  console.log(`   4. URL de instalação no Foundry:`);
  console.log(`      https://raw.githubusercontent.com/SEU_USUARIO/flatline-foundry-vtt/main/dist/system.json\n`);
});

archive.on('error', err => { throw err; });
archive.pipe(output);

// Adiciona todo o conteúdo de dist/ na raiz do zip
archive.directory(dist, false);
archive.finalize();

import * as esbuild from 'esbuild';
import * as sass    from 'sass';
import * as fs      from 'fs';
import * as path    from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isWatch   = process.argv.includes('--watch');
const outDir    = path.join(__dirname, 'dist');

// Garante que o diretório de saída existe
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

/* ------------------------------------------ */
/*  Alias plugin — resolve @system, @actor…   */
/* ------------------------------------------ */
const aliasPlugin = {
  name: 'alias',
  setup(build) {
    const aliases = {
      '@system':     path.join(__dirname, 'src/system'),
      '@actor':      path.join(__dirname, 'src/actor'),
      '@item':       path.join(__dirname, 'src/item'),
      '@components': path.join(__dirname, 'src/components'),
      '@utils':      path.join(__dirname, 'src/utils'),
    };
    build.onResolve({ filter: /^@/ }, args => {
      for (const [alias, resolved] of Object.entries(aliases)) {
        if (args.path.startsWith(alias)) {
          return { path: args.path.replace(alias, resolved) };
        }
      }
    });
  },
};

/* ------------------------------------------ */
/*  Compila SCSS → dist/flatline.css           */
/* ------------------------------------------ */
function compileSCSS() {
  try {
    const result = sass.compile(
      path.join(__dirname, 'src/flatline.scss'),
      { style: 'compressed', sourceMap: false }
    );
    fs.writeFileSync(path.join(outDir, 'flatline.css'), result.css);
    console.log('✓ SCSS compilado → dist/flatline.css');
  } catch (e) {
    console.error('✗ Erro no SCSS:', e.message);
  }
}

/* ------------------------------------------ */
/*  Configuração esbuild                       */
/* ------------------------------------------ */
const buildOptions = {
  entryPoints: ['src/flatline.js'],
  outfile:     'dist/flatline.js',
  bundle:      true,
  format:      'esm',
  sourcemap:   !isWatch ? false : 'inline',
  minify:      !isWatch,
  plugins:     [aliasPlugin],
  logLevel:    'info',
};

if (isWatch) {
  // Modo watch — rebuilda JS e SCSS a cada mudança
  const ctx = await esbuild.context({
    ...buildOptions,
    plugins: [
      aliasPlugin,
      {
        name: 'scss-watch',
        setup(build) {
          build.onEnd(() => compileSCSS());
        },
      },
    ],
  });
  compileSCSS();
  await ctx.watch();
  console.log('👁  Watching for changes…');
} else {
  // Build único
  await esbuild.build(buildOptions);
  compileSCSS();
  console.log('✓ Build completo → dist/');
}

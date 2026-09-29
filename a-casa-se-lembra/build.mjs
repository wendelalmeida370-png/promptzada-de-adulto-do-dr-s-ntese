// Gera dist/game.js como um único script clássico (IIFE), para que o jogo
// abra com dois cliques no index.html (file://), sem servidor.
import * as esbuild from 'esbuild';

const watch = process.argv.includes('--watch');

const options = {
  entryPoints: ['src/main.js'],
  bundle: true,
  format: 'iife',
  target: ['es2020'],
  outfile: 'dist/game.js',
  minify: !watch,
  sourcemap: watch ? 'inline' : false,
  legalComments: 'none',
  logLevel: 'info',
};

if (watch) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  console.log('observando alterações...');
} else {
  await esbuild.build(options);
}

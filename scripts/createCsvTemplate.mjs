import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const DEFAULT_FILENAME = 'plantilla-entregas.csv';

const args = process.argv.slice(2);
const outputFlagIndex = args.findIndex(arg => arg === '--out' || arg === '-o');
const outputArg = outputFlagIndex >= 0 ? args[outputFlagIndex + 1] : undefined;

if (outputFlagIndex >= 0 && !outputArg) {
  process.stderr.write('Falta la ruta despues de --out o -o.\n');
  process.exitCode = 1;
} else {
  const outputPath = outputArg ?? DEFAULT_FILENAME;
  const resolvedPath = resolve(process.cwd(), outputPath);
  const content = ['materia,nombre,fecha de entrega', 'Matematicas,Parcial 1,2026-03-10'].join(
    '\n'
  );

  mkdirSync(dirname(resolvedPath), { recursive: true });
  writeFileSync(resolvedPath, content, 'utf8');
  process.stdout.write(`Plantilla creada en: ${resolvedPath}\n`);
}

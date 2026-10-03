import { spawn, spawnSync } from 'node:child_process';

const compiler = 'node_modules/typescript/bin/tsc';
const initialBuild = spawnSync(
  process.execPath,
  [compiler, '-p', 'tsconfig.student.json'],
  {
    stdio: 'inherit',
  },
);
if (initialBuild.status !== 0) process.exit(initialBuild.status || 1);

const children = [
  spawn(
    process.execPath,
    [
      compiler,
      '-p',
      'tsconfig.student.json',
      '--watch',
      '--preserveWatchOutput',
    ],
    { stdio: 'inherit' },
  ),
  spawn(
    process.execPath,
    ['node_modules/next/dist/bin/next', 'dev', ...process.argv.slice(2)],
    { stdio: 'inherit' },
  ),
];
let stopping = false;
function stop(code) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill('SIGTERM');
  process.exitCode = code;
}
for (const child of children) {
  child.on('error', (error) => {
    console.error(error);
    stop(1);
  });
  child.on('exit', (code) => stop(code || 0));
}
process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));

// @flow

const child_process = require('child_process');
const os = require('os');
const fs = require('fs-extra');
const path = require('path');
const outdent = require('outdent');

const isWindows = os.platform() === 'win32';

const root = path.normalize(path.join(__dirname, '..'));
const bin = path.join(root, 'bin');

fs.mkdirpSync(bin);

function which(cmd) {
  const which = isWindows ? 'where' : 'which';
  return child_process.execSync(`${which} esy-solve-cudf`).toString().trim();
}

const esySolveCudf = which('esy-solve-cudf');

if (isWindows) {
  const esy = path.join(bin, 'esy.cmd');
  fs.writeFileSync(
    path.join(bin, 'esy.cmd'),
    outdent`
    @ECHO off
    @SETLOCAL
    @SET ESY__SOLVE_CUDF_COMMAND=${esySolveCudf}
    "${root}/_build/default/esy/bin/esyCommand.exe" %%*
    `
  );
} else {
  const esy = path.join(bin, 'esy');
  fs.writeFileSync(
    esy,
    outdent`
    #!/bin/bash
    export ESY__SOLVE_CUDF_COMMAND="${esySolveCudf}"
    exec "${root}/_build/default/esy/bin/esyCommand.exe" "$@"
    `
  );
  fs.chmodSync(esy, 0o755);

}
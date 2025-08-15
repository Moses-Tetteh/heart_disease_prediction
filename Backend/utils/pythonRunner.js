// utils/pythonRunner.js

import { spawn } from 'child_process';
import path from 'path';

/**
 * Spawns a Python child process and returns its stdout (or rejects on non-zero exit).
 *
 * @param {string} scriptPath
 *   - Path to the Python script you want to run (absolute or relative).
 *   - If relative, it will be resolved against process.cwd().
 * @param {string[]} args
 *   - An array of strings to pass as command-line arguments to Python.
 * @param {NodeJS.ProcessEnv} [env]
 *   - (Optional) environment variables to merge into `process.env`.
 *   - Example: { PATH: '/custom/python/bin:' + process.env.PATH }
 *
 * @returns {Promise<string>}
 *   - Resolves with whatever the script printed to stdout (trimmed).
 *   - Rejects if the script exits with a non-zero code (and includes stderr).
 */
export function runPython(scriptPath, args = [], env = {}) {
  return new Promise((resolve, reject) => {
    // 1) Resolve the scriptPath to an absolute path
    const resolvedScript = path.isAbsolute(scriptPath)
      ? scriptPath
      : path.resolve(process.cwd(), scriptPath);

    // 2) Choose the Python command; change to 'python3' if needed
    const pythonCmd = process.env.PYTHON_BIN || 'python';

    // 3) Spawn the child process
    const pythonProcess = spawn(
      pythonCmd,
      [resolvedScript, ...args],
      {
        env: { ...process.env, ...env },
        // If you want to run inside the script’s own folder, uncomment:
        // cwd: path.dirname(resolvedScript),
      }
    );

    let stdoutData = '';
    let stderrData = '';

    pythonProcess.stdout.on('data', (chunk) => {
      stdoutData += chunk.toString();
    });

    pythonProcess.stderr.on('data', (chunk) => {
      stderrData += chunk.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`\n––– Python stderr (${code}) –––\n${stderrData}`);
        return reject(new Error(`Python exited with code ${code}\n${stderrData}`));
      }
      resolve(stdoutData.trim());
    });

    pythonProcess.on('error', (err) => {
      console.error('Failed to start Python process:', err);
      reject(err);
    });
  });
}

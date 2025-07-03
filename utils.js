import { exec } from "child_process";

export function execPromise(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) reject(new Error(stderr));
      else resolve(stdout);
    });
  });
}

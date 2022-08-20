import { exec } from "child_process";
import path from "node:path";
export function installNuxt(projectName) {
    return new Promise((resolve, reject) => exec(`cd ${projectName} && npx nuxi init client`, (error) => {
        if (error) {
            reject(error);
        }
        resolve();
    }));
}
export function installTailwind(projectName) {
    return new Promise((resolve, reject) => {
        const nuxtPath = path.join(projectName, "client");
        exec(`npm install --save-dev @nuxtjs/tailwindcss`, { cwd: nuxtPath }, (error) => {
            if (error) {
                reject(error);
            }
            exec('npx tailwindcss init', { cwd: nuxtPath });
            resolve();
        });
    });
}
//# sourceMappingURL=nuxt.js.map
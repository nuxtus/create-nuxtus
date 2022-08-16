import { exec } from "child_process";
export function installNuxt(projectName) {
    return new Promise((resolve, reject) => exec(`cd ${projectName} && npx nuxi init client`, (error) => {
        if (error) {
            reject(error);
        }
        resolve();
    }));
}
//# sourceMappingURL=nuxt.js.map
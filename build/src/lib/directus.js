import * as fs from 'fs';
import * as path from 'path';
import { exec, execSync, spawn } from 'child_process';
import ora from 'ora';
export function startDirectus() {
    spawn('npx', ['directus', 'start'], {
        cwd: './server',
    });
}
export function installDirectusHook() {
    const hookSpinner = ora('Installing Nuxtus hook...').start();
    try {
        execSync(`cd server && npm install @nuxtus/directus-extension-nuxtus-hook --save-dev`, {
            stdio: 'ignore',
        });
        const source = path.join('server', 'node_modules', '@nuxtus', 'directus-extension-nuxtus-hook');
        const subDest = path.join('server', 'extensions', 'directus-extension-nuxtus-hook');
        const subDestDist = path.join(subDest, 'dist');
        fs.mkdirSync(subDestDist, { recursive: true });
        const dest = path.join(subDestDist, 'index.js');
        const indexFile = path.join(source, 'dist', 'index.js');
        fs.copyFileSync(indexFile, dest);
        fs.copyFileSync(path.join(source, 'package.json'), subDest);
        hookSpinner.succeed('Nuxtus hook installed.');
    }
    catch (err) {
        throw `Failed installing Nuxtus hook: ${err}`;
    }
}
export async function installDirectus() {
    return new Promise((resolve, reject) => {
        exec('cd server && npm install', (error) => {
            if (error) {
                reject(error);
            }
            resolve();
        });
    });
}
export async function installDBDriver(dbClient) {
    const spinnerDriver = ora('Installing Database Driver...').start();
    await exec(`cd server && npm install ${dbClient} --production`);
    spinnerDriver.stop();
}

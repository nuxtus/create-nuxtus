import * as childProcess from "child_process";
import * as fs from "fs";
import * as path from "path";
import { exec, execSync } from "child_process";
import chalk from "chalk";
import ora from "ora";
export default function () { }
export function startDirectus() {
    const process = childProcess.spawn("npx", ["directus", "start"], {
        cwd: "./server",
    });
    process.stdout.on("data", (data) => {
        console.log(data.toString());
    });
    process.stderr.on("data", (data) => {
        console.error(data.toString());
    });
    process.on("exit", (code) => {
        console.log(`Directus exited with code ${code}`);
    });
}
export function installDirectusHook() {
    const hookSpinner = ora("%s Installing Nuxtus hook...").start();
    try {
        execSync("cd server && npm install @nuxtus/directus-extension-nuxtus-hook --save-dev", {
            stdio: "ignore",
        });
        const source = path.join("server", "node_modules", "@nuxtus", "directus-extension-nuxtus-hook", "dist", "index.js");
        const subDest = path.join("server", "extensions", "hooks", "directus-extension-nuxtus-hook");
        fs.mkdirSync(subDest);
        const dest = path.join(subDest, "index.js");
        fs.copyFileSync(source, dest);
        hookSpinner.succeed("Nuxtus hook installed.");
    }
    catch (err) {
        console.error(chalk.red(`Failed installing Nuxtus hook: ${err}`));
        return;
    }
    console.log("✅ Nuxtus Directus hook installed. Pages will automatically be created when you create a Collection in Directus.");
}
export async function installDirectus() {
    return new Promise((resolve, reject) => exec(`npm init directus-project server`, (error) => {
        if (error) {
            reject(error);
        }
        resolve();
    }));
}

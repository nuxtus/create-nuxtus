#!/usr/bin/env node
import * as fs from "fs";
import * as path from "path";
import { ProjectType, askOptions, cleanUp, updatePackageJson } from "./lib/util.js";
import { installDirectus, installDirectusHook } from "./lib/directus.js";
import chalk from "chalk";
import { execSync } from "child_process";
import figlet from "figlet";
import { installNuxt } from "./lib/nuxt.js";
import ora from "ora";
let options = {
    dbType: "SQLite"
};
console.log(chalk.green(figlet.textSync("nuxtus", { horizontalLayout: "full" })));
const currentNodeVersion = process.versions.node;
const semver = currentNodeVersion.split(".");
const major = Number(semver[0]);
if (major < 16) {
    console.error(chalk.red("You are running Node " +
        currentNodeVersion +
        ".\n" +
        "Create Nuxtus requires Node 16 or higher. \n" +
        "Please update your version of Node."));
    process.exit(1);
}
if (process.argv.length < 3) {
    console.log(chalk.red("You have to provide a name for your app."));
    console.log("For example :");
    console.log("    npx create-nuxtus " + chalk.bold("my-app"));
    process.exit(1);
}
const projectName = process.argv[2];
const currentPath = process.cwd();
const projectPath = path.join(currentPath, projectName);
const git_repo = "https://github.com/nuxtus/nuxtus";
const branch = process.env.NUXTUS_BRANCH || "main";
try {
    fs.mkdirSync(projectPath);
}
catch (err) {
    if (err.code === "EEXIST") {
        console.log(chalk.red(`The folder ${projectName} already exist in the current directory, please try another name.`));
    }
    else {
        console.log(chalk.red(err));
    }
    process.exit(1);
}
async function main() {
    try {
        options = await askOptions();
    }
    catch (error) {
        if (error.isTtyError) {
            console.log(chalk.red("Prompt couldn't be rendered in the current environment"));
        }
        else {
            // Something else went wrong
            console.log(chalk.red(error));
        }
    }
    const nuxtusSpinner = ora("Downloading Nuxtus boilerplate...").start();
    try {
        execSync(`git clone --depth 1 -b ${branch} ${git_repo} ${projectPath}`, { stdio: "ignore" });
        nuxtusSpinner.succeed("Nuxtus boilerplate downloaded.");
        process.chdir(projectPath);
    }
    catch (error) {
        nuxtusSpinner.fail(chalk.red(`Failed cloning Nuxtus repo: ${error}`));
        process.exit();
    }
    const directusSpinner = ora("Installing Directus...").start();
    const nuxtSpinner = ora("Installing Nuxt...").start();
    const rmSpinner = ora("Removing unused files...").start();
    const directus = installDirectus().then(() => {
        // Replace "name": "server" in package.json with "name": ${packageName}
        updatePackageJson(projectName, ProjectType.Directus);
        directusSpinner.succeed("Directus installed.");
    }).catch((error) => {
        directusSpinner.fail(`Failed installing Directus: ${error}`);
        process.exit(1);
    });
    const nuxt = installNuxt().then(() => {
        updatePackageJson(projectName, ProjectType.Nuxt);
        nuxtSpinner.succeed("Nuxt installed.");
    }).catch((error) => {
        nuxtSpinner.fail(chalk.red(`Failed installing Nuxt: ${error}`));
        process.exit(1);
    });
    const cleanup = cleanUp().then(() => {
        rmSpinner.succeed("Unused files removed.");
    }).catch(error => {
        rmSpinner.fail(chalk.red(`Failed removing unused files: ${error}`));
        process.exit(1);
    });
    Promise.all([directus, nuxt, cleanup]).then(() => {
        if (options.dbType === "SQLite") {
            // Run migrations and start Directus/Nuxt
            const dbSpinner = ora("Running migrations...").start();
            try {
                execSync("npm install", { stdio: "ignore" });
                // TODO: This also creates Directus folders etc. so "Other" db won't work
                execSync("cd server && npm run cli bootstrap", {
                    stdio: "ignore",
                });
                dbSpinner.succeed("Database migrated.");
            }
            catch (err) {
                dbSpinner.fail(chalk.red("An error occurred running migrations " + err));
            }
            installDirectusHook(); // TODO: This needs installing regardless of DB!
        }
        else {
            console.log("\n");
            console.log(chalk.bold("You will need to edit server/.env with your database details and then run " +
                chalk.blueBright("npm run cli bootstrap") +
                "."));
            // TODO: Allow auto configuration of database based on selection instead of manual prompt
        }
        console.log("\n");
        console.log(chalk.green("🚀 Nuxtus site is ready for use!\n\n") +
            chalk.blueBright("Directus admin login\n") +
            chalk.bgMagenta.underline("http://localhost:8055\n") +
            chalk.bold(`User: `) +
            chalk.white("admin@example.com") +
            chalk.bold(` Password: `) +
            chalk.white("password\n\n") +
            chalk.blueBright("Nuxtus\n") +
            chalk.bgGreen.white.underline("http://localhost:3000\n\n") +
            chalk.white(`cd ${projectName}` + "\nnpm start\n\n") +
            chalk.green("For documentation see: ", chalk.underline("https://nuxtus.com", "\n")));
    });
}
main();
//# sourceMappingURL=main.js.map
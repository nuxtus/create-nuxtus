#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";

import chalk from "chalk";
import figlet from "figlet";
// import { exec, execSync } from "child_process"
import { installDirectus } from "./lib/directus";
import ora from "ora";
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
    console.log("    npx create-nuxtus my-app");
    process.exit(1);
}
const projectName = process.argv[2];
const currentPath = process.cwd();
const projectPath = path.join(currentPath, projectName);
const git_repo = "https://github.com/nuxtus/nuxtus";
const branch = process.env.NUXTUS_BRANCH || "main";
let options = {
    dbType: "SQLite",
    autoCollections: true,
};
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
        const directusSpinner = ora("%s Installing Directus dependencies...").start();
        const nuxtSpinner = ora("%s Installing Nuxt dependencies...").start();
        const rmSpinner = ora("%s Removing unused files...").start();
        // TODO: Change all spinner success/fail to ora as below
        let directus = installDirectus().then(() => {
            // TODO: Replace "name": "server" in package.json with "name": ${packageName}
            directusSpinner.succeed("Directus dependencies installed.");
        }).catch((error) => {
            directusSpinner.fail(`Failed installing Directus: ${error}`);
            return;
        });
        // let nuxt = new Promise((resolve, reject) =>
        // 	exec("cd client && npm install", { stdio: "ignore" }, (error) => {
        // 		nuxtSpinner.stop(true)
        // 		if (error) {
        // 			console.error(chalk.red(`Failed installing Nuxt: ${error}`))
        // 			reject(error)
        // 		}
        // 		console.log("✅ Nuxt dependencies installed.")
        // 		resolve()
        // 	})
        // )
        // let cleanup = new Promise((resolve, reject) => {
        // 	execSync("npx rimraf ./.git ./TODO ./node_modules ./.github CHANGELOG.md")
        // 	fs.appendFileSync("./client/.gitignore", ".env", function (err) {
        // 		if (err) throw err
        // 	})
        // 	fs.writeFileSync("./server/.gitignore", ".env")
        // 	// Remove interface/nuxtus.ts from gitignore
        // 	const interfaceFile = "./.gitignore"
        // 	var gitIgnore = fs.readFileSync(interfaceFile, "utf-8")
        // 	// replace git ignore rules that are just for nuxtus development
        // 	var newGitIgnore = gitIgnore.replace(
        // 		/client\/interfaces\/nuxtus.ts\n/gm|/package-lock.json\n/gm|/server\/extensions\/hooks\/*\n/gm|/client\/pages\/*\n/gm,
        // 		""
        // 	)
        // 	fs.writeFileSync(interfaceFile, newGitIgnore, "utf-8")
        // 	//////////
        // 	rmSpinner.stop(true)
        // 	console.log("✅ Clean up complete.")
        // 	resolve()
        // })
        // Promise.all([directus, nuxt, cleanup]).then(() => {
        // 	if (options.dbType === "SQLite") {
        // 		// Run migrations and start Directus/Nuxt
        // 		const dbSpinner = ora("%s Running migrations...").start()
        // 		try {
        // 			execSync("npm install", { stdio: "ignore" })
        // 			execSync("cd server && npm run cli bootstrap", {
        // 				stdio: "ignore",
        // 			})
        // 			dbSpinner.stop(true)
        // 			console.log("✅ Database migrated.")
        // 		} catch (err) {
        // 			dbSpinner.stop(true)
        // 			console.log(
        // 				chalk.red("An error occurred running migrations " + err)
        // 			)
        // 		}
        // 	} else {
        // 		console.log("\n")
        // 		console.log(
        // 			chalk.bold(
        // 				"You will need to edit server/.env with your database details and then run " +
        // 					chalk.blueBright("npm run cli bootstrap") +
        // 					"."
        // 			)
        // 		)
        // 		// TODO: Allow auto configuration of database based on selection instead of manual prompt
        // 	}
        // 	if (options.autoCollections) {
        // 		installDirectusHook()
        // 	}
        // 	console.log("\n")
        // 	console.log(
        // 		chalk.green("🚀 Nuxtus site is ready for use!\n\n") +
        // 			chalk.blueBright("Directus admin login\n") +
        // 			chalk.bold(`User: `) +
        // 			chalk.white("admin@example.com") +
        // 			chalk.bold(` Password: `) +
        // 			chalk.white("password\n\n") +
        // 			chalk.white(`cd ${projectName}` + "\nnpm start\n\n") +
        // 			chalk.green(
        // 				"For documentation see: ",
        // 				chalk.underline("https://nuxtus.com", "\n")
        // 			)
        // 	)
        // })
    }
    catch (error) {
        console.log(chalk.red(error));
    }
}
main();

#!/usr/bin/env node

import * as fs from "fs"
import * as path from "path"

import { ProjectType, updatePackageJson } from "./lib/util.js"
// import { exec, execSync } from "child_process"
import { installDirectus, installDirectusHook } from "./lib/directus.js"
import { installNuxt, installTailwind } from "./lib/nuxt.js"

import chalk from "chalk"
import figlet from "figlet"
import ora from "ora"

console.log(
	chalk.green(figlet.textSync("nuxtus", { horizontalLayout: "full" }))
)

const currentNodeVersion = process.versions.node
const semver = currentNodeVersion.split(".")
const major = Number(semver[0])

if (major < 16) {
	console.error(
		chalk.red(
			"You are running Node " +
				currentNodeVersion +
				".\n" +
				"Create Nuxtus requires Node 16 or higher. \n" +
				"Please update your version of Node."
		)
	)
	process.exit(1)
}

if (process.argv.length < 3) {
	console.log(chalk.red("You have to provide a name for your app."))
	console.log("For example :")
  console.log("    npx create-nuxtus " + chalk.bold("my-app"))
	process.exit(1)
}

const projectName = process.argv[2]
const currentPath = process.cwd()
const projectPath = path.join(currentPath, projectName)
// const git_repo = "https://github.com/nuxtus/nuxtus"
// const branch = process.env.NUXTUS_BRANCH || "main"

try {
	fs.mkdirSync(projectPath)
} catch (err: any) {
	if (err.code === "EEXIST") {
		console.log(
			chalk.red(
				`The folder ${projectName} already exist in the current directory, please try another name.`
			)
		)
	} else {
		console.log(chalk.red(err))
	}
	process.exit(1)
}

async function main(): Promise<void> {

		// const rmSpinner = ora("Removing unused files...").start()
    const directusSpinner = ora(
      "Installing Nuxtus hook..."
    )
    try {
      installDirectus(projectName).then(() => {
        directusSpinner.start()
        // Replace "name": "server" in package.json with "name": ${packageName}
        updatePackageJson(projectName, ProjectType.Directus)
        installDirectusHook(projectName)
        directusSpinner.succeed("Nuxtus hook installed.")
      }).catch((error) => {
        // console.error(error)
        directusSpinner.fail(chalk.red(`Failed installing Directus: ${error}`))
        process.exit(1)
      })

    // console.log(directus)

    const nuxtSpinner = ora(
			"Installing Nuxt"
		).start()
    installNuxt(projectName).then(async () => {
      updatePackageJson(projectName, ProjectType.Nuxt)
      await installTailwind(projectName)

      // TODO: install nuxt-directus here

      // TODO: Update nuxt.config.js

      nuxtSpinner.succeed("Nuxt installed.")
    }).catch((error) => {
      console.error(chalk.red(`Failed installing Nuxt: ${error}`))
      return
    })

    // TODO: Can run npm install for nuxt and root nuxtus in parallel

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
				// 		const dbSpinner = ora("Running migrations...").start()
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
	} catch (error) {
      console.log(chalk.red(error))
      process.exit(1)
	}
}

main()

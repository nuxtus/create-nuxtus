#!/usr/bin/env node

import * as childProcess from "child_process"
import * as fs from "fs"
import * as path from "path"

import { exec, execSync } from "child_process"

import { Spinner } from "cli-spinner"
import chalk from "chalk"
import figlet from "figlet"
import inquirer from "inquirer"

const startDirectus = function () {
	const process = childProcess.spawn("npx", ["directus", "start"], {
		cwd: "./server",
	})

	process.stdout.on("data", (data) => {
		console.log(data.toString())
	})

	process.stderr.on("data", (data) => {
		console.error(data.toString())
	})

	process.on("exit", (code) => {
		console.log(`Directus exited with code ${code}`)
	})
}

const autoCollections = function () {
	const hookSpinner = new Spinner("%s Installing Nuxtus hook...").start()

	try {
		execSync(
			"cd server && npm install @nuxtus/directus-extension-nuxtus-hook --save-dev",
			{
				stdio: "ignore",
			}
		)

		const source = path.join(
			"server",
			"node_modules",
			"@nuxtus",
			"directus-extension-nuxtus-hook",
			"dist",
			"index.js"
		)
		const subDest = path.join(
			"server",
			"extensions",
			"hooks",
			"directus-extension-nuxtus-hook"
		)
		fs.mkdirSync(subDest)
		const dest = path.join(subDest, "index.js")
		fs.copyFileSync(source, dest)
		hookSpinner.stop(true)
	} catch (err) {
		console.error(chalk.red(`Failed installing Nuxtus hook: ${error}`))
		return
	}
	console.log(
		"✅ Nuxtus Directus hook installed. Pages will automatically be created when you create a Collection in Directus."
	)
}

console.log(
	chalk.green(figlet.textSync("nuxtus", { horizontalLayout: "full" }))
)

const currentNodeVersion = process.versions.node
const semver = currentNodeVersion.split(".")
const major = semver[0]

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
	console.log("    npx create-nuxtus my-app")
	process.exit(1)
}

const projectName = process.argv[2]
const currentPath = process.cwd()
const projectPath = path.join(currentPath, projectName)
const git_repo = "https://github.com/nuxtus/nuxtus"
const branch = process.env.NUXTUS_BRANCH || "main"

let options = {
	dbType: "SQLite",
	autoCollections: true,
}

try {
	fs.mkdirSync(projectPath)
} catch (err) {
	if (err.code === "EEXIST") {
		console.log(
			chalk.red(
				`The folder ${projectName} already exist in the current directory, please try another name.`
			)
		)
	} else {
		console.log(error)
	}
	process.exit(1)
}

async function askOptions() {
	options = await inquirer
		.prompt([
			{
				type: "list",
				name: "dbType",
				message: "Select database type",
				choices: ["SQLite", "Other"],
			},
			{
				type: "confirm",
				name: "autoCollections",
				message: "Create Nuxt pages and types automatically?",
				choices: ["Y", "n"],
				default: "Y",
			},
		])
		.catch((error) => {
			if (error.isTtyError) {
				console.log(
					chalk.red("Prompt couldn't be rendered in the current environment")
				)
			} else {
				// Something else went wrong
				console.log(chalk.red(error))
			}
		})

	return
}

async function main() {
	try {
		await askOptions()
		console.log()
		Spinner.setDefaultSpinnerString(30)
		const downloadSpinner = new Spinner("%s Retrieving Nuxtus boilerplate...")
		downloadSpinner.start()
		exec(
			`git clone --depth 1 -b ${branch} ${git_repo} ${projectPath}`,
			{
				stdio: "ignore",
			},
			(error) => {
				downloadSpinner.stop(true)
				if (error) {
					console.error(chalk.red(`Failed cloning repo: ${error}`))
					process.exit()
				}
				process.chdir(projectPath)
				console.log("✅ Nuxtus downloaded.")

				const directusSpinner = new Spinner(
					"%s Installing Directus dependencies..."
				).start()
				const nuxtSpinner = new Spinner(
					"%s Installing Nuxt dependencies..."
				).start()
				const rmSpinner = new Spinner("%s Removing unused files...").start()

				let directus = new Promise((resolve, reject) =>
					exec(
						"cd server && npm install",
						{
							stdio: "ignore",
						},
						(error) => {
							directusSpinner.stop(true)
							if (error) {
								console.error(chalk.red(`Failed installing Directus: ${error}`))
								reject(error)
							}
							console.log("✅ Directus dependencies installed.")
							resolve()
						}
					)
				)

				let nuxt = new Promise((resolve, reject) =>
					exec("cd client && npm install", { stdio: "ignore" }, (error) => {
						nuxtSpinner.stop(true)
						if (error) {
							console.error(chalk.red(`Failed installing Nuxt: ${error}`))
							reject(error)
						}
						console.log("✅ Nuxt dependencies installed.")
						resolve()
					})
				)

				let cleanup = new Promise((resolve, reject) => {
					execSync("npx rimraf ./.git ./TODO ./node_modules ./github")
					fs.appendFileSync("./client/.gitignore", ".env", function (err) {
						if (err) throw err
					})
					fs.writeFileSync("./server/.gitignore", ".env")
					// Remove interface/nuxtus.ts from gitignore
					const interfaceFile = "./.gitignore"
					var gitIgnore = fs.readFileSync(interfaceFile, "utf-8")
					// replace 'world' together with the new line character with empty
					var newGitIgnore = gitIgnore.replace(
						"client/interfaces/nuxtus.ts\n",
						""
					)
					fs.writeFileSync(interfaceFile, newGitIgnore, "utf-8")
					//////////
					rmSpinner.stop(true)
					console.log("✅ Clean up complete.")
					resolve()
				})

				Promise.all([directus, nuxt, cleanup]).then(() => {
					if (options.dbType === "SQLite") {
						// Run migrations and start Directus/Nuxt
						const dbSpinner = new Spinner("%s Running migrations...").start()
						try {
							execSync("npm install", { stdio: "ignore" })
							execSync("cd server && npm run cli bootstrap", {
								stdio: "ignore",
							})
							dbSpinner.stop(true)
							console.log("✅ Database migrated.")
						} catch (err) {
							dbSpinner.stop(true)
							console.log(
								chalk.red("An error occurred running migrations " + err)
							)
						}
					} else {
						console.log("\n")
						console.log(
							chalk.bold(
								"You will need to edit server/.env with your database details and then run " +
									chalk.blueBright("npm run cli bootstrap") +
									"."
							)
						)
						// TODO: Allow auto configuration of database based on selection instead of manual prompt
					}
					if (options.autoCollections) {
						autoCollections()
					}
					console.log("\n")
					console.log(
						chalk.green("🚀 Nuxtus site is ready for use!\n\n") +
							chalk.white(`cd ${projectName}` + "\nnpm start\n\n") +
							chalk.green(
								"For documentation see: ",
								chalk.underline("https://github.com/nuxtus/nuxtus", "\n")
							)
					)
				})
			}
		)
	} catch (error) {
		console.log(chalk.red(error))
	}
}

main()

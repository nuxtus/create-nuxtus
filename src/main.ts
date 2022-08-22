#!/usr/bin/env node

import * as fs from "fs"
import * as path from "path"

import { ProjectType, askOptions, cleanUp, updatePackageJson } from "./lib/util.js"
import { installDBDriver, installDirectus, installDirectusHook } from "./lib/directus.js"

import {Credentials} from "./lib/directus-init/create-db-credentials.js"
import chalk from "chalk"
import createEnv from "./lib/directus-init/create-env.js"
import { databaseQuestions } from './lib/directus-init/questions.js';
import { execSync } from "child_process"
import figlet from "figlet"
import { getDriverForClient } from "./lib/directus-init/drivers.js"
import inquirer from "inquirer"
import { installNuxt } from "./lib/nuxt.js"
import ora from "ora"

export declare type Options = {
  dbType: string
}

let options: Options = {
	dbType: "SQLite"
}

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
const git_repo = "https://github.com/nuxtus/nuxtus"
const branch = process.env.NUXTUS_BRANCH || "main"

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

let dbClient
let credentials: Credentials
const rootPath = path.join(process.cwd(), projectName, "server")

async function main(): Promise<void> {

  try {
    options = await askOptions()
    dbClient = await getDriverForClient(options.dbType);
    await installDBDriver(dbClient)

    credentials = await inquirer.prompt(
			(databaseQuestions[dbClient] as any[]).map((question: ({ client, filepath }: any) => any) =>
				question({ client: dbClient, filepath: rootPath })
			)
    );
  } catch (error) {
    if (error.isTtyError) {
      console.log(
        chalk.red("Prompt couldn't be rendered in the current environment")
      )
    } else {
      // Something else went wrong
      console.log(chalk.red(error))
    }
  }

  const nuxtusSpinner = ora("Downloading Nuxtus boilerplate...").start()

  try {
    execSync(`git clone --depth 1 -b ${branch} ${git_repo} ${projectPath}`, {stdio: "ignore"})
    nuxtusSpinner.succeed("Nuxtus boilerplate downloaded.")
    process.chdir(projectPath)
  } catch (error) {
    nuxtusSpinner.fail(chalk.red(`Failed cloning Nuxtus repo: ${error}`))
          process.exit()
  }


  const directusSpinner = ora("Installing Directus...").start()
  const nuxtSpinner = ora("Installing Nuxt...").start()
	const rmSpinner = ora("Optimising boilerplate...").start()

  const directus = installDirectus().then(async () => {

    // Replace "name": "server" in package.json with "name": ${packageName}
    await updatePackageJson(projectName, ProjectType.Directus)

    await createEnv(dbClient, credentials, rootPath);

    // Run the boilerplate install script here
    execSync("cd server && npm run cli bootstrap", {
      stdio: "ignore",
    })
    await installDirectusHook()
    directusSpinner.succeed("Directus installed.")
  }).catch((error) => {
    directusSpinner.fail(`Failed installing Directus: ${error}`)
    process.exit(1)
  })

  const nuxt = installNuxt().then(() => {
    updatePackageJson(projectName, ProjectType.Nuxt)
    nuxtSpinner.succeed("Nuxt installed.")
  }).catch((error) => {
    nuxtSpinner.fail(chalk.red(`Failed installing Nuxt: ${error}`))
    process.exit(1)
  })


  const cleanup = cleanUp(projectName).then(() => {
    rmSpinner.succeed("Boilerplate customised.")
  }).catch(error => {
    rmSpinner.fail(chalk.red(`Failed removing unused files: ${error}`))
    process.exit(1)
  })

  Promise.all([directus, nuxt, cleanup]).then(() => {
    console.log("\n")
    console.log(
      chalk.green("🚀 Nuxtus site is ready for use!\n\n") +
      chalk.blueBright("Directus admin login\n") +
      chalk.bgMagenta.white.underline("http://localhost:8055\n") +
      chalk.bold(`User: `) +
      chalk.white("admin@example.com") +
      chalk.bold(` Password: `) +
      chalk.white("password\n\n") +

      chalk.blueBright("Nuxtus\n") +
      chalk.bgGreen.white.underline("http://localhost:3000\n\n") +

      chalk.white(`cd ${projectName}` + "\nnpm start\n\n") +
      chalk.green(
        "For documentation see: ",
        chalk.underline("https://nuxtus.com", "\n")
      )
    )
  })
}

main()

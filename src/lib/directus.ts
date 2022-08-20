// import * as childProcess from "child_process"
import * as fs from "fs"
import * as path from "path"

import { execSync, spawn } from "child_process"

import ora from "ora"

export function startDirectus(): void {
	spawn("npx", ["directus", "start"], {
		cwd: "./server",
	})
}

export function installDirectusHook(projectName: string): void{
	const hookSpinner = ora("Installing Nuxtus hook...").start()

	try {
		execSync(
			`cd ${projectName}/server && npm install @nuxtus/directus-extension-nuxtus-hook --save-dev`,
			{
				stdio: "ignore",
			}
		)

		const source = path.join(
			projectName,
      "server",
			"node_modules",
			"@nuxtus",
			"directus-extension-nuxtus-hook",
			"dist",
			"index.js"
		)
		const subDest = path.join(
			projectName,
      "server",
			"extensions",
			"hooks",
			"directus-extension-nuxtus-hook"
		)
		fs.mkdirSync(subDest)
		const dest = path.join(subDest, "index.js")
		fs.copyFileSync(source, dest)
		hookSpinner.succeed("Nuxtus hook installed.")
	} catch (err) {
		// console.error(chalk.red(`Failed installing Nuxtus hook: ${err}`))
		throw `Failed installing Nuxtus hook: ${err}`
	}
}

export async function installDirectus(projectName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn('npm', ["init", "directus-project", "server"], { stdio: 'inherit', cwd: `./${projectName}` })

    child.on('exit', function () { // Should probably be 'exit', not 'close'
      // *** Process completed
      // Append NUXT_SERVER to .env
      const nuxtServer = `####################################################################################################
## NUXT SERVER
NUXT_SERVER="http://localhost:3000"`
      fs.appendFileSync(`./${projectName}/server/.env`, nuxtServer)
      resolve()
    })
    child.on('error', function (err) {
      // *** Process creation failed
      reject(err)
    })
  })
}

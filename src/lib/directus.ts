// import * as childProcess from "child_process"
import * as fs from "fs"
import * as path from "path"

import { execSync, spawn } from "child_process"

import ora from "ora"

export function startDirectus() {
	const process = spawn("npx", ["directus", "start"], {
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

export function installDirectusHook(projectName: string){
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
    const process = spawn('npm', ["init", "directus-project", "server"], { stdio: 'inherit', cwd: `./${projectName}` })

    process.on('message', (message) => {
      console.log("message: ", message)
    })

    process.on('exit', function () { // Should probably be 'exit', not 'close'
      // *** Process completed
      resolve()
    })
    process.on('error', function (err) {
      // *** Process creation failed
      reject(err)
    })
  })
}

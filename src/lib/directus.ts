// import * as childProcess from "child_process"
import * as fs from "fs"
import * as path from "path"

import { exec, execSync, spawn } from "child_process"

import ora from "ora"

export function startDirectus() {
	spawn("npx", ["directus", "start"], {
		cwd: "./server",
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

export async function installDirectus(): Promise<void> {
  return new Promise((resolve, reject) => {
    exec(
      "cd server && npm install",
      (error) => {
        if (error) {
          reject(error)
        }
        resolve()
      }
    )
  })
}

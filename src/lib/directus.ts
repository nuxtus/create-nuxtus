// import * as childProcess from "child_process"
import * as fs from "fs"
import * as path from "path"

import { execSync, spawn } from "child_process"

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

export async function installDirectus(projectName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // const child = spawn('npm', ["init", "directus-project", "server"], { stdio: 'inherit', cwd: `./${projectName}` })
    const child = spawn('npm', ["init", "directus-project", "server"], {cwd: `./${projectName}`})

    // process.on('message', (message) => {
    //   console.log("message: ", message)
    // })

    // child.stdin.write('Hello there!');
    // Listen for any response from the child:
    // child.stdout.on('data', function (data) {
    //     console.log('We received a reply: ' + data);
    // });
    // Listen for any errors:
    // child.stderr.on('data', function (data) {
    //     console.log('There was an error: ' + data);
    // });

    child.on('exit', function (data) { // Should probably be 'exit', not 'close'
      // *** Process completed
      console.log('exit', data)
      resolve()
    })
    child.on('error', function (err) {
      // *** Process creation failed
      reject(err)
    })
  })
}

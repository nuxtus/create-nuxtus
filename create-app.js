#!/usr/bin/env node

const { execSync } = require("child_process")
const path = require("path")
const fs = require("fs")

if (process.argv.length < 3) {
	console.log("You have to provide a name for your app.")
	console.log("For example :")
	console.log("    npx create-nuxtus my-app")
	process.exit(1)
}

const projectName = process.argv[2]
const currentPath = process.cwd()
const projectPath = path.join(currentPath, projectName)
const git_repo = "https://github.com/nuxtus/nuxtus"
const branch = process.env.NUXTUS_BRANCH || "main"

try {
	fs.mkdirSync(projectPath)
} catch (err) {
	if (err.code === "EEXIST") {
		console.log(
			`The folder ${projectName} already exist in the current directory, please try another name.`
		)
	} else {
		console.log(error)
	}
	process.exit(1)
}

async function main() {
	try {
		console.log("Downloading files...")
		execSync(`git clone --depth 1 -b ${branch} ${git_repo} ${projectPath}`)

		process.chdir(projectPath)

		console.log("Installing Directus dependencies...")
		execSync("cd server && npm install")
		console.log("Installing Nuxt dependencies...")
		execSync("cd client && npm install")

		console.log("Removing unused files...")
		execSync("npx rimraf ./.git ./package.json ./TODO")
		fs.rmdirSync(path.join(projectPath, "bin"), { recursive: true })
		fs.appendFileSync("./client/.gitignore", ".env", function (err) {
			if (err) throw err
		})
		fs.writeFileSync("./server/.gitignore", ".env")

		console.log(
			"Nuxtus site is ready for use! For documentation see: https://github.com/nuxtus/nuxtus"
		)
	} catch (error) {
		console.log(error)
	}
}
main()

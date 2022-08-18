import * as fs from "fs"
import * as path from "path"

import { Options } from "../main.js"
import { execSync } from "child_process"
import inquirer from "inquirer"

export enum ProjectType {
  Directus = "server",
  Nuxt = "client"
}

/**
 * Replace the name "server" with the project name supplied by user
 * @param projectName
 */
 export function updatePackageJson(projectName: string, projectTye: ProjectType): void {
  const packageJson = path.join(process.cwd(), projectName, projectTye, "package.json")
  const packageJsonContent = fs.readFileSync(packageJson, "utf8")
  const packageJsonObject = JSON.parse(packageJsonContent)
  packageJsonObject.name = projectName
  fs.writeFileSync(packageJson, JSON.stringify(packageJsonObject, null, 2))
 }

 export async function askOptions(): Promise<Options> {
	return inquirer
		.prompt([
			{
				type: "list",
				name: "dbType",
				message: "Select database type",
				choices: ["SQLite", "Other"],
			}
		])
 }

export async function cleanUp(): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      execSync("npx rimraf ./.git ./TODO ./node_modules ./.github CHANGELOG.md")
      fs.appendFileSync("./client/.gitignore", ".env")
      fs.writeFileSync("./server/.gitignore", ".env")
      // Remove interface/nuxtus.ts from gitignore
      const interfaceFile = "./.gitignore"
      const gitIgnore = fs.readFileSync(interfaceFile, "utf-8")
      // replace git ignore rules that are just for nuxtus development
      //  /client\/interfaces\/nuxtus.ts\n/gm | /package-lock.json\n/gm | /server\/extensions\/hooks\/*\n/gm | /client\/pages\/*\n/gm
      const gitRegEx = new RegExp(/client\/interfaces\/nuxtus.ts\n | package-lock.json\n | server\/extensions\/hooks\/*\n | client\/pages\/*\n /gm)
      const newGitIgnore = gitIgnore.replace(gitRegEx, "")
      fs.writeFileSync(interfaceFile, newGitIgnore, "utf-8")
    } catch (error) {
      reject(error)
    }

    resolve()
  })
 }

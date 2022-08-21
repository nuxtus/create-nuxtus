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
  const packageJson = path.join(process.cwd(), projectTye, "package.json")
  const packageJsonContent = fs.readFileSync(packageJson, "utf8")
  const packageJsonObject = JSON.parse(packageJsonContent)
  packageJsonObject.name = projectName
  fs.writeFileSync(packageJson, JSON.stringify(packageJsonObject, null, 2))
 }

 export const drivers = {
	pg: 'PostgreSQL / Redshift',
	cockroachdb: 'CockroachDB (Beta)',
	mysql: 'MySQL / MariaDB / Aurora',
	sqlite3: 'SQLite',
	mssql: 'Microsoft SQL Server',
	oracledb: 'Oracle Database',
 };

 export function getDriverForClient(client: string): keyof typeof drivers | null {
	for (const [key, value] of Object.entries(drivers)) {
		if (value === client) return key as keyof typeof drivers;
	}

	return null;
}

 export async function askOptions(): Promise<Options> {
	return inquirer
		.prompt([
			{
				type: "list",
				name: "dbType",
				message: "Choose your database client",
				choices: Object.values(drivers),
			}
		])
 }

export async function cleanUp(projectName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      execSync(`npx rimraf ./.git ./TODO ./node_modules ./.github ./CHANGELOG.md ./package.json ./package-lock.json ./LICENSE`)
      fs.appendFileSync("./client/.gitignore", ".env")
      fs.writeFileSync("./server/.gitignore", ".env")
      // Remove interface/nuxtus.ts from gitignore
      const interfaceFile = "./.gitignore"
      const gitIgnore = fs.readFileSync(interfaceFile, "utf-8")
      // replace git ignore rules that are just for nuxtus development
      const gitRegEx = new RegExp(/client\/interfaces\/nuxtus.ts\n | package-lock.json\n | server\/extensions\/hooks\/*\n | client\/pages\/*\n /gm)
      const newGitIgnore = gitIgnore.replace(gitRegEx, "")
      fs.writeFileSync(interfaceFile, newGitIgnore, "utf-8")
      // Create initial package.json
      const packageJson = {
          name: projectName,
          description: "Created with Nuxtus - Directus/Nuxt boilerplate with Tailwind CSS.",
          version: "0.0.1",
          scripts: {
            client: "cd client && npm run dev -- -o",
            server: "cd server && npx directus start",
            start: "concurrently \"npm run client\" \"npm run server\""
        },
        devDependencies: {
          concurrently: "^7.2.2",
        }
      }
      fs.writeFileSync("package.json", JSON.stringify(packageJson), "utf-8")
      execSync("npm install")
    } catch (error) {
      reject(error)
    }

    resolve()
  })
 }

import * as fs from "fs"
import * as path from "path"

import { Liquid } from 'liquidjs';
import { Options } from "../main.js"
import { drivers } from "./directus-init/drivers.js"
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
      execSync(`npx rimraf ./.git ./TODO ./node_modules ./.github ./CHANGELOG.md ./package.json ./package-lock.json ./LICENSE .gitignore`)
      fs.appendFileSync("./client/.gitignore", ".env")
      const liquidEngine = new Liquid({
        extname: '.liquid',
      });
      // Create .gitignore
      const gitignoreTemplateString = fs.readFileSync(path.join(process.cwd(), "templates", 'gitignore.liquid'), "utf8")
      const gitignoreTemplate = liquidEngine.parseAndRenderSync(gitignoreTemplateString);
      fs.writeFileSync(path.join(process.cwd(), '.gitignore'), gitignoreTemplate);
      // Create initial package.json
      const packageTemplateString = fs.readFileSync(path.join(process.cwd(), "templates", 'package.json.liquid'), "utf8")
      const text = liquidEngine.parseAndRenderSync(packageTemplateString, {
        appName: projectName
      });
      fs.writeFileSync(path.join(process.cwd(), 'package.json'), text);
      execSync("npm install")
    } catch (error) {
      reject(error)
    }

    resolve()
  })
 }

import * as fs from "fs"
import * as path from "path"

import Joi from 'joi';
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
	console.log("Directus configuration\n")
  return inquirer
    .prompt([
      {
        type: 'input',
        name: 'email',
        message: 'Email',
        default: 'admin@example.com',
        validate: (input: string): boolean => {
          const emailSchema = Joi.string().email().required();
          const { error } = emailSchema.validate(input);
          if (error) throw new Error('The email entered is not a valid email address!');
          return true;
        },
      },
      {
        type: 'password',
        name: 'password',
        message: 'Password',
        mask: '*',
        validate: (input: string | null): boolean => {
          if (input === null || input === '') throw new Error('The password cannot be empty!');
          return true;
        },
      },
			{
				type: "list",
				name: "dbType",
				message: "Choose your database client",
				choices: Object.values(drivers),
      },
		])
 }

export async function cleanUp(projectName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      execSync(`npx rimraf ./.git ./TODO ./node_modules ./.github ./CHANGELOG.md ./package.json ./package-lock.json ./LICENSE .gitignore`)
      fs.appendFileSync("./.gitignore", ".env")
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

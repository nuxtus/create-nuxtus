import * as fs from "fs";
import * as path from "path";
import Joi from 'joi';
import { Liquid } from 'liquidjs';
import { drivers } from "./directus-init/drivers.js";
import { execSync } from "child_process";
import inquirer from "inquirer";
export var ProjectType;
(function (ProjectType) {
    ProjectType["Directus"] = "server";
    ProjectType["Nuxt"] = "client";
})(ProjectType || (ProjectType = {}));
/**
 * Replace the name "server" with the project name supplied by user
 * @param projectName
 */
export function updatePackageJson(projectName, projectTye) {
    const packageJson = path.join(process.cwd(), projectTye, "package.json");
    const packageJsonContent = fs.readFileSync(packageJson, "utf8");
    const packageJsonObject = JSON.parse(packageJsonContent);
    packageJsonObject.name = projectName;
    fs.writeFileSync(packageJson, JSON.stringify(packageJsonObject, null, 2));
}
export async function askOptions() {
    console.log("Directus configuration\n");
    return inquirer
        .prompt([
        {
            type: 'input',
            name: 'directusURL',
            message: 'Directus URL',
            default: 'http://localhost:8055',
            validate: (input) => {
                const uriSchema = Joi.string().uri().optional();
                const { error } = uriSchema.validate(input);
                if (error)
                    throw new Error('The Directus Cloud URL must be a valid URL or empty.');
                return true;
            },
        },
        {
            type: 'input',
            name: 'email',
            message: 'Email',
            default: 'admin@example.com',
            validate: (input) => {
                const emailSchema = Joi.string().email().required();
                const { error } = emailSchema.validate(input);
                if (error)
                    throw new Error('The email entered is not a valid email address!');
                return true;
            },
        },
        {
            type: 'password',
            name: 'password',
            message: 'Password',
            mask: '*',
            validate: (input) => {
                if (input === null || input === '')
                    throw new Error('The password cannot be empty!');
                return true;
            },
        },
        {
            type: "list",
            name: "dbType",
            message: "Choose your database client",
            choices: Object.values(drivers),
        },
    ]);
}
export async function cleanUp(projectName) {
    return new Promise((resolve, reject) => {
        try {
            execSync(`npx rimraf ./.git ./TODO ./node_modules ./.github ./CHANGELOG.md ./package.json ./package-lock.json ./LICENSE .gitignore renovate.json`);
            fs.appendFileSync("./.gitignore", ".env");
            const liquidEngine = new Liquid({
                extname: '.liquid',
            });
            // Create .gitignore
            const gitignoreTemplateString = fs.readFileSync(path.join(process.cwd(), "templates", 'gitignore.liquid'), "utf8");
            const gitignoreTemplate = liquidEngine.parseAndRenderSync(gitignoreTemplateString);
            fs.writeFileSync(path.join(process.cwd(), '.gitignore'), gitignoreTemplate);
            // Create initial package.json
            const packageTemplateString = fs.readFileSync(path.join(process.cwd(), "templates", 'package.json.liquid'), "utf8");
            const text = liquidEngine.parseAndRenderSync(packageTemplateString, {
                appName: projectName
            });
            fs.writeFileSync(path.join(process.cwd(), 'package.json'), text);
            execSync("npm install");
        }
        catch (error) {
            reject(error);
        }
        resolve();
    });
}
//# sourceMappingURL=util.js.map
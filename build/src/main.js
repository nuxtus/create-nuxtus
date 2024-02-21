#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import { ProjectType, askOptions, cleanUp, updatePackageJson, } from './lib/util.js';
import { installDBDriver, installDirectus, installDirectusHook, } from './lib/directus.js';
import { installLocaltunnel, installNuxt } from './lib/nuxt.js';
import chalk from 'chalk';
import commandExistsSync from 'command-exists';
import createEnv from './lib/directus-init/create-env.js';
import { databaseQuestions } from './lib/directus-init/questions.js';
import { execSync } from 'child_process';
import figlet from 'figlet';
import { getDriverForClient } from './lib/directus-init/drivers.js';
import inquirer from 'inquirer';
import ora from 'ora';
/************
 * Some initial checks if we can run Nuxtus install script
 */
const currentNodeVersion = process.versions.node;
const semver = currentNodeVersion.split('.');
const major = Number(semver[0]);
if (major < 16) {
    console.error(chalk.red('You are running Node ' +
        currentNodeVersion +
        '.\n' +
        'Create Nuxtus requires Node 16 or higher. \n' +
        'Please update your version of Node.'));
    process.exit(1);
}
if (!commandExistsSync('git')) {
    console.log(chalk.red('Git is required to install Nuxtus. Please install Git and try again.'));
    process.exit(1);
}
if (process.argv.length < 3) {
    console.log(chalk.red('You have to provide a name for your app.'));
    console.log('For example :');
    console.log('    npx create-nuxtus ' + chalk.bold('my-app'));
    process.exit(1);
}
let options = {
    dbType: 'SQLite',
    directusURL: 'http://localhost:8055',
    email: 'admin@example.com',
    password: 'password',
};
console.log(chalk.green(figlet.textSync('nuxtus', { horizontalLayout: 'full' })));
const projectName = process.argv[2];
const currentPath = process.cwd();
const projectPath = path.join(currentPath, projectName);
const git_repo = 'https://github.com/nuxtus/nuxtus';
const branch = process.env.NUXTUS_BRANCH || 'main';
try {
    fs.mkdirSync(projectPath);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}
catch (err) {
    if (err.code === 'EEXIST') {
        console.log(chalk.red(`The folder ${projectName} already exist in the current directory, please try another name.`));
    }
    else {
        console.log(chalk.red(err));
    }
    process.exit(1);
}
let dbClient;
let credentials;
const rootPath = path.join(process.cwd(), projectName, 'server');
async function main() {
    try {
        options = await askOptions();
        dbClient = await getDriverForClient(options.dbType);
        await installDBDriver(dbClient);
        credentials = await inquirer.prompt(databaseQuestions[dbClient].map((question) => question({ client: dbClient, filepath: rootPath })));
    }
    catch (error) {
        if (error.isTtyError) {
            console.log(chalk.red("Prompt couldn't be rendered in the current environment"));
        }
        else {
            // Something else went wrong
            console.log(chalk.red(error));
        }
    }
    console.log(''); // empty line between Directus questions and status messages
    const nuxtusSpinner = ora('Downloading Nuxtus boilerplate...').start();
    try {
        execSync(`git clone --depth 1 -b ${branch} ${git_repo} ${projectPath}`, {
            stdio: 'ignore',
        });
        nuxtusSpinner.succeed('Nuxtus boilerplate downloaded.');
        process.chdir(projectPath);
    }
    catch (error) {
        nuxtusSpinner.fail(chalk.red(`Failed cloning Nuxtus repo: ${error}`));
        process.exit();
    }
    const directusSpinner = ora('Installing Directus...').start();
    const nuxtSpinner = ora('Installing Nuxt...').start();
    const rmSpinner = ora('Optimising boilerplate...').start();
    const directus = installDirectus()
        .then(async () => {
        // Replace "name": "server" in package.json with "name": ${packageName}
        await updatePackageJson(projectName, ProjectType.Directus);
        await createEnv(dbClient, credentials, rootPath, {
            email: options.email,
            password: options.password,
        });
        // Run the boilerplate install script here
        execSync('cd server && npm run cli bootstrap', {
            stdio: 'ignore',
        });
        await installDirectusHook();
        directusSpinner.succeed('Directus installed.');
    })
        .catch((error) => {
        directusSpinner.fail(`Failed installing Directus: ${error}`);
        process.exit(1);
    });
    const nuxt = installNuxt(options.directusURL, options.email, options.password)
        .then(() => {
        updatePackageJson(projectName, ProjectType.Nuxt);
        if (options.directusURL !== 'http://localhost:8055') {
            installLocaltunnel();
        }
        nuxtSpinner.succeed('Nuxt installed.');
    })
        .catch((error) => {
        nuxtSpinner.fail(chalk.red(`Failed installing Nuxt: ${error}`));
        process.exit(1);
    });
    const cleanup = cleanUp(projectName)
        .then(() => {
        rmSpinner.succeed('Boilerplate customised.');
    })
        .catch((error) => {
        rmSpinner.fail(chalk.red(`Failed removing unused files: ${error}`));
        process.exit(1);
    });
    Promise.all([directus, nuxt, cleanup]).then(() => {
        execSync(`npx rimraf ./templates`);
        console.log('\n');
        console.log(chalk.green('🚀 Nuxtus site is ready for use!\n\n') +
            chalk.white.bold('Directus\n') +
            chalk.magenta.underline(`${options.directusURL}\n\n`) +
            chalk.white.bold('Nuxtus\n') +
            chalk.green.underline('http://localhost:3000\n\n') +
            chalk.white(`cd ${projectName}` + '\nnpm start\n\n') +
            chalk.green('For documentation see: ', chalk.underline('https://docs.nuxtus.com', '\n')));
    });
}
main();
//# sourceMappingURL=main.js.map
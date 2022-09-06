import fs, { readFileSync, writeFileSync } from "node:fs"

import { Liquid } from 'liquidjs';
import { exec } from "child_process"
import path from "node:path"
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const fchmod = promisify(fs.fchmod);
const open = promisify(fs.open);

const liquidEngine = new Liquid({
	extname: '.liquid',
});

export async function installNuxt(directusURL, email, password): Promise<void> {
    const templateString = await readFile(path.join(process.cwd(), "templates", 'env-nuxt.liquid'), 'utf8');
    const text = await liquidEngine.parseAndRender(templateString, {
      directus_url: directusURL,
      email,
      password
    });
    await writeFile(path.join('client', '.env'), text);
    await fchmod(await open(path.join('client', '.env'), 'r+'), 0o640);
    exec("cd client && npm install")
    return
}

export function installLocaltunnel(): void {
  exec("cd client && npm install @nuxtus/nuxt-localtunnel --save-dev")
  const configFile = path.join(process.cwd(), 'client', "nuxt.config.ts")
  let configString = readFileSync(configFile, "utf8")
	configString = configString.replace('modules: [', `modules: ['@nuxtus/nuxt-localtunnel', `)
	// Write the config back to a file
	writeFileSync(configFile, configString)
  return
}

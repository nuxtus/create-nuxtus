// https://github.com/directus/directus/blob/31a217595c3b9134bc334f300992027d3bfdf09e/api/src/cli/utils/create-env/index.ts

import { Credentials } from './create-db-credentials.js';
import { Liquid } from 'liquidjs';
import { drivers } from './drivers.js';
import fs from 'fs';
import { nanoid } from 'nanoid';
import path from 'path';
import { promisify } from 'util';
import { v4 as uuid } from 'uuid';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const fchmod = promisify(fs.fchmod);
const open = promisify(fs.open);

const liquidEngine = new Liquid({
  extname: '.liquid',
});

const defaults = {
  security: {
    KEY: uuid(),
    SECRET: nanoid(32),
  },
};

export default async function createEnv(
  client: keyof typeof drivers,
  credentials: Credentials,
  directory: string,
  user: { email: string; password: string },
): Promise<void> {
  const config: Record<string, unknown> = {
    ...defaults,
    database: {
      DB_CLIENT: client,
    },
    user,
  };

  for (const [key, value] of Object.entries(credentials)) {
    config.database[`DB_${key.toUpperCase()}`] = value;
  }

  let sslEnabled = false;
  if (credentials.ssl === true) {
    sslEnabled = true;
    config.database['DB_SSL__REJECT_UNAUTHORIZED'] = 'false';
  }
  const configAsStrings: Record<string, string> = {};

  for (const [key, value] of Object.entries(config)) {
    configAsStrings[key] = '';

    for (const [envKey, envValue] of Object.entries(value)) {
      if (envKey === 'DB_SSL__REJECT_UNAUTHORIZED') {
        configAsStrings[key] += `# WARNING: rejectUnauthorized=false disables certificate verification (MITM risk)\n`;
        configAsStrings[key] += `# For production, provide certificates below instead:\n`;
      }
      configAsStrings[key] += `${envKey}="${envValue}"\n`;
    }
  }

  if (sslEnabled) {
    configAsStrings['database'] += `# DB_SSL__CA="/path/to/ca-cert.pem"\n`;
    configAsStrings['database'] += `# DB_SSL__CERT="/path/to/client-cert.pem"\n`;
    configAsStrings['database'] += `# DB_SSL__KEY="/path/to/client-key.pem"\n`;
  }

  configAsStrings['user'] =
    `ADMIN_EMAIL="${user.email}"\nADMIN_PASSWORD="${user.password}"`;

  const templateString = await readFile(
    path.join(process.cwd(), 'templates', 'env-directus.liquid'),
    'utf8',
  );
  const text = await liquidEngine.parseAndRender(
    templateString,
    configAsStrings,
  );
  await writeFile(path.join(directory, '.env'), text);
  await fchmod(await open(path.join(directory, '.env'), 'r+'), 0o640);
}

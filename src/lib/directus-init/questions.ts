// https://github.com/directus/directus/blob/31a217595c3b9134bc334f300992027d3bfdf09e/api/src/cli/commands/init/questions.ts

import path from 'path';

const filename = ({
  filepath,
}: {
  filepath: string;
}): Record<string, string> => ({
  type: 'input',
  name: 'filename',
  message: 'Database File Path:',
  default: path.join(filepath, 'data.db'),
});

const host = (): Record<string, string> => ({
  type: 'input',
  name: 'host',
  message: 'Database Host:',
  default: '127.0.0.1',
});

const port = ({
  client,
}: {
  client: string;
}): Record<string, string | (() => number)> => ({
  type: 'input',
  name: 'port',
  message: 'Port:',
  default(): number {
    const ports: Record<string, number> = {
      pg: 5432,
      cockroachdb: 26257,
      mysql: 3306,
      oracledb: 1521,
      mssql: 1433,
    };

    return ports[client];
  },
});

const database = (): Record<string, string> => ({
  type: 'input',
  name: 'database',
  message: 'Database Name:',
  default: 'directus',
});

const user = (): Record<string, string> => ({
  type: 'input',
  name: 'user',
  message: 'Database User:',
});

const password = (): Record<string, string> => ({
  type: 'password',
  name: 'password',
  message: 'Database Password:',
  mask: '*',
});

const encrypt = (): Record<string, string | boolean> => ({
  type: 'confirm',
  name: 'options__encrypt',
  message: 'Encrypt Connection:',
  default: false,
});

const ssl = (): Record<string, string | boolean> => ({
  type: 'confirm',
  name: 'ssl',
  message: 'Enable SSL:',
  default: false,
});

export const databaseQuestions = {
  sqlite3: [filename],
  mysql: [host, port, database, user, password],
  pg: [host, port, database, user, password, ssl],
  cockroachdb: [host, port, database, user, password, ssl],
  oracledb: [host, port, database, user, password],
  mssql: [host, port, database, user, password, encrypt],
};

// https://github.com/directus/directus/blob/31a217595c3b9134bc334f300992027d3bfdf09e/api/src/cli/utils/drivers.ts
export const drivers = {
    pg: 'PostgreSQL / Redshift',
    cockroachdb: 'CockroachDB (Beta)',
    mysql: 'MySQL / MariaDB / Aurora',
    sqlite3: 'SQLite',
    mssql: 'Microsoft SQL Server',
    oracledb: 'Oracle Database',
};
export function getDriverForClient(client) {
    for (const [key, value] of Object.entries(drivers)) {
        if (value === client)
            return key;
    }
    return null;
}
//# sourceMappingURL=drivers.js.map
// https://github.com/directus/directus/blob/31a217595c3b9134bc334f300992027d3bfdf09e/api/src/cli/utils/create-db-connection.ts

export declare type Credentials = {
  filename?: string;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  ssl?: boolean;
  options__encrypt?: boolean;
};

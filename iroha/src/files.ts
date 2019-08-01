import { readFileSync } from 'fs';
import { resolve } from 'path';

const root = resolve(__dirname, '..');

const read = (path: string) => readFileSync(resolve(root, path)).toString();

export const graphiqlHtml = read('files/graphiql.html');
export const graphqlGql = read('files/graphql.gql');
export const postgresSql = read('files/postgres.sql');

export const docPath = resolve(root, 'doc');

export const frontendPath = resolve(root, 'frontend');

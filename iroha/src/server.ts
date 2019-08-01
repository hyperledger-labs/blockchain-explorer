import { checkLogLevel, logger , setLogLevel } from './logger';

import { GraphQLServer } from 'graphql-yoga';
import serveStatic from 'serve-static';
import { createPool } from 'slonik';
import config from './config';
import { docPath, frontendPath, graphiqlHtml } from './files';
import { schema } from './graphql';
import { IrohaDb } from './iroha-db';
import * as prometheus from './prometheus';

const db = new IrohaDb(createPool(config.postgres));

const server = new GraphQLServer({ schema, context: db.fork });
server.get('/graphql', (_, res) => res.end(graphiqlHtml));
server.use('/doc', serveStatic(docPath));
server.use('/', serveStatic(frontendPath));

server.post('/logLevel', (req, res) => {
  const { level } = req.query;
  if (checkLogLevel(level)) {
    setLogLevel(level);
  } else {
    res.statusCode = 400;
  }
  res.end();
});

server.get('/prometheus', prometheus.httpHandler);

server.get('/health', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json({ status: 'UP' });
});

export async function main() {
  const http = await server.start(
    { endpoint: '/graphql', playground: false },
    () => logger.info(`Server is running on localhost:${server.options.port}`),
  );
  process.once('SIGTERM', () => http.close());
}

if (module === require.main) {
  // tslint:disable-next-line:no-floating-promises
  main();
}

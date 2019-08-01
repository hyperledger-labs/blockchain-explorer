import './logger';

import { createPool } from 'slonik';
import config from './config';
import { IrohaDb } from './iroha-db';

export async function main() {
  await IrohaDb.init(createPool(config.postgres));
}

if (module === require.main) {
  // tslint:disable-next-line:no-floating-promises
  main();
}

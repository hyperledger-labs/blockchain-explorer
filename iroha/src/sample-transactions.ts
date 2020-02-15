import { derivePublicKey } from 'ed25519.js';
import * as grpc from 'grpc';
import { commands } from 'iroha-helpers';
import { CommandService_v1Client } from 'iroha-helpers/lib/proto/endpoint_grpc_pb';
import config from './config';

const publicKey = derivePublicKey(Buffer.from(config.iroha.admin.privateKey, 'hex')).toString('hex');

const commandService = new CommandService_v1Client(config.iroha.host, grpc.credentials.createInsecure() as any);
const commandOptions = {
  commandService,
  privateKeys: [config.iroha.admin.privateKey],
  creatorAccountId: config.iroha.admin.accountId,
  quorum: 1,
  timeoutLimit: 5000,
};

export const createAccount = (accountName: string, domainId: string) =>
  commands.createAccount(commandOptions, { accountName, domainId, publicKey });

export const addMySignatory = (creatorAccountId: string, publicKey: string) =>
  commands.addSignatory({ ...commandOptions, creatorAccountId }, { accountId: creatorAccountId, publicKey });

export const setMyQuorum = (creatorAccountId: string, quorum: number) =>
  commands.setAccountQuorum({ ...commandOptions, creatorAccountId }, { accountId: creatorAccountId, quorum });

/** TODO: remove when iroha-helpers treats NOT_RECEIVED as non-terminal status */
async function retry(tx) {
  while (true) {
    try {
      return await tx();
    } catch (e) {
      if (e.message && e.message.includes('actual=NOT_RECEIVED')) {
        continue;
      }
      throw e;
    }
  }
}

export const main = async () => {
  const key1 = '01'.repeat(32);
  const key2 = '02'.repeat(32);
  const key3 = '03'.repeat(32);
  await retry(() => createAccount('alice', 'explorer'));
  await retry(() => addMySignatory('alice@explorer', key1));
  await retry(() => addMySignatory('alice@explorer', key2));
  await retry(() => setMyQuorum('alice@explorer', 3));
  await retry(() => createAccount('bob', 'explorer'));
  await retry(() => addMySignatory('bob@explorer', key2));
  await retry(() => createAccount('eve', 'explorer'));
  await retry(() => addMySignatory('eve@explorer', key3));
  await retry(() => setMyQuorum('eve@explorer', 2));
};

if (module === require.main) {
  // tslint:disable-next-line:no-floating-promises
  main();
}

import * as grpc from 'grpc';
import { commands } from 'iroha-helpers';
import { CommandService_v1Client } from 'iroha-helpers/lib/proto/endpoint_grpc_pb';
import config from '../config';
import { blockHash, blockHeight, IrohaApi } from '../iroha-api';
import { IrohaContainer } from './util/iroha-container';

function addBlock(host: string) {
  const commandService = new CommandService_v1Client(host, grpc.credentials.createInsecure() as any);
  return commands.setAccountQuorum(
    {
      commandService,
      privateKeys: [config.iroha.admin.privateKey],
      creatorAccountId: config.iroha.admin.accountId,
      quorum: 1,
      timeoutLimit: 5000,
    },
    {
      accountId: config.iroha.admin.accountId,
      quorum: 1,
    },
  );
}

describe('iroha api', () => {
  let iroha: IrohaContainer = null;
  let api: IrohaApi = null;
  let invalidSignatory: IrohaApi = null;

  beforeAll(
    async () => {
      iroha = await IrohaContainer.create();
      api = new IrohaApi(iroha.host, config.iroha.admin.accountId, config.iroha.admin.privateKey);
      invalidSignatory = new IrohaApi(iroha.host, config.iroha.admin.accountId, '0000000000000000000000000000000000000000000000000000000000000000');
    },
    60000,
  );

  afterAll(async () => {
    if (iroha) {
      await iroha.stop();
    }
  });

  test('getBlock throw invalid height stateless', async () => {
    await expect(api.getBlock(0)).rejects.toBeDefined();
  });

  test('getBlock throw invalid signatory', async () => {
    await expect(invalidSignatory.getBlock(1)).rejects.toBeDefined();
  });

  test('getBlock null', async () => {
    await expect(api.getBlock(2)).resolves.toBeNull();
  });

  test('getBlock', async () => {
    const block = await api.getBlock(1);
    expect(block).not.toBeNull();
    expect(blockHeight(block)).toBe(1);
  });

  test('fetchCommits end', async () => {
    const mock = jest.fn();
    const stream = api.fetchCommits(mock);
    stream.end();
    await stream.promise;
    expect(mock).not.toBeCalled();
  });

  test('streamBlocks throw invalid height stateless', async () => {
    const mock = jest.fn();
    const stream = api.streamBlocks(0, mock);
    await expect(stream.promise).rejects.toBeDefined();
    expect(mock).not.toBeCalled();
  });

  test('streamBlock throw invalid signatory', async () => {
    const mock = jest.fn();
    const stream = invalidSignatory.streamBlocks(1, mock);
    await expect(stream.promise).rejects.toBeDefined();
    expect(mock).not.toBeCalled();
  });

  test('streamBlocks throw callback', async () => {
    const error = {};
    const mock = jest.fn(async () => {
      throw error;
    });
    const stream = api.streamBlocks(1, mock);
    await expect(stream.promise).rejects.toBe(error);
    expect(mock).toBeCalledTimes(1);
  });

  test('streamBlocks end', async () => {
    const mock = jest.fn();
    const stream = api.streamBlocks(1, mock);
    stream.end();
    await stream.promise;
    expect(mock).not.toBeCalled();
  });

  test('streamBlocks existing', async () => {
    let block1 = null;
    const stream = api.streamBlocks(1, async (block) => {
      block1 = block;
      stream.end();
    });
    await stream.promise;
    expect(blockHeight(block1)).toBe(1);
  });

  test('new block', async () => {
    let fetchCommitsBlock = null;
    const fetchCommits = api.fetchCommits((block) => {
      fetchCommitsBlock = block;
      fetchCommits.end();
    });

    let streamBlocksBlock = null;
    const streamBlocks = api.streamBlocks(2, async (block) => {
      streamBlocksBlock = block;
      streamBlocks.end();
    });

    await addBlock(iroha.host);

    await fetchCommits.promise;
    expect(blockHeight(fetchCommitsBlock)).toBe(2);

    await streamBlocks.promise;
    expect(blockHeight(streamBlocksBlock)).toBe(2);
  });

  test('blockHeight', async () => {
    const blocks = [await api.getBlock(1), await api.getBlock(2)];
    expect(blocks).toHaveLength(2);
    expect(blockHeight(blocks[0])).toBe(1);
    expect(blockHeight(blocks[1])).toBe(2);
  });

  test('blockHash', async () => {
    const blocks = [await api.getBlock(1), await api.getBlock(2)];
    expect(blocks).toHaveLength(2);
    expect(blockHash(blocks[0])).toBe(blocks[1].getBlockV1().getPayload().getPrevBlockHash());
  });
});

import * as grpc from 'grpc';
import { sha3_256 } from 'js-sha3';
import invert from 'lodash/invert';
import propertyOf from 'lodash/propertyOf';

import { queryHelper } from 'iroha-helpers';
import { Block } from 'iroha-helpers/lib/proto/block_pb';
import { QueryService_v1Client } from 'iroha-helpers/lib/proto/endpoint_grpc_pb';
import { GrantablePermission, RolePermission } from 'iroha-helpers/lib/proto/primitive_pb';
import { ErrorResponse } from 'iroha-helpers/lib/proto/qry_responses_pb';
import { Transaction } from 'iroha-helpers/lib/proto/transaction_pb';

export { Block as BlockProto } from 'iroha-helpers/lib/proto/block_pb';
export { Transaction as TransactionProto } from 'iroha-helpers/lib/proto/transaction_pb';

interface WithErrorResponse extends Error {
  errorResponse?: ErrorResponse;
}

export class IrohaApi {
  private queryService: QueryService_v1Client;

  public constructor(
    private host: string,
    private accountId: string,
    private privateKey: string,
  ) {
    this.queryService = new QueryService_v1Client(this.host, grpc.credentials.createInsecure() as any);
  }

  public streamBlocks(firstHeight: number, onBlock: (block: Block) => Promise<any>) {
    let height = firstHeight;
    let end = false;
    let result = null;
    let onBlockLock = true;
    const streamQueue: Block[] = [];
    const stream = this.fetchCommits((block) => {
      streamQueue.push(block);
      return streamTryConsume();
    });
    async function streamTryConsume() {
      if (!onBlockLock) {
        onBlockLock = true;
        try {
          while (streamQueue.length) {
            const block = streamQueue.shift();
            if (end) {
              return;
            }
            if (blockHeight(block) === height) {
              await onBlock(block);
              height += 1;
            }
          }
          onBlockLock = false;
        } catch (error) {
          result = error;
          stream.end();
        }
      }
    }
    return {
      promise: Promise.all([
        (async () => {
          try {
            while (true) {
              const block = await this.getBlock(height);
              if (end || block === null || streamQueue.length && blockHeight(streamQueue[0]) <= height) {
                break;
              }
              await onBlock(block);
              height += 1;
            }
            onBlockLock = false;
          } catch (error) {
            result = error;
            stream.end();
            return;
          }
          if (!end) {
            await streamTryConsume();
          }
        })(),
        stream.promise,
      ]).then(() => result && Promise.reject(result)),
      end() {
        end = true;
        stream.end();
      },
    };
  }

  public fetchCommits(onBlock: (block: Block) => void) {
    let end = false;
    const query = this.prepareQuery(queryHelper.emptyBlocksQuery());
    const stream = this.queryService.fetchCommits(query);
    const promise = new Promise<void>((resolve, reject) => {
      (stream as any).on('error', (error) => {
        if (error.details === 'Cancelled') {
          resolve();
        } else {
          reject(error);
        }
      });
      stream.on('data', (response) => {
        if (response.hasBlockErrorResponse()) {
          /** currently BlockErrorResponse contains only message */
          reject(new Error(response.getBlockErrorResponse().getMessage()));
        } else if (!end) {
          onBlock(response.getBlockResponse().getBlock());
        }
      });
    });
    return {
      promise,
      end () {
        end = true;
        stream.cancel();
      },
    };
  }

  public getBlock(height: number) {
    return new Promise<Block>((resolve, reject) => {
      const query = this.prepareQuery(queryHelper.addQuery(
        queryHelper.emptyQuery(),
        'getBlock',
        { height },
      ));
      this.queryService.find(query, (err, response) => {
        if (err) {
          reject(err);
        } else {
          if (response.hasErrorResponse()) {
            const errorResponse = response.getErrorResponse();
            if (errorResponse.getReason() === ErrorResponse.Reason.STATEFUL_INVALID && errorResponse.getErrorCode() === 3 && errorResponse.getMessage() !== 'query signatories did not pass validation') {
              resolve(null);
            } else {
              const error = new Error() as WithErrorResponse;
              error.errorResponse = errorResponse;
              error.message = error.errorResponse.getMessage();
              reject(error);
            }
          } else {
            resolve(response.getBlockResponse().getBlock());
          }
        }
      });
    });
  }

  private prepareQuery(query) {
    return queryHelper.sign(
      queryHelper.addMeta(query, { creatorAccountId: this.accountId }),
      this.privateKey,
    );
  }
}

export const blockHash = (block: Block) => sha3_256(block.getBlockV1().getPayload().serializeBinary());

export const blockHeight = (block: Block) => block.getBlockV1().getPayload().getHeight();

export const transactionHash = (transaction: Transaction) => sha3_256(transaction.getPayload().serializeBinary());

const ACCOUNT_REGEX = /^[^@]+@([^@]+)$/;

export function accountDomain(accountId: string) {
  const match = accountId.match(ACCOUNT_REGEX);
  return match && match[1];
}

export const rolePermissionName = propertyOf(invert(RolePermission));
export const grantablePermissionName = propertyOf(invert(GrantablePermission));

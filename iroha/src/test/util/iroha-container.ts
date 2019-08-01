import * as path from 'path';
import { StartedTestContainer } from 'testcontainers/dist/test-container';
import waitOn = require('wait-on');
import { PostgresContainer } from './postgres-container';
import { buildDockerfile, inspectIp, startWithLinks } from './testcontainers';

export class IrohaContainer {
  public static async create() {
    const container = await buildDockerfile('iroha-explorer-iroha-test', 'latest', path.resolve(__dirname, '../../../docker/iroha'));
    container.withEnv('KEY', 'node');
    const postgres = await PostgresContainer.create('iroha-explorer-backend');
    try {
      const instance = await startWithLinks(container, { 'iroha-explorer-iroha-postgres': postgres.instance });
      try {
        const host = `${await inspectIp(instance)}:50051`;
        await waitOn({ resources: [`tcp:${host}`] });
        return new IrohaContainer(postgres, instance, host);
      } catch (e) {
        await instance.stop();
        throw e;
      }
    } catch (e) {
      await postgres.stop();
      throw e;
    }
  }

  private constructor(
    public postgres: PostgresContainer,
    public instance: StartedTestContainer,
    public host: string,
  ) {
  }

  public stop() {
    return Promise.all([
      this.instance.stop(),
      this.postgres.stop(),
    ]);
  }
}

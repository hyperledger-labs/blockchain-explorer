import { GenericContainer } from 'testcontainers';
import { StartedTestContainer } from 'testcontainers/dist/test-container';
import * as Url from 'url';
import waitOn = require('wait-on');
import { inspectIp } from './testcontainers';

export class PostgresContainer {
  public static async create(password: string) {
    const instance = await new GenericContainer('postgres', '9.5')
      .withEnv('POSTGRES_PASSWORD', password)
      .start();
    try {
      const url = Url.parse(`postgres://postgres:${password}@${await inspectIp(instance)}:5432/postgres`);
      await waitOn({ resources: [`tcp:${url.host}`] });
      return new PostgresContainer(instance, password, url);
    } catch (e) {
      await instance.stop();
      throw e;
    }
  }

  private constructor(
    public readonly instance: StartedTestContainer,
    public readonly password: string,
    public readonly url: Url.Url,
  ) {
  }

  public stop() {
    return this.instance.stop();
  }
}

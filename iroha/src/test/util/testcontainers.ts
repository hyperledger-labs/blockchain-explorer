import Dockerode, * as dockerode from 'dockerode';
import { GenericContainer } from 'testcontainers';
import { DockerodeClientFactory } from 'testcontainers/dist/docker-client-factory';
import { RepoTag } from 'testcontainers/dist/repo-tag';
import { StartedTestContainer } from 'testcontainers/dist/test-container';

/** HACK: get dockerode client */
const dockerodeContainer = (instance: StartedTestContainer) => (instance as any).container.container as dockerode.Container;

/** HACK: get ip address via docker inspect */
export async function inspectIp(instance: StartedTestContainer) {
  const result = await dockerodeContainer(instance).inspect();
  return result.NetworkSettings.IPAddress;
}

/** HACK: pass extra arguments to dockerode */
export async function startWithLinks(container: GenericContainer, links: {[alias: string]: StartedTestContainer}) {
  const linksList = Object.entries(links).map(([alias, instance]) => `${dockerodeContainer(instance).id}:${alias}`);

  // tslint:disable-next-line:ter-prefer-arrow-callback
  const containerOverlay: GenericContainer = new (Object.assign(function () {}, { prototype: container }));
  (containerOverlay as any).dockerClient = containerOverlay.dockerClientFactory.getClient();

  const client = (containerOverlay as any).dockerClient.dockerode as Dockerode;
  const createContainer = client.createContainer;
  client.createContainer = function (options: Dockerode.ContainerCreateOptions) {
    options.HostConfig.Links = linksList;
    return createContainer.call(this, options);
  };

  return containerOverlay.start();
}

export async function buildDockerfile(image: string, tag: string, context: string) {
  await new DockerodeClientFactory().getClient().buildImage(new RepoTag(image, tag), context);
  return new GenericContainer(image, tag);
}

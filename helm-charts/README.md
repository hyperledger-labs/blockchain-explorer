## Prerequisites

- Kubernetes 1.9+
- A running Hyperledger Fabric network on kubernetes.

## Installing the Chart

To install the chart with the release name `explorer`:

```bash
$ helm install explorer/ --name explorer
```

The command deploys the Blockchain Explorer & Explorer-DB on the Kubernetes cluster in the default configuration. The [Configuration](#configuration) section lists the parameters that can be configured during installation.

## Test the Chart

To test the chart with the release name `explorer`:

```bash
$ helm test explorer
```

The command tests the Blockchain Explorer & Explorer-DB on the Kubernetes cluster.

## Uninstalling the Chart

To uninstall/delete the `explorer` deployment:

```bash
$ helm delete explorer
```

The command removes all the Kubernetes components associated with the chart and deletes the release.

## Configuration

The following table lists the configurable parameters of the Blockchain Explorer & Explorer-DB chart and default values.
            
| Parameter                           | Description                                                    | Default                   |
| ---------------------------------   | -------------------------------------------------              | ------------------------- |
| `explorer.image.repository`         | `explorer` image repository                                    | `hyperledger/explorer`    |
| `explorer.image.tag`                | `explorer` image tag                                           | `latest`                  |
| `explorer.username`                 | `explorer` username                                            | ` `                       |
| `explorer.password`                 | `explorer` password                                            | ` `                       |
| `image.pullPolicy`                  | Image pull policy                                              | `IfNotPresent`            |
| `db.image.repository`               | `explorer-db` image repository                                 | `hyperledger/explorer-db` |
| `db.image.tag`                      | `explorer-db` image tag                                        | `latest`                  |
| `db.DATABASE_DATABASE`              | `explorer-db` DATABASE_DATABASE name                           | ` `                       |
| `db.DATABASE_USERNAME`              | `explorer-db` DATABASE_USERNAME name                           | ` `                       |
| `db.DATABASE_PASSWORD`              | `explorer-db` DATABASE_PASSWORD name                           | ` `                       |
| `explorer.service.port`             | TCP port for requests to explorer                              | `8080`                    |
| `explorer.service.type`             | K8S service type exposing ports, e.g. `ClusterIP`              | `ClusterIP`               |
| `explorer.ingress.enabled`          | If true, Ingress will be created                               | `false`                   |
| `explorer.ingress.annotations`      | Ingress annotations                                            | `{}`                      |
| `explorer.ingress.path`             | Ingress path                                                   | `/`                       |
| `explorer.ingress.hosts`            | Ingress hostnames                                              | ` `                       |
| `db.service.port`                   | TCP port for requests to explorer-db                           | `5432`                    |
| `db.service.type`                   | K8S service type exposing ports, e.g. `ClusterIP`              | `ClusterIP`               |
| `resources`                         | CPU/Memory resource requests/limits                            | `{}`                      |
| `replicaCount`                      | Replicacount of pods                                           | `1`                       |
| `network.channel`                   | HLF network channel name                                       | ` `                       |
| `network.mspid`                     | HLF network peer org mspid                                     | ` `                       |
| `network.peername`                  | HLF network peername                                           | ` `                       |
| `network.peerurl`                   | HLF network peerurl                                            | ` `                       |
| `network.adminPrivateKey`           | HLF network peer adminPrivateKey                               | ` `                       |
| `network.signedCert`                | HLF network peer signedCert                                    | ` `                       |
| `network.tlsCACerts`                | HLF network peer tlsCACerts                                    | ` `                       |

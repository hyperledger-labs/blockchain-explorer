const AdmZip = require('adm-zip');

const generatePeerDockerfile = () => {
  const fabricVersion = '1.4.0';
  const os = 'linux-amd64';
  const caBinaryFile = `hyperledger-fabric-ca-${os}-${fabricVersion}.tar.gz`;
  const clientBinaryFile = `hyperledger-fabric-${os}-${fabricVersion}.tar.gz`;
  const caURL = `https://nexus.hyperledger.org/content/repositories/releases/org/hyperledger/fabric-ca/hyperledger-fabric-ca/${os}-${fabricVersion}/${caBinaryFile}`;
  const clientURL = `https://nexus.hyperledger.org/content/repositories/releases/org/hyperledger/fabric/hyperledger-fabric/${os}-${fabricVersion}/${clientBinaryFile}`;

  return `FROM hyperledger/fabric-peer:1.4.0
RUN apt-get update && apt-get install -y netcat jq && apt-get install -y curl && rm -rf /var/cache/apt
RUN curl -o /tmp/fabric-ca-client.tar.gz ${caURL} && tar -xzvf /tmp/fabric-ca-client.tar.gz -C /tmp && cp -r /tmp/bin/* /usr/local/bin
RUN curl -o /tmp/fabric-client.tar.gz ${clientURL} && tar -xzvf /tmp/fabric-client.tar.gz -C /tmp && cp -r /tmp/bin/* /usr/local/bin
RUN chmod +x -R /usr/local/bin/*
ARG FABRIC_CA_DYNAMIC_LINK=true
EXPOSE 7051
RUN if [ "\\$FABRIC_CA_DYNAMIC_LINK" = "true" ]; then apt-get install -y libltdl-dev; fi`;
};

const getRootCA = (orgOptions, networkOptions) => {
  const { orderer, newOrg, numPeers, randomNumber } = orgOptions;
  const { commonDir, scriptsDir, logsDir, networkName } = networkOptions;
  const rcaName = `rca.${newOrg}.com`;

  return {
    [rcaName]: {
      container_name: rcaName,
      image: 'hyperledger/fabric-ca',
      command: `/bin/bash -c '/scripts/start-root-ca.sh 2>&1 | tee //logs/${rcaName}.log'`,
      environment: [
        `ORDERER_ORGS=${orderer}`,
        `PEER_ORGS=${newOrg}`,
        `NUM_PEERS=${numPeers}`,
        'FABRIC_CA_SERVER_HOME=/etc/hyperledger/fabric-ca',
        'FABRIC_CA_SERVER_TLS_ENABLED=true',
        `FABRIC_CA_SERVER_CSR_CN=${rcaName}`,
        `FABRIC_CA_SERVER_CSR_HOSTS=${rcaName}`,
        'FABRIC_CA_SERVER_DEBUG=false',
        `BOOTSTRAP_USER_PASS=rca-${newOrg}-admin:rca-${newOrg}-adminpw`,
        `TARGET_CERTFILE=/${commonDir}/${newOrg}-ca-cert.pem`,
        `FABRIC_ORGS=${orderer} ${newOrg}`,
        `RANDOM_NUMBER=${randomNumber}`
      ],
      volumes: [
        `${scriptsDir}:/scripts`,
        `${logsDir}:/logs`,
        `${commonDir}:/${commonDir}`
      ],
      networks: [networkName]
    }
  };
};

const getIntCA = (orgOptions, networkOptions) => {
  const { orderer, newOrg, numPeers, randomNumber } = orgOptions;
  const { commonDir, scriptsDir, logsDir, networkName } = networkOptions;
  const rcaName = `rca.${newOrg}.com`;
  const icaName = `ica.${newOrg}.com`;

  return {
    [icaName]: {
      container_name: icaName,
      image: 'hyperledger/fabric-ca',
      command: `/bin/bash -c '/scripts/start-intermediate-ca.sh 2>&1 | tee //logs/${icaName}.log'`,
      environment: [
        `ORDERER_ORGS=${orderer}`,
        `PEER_ORGS=${newOrg}`,
        `NUM_PEERS=${numPeers}`,
        'FABRIC_CA_SERVER_HOME=/etc/hyperledger/fabric-ca',
        `FABRIC_CA_SERVER_CA_NAME=${icaName}`,
        `FABRIC_CA_SERVER_INTERMEDIATE_TLS_CERTFILES=/${commonDir}/${newOrg}-ca-cert.pem`,
        'FABRIC_CA_SERVER_TLS_ENABLED=true',
        `FABRIC_CA_SERVER_CSR_HOSTS=${icaName}`,
        'FABRIC_CA_SERVER_DEBUG=false',
        `BOOTSTRAP_USER_PASS=ica-${newOrg}-admin:ica-${newOrg}-adminpw`,
        `PARENT_URL=https://rca-${newOrg}-admin:rca-${newOrg}-adminpw@${rcaName}:7054`,
        `TARGET_CHAINFILE=/${commonDir}/${newOrg}-ca-chain.pem`,
        `ORGANIZATION=${newOrg}`,
        `FABRIC_ORGS=${orderer} ${newOrg}`,
        `RANDOM_NUMBER=${randomNumber}`
      ],
      volumes: [
        `${scriptsDir}:/scripts`,
        `${logsDir}:/logs`,
        `${commonDir}:/${commonDir}`
      ],
      networks: [networkName],
      depends_on: [rcaName]
    }
  };
};

const getPeers = (orgOptions, networkOptions) => {
  const { orderer, newOrg, numPeers, randomNumber, startPeer } = orgOptions;
  const { commonDir, scriptsDir, logsDir, networkName } = networkOptions;
  const peerHome = '/opt/gopath/src/github.com/hyperledger/fabric/peer';
  const caChainFile = `/${commonDir}/${newOrg}-ca-chain.pem`;
  const caHost = `ica.${newOrg}.com`;

  const peers = {};
  for (let i = startPeer; i < startPeer + numPeers; i++) {
    const peerName = `peer${i}.${newOrg}.com`;
    peers[peerName] = {
      container_name: peerName,
      build: {
        context: '.',
        dockerfile: 'fabric-ca-peer.dockerfile'
      },
      working_dir: peerHome,
      command: `/bin/bash -c '/scripts/start-peer.sh 2>&1 | tee //logs/${peerName}.log'`,
      environment: [
        `ORDERER_ORGS=${orderer}`,
        `PEER_ORGS=${newOrg}`,
        `NUM_PEERS=${numPeers}`,
        `FABRIC_CA_CLIENT_HOME=${peerHome}`,
        `FABRIC_CA_CLIENT_TLS_CERTFILES=${caChainFile}`,
        `ENROLLMENT_URL=https://${peerName}:${peerName}pw@${caHost}:7054`,
        `PEER_NAME=${peerName}`,
        `PEER_HOME=${peerHome}`,
        `PEER_HOST=${peerName}`,
        `PEER_NAME_PASS=${peerName}:${peerName}pw`,
        `CORE_PEER_ID=${peerName}`,
        `CORE_PEER_ADDRESS=${peerName}:7051`,
        `CORE_PEER_LOCALMSPID=${newOrg}MSP`,
        `CORE_PEER_MSPCONFIGPATH=${peerHome}/msp`,
        'CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock',
        `CORE_VM_DOCKER_HOSTCONFIG_NETWORKMODE=net_${networkName}`,
        'FABRIC_LOGGING_SPEC=INFO',
        'CORE_PEER_TLS_ENABLED=true',
        `CORE_PEER_TLS_CERT_FILE=${peerHome}/tls/server.crt`,
        `CORE_PEER_TLS_KEY_FILE=${peerHome}/tls/server.key`,
        `CORE_PEER_TLS_ROOTCERT_FILE=${caChainFile}`,
        'CORE_PEER_TLS_CLIENTAUTHREQUIRED=true',
        `CORE_PEER_TLS_CLIENTROOTCAS_FILES=${caChainFile}`,
        'CORE_PEER_GOSSIP_USELEADERELECTION=true',
        'CORE_PEER_GOSSIP_ORGLEADER=false',
        `CORE_PEER_GOSSIP_EXTERNALENDPOINT=${peerName}:7051`,
        'CORE_PEER_GOSSIP_SKIPHANDSHAKE=true',
        `ORGANIZATION=${newOrg}`,
        `COUNT=${i}`,
        `ORG_ADMIN_CERT=/${commonDir}/orgs/${newOrg}/msp/admincerts/cert.pem`,
        `RANDOM_NUMBER=${randomNumber}`
      ].concat(
        i > 1 ? [`CORE_PEER_GOSSIP_BOOTSTRAP=peer1.${newOrg}.com:7051`] : []
      ),
      volumes: [
        `${scriptsDir}:/scripts`,
        `${logsDir}:/logs`,
        '/var/run:/host/var/run',
        `${commonDir}:/${commonDir}`
      ],
      networks: [networkName]
    };
  }

  return peers;
};

const services = {
  peers: getPeers,
  rca: getRootCA,
  ica: getIntCA
};

const generateDockerCompose = (orgOptions, networkOptions) => ({
  version: '3.4',
  networks: { 'fabric-ca': { external: { name: 'net_fabric-ca' } } },
  volumes: { private: null },
  services: orgOptions.services.reduce(
    (acc, service) => ({
      ...acc,
      ...services[service](orgOptions, networkOptions)
    }),
    {}
  )
});

const generteDockerfiles = (orgOptions, networkOptions) => {
  const { newOrg } = orgOptions;

  const archive = new AdmZip();

  const dockerCompose = generateDockerCompose(orgOptions, networkOptions);
  archive.addFile(
    `docker-compose-${newOrg}.json`,
    Buffer.from(JSON.stringify(dockerCompose, null, 2))
  );
  archive.addFile(
    'fabric-ca-peer.dockerfile',
    Buffer.from(generatePeerDockerfile())
  );
  return archive;
};

module.exports.generteDockerfiles = generteDockerfiles;

#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#

import os
import sys
import subprocess
import shutil
import json
import uuid
import time
from common_util import convertBoolean


def enableTls(context, tlsEnabled, projectName=None):
    if not hasattr(context, "composition"):
        context.composition = Composition(context, projectName=projectName, startContainers=False)
    context.composition.environ["ORDERER_GENERAL_TLS_ENABLED"] = convertBoolean(tlsEnabled)
    context.composition.environ["CORE_PEER_TLS_ENABLED"] = convertBoolean(tlsEnabled)
    context.composition.environ["FABRIC_CA_SERVER_TLS_ENABLED"] = convertBoolean(tlsEnabled)


class ContainerData:
    def __init__(self, containerName, ipAddress, envFromInspect, composeService, ports):
        self.containerName = containerName
        self.ipAddress = ipAddress
        self.envFromInspect = envFromInspect
        self.composeService = composeService
        self.ports = ports

    def getEnv(self, key):
        """
        Gathers the environment information from "docker inspect"
        Returns the value that is set in the environment variable
        """
        envValue = None
        for val in self.envFromInspect:
            if val.startswith(key):
                envValue = val[len(key)+1:].strip()
                break
        if envValue == None:
            raise Exception("ENV key not found ({0}) for container ({1})".format(key, self.containerName))
        return envValue


class Composition:

    def __init__(self, context, composeFilesYaml=None, projectName=None,
                 force_recreate=True, components=[], startContainers=True):
        if not projectName:
            projectName = str(uuid.uuid1()).replace('-','')
        self.projectName = projectName
        self.context = context
        self.containerDataList = []
        self.environ = {}
        self.composeFilesYaml = composeFilesYaml
        if startContainers:
            self.up(force_recreate, components)

    def collectServiceNames(self):
        servicesList = [service for service in self.issueCommand(["config", "--services"]).splitlines() if "WARNING" not in service]
        return servicesList

    def up(self, force_recreate=True, components=[]):
        command = ["up", "-d"]
        if force_recreate:
            command += ["--force-recreate"]
        cas = ["ca.org1.example.com", "ca.org2.example.com"]
        for ca in cas:
            self.setFabricCaEnv(ca)
        self.issueCommand(command + components)

    def scale(self, serviceName, count=1):
        command = ["scale", "%s=%d" %(serviceName, count)]
        self.issueCommand(command)

    def stop(self, components=[]):
        command = ["stop"]
        self.issueCommand(command, components)

    def pause(self, components=[]):
        command = ["pause"]
        self.issueCommand(command, components)

    def disconnect(self, components=[]):
        command = ["network", "disconnect", str(self.projectName)+"_behave"]
        self.issueCommand(command, components)

    def start(self, components=[]):
        command = ["start"]
        self.issueCommand(command, components)

    def unpause(self, components=[]):
        command = ["unpause"]
        self.issueCommand(command, components)

    def connect(self, components=[]):
        command = ["network", "connect", str(self.projectName)+"_behave"]
        self.issueCommand(command, components)

    def docker_exec(self, command, components=[]):
        results = {}
        updatedCommand = " ".join(command)
        for component in components:
            execCommand = ["exec", component, updatedCommand]
            results[component] = self.issueCommand(execCommand, [])
        return results

    def parseComposeFilesArg(self, composeFileArgs):
        argSubList = [["-f", composeFile] for composeFile in composeFileArgs]
        args = [arg for sublist in argSubList for arg in sublist]
        return args

    def getFileArgs(self):
        return self.parseComposeFilesArg(self.composeFilesYaml)

    def getEnvFromContainer(self, container_name, key):
        value = ""
        for container in self.containerDataList:
            if container_name in container.containerName:
                value = container.getEnv(key)
                break
        return value

    def setFabricCaEnv(self, ca):
        name = ca.split('.', 1)
        ofileLoc = './configs/{0}/ordererOrganizations/{1}/ca/'.format(self.projectName, name[1])
        pfileLoc = './configs/{0}/peerOrganizations/{1}/ca/'.format(self.projectName, name[1])
        if os.path.exists(ofileLoc):
            fileLoc = ofileLoc
        else:
            fileLoc = pfileLoc
        assert os.path.exists(fileLoc),'File "{0}" does not exist'.format(fileLoc)
        filename = self.lookForKeyFile(fileLoc)

        keyVals = []
        fullOrg = name[1].split('.')
        org = fullOrg[0]

        self.environ['FABRIC_CA_SERVER_{}_TLS_KEYFILE'.format(org.upper())] = '/var/hyperledger/fabric-ca-server/ca/{}'.format(filename)
        self.environ['FABRIC_CA_SERVER_{}_CA_KEYFILE'.format(org.upper())] = '/var/hyperledger/fabric-ca-server/ca/{}'.format(filename)

        #copy keyfile to msp/keystore
        if not os.path.exists("{0}../msp/keystore".format(fileLoc)):
            os.mkdir("{0}../msp/keystore".format(fileLoc))
        shutil.copyfile("{0}{1}".format(fileLoc, filename), "{0}../msp/keystore/{1}".format(fileLoc, filename))

        with open("./configs/fabric-ca-server-config.yaml", "r") as template:
            config = template.read().format(orgName=name[1])
            fd = open("{0}../fabric-ca-server-config.yaml".format(fileLoc), "w")
            fd.write(config)
            fd.close()

        shutil.copyfile("./configs/fabric-ca-server-config.yaml", "{0}../fabric-ca-server-config.yaml".format(fileLoc))

    def lookForKeyFile(self, fileLoc):
        filename = ""
        files = os.listdir(fileLoc)
        for fn in files:
            if fn.endswith('sk'):
                filename = fn
        return filename

    def getEnvAdditions(self):
        myEnv = {}
        myEnv = self.environ.copy()
        myEnv["COMPOSE_PROJECT_NAME"] = self.projectName
        myEnv["CORE_PEER_NETWORKID"] = self.projectName
        return myEnv

    def getEnv(self, container=''):
        myEnv = os.environ.copy()
        for key,value in self.getEnvAdditions().items():

            if key == container and type(value) == dict:
                # If these are container specific environment variables
                # copy these env vars
                for c_key, c_value in value.items():
                    myEnv[c_key] = c_value
            elif type(value) != dict:
                # Skipping any env vars that contain dict values
                # for containers that we don't care about
                myEnv[key] = value
        return myEnv

    def refreshContainerIDs(self):
        containers = self.issueCommand(["ps", "-q"]).split()
        return containers

    def getContainerIP(self, container):
        container_ipaddress = None
        if container['State']['Running']:
            container_ipaddress = container['NetworkSettings']['IPAddress']
            if not container_ipaddress and container['NetworkSettings']['Networks']:
                # ipaddress not found at the old location, try the new location
                container_ipaddress = container['NetworkSettings']['Networks'].values()[0]['IPAddress']
        return container_ipaddress

    def getContainerFromName(self, containerName, containerList):
        container = None
        for container in containerList:
            if containerName == container.containerName:
                break
        return container

    def issueCommand(self, command, components=[]):
        componentList = []
        useCompose = True
        # Some commands need to be run using "docker" and not "docker-compose"
        docker_only_commands=["network", "start", "stop", "pause", "unpause"]
        for component in components:
            if '_' in component:
                useCompose = False
                componentList.append("%s_%s" % (self.projectName, component))
            else:
                break
        # If we need to perform docker network commands, use docker, not
        # docker-compose
        if command[0] in docker_only_commands:
            useCompose = False

        # If we need to perform an operation on a specific container, use
        # docker not docker-compose
        if useCompose and command[0] != "exec":
            cmdArgs = self.getFileArgs()+ command + components
            cmd = ["docker-compose"] + cmdArgs
        elif command[0] == "exec":
            cmdArgs = command + componentList
            cmdList = ["docker"] + cmdArgs
            cmd = [" ".join(cmdList)]
        elif command[0] in docker_only_commands:
            cmdArgs = command + components
            cmd = ["docker"] + cmdArgs
        else:
            cmdArgs = command + componentList
            cmd = ["docker"] + cmdArgs

        try:
            if cmd[0].startswith("docker exec"):
                process = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=self.getEnv())
                output, _error = process.communicate()
                if "Error: " in _error or "CRIT " in _error:
                    raise Exception(_error)
            else:
                process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=self.getEnv())
                output, _error = process.communicate()
                if _error:
                    raise Exception(_error)
        except:
            err = "Error occurred {0}: {1}".format(cmd, sys.exc_info()[1])
            output = err

        # Don't rebuild if ps command
        if command[0] !="ps" and command[0] !="config":
            self.rebuildContainerData()
        return str(output)

    def updateContainerEnviron(self, container_name, keyValList):
        for containerID in self.refreshContainerIDs():
            # get container metadata
            cmd = ["docker", "inspect", containerID]
            try:
                output = subprocess.check_output(cmd)
            except:
                err = "Error occurred {0}: {1}".format(cmd, sys.exc_info()[1])
                continue
            container = json.loads(str(output))[0]
            # container name
            if container_name == container['Name'][1:]:
                config_loc = "/var/lib/docker/containers/{}/config.v2.json".format(container['Id'])
                container['Config']['Env'] += keyValList
                self.stop([container_name])
                with open(config_loc, "w") as fd:
                    fd.write(json.dumps([container]))
                self.start([container_name])
            else:
                continue

    def rebuildContainerData(self):
        self.containerDataList = []
        for containerID in self.refreshContainerIDs():
            # get container metadata
            cmd = ["docker", "inspect", containerID]
            try:
                output = subprocess.check_output(cmd)
            except:
                err = "Error occurred {0}: {1}".format(cmd, sys.exc_info()[1])
                continue
            container = json.loads(str(output))[0]
            # container name
            container_name = container['Name'][1:]
            # container ip address (only if container is running)
            container_ipaddress = self.getContainerIP(container)
            # container environment
            container_env = container['Config']['Env']
            # container exposed ports
            container_ports = container['NetworkSettings']['Ports']
            # container docker-compose service
            container_compose_service = container['Config']['Labels']['com.docker.compose.service']
            container_data = ContainerData(container_name,
                                           container_ipaddress,
                                           container_env,
                                           container_compose_service,
                                           container_ports)
            self.containerDataList.append(container_data)

    def decompose(self):
        self.issueCommand(["unpause"], self.refreshContainerIDs())
        self.issueCommand(["down"])
        self.issueCommand(["kill"])
        self.issueCommand(["rm", "-f"])
        env = self.getEnv()

        # Now remove associated chaincode containers if any
        cmd = ["docker", "ps", "-qa", "--filter", "name={0}".format(self.projectName)]
        output = str(subprocess.check_output(cmd, env=env))
        container_list = output.strip().split('\n')
        for container in container_list:
            if container != '':
                subprocess.call(['docker', 'rm', '-f', container], env=env)

        # Need to remove the chaincode images: docker rmi -f $(docker images | grep "example.com-" | awk '{print $3}')
        retVal = subprocess.call(['docker images | grep ".example.com-"'], env=env, shell=True)
        if retVal != 1:
            cmd = ['docker images | grep ".example.com-" | awk \'{print $3}\' | xargs docker rmi']
            subprocess.call(cmd, shell=True, env=env)

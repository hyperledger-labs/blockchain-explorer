#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#

import os
import subprocess
import shutil
import gc
import psutil
from steps.endorser_util import CLIInterface, ToolInterface


def getLogFiles(containers, fileSuffix):
    """ This will gather the logs for the different component containers as well as
        the chaincode containers. If the containers is a list of strings, it is
        assumed this is a chaincode container list. Otherwise, the list is a list
        of Container objects.
    """
    for container in containers:
        if isinstance(container, str):
            namePart, sep, _ = container.rpartition("-")
            containerName = container
        else:
            namePart = container.containerName
            containerName = container.containerName
        try:
            with open(namePart + fileSuffix, "w+") as logfile:
                rc = subprocess.call(["docker", "logs", containerName], stdout=logfile, stderr=logfile)
                if rc !=0 :
                    print("Cannot get logs for {0}. Docker rc = {1}".format(namePart, rc))
        except:
            print("Unable to get the logs for {}".format(namePart + fileSuffix))


def before_scenario(context, scenario):
    # Remove all existing containers if any
    output = str(subprocess.check_output(["docker ps -aq"], shell=True))
    container_list = output.strip().split('\n')
    for container in container_list:
        if container != '':
            subprocess.call(['docker rm -f {}'.format(container)], shell=True)


def after_scenario(context, scenario):
    # Display memory usage before tearing down the network
    mem = psutil.virtual_memory()
    print("Memory Info Before Network Teardown:\n\tFree: {}\n\tUsed: {}\n\tPercentage: {}\n".format(mem.free, mem.used, mem.percent))

    if hasattr(context, "printEnvWarning") and context.printEnvWarning:
        print("WARNING: The permissions on the newly generated user files did not match the original files. Workaround was deployed.")

    # Show files in the configs directory for this test
    if hasattr(context, "projectName"):
        output = subprocess.check_output(["ls -ltr configs/{}".format(context.projectName)], shell=True)
        print(output)
        output = subprocess.check_output(["ls -ltr configs/{}/peerOrganizations/org*.example.com/users".format(context.projectName)], shell=True)
        print(output)

    getLogs = context.config.userdata.get("logs", "N")
    if getLogs.lower() == "force" or (scenario.status == "failed" and getLogs.lower() == "y" and "compose_containers" in context):
        print("Collecting container logs for Scenario '{}'".format(scenario.name))
        # Replace spaces and slashes with underscores
        fileSuffix = "_" + scenario.name.replace(" ", "_").replace("/", "_") + ".log"
        # get logs from the peer containers
        getLogFiles(context.composition.containerDataList, fileSuffix)
        # get logs from the chaincode containers
        chaincodeContainers = subprocess.check_output(["docker",  "ps", "-f",  "name=-peer", "--format", "{{.Names}}"])
        getLogFiles(chaincodeContainers.splitlines(), fileSuffix)

    if 'doNotDecompose' in scenario.tags:
        if 'compose_yaml' in context:
            print("Not going to decompose after scenario {0}, with yaml '{1}'".format(scenario.name,
                                                                                      context.compose_yaml))
    elif 'composition' in context:
        # Remove config data and docker containers
        shutil.rmtree("configs/%s" % context.composition.projectName)
        shutil.rmtree("/tmp/fabric-client-kvs_org1", ignore_errors=True)
        shutil.rmtree("/tmp/fabric-client-kvs_org2", ignore_errors=True)
        context.composition.decompose()
    elif hasattr(context, 'projectName'):
        shutil.rmtree("configs/%s" % context.projectName)

    # Print memory information after every scenario
    memory = subprocess.check_output(["df", "-h"], shell=True)
    print("\nMemory Usage Info:\n{}\n".format(memory))
    mem = psutil.virtual_memory()
    print("*** Memory Info:\n\tFree: {}\n\tUsed: {}\n\tPercentage: {}\n".format(mem.free, mem.used, mem.percent))

    # Clean up memory in between scenarios, just in case
    if hasattr(context, "random_key"):
        del context.random_key
    if hasattr(context, "payload"):
        del context.payload
    if hasattr(context, "composition"):
        del context.composition
    if hasattr(context, "result"):
        del context.result
    gc.collect()

def before_all(context):
    # Be sure to use a fresh install of the vendored packages for this chaincode
    shutil.rmtree("../fabric/examples/chaincode/go/enccc_example/vendor", ignore_errors=True)

    # Performing `npm install` before test suit not before test cases.
    shutil.rmtree("./node_modules", ignore_errors=True)
    shutil.rmtree("./package-lock.json", ignore_errors=True)
    shutil.copyfile("package.json", "../../../package.json")
    npminstall = subprocess.check_output(["npm install --silent"],
                                            env=os.environ,
                                            cwd="../../..",
                                            shell=True)
    print("npm install: {}".format(npminstall))
    shutil.copytree("../../../node_modules", "./node_modules")
    context.interface = CLIInterface()
    context.remote = False
    if context.config.userdata.get("network", None) is not None:
        context.network = context.config.userdata["network"]
        context.remote = True
        context.interface = ToolInterface(context)

    mem = psutil.virtual_memory()
    print("Starting Memory Info:\n\tFree: {}\n\tUsed: {}\n\tPercentage: {}\n".format(mem.free, mem.used, mem.percent))

def after_all(context):
    # Removing Node modules at the end of the test suites
    if os.path.exists("./node_modules"):
        shutil.rmtree("./node_modules", ignore_errors=True)
        shutil.rmtree("../../../node_modules", ignore_errors=True)
        shutil.rmtree("../../../package-lock.json", ignore_errors=True)
        subprocess.call(["npm cache clear --force"], shell=True)
        # subprocess.call(["npm i -g npm"], shell=True)
    mem = psutil.virtual_memory()
    print("\nEnding Memory Info:\n\tFree: {}\n\tUsed: {}\n\tPercentage: {}".format(mem.free, mem.used, mem.percent))

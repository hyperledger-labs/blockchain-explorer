#
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#

from behave import *
import time
import os
import uuid
import subprocess
from shutil import copyfile
import common_util
import compose_util
import orderer_util
import config_util
from endorser_util import CLIInterface, ToolInterface, SDKInterface
import database_util


@given(u'I wait "{seconds}" seconds')
@when(u'I wait "{seconds}" seconds')
@then(u'I wait "{seconds}" seconds')
def step_impl(context, seconds):
    time.sleep(float(seconds))

@given(u'I use the {language} SDK interface')
def step_impl(context, language):
    context.interface = SDKInterface(context, language)

@given(u'I use the CLI interface')
def step_impl(context):
    context.interface = CLIInterface()

@given(u'I use the tool interface {toolCommand}')
def step_impl(context, toolCommand):
    # The tool command is what is used to generate the network that will be setup for use in the tests
    context.network = toolCommand
    context.interface = ToolInterface(context)

@given(u'I compose "{composeYamlFile}"')
def compose_impl(context, composeYamlFile, projectName=None, startContainers=True):
    if not hasattr(context, "composition"):
        context.composition = compose_util.Composition(context, composeYamlFile,
                                           projectName=projectName,
                                           startContainers=startContainers)
    else:
        context.composition.composeFilesYaml = composeYamlFile
        context.composition.up()
    context.compose_containers = context.composition.collectServiceNames()

def getCompositionFiles(context, curpath, ordererType, database="leveldb", fca=False):
    # Get the correct composition file
    composeFiles = ["%s/docker-compose/docker-compose-%s.yml" % (curpath, ordererType)]
    if database.lower() != "leveldb":
        composeFiles.append("%s/docker-compose/docker-compose-%s.yml" % (curpath, database.lower()))
    composeFiles.append("%s/docker-compose/docker-compose-cli.yml" % (curpath))

    # If using fabric-ca insert the fabric-ca composition file to start first
    if fca:
        composeFiles.insert(0, "%s/docker-compose/docker-compose-fca.yml" % (curpath))

    for composeFile in composeFiles:
        assert os.path.exists(composeFile), "The docker compose file does not exist: {0}".format(composeFile)
    return composeFiles

def bootstrapped_impl(context, ordererType, database, tlsEnabled=False, timeout=300, ouEnabled=False, fca=False):
    assert ordererType in config_util.ORDERER_TYPES, "Unknown network type '%s'" % ordererType
    curpath = os.path.realpath('.')

    # Get the correct composition file
    context.composeFile = getCompositionFiles(context, curpath, ordererType, database, fca)

    # Should TLS be enabled
    context.tls = tlsEnabled
    compose_util.enableTls(context, tlsEnabled)

    # Perform bootstrap process
    context.ordererProfile = config_util.PROFILE_TYPES.get(ordererType, "SampleInsecureSolo")
    channelID = context.interface.SYS_CHANNEL_ID
    if hasattr(context, "composition"):
        context.projectName = context.composition.projectName
    elif not hasattr(context, "projectName"):
        context.projectName = str(uuid.uuid1()).replace('-','')

    # Determine number of orderers
    numOrderers = 1
    if ordererType == 'kafka':
        numOrderers = 3

    # Get Configs setup
    if ouEnabled:
        config_util.buildCryptoFile(context, 2, 2, numOrderers, 2, ouEnable=ouEnabled)
        config_util.generateCrypto(context, "./configs/{0}/crypto.yaml".format(context.projectName))
    else:
        config_util.generateCrypto(context)
    config_util.generateConfig(context, channelID, config_util.CHANNEL_PROFILE, context.ordererProfile)

    compose_impl(context, context.composeFile, projectName=context.projectName)
    wait_for_bootstrap_completion(context, timeout)


def wait_for_bootstrap_completion(context, timeout):
    peers = context.interface.get_peers(context)
    brokers = []
    try:
        with common_util.Timeout(timeout):
            common_util.wait_until_in_log(peers, "Starting profiling server with listenAddress = 0.0.0.0:6060")

            # Check Kafka logs
            if "kafka0" in context.composition.collectServiceNames():
                kafkas = orderer_util.getKafkaBrokerList(context, "orderer0.example.com")
                # Remove the ports from the list
                for kafka in kafkas:
                    broker = kafka.split(":")
                    brokers.append(broker[0])
                common_util.wait_until_in_log(brokers, " Startup complete. ")
    finally:
        assert common_util.is_in_log(peers, "Starting profiling server with listenAddress = 0.0.0.0:6060"), "The peer containers are not ready in the allotted time ({} seconds)".format(timeout)
        assert common_util.is_in_log(brokers, " Startup complete. "), "The kafka containers are not ready in the allotted time ({} seconds)".format(timeout)

    # A 5-second additional delay ensures ready state
    time.sleep(5)


def bootstrap_fca_impl(context, tlsEnabled=False):
    # Should TLS be enabled
    context.tls = tlsEnabled
    compose_util.enableTls(context, tlsEnabled)
    context = config_util.setCAConfig(context)
    compose_impl(context, ["docker-compose/docker-compose-preca.yml"], context.projectName)

@given(u'I bootstrap a fabric-ca server without tls')
def step_impl(context):
    bootstrap_fca_impl(context, False)

@given(u'I bootstrap a fabric-ca server with tls')
def step_impl(context):
    bootstrap_fca_impl(context, True)

@given(u'I bootstrap a fabric-ca server')
def step_impl(context):
    bootstrap_fca_impl(context, False)


@given(u'I have a fabric-ca bootstrapped fabric network of type {ordererType} using state-database {database} with tls')
def step_impl(context, ordererType, database):
    config_util.setCAConfig(context)
    bootstrapped_impl(context, ordererType, database, True, fca=True)

@given(u'I have a fabric-ca bootstrapped fabric network of type {ordererType} using state-database {database} without tls')
def step_impl(context, ordererType, database):
    config_util.setCAConfig(context)
    bootstrapped_impl(context, ordererType, database, False, fca=True)

@given(u'I have a fabric-ca bootstrapped fabric network of type {ordererType} using state-database {database}')
def step_impl(context, ordererType, database):
    config_util.setCAConfig(context)
    bootstrapped_impl(context, ordererType, database, True, fca=True)

@given(u'I have a fabric-ca bootstrapped fabric network using state-database {database} with tls')
def step_impl(context, database):
    config_util.setCAConfig(context)
    bootstrapped_impl(context, "solo", database, True, fca=True)

@given(u'I have a fabric-ca bootstrapped fabric network of type {ordererType} with tls')
def step_impl(context, ordererType):
    config_util.setCAConfig(context)
    bootstrapped_impl(context, ordererType, "leveldb", True, fca=True)

@given(u'I have a fabric-ca bootstrapped fabric network with tls')
def step_impl(context):
    config_util.setCAConfig(context)
    bootstrapped_impl(context, "solo", "leveldb", True, fca=True)

@given(u'I have a fabric-ca bootstrapped fabric network of type {ordererType}')
def step_impl(context, ordererType):
    config_util.setCAConfig(context)
    bootstrapped_impl(context, ordererType, "leveldb", True, fca=True)

@given(u'I have a bootstrapped fabric network of type {ordererType} with tls with organizational units enabled on all nodes')
def step_impl(context, ordererType):
    bootstrapped_impl(context, ordererType, "leveldb", True, ouEnabled=True)

@given(u'I have a bootstrapped fabric network of type {ordererType} with tls with organizational units enabled on all {orgName} nodes')
def step_impl(context, ordererType, orgName):
    bootstrapped_impl(context, ordererType, "leveldb", True, ouEnabled=orgName)

@given(u'I have a bootstrapped fabric network of type {ordererType} using state-database {database} with tls')
def step_impl(context, ordererType, database):
    bootstrapped_impl(context, ordererType, database, True)

@given(u'I have a bootstrapped fabric network of type {ordererType} using state-database {database} without tls')
def step_impl(context, ordererType, database):
    bootstrapped_impl(context, ordererType, database, False)

@given(u'I have a bootstrapped fabric network of type {ordererType} using state-database {database}')
def step_impl(context, ordererType, database):
    bootstrapped_impl(context, ordererType, database, False)

@given(u'I have a bootstrapped fabric network using state-database {database} with tls')
def step_impl(context, database):
    bootstrapped_impl(context, "solo", database, True)

@when(u'a user defines a couchDB index named {indexName} with design document name "{docName}" containing the fields "{fields}" to the chaincode at path "{path}"')
def step_impl(context, indexName, docName, fields, path):
    database_util.generateIndex(indexName, docName, fields, path)

@given(u'I have a bootstrapped fabric network of type {ordererType} with tls')
def step_impl(context, ordererType):
    bootstrapped_impl(context, ordererType, "leveldb", True)

@given(u'I have a bootstrapped fabric network with tls')
def step_impl(context):
    bootstrapped_impl(context, "solo", "leveldb", True)

@given(u'I have a bootstrapped fabric network using state-database {database} without tls')
def step_impl(context, database):
    bootstrapped_impl(context, "solo", database, False)

@given(u'I have a bootstrapped fabric network using state-database {database}')
def step_impl(context, database):
    bootstrapped_impl(context, "solo", database, False)

@given(u'I have a bootstrapped fabric network of type {ordererType} without tls')
def step_impl(context, ordererType):
    bootstrapped_impl(context, ordererType, "leveldb", False)

@given(u'I have a bootstrapped fabric network of type {ordererType}')
def step_impl(context, ordererType):
    bootstrapped_impl(context, ordererType, "leveldb", False)

@given(u'I have a bootstrapped fabric network without tls')
def step_impl(context):
    bootstrapped_impl(context, "solo", "leveldb", False)

@given(u'I have a bootstrapped fabric network')
def step_impl(context):
    bootstrapped_impl(context, "solo", "leveldb", False)

@when(u'I vendor "{language}" packages for fabric-based chaincode at "{path}"')
def step_impl(context, language, path):
    if language.upper() == "GOLANG":
        print(subprocess.check_output(["govendor init && govendor add +external"], cwd=path, shell=True))
    elif language=="NODE":
        print(subprocess.check_output(["npm install"], cwd=path, shell=True))
    else:
        assert False, "undefined language: {}".format(context.language)

@when(u'I vendor go packages for non-fabric-based chaincode at "{path}"')
def step_impl(context, path):
    print(subprocess.check_output(["govendor init && govendor add +external && govendor fetch {}".format(path)], cwd=path, shell=True))

@when(u'the initial leader peer of "{org}" is taken down by doing a {takeDownType}')
def step_impl(context, org, takeDownType):
    bringdown_impl(context, context.interface.get_initial_leader(context, org), takeDownType)

@when(u'the initial leader peer of "{org}" is taken down')
def step_impl(context, org):
    bringdown_impl(context, context.interface.get_initial_leader(context, org))

@when(u'the initial non-leader peer of "{org}" is taken down by doing a {takeDownType}')
def step_impl(context, org, takeDownType):
    bringdown_impl(context, context.interface.get_initial_non_leader(context, org), takeDownType)

@when(u'the initial non-leader peer of "{org}" is taken down')
def step_impl(context, org):
    bringdown_impl(context, context.interface.get_initial_non_leader(context, org))

@when(u'"{component}" is taken down by doing a {takeDownType}')
def step_impl(context, component, takeDownType):
    bringdown_impl(context, component, takeDownType)

@when(u'"{component}" is taken down')
def bringdown_impl(context, component, takeDownType="stop"):
    assert component in context.composition.collectServiceNames(), "Unknown component '{0}'".format(component)
    if takeDownType=="stop":
        context.composition.stop([component])
    elif takeDownType=="pause":
        context.composition.pause([component])
    elif takeDownType=="disconnect":
        context.composition.disconnect([component])
    else:
        assert False, "takedown process undefined: {}".format(context.takeDownType)

@when(u'the initial leader peer of "{org}" comes back up by doing a {bringUpType}')
def step_impl(context, org, bringUpType):
    bringup_impl(context, context.interface.get_initial_leader(context, org), bringUpType)

@when(u'the initial leader peer of "{org}" comes back up')
def step_impl(context, org):
    bringup_impl(context, context.interface.get_initial_leader(context, org))

@when(u'the initial non-leader peer of "{org}" comes back up by doing a {bringUpType}')
def step_impl(context, org, bringUpType):
    bringup_impl(context, context.interface.get_initial_non_leader(context, org), bringUpType)

@when(u'the initial non-leader peer of "{org}" comes back up')
def step_impl(context, org):
    bringup_impl(context, context.interface.get_initial_non_leader(context, org))

@when(u'"{component}" comes back up by doing a {bringUpType}')
def step_impl(context, component, bringUpType):
    bringup_impl(context, component, bringUpType)

@when(u'"{component}" comes back up')
def bringup_impl(context, component, bringUpType="start"):
    assert component in context.composition.collectServiceNames(), "Unknown component '{0}'".format(component)
    if bringUpType=="start":
        context.composition.start([component])
    elif bringUpType=="unpause":
        context.composition.unpause([component])
    elif bringUpType=="connect":
        context.composition.connect([component])
    else:
        assert False, "Bringing-up process undefined: {}".format(context.bringUpType)

@when(u'I start a fabric network using a {ordererType} orderer service with tls')
def start_network_impl(context, ordererType, tlsEnabled=True):
    assert ordererType in config_util.ORDERER_TYPES, "Unknown network type '%s'" % ordererType
    curpath = os.path.realpath('.')

    context.composeFile = getCompositionFiles(context, curpath, ordererType)

    if not hasattr(context, "projectName"):
        context.projectName = None

    # Should TLS be enabled
    context.tls = tlsEnabled
    compose_util.enableTls(context, tlsEnabled, projectName=context.projectName)

    compose_impl(context, context.composeFile, projectName=context.projectName)

@when(u'I start a fabric network using a {ordererType} orderer service')
def step_impl(context, ordererType):
    start_network_impl(context, ordererType, False)

@when(u'I start a fabric network with TLS')
def step_impl(context):
    start_network_impl(context, "solo", True)

@when(u'I start a fabric network')
def step_impl(context):
    start_network_impl(context, "solo", False)

@when(u'I locally execute the command "{command}" saving the results as "{key}"')
def step_impl(context, command, key):
    # This is a workaround to allow sending piped commands to behave without conflicting with the pipes in the table.
    command = command.replace("!", "|")
    if not hasattr(context, "command_result"):
        context.command_result = {}

    if "|" in command:
        context.command_result[key] = subprocess.check_output(command, shell=True).strip()
    else:
        cmd = command.split()
        context.command_result[key] = subprocess.check_output(cmd, env=os.environ).strip()
    print("command result: {}".format(context.command_result))

@when(u'an admin adds an organization to the {channelName} channel config')
def step_impl(context, channelName):
    add_org_impl(context, "org3.example.com", channelName)

@when(u'an admin adds an organization to the channel config')
def step_impl(context):
    add_org_impl(context, "org3.example.com", context.interface.TEST_CHANNEL_ID)

@when(u'an admin adds an organization named {orgMSP} to the {channelName} channel config')
def add_org_impl(context, orgMSP, channelName):
    configDir =  "./configs/{0}".format(context.projectName)

    #Save original crypto.yaml file
    if os.path.exists("{0}/crypto.yaml".format(configDir)):
        copyfile("{0}/crypto.yaml".format(configDir),
                 "{0}/crypto_orig.yaml".format(configDir))

    # Add cryptogen info for 3rd org
    config_util.buildCryptoFile(context, 1, 2, 0, 2, orgMSP=orgMSP)
    config_util.generateCrypto(context, "{0}/crypto.yaml".format(configDir))
    config_util.generateCryptoDir(context, 1, 2, 0, 2, tlsExist=context.tls, orgMSP=orgMSP)
    args = config_util.getNewOrg(context, orgMSP)
    updated_config = config_util.addNewOrg(context, args, "Application", channelName)

    update_impl(context, 'peer', channelName, updated_config, userName='Admin')

@when(u'an admin removes an organization named {orgMSP} from the channel config')
def step_impl(context, orgMSP):
    del_org_impl(context, orgMSP, context.interface.TEST_CHANNEL_ID)

@when(u'an admin removes an organization named {orgMSP} from the {channelName} channel config')
def del_org_impl(context, orgMSP, channelName):
    configDir =  "./configs/{0}".format(context.projectName)

    # Format the args for removing orgMSP
    args = config_util.delNewOrg(context, "Application", orgMSP, channelName)

    update_impl(context, 'peer', channelName, args, userName='Admin')

@when(u'an {component} admin updates the {channelName} channel config with {args}')
def step_impl(context, component, channelName, args):
    update_impl(context, component, channelName, args, userName='Admin')

@when(u'an admin updates the channel config with {args}')
def step_impl(context, args):
    update_impl(context, 'peer', context.interface.TEST_CHANNEL_ID, args, userName='Admin')

@when(u'an {component} admin with username {userName} updates the {channelName} channel config with {args}')
def update_impl(context, component, channelName, args, userName='Admin'):
    assert component in ('peer', 'orderer'), "Error: the component type must be either 'peer' or 'orderer' instead of '{}'.".format(component)
    if channelName == "system":
        assert component == 'orderer', "Error: Only an orderer admin may update the system channel."
        channelName = context.interface.SYS_CHANNEL_ID

    # fetch the block for the specified channel
    peers = context.interface.get_peers(context)
    assert len(peers) > 0, "Error: There are no peers on this fabric network."
    context.interface.fetch_channel(context, peers, 'orderer0.example.com', channelName, user=userName)

    # Convert block file to json & Prep for update
    context.block_filename = config_util.configUpdate(context, args, "Application", channelName)

@when(u'the peers from the added organization are added to the network')
def step_impl(context):
    curpath = os.path.realpath('.')
    context.composeFile.append("%s/docker-compose/docker-compose-peer-org3.yml" % (curpath))
    context.composition.up(force_recreate=False, components=["peer0.org3.example.com", "peer1.org3.example.com"])

@then(u'the initial non-leader peer of "{org}" has become the leader')
def step_impl(context, org):
    assert hasattr(context, 'initial_non_leader'), "Error: initial non-leader was not set previously. This statement works only with pre-set initial non-leader."
    max_waittime=15
    waittime=5
    try:
        with common_util.Timeout(max_waittime):
            while not common_util.get_leadership_status(context.initial_non_leader[org]):
                time.sleep(waittime)
    finally:
        assert common_util.get_leadership_status(context.initial_non_leader[org]), "Error: The initial non-leader peer has not become leader, after "+str(max_waittime)+" seconds."

@then(u'the initial non-leader peer of "{org}" has not become the leader')
def step_impl(context, org):
    assert hasattr(context, 'initial_non_leader'), "Error: initial non-leader was not set previously. This statement works only with pre-set initial non-leader."
    assert not common_util.get_leadership_status(context.initial_non_leader[org]), "Error: initial non-leader peer has already become leader."

@then(u'the logs on {component} contains "{data}" within {timeout:d} seconds')
def step_impl(context, component, data, timeout):
    with common_util.Timeout(timeout):
        common_util.wait_until_in_log([component], data)

@then(u'the logs on {component} contains {data}')
def step_impl(context, component, data):
    assert common_util.is_in_log(component, data), "Error: the {0} log does not contain {1}.".format(component, data)

@then(u'there are no errors')
def step_impl(context):
    pass

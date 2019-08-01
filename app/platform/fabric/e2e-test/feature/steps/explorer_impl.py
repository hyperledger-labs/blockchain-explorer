# SPDX-License-Identifier: Apache-2.0

from behave_rest.steps import *
from behave import *
import time
import os
import sys
import uuid
import basic_impl
import compose_util
import common_util
import config_util
import shutil
import subprocess
import requests
import json_responses

FNULL = open(os.devnull, 'w')

@given(u'For explorer env, I have a bootstrapped fabric network of type {ordererType}')
def step_impl(context, ordererType):
    config_util.PROFILE_TYPES.update({"kafka-sd": "SampleInsecureKafka"})
    config_util.ORDERER_TYPES.append("kafka-sd")
    basic_impl.bootstrapped_impl(context, ordererType, "leveldb", False)

@when(u'I start explorer')
def start_explorer_impl(context):
    try:
        testConfigs = config_util.makeProjectConfigDir(context)
        updated_env = config_util.updateEnviron(context)
        cmd = ['find {0} -iregex \'.*_sk$\' -type f | xargs -I[] dirname [] | xargs -I[] bash -c \'pushd [] && ln -s *_sk sk && popd\''.format(testConfigs)]
        subprocess.call(cmd, shell=True, env=updated_env)
    except:
        print("Unable to create symbolic link for secret keys: {0}".format(sys.exc_info()[1]))

    context.headers = {}
    context.base_url = ""
    context.json_responses = json_responses

    curpath = os.path.realpath('.')
    composeFiles = ["%s/docker-compose/docker-compose-explorer.yaml" % (curpath)]
    if not hasattr(context, "composition_explorer"):
        context.composition_explorer = compose_util.Composition(context, composeFiles,
                                                                projectName=context.projectName,
                                                                startContainers=False)
    else:
        context.composition_explorer.composeFilesYaml = composeFiles

    if hasattr(context, "composition"):
        env = context.composition.getEnv()
        for key,value in env.items():
            context.composition_explorer.environ[key] = value

    context.composition_explorer.up()


@given(u'I start first-network')
@given(u'I start first-network orderer network of type {consensus_type}')
def start_firstnetwork_impl(context, consensus_type="solo"):
    curpath = os.path.realpath('.')
    composeFiles = ["%s/fabric-samples/first-network/docker-compose-explorer.yaml" % (curpath)]
    config_util.makeProjectConfigDir(context)

    shutil.copyfile("{0}/fabric-samples/first-network/crypto-config.yaml".format(curpath), "{0}/configs/{1}/crypto-config.yaml".format(curpath, context.projectName))
    shutil.copyfile("{0}/fabric-samples/first-network/configtx.yaml".format(curpath), "{0}/configs/{1}/configtx.yaml".format(curpath, context.projectName))
    os.mkdir("{0}/configs/{1}/channel-artifacts".format(curpath, context.projectName))
    generateCryptoArtifacts(context, "mychannel", consensus_type)

    # In this step, composition will not be used, clear it once
    if hasattr(context, "composition"):
        del context.composition

    updated_env = config_util.updateEnviron(context)
    updated_env["COMPOSE_PROJECT_NAME"] = context.projectName
    updated_env["CORE_PEER_NETWORKID"] = context.projectName

    os.chdir("{0}/fabric-samples/first-network".format(curpath))

    try:
        command = ["./byfn.sh up -f docker-compose-explorer.yaml -c {0} -o {1}".format("mychannel", consensus_type)]
        subprocess.call(command, shell=True, env=updated_env, stdout=FNULL)
    except:
        print("Failed npm install: {0}".format(sys.exc_info()[1]))

    os.chdir(curpath)

def generateCryptoArtifacts(context, channelID, consensus_type):
    curpath = os.path.realpath('.')
    testConfigs = config_util.makeProjectConfigDir(context)
    updated_env = config_util.updateEnviron(context)
    try:
        command = ["../../fabric-samples/first-network/byfn.sh", "generate", "-f", "docker-compose-explorer.yaml", "-c", channelID, "-o", consensus_type]
        subprocess.call(command, cwd=testConfigs, env=updated_env, stderr=subprocess.STDOUT)
    except:
        print("Unable to generate crypto artifacts: {0}".format(sys.exc_info()[1]))

    try:
        shutil.rmtree("{0}/fabric-samples/first-network/crypto-config".format(curpath), ignore_errors=True)
        shutil.copytree("{0}/crypto-config".format(testConfigs), "{0}/fabric-samples/first-network/crypto-config".format(curpath))
        shutil.copytree("{0}/crypto-config/peerOrganizations".format(testConfigs), "{0}/peerOrganizations".format(testConfigs))
        shutil.copytree("{0}/crypto-config/ordererOrganizations".format(testConfigs), "{0}/ordererOrganizations".format(testConfigs))
    except:
        print("Unable to copy crypto artifacts: {0}".format(sys.exc_info()[1]))

    try:
        shutil.rmtree("{0}/fabric-samples/first-network/channel-artifacts".format(curpath), ignore_errors=True)
        shutil.copytree("{0}/channel-artifacts".format(testConfigs), "{0}/fabric-samples/first-network/channel-artifacts".format(curpath))
    except:
        print("Unable to copy channel artifacts: {0}".format(sys.exc_info()[1]))


@given(u'I start balance-transfer')
@given(u'I start balance-transfer orderer network of type {consensus_type}')
def start_balancetransfer_impl(context, consensus_type="solo"):
    testConfigs = config_util.makeProjectConfigDir(context)
    curpath = os.path.realpath('.')
    shutil.copytree(
        "%s/fabric-samples/balance-transfer/artifacts/channel/crypto-config/ordererOrganizations" % (curpath),
        "%s/%s/ordererOrganizations" % (curpath, testConfigs)
    )
    shutil.copytree(
        "%s/fabric-samples/balance-transfer/artifacts/channel/crypto-config/peerOrganizations" % (curpath),
        "%s/%s/peerOrganizations" % (curpath, testConfigs)
    )

    os.chdir("{0}/fabric-samples/balance-transfer".format(curpath))

    # In this step, composition will not be used, clear it once
    if hasattr(context, "composition"):
        del context.composition

    updated_env = config_util.updateEnviron(context)
    updated_env["COMPOSE_PROJECT_NAME"] = context.projectName
    updated_env["CORE_PEER_NETWORKID"] = context.projectName

    try:
        command = ["npm install --silent"]
        subprocess.call(command, shell=True, env=updated_env, stdout=FNULL)
    except:
        print("Failed npm install: {0}".format(sys.exc_info()[1]))

    try:
        command = ["./runApp.sh"]
        p = subprocess.Popen(command, shell=True, env=updated_env, stdout=subprocess.PIPE)
    except:
        print("Failed to start application: {0}".format(sys.exc_info()[1]))

    while True:
        line = p.stdout.readline()
        if "SERVER STARTED" in line:
            print(line)
            break
        else:
            time.sleep(1)

    try:
        command = ["./testAPIs.sh"]
        subprocess.call(command, shell=True, env=updated_env, stdout=FNULL)
    except:
        print("Failed to exectute REST API: {0}".format(sys.exc_info()[1]))

    os.chdir(curpath)

@step('I make a {request_verb} request to the following path segment')
def request_to_the_path_described_on_table(context, request_verb):
    if not hasattr(context, 'verify_ssl'):
        context.verify_ssl = True

    url = context.base_url

    for row in context.table:
        for x in context.table.headings:
            path = row[x]
            if path.startswith("context") and path[8:] == "block_height":
                # TODO messy code
                # This attribute should be integer
                url = url + '/' + str(getattr(context, path[8:]) - 1).encode('ascii')
            elif path.startswith("context"):
                url = url + '/' + str(getattr(context, path[8:])).encode('ascii')
            else:
                url = url + '/' + path

    context.r = getattr(requests, request_verb.lower())(url, headers=context.headers, verify=context.verify_ssl)

    log_full(context.r)

    return context.r

@then(u'the explorer app logs contains "{data}" {count:d} time(s) within {timeout:d} seconds')
def step_impl(context, data, count, timeout):
    time.sleep(float(timeout))
    data_count = is_in_log("explorer.mynetwork.com", data)
    assert data_count == count, "The log didn't appear the expected number of times({0}).".format(data_count)

@then(u'the explorer app logs contains "{data}" within {timeout:d} seconds')
def step_impl(context, data, timeout):
    time.sleep(float(timeout))
    data_count = is_in_log("explorer.mynetwork.com", data)
    assert data_count > 0, "The log didn't appear at all."

@when(u'"{container}" is stopped')
def step_impl(context, container):
    if hasattr(context, "composition") and hasattr(context, "composeFilesYaml"):
        context.composition.stop([container])
    elif hasattr(context, "composition_explorer"):
        context.composition_explorer.stop([container])
    else:
        assert False, "Failed to stop container {0}".format(container)

def is_in_log(container, keyText):
    output = subprocess.check_output(
        "docker exec  " + container + " cat logs/app/app.log | grep " + "\"" + keyText + "\"" + " | wc -l",
        shell=True)
    return int(output)

@step(u'Copy "{srcfile}" to "{dstfile}" on "{peer}"')
def start_explorer_impl(context, srcfile, dstfile, peer):
    try:
        testConfigs = config_util.makeProjectConfigDir(context)
        updated_env = config_util.updateEnviron(context)
        cmd = ['docker cp {0} {1}:{2}'.format(srcfile, peer, dstfile)]
        subprocess.call(cmd, shell=True, env=updated_env)
    except:
        print("Unable to copy {0} on {1}: {2}".format(srcfile, peer, sys.exc_info()[1]))

@step(u'Update "{peer}" of "{org}" as an anchor in "{channel}"')
def step_impl(context, peer, org, channel):
    try:
        testConfigs = config_util.makeProjectConfigDir(context)
        updated_env = config_util.updateEnviron(context)
        cmd = ['mkdir -p {0}/channel-artifacts'.format(testConfigs) ]
        subprocess.call(cmd, shell=True, env=updated_env)
        cmd = ['configtxgen -configPath {1} -profile {0} -outputAnchorPeersUpdate ./{1}/channel-artifacts/{2}_{3}anchor.tx -channelID {2} -asOrg {3}'.format(config_util.CHANNEL_PROFILE, testConfigs, channel, org)]
        subprocess.call(cmd, shell=True, env=updated_env)
    except:
        print("Unable to create anchor tx file for {0} on {1}: {2}".format(peer, channel, sys.exc_info()[1]))

    update_anchor(context, peer, channel, tx_filename='channel-artifacts/{0}_{1}anchor.tx'.format(channel, org))

def update_anchor(context, peer, channelId="mychannel", orderer="orderer0.example.com", tx_filename="update.pb", user="Admin"):
    configDir = "/var/hyperledger/configs/{0}".format(context.composition.projectName)

    # peer channel update -f org3_update_in_envelope.pb -c $CHANNEL_NAME -o orderer.example.com:7050 --tls --cafile $ORDERER_CA
    peerParts = peer.split('.')
    org = '.'.join(peerParts[1:])
    setup = context.interface.get_env_vars(context, peer, includeAll=False, user=user)
    command = ["peer", "channel", "update",
                "--file", '{0}/{1}'.format(configDir, tx_filename),
                "--channelID", channelId,
                "--orderer", '{0}:7050'.format(orderer)]
    if context.tls:
        command = command + ["--tls",
                                "--cafile",
                                '{0}/ordererOrganizations/example.com/orderers/{1}/msp/tlscacerts/tlsca.example.com-cert.pem'.format(configDir, orderer)]
    if hasattr(context, "mutual_tls") and context.mutual_tls:
        command = command + ["--clientauth",
                                "--certfile",
                                '{0}/peerOrganizations/{1}/users/{2}@{1}/tls/client.crt'.format(configDir, org, user),
                                "--keyfile",
                                '{0}/peerOrganizations/{1}/users/{2}@{1}/tls/client.key'.format(configDir, org, user)]

    command.append('"')
    output = context.composition.docker_exec(setup+command, [peer])
    print("[{0}]: {1}".format(" ".join(setup+command), output))
    return output

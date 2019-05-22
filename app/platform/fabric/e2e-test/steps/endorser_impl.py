#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#

from behave import *
import sys
import os
import json
import time
import os
import random
import string
import struct
import marshal
import subprocess
import config_util
from endorser_util import CLIInterface, ToolInterface, SDKInterface

# try:
#     pbFilePath = "../feature-upgrade"
#     sys.path.insert(0, pbFilePath)
#     from common import ledger_pb2
# except:
#     print("ERROR! Unable to import the protobuf libraries from the ../feature-upgrade directory: {0}".format(sys.exc_info()[0]))
#     sys.exit(1)


@when(u'an admin sets up a channel named "{channelId}" using orderer "{orderer}"')
def setup_channel_impl(context, channelId, orderer, username="Admin"):
    # Be sure there is a transaction block for this channel
    config_util.generateChannelConfig(channelId, config_util.CHANNEL_PROFILE, context)
    peers = context.interface.get_peers(context)

    context.interface.create_channel(context, orderer, channelId, user=username)
    context.interface.fetch_channel(context, peers, orderer, channelId, user=username)
    context.interface.join_channel(context, peers, channelId, user=username)

    # If using any interface besides the CLI, we should add a few seconds delay to be sure
    # that the code executes successfully
    if not isinstance(context.interface, CLIInterface):
        time.sleep(3)

@when(u'an admin sets up a channel named "{channelId}"')
def step_impl(context, channelId):
    setup_channel_impl(context, channelId, "orderer0.example.com")

@when(u'an admin sets up a channel')
def step_impl(context):
    setup_channel_impl(context, context.interface.TEST_CHANNEL_ID, "orderer0.example.com")

@when(u'a user "{user}" sets up a channel')
def step_impl(context, user):
    setup_channel_impl(context, context.interface.TEST_CHANNEL_ID, "orderer0.example.com", username=user)

@when(u'a user "{user}" sets up a channel named "{channelId}"')
def step_impl(context, user, channelId):
    setup_channel_impl(context, channelId, "orderer0.example.com", username=user)

@when(u'an admin deploys chaincode at path "{path}" with args {args} with name "{name}" with language "{language}" to "{peer}" on channel "{channel}" within {timeout:d} seconds')
def step_impl(context, path, args, name, language, peer, channel, timeout):
    deploy_impl(context, path, args, name, language, peer, channel, timeout=timeout)

@when(u'an admin deploys chaincode at path "{path}" with version "{version}" with args {args} with name "{name}" with language "{language}" to "{peer}" on channel "{channel}" within {timeout:d} seconds')
def deploy_impl(context, path, args, name, language, peer, channel, version=0, timeout=300, username="Admin", policy=None):
    context.interface.deploy_chaincode(context, path, args, name, language, peer, username, timeout, channel, version, policy=policy)

@when(u'an admin deploys chaincode at path "{path}" with version "{version}" with args {args} with name "{name}" with language "{language}" to "{peer}" on channel "{channel}"')
def step_impl(context, path, args, name, language, peer, channel, version):
    deploy_impl(context, path, args, name, language, peer, channel, version)

@when(u'an admin deploys chaincode at path "{path}" with version "{version}" with args {args} with name "{name}" with language "{language}" on channel "{channel}"')
def step_impl(context, path, args, name, language, channel, version):
    deploy_impl(context, path, args, name, language, "peer0.org1.example.com", channel, version)

@when(u'an admin deploys chaincode at path "{path}" with args {args} with policy {policy}')
def step_impl(context, path, args, policy):
    deploy_impl(context, path, args, "mycc", "GOLANG", "peer0.org1.example.com", context.interface.TEST_CHANNEL_ID, 300, policy=policy)

@when(u'an admin deploys chaincode at path "{path}" with args {args} with name "{name}" with language "{language}" to "{peer}" on channel "{channel}"')
def step_impl(context, path, args, name, language, peer, channel):
    deploy_impl(context, path, args, name, language, peer, channel, 300)

@when(u'an admin deploys chaincode at path "{path}" with args {args} with name "{name}" to "{peer}" on channel "{channel}" within {timeout:d} seconds')
def step_impl(context, path, args, name, peer, channel, timeout):
    deploy_impl(context, path, args, name, "GOLANG", peer, channel, timeout)

@when(u'an admin deploys chaincode at path "{path}" with args {args} with name "{name}" to "{peer}" on channel "{channel}"')
def step_impl(context, path, args, name, peer, channel):
    deploy_impl(context, path, args, name, "GOLANG", peer, channel)

@when(u'an admin deploys chaincode at path "{path}" with args {args} with name "{name}" on the initial leader peer of "{org}"')
def step_impl(context, path, args, name, org):
    deploy_impl(context, path, args, name, "GOLANG", context.interface.get_initial_leader(context, org), context.interface.TEST_CHANNEL_ID)

@when(u'an admin deploys chaincode at path "{path}" with args {args} with name "{name}" on the initial non-leader peer of "{org}"')
def step_impl(context, path, args, name, org):
    deploy_impl(context, path, args, name, "GOLANG", context.interface.get_initial_non_leader(context, org), context.interface.TEST_CHANNEL_ID)

@when(u'an admin deploys chaincode at path "{path}" with args {args} with name "{name}" with language "{language}" on channel "{channel}" within {timeout:d} seconds')
def step_impl(context, path, args, name, language, channel, timeout):
    deploy_impl(context, path, args, name, language, "peer0.org1.example.com", channel, timeout)

@when(u'an admin deploys chaincode at path "{path}" with args {args} with name "{name}" with language "{language}" on channel "{channel}"')
def step_impl(context, path, args, name, language, channel):
    deploy_impl(context, path, args, name, language, "peer0.org1.example.com", channel)

@when(u'an admin deploys chaincode at path "{path}" with args {args} with name "{name}" with language "{language}" within {timeout:d} seconds')
def step_impl(context, path, args, name, language, timeout):
    deploy_impl(context, path, args, name, language, "peer0.org1.example.com", context.interface.TEST_CHANNEL_ID, timeout)

@when(u'an admin deploys chaincode at path "{path}" with args {args} with name "{name}" with language "{language}"')
def step_impl(context, path, args, name, language):
    deploy_impl(context, path, args, name, language, "peer0.org1.example.com", context.interface.TEST_CHANNEL_ID)

@when(u'an admin deploys chaincode at path "{path}" with args {args} with language "{language}" within {timeout:d} seconds')
def step_impl(context, path, args, language, timeout):
    deploy_impl(context, path, args, "mycc", language, "peer0.org1.example.com", context.interface.TEST_CHANNEL_ID, timeout)

@when(u'an admin deploys chaincode at path "{path}" with args {args} with language "{language}"')
def step_impl(context, path, args, language):
    deploy_impl(context, path, args, "mycc", language, "peer0.org1.example.com", context.interface.TEST_CHANNEL_ID)

@when(u'an admin deploys chaincode at path "{path}" with args {args} with name "{name}" on channel "{channel}" within {timeout:d} seconds')
def step_impl(context, path, args, name, channel, timeout):
    deploy_impl(context, path, args, name, "GOLANG", "peer0.org1.example.com", channel, timeout)

@when(u'an admin deploys chaincode at path "{path}" with args {args} with name "{name}" on channel "{channel}"')
def step_impl(context, path, args, name, channel):
    deploy_impl(context, path, args, name, "GOLANG", "peer0.org1.example.com", channel)

@when(u'an admin deploys chaincode at path "{path}" with args {args} with name "{name}" within {timeout:d} seconds')
def step_impl(context, path, args, name, timeout):
    deploy_impl(context, path, args, name, "GOLANG", "peer0.org1.example.com", context.interface.TEST_CHANNEL_ID, timeout)

@when(u'an admin deploys chaincode at path "{path}" with args {args} with name "{name}"')
def step_impl(context, path, args, name):
    deploy_impl(context, path, args, name, "GOLANG", "peer0.org1.example.com", context.interface.TEST_CHANNEL_ID)

@when(u'an admin deploys chaincode at path "{path}" with args {args} within {timeout:d} seconds')
def step_impl(context, path, args, timeout):
    deploy_impl(context, path, args, "mycc", "GOLANG", "peer0.org1.example.com", context.interface.TEST_CHANNEL_ID, timeout)

@when(u'an admin deploys chaincode at path "{path}" with args {args}')
def step_impl(context, path, args):
    deploy_impl(context, path, args, "mycc", "GOLANG", "peer0.org1.example.com", context.interface.TEST_CHANNEL_ID)

@when(u'an admin deploys chaincode on channel "{channel}" with args {args} within {timeout:d} seconds')
def step_impl(context, channel, args, timeout):
    deploy_impl(context,
                "github.com/hyperledger/fabric/examples/chaincode/go/example02/cmd",
                args,
                "mycc",
                "GOLANG",
                "peer0.org1.example.com",
                channel, timeout)

@when(u'an admin deploys chaincode on channel "{channel}" with args {args}')
def step_impl(context, channel, args):
    deploy_impl(context,
                "github.com/hyperledger/fabric/examples/chaincode/go/example02/cmd",
                args,
                "mycc",
                "GOLANG",
                "peer0.org1.example.com",
                channel)

@when(u'an admin deploys chaincode on channel "{channel}" within {timeout:d} seconds')
def step_impl(context, channel, timeout):
    deploy_impl(context,
                "github.com/hyperledger/fabric/examples/chaincode/go/example02/cmd",
                '["init", "a", "100" , "b", "200"]',
                "mycc",
                "GOLANG",
                "peer0.org1.example.com",
                channel, timeout)

@when(u'an admin deploys chaincode on channel "{channel}"')
def step_impl(context, channel):
    deploy_impl(context,
                "github.com/hyperledger/fabric/examples/chaincode/go/example02/cmd",
                '["init", "a", "100" , "b", "200"]',
                "mycc",
                "GOLANG",
                "peer0.org1.example.com",
                channel)

@when(u'an admin deploys chaincode with name "{name}" on channel "{channel}" within {timeout:d} seconds')
def step_impl(context, name, channel, timeout):
    deploy_impl(context,
                "github.com/hyperledger/fabric/examples/chaincode/go/example02/cmd",
                '["init", "a", "100" , "b", "200"]',
                name,
                "GOLANG",
                "peer0.org1.example.com",
                channel, timeout)

@when(u'an admin deploys chaincode with name "{name}" on channel "{channel}"')
def step_impl(context, name, channel):
    deploy_impl(context,
                "github.com/hyperledger/fabric/examples/chaincode/go/example02/cmd",
                '["init", "a", "100" , "b", "200"]',
                name,
                "GOLANG",
                "peer0.org1.example.com",
                channel)

@when(u'an admin deploys chaincode with args {args} with policy {policy}')
def step_impl(context, args, policy):
    deploy_impl(context,
                "github.com/hyperledger/fabric/examples/chaincode/go/example02/cmd",
                args,
                "mycc",
                "GOLANG",
                "peer0.org1.example.com",
                context.interface.TEST_CHANNEL_ID,
                300,
                policy=policy)

@when(u'an admin deploys chaincode with args {args} within {timeout:d} seconds')
def step_impl(context, args, timeout):
    deploy_impl(context,
                "github.com/hyperledger/fabric/examples/chaincode/go/example02/cmd",
                args,
                "mycc",
                "GOLANG",
                "peer0.org1.example.com",
                context.interface.TEST_CHANNEL_ID, timeout)

@when(u'an admin deploys chaincode with args {args}')
def step_impl(context, args):
    deploy_impl(context,
                "github.com/hyperledger/fabric/examples/chaincode/go/example02/cmd",
                args,
                "mycc",
                "GOLANG",
                "peer0.org1.example.com",
                context.interface.TEST_CHANNEL_ID)

@when(u'an admin deploys chaincode within {timeout:d} seconds')
def step_impl(context, timeout):
    deploy_impl(context,
                "github.com/hyperledger/fabric/examples/chaincode/go/example02/cmd",
                '["init", "a", "100" , "b", "200"]',
                "mycc",
                "GOLANG",
                "peer0.org1.example.com",
                context.interface.TEST_CHANNEL_ID, timeout)

@when(u'an admin deploys chaincode')
def step_impl(context):
    deploy_impl(context,
                "github.com/hyperledger/fabric/examples/chaincode/go/example02/cmd",
                '["init", "a", "100" , "b", "200"]',
                "mycc",
                "GOLANG",
                "peer0.org1.example.com",
                context.interface.TEST_CHANNEL_ID)

@when(u'an admin installs chaincode at path "{path}" of language "{language}" as version "{version}" with args {args} with name "{name}" to all peers')
def step_impl(context, path, args, name, language, version):
    peers = context.interface.get_peers(context)
    install_impl(context, path, args, name, language, version, peers)

@when(u'an admin installs chaincode at path "{path}" of language "{language}" as version "{version}" with args {args} with name "{name}" to "{peer}"')
def step_impl(context, path, args, name, peer, language, version):
    install_impl(context, path, args, name, language, version, [peer])

@when(u'an admin installs chaincode at path "{path}" of language "{language}" as version "{version}" with args {args} with name "{name}"')
def install_impl(context, path, args, name, language, version, peers=["peer0.org1.example.com"], username="Admin"):
    context.interface.pre_deploy_chaincode(context, path, args, name, language, version=version)
    context.interface.install_chaincode(context, peers, username)

@when(u'an admin installs chaincode at path "{path}" as version "{version:d}" with args {args} with name "{name}" to "{peer}"')
def step_impl(context, path, args, name, version, peer):
    install_impl(context, path, args, name, "GOLANG", version, [peer])

@when(u'an admin installs chaincode at path "{path}" as version "{version}" with args {args} with name "{name}"')
def step_impl(context, path, args, name, version):
    install_impl(context, path, args, names, "GOLANG", version)

@when(u'an admin installs chaincode at path "{path}" as version "{version:d}" with args {args} with name "{name}" on all peers')
def step_impl(context, path, args, name, version, username="Admin"):
    peers = context.interface.get_peers(context)
    context.interface.pre_deploy_chaincode(context, path, args, name, "GOLANG", version=version)
    context.interface.install_chaincode(context, peers, "Admin")

@when(u'an admin installs chaincode at path "{path}" as version "{version:d}" with args {args} on all peers')
def step_impl(context, path, version, args, username="Admin"):
    peers = context.interface.get_peers(context)
    context.interface.pre_deploy_chaincode(context, path, args, "mycc", "GOLANG", version=version)
    context.interface.install_chaincode(context, peers, "Admin")

@when(u'an admin installs chaincode at path "{path}" with args {args} on all peers')
def step_impl(context, path, args, username="Admin"):
    peers = context.interface.get_peers(context)
    context.interface.pre_deploy_chaincode(context, path, args, "mycc", "GOLANG", version="0")
    context.interface.install_chaincode(context, peers, "Admin")

@when(u'an admin installs chaincode at path "{path}" with args {args} with name "{name}" to "{peer}"')
def step_impl(context, path, args, name, peer):
    install_impl(context, path, args, name, "GOLANG", "0", [peer])

@when(u'an admin installs chaincode on all peers')
def step_impl(context):
    peers = context.interface.get_peers(context)
    install_impl(context,
                "github.com/hyperledger/fabric/examples/chaincode/go/example02/cmd",
                '["init", "a", "100" , "b", "200"]',
                "mycc",
                "GOLANG",
                "0")

@when(u'an admin upgrades the chaincode with name "{name}" on channel "{channel}" to version "{version:d}" on peer "{peer}" with args {args}')
def upgrade_impl(context, channel, version, peer, name=None, args=None, timeout=120):
    if args:
        context.chaincode["args"] = args
    if name:
        context.chaincode["name"] = name
    context.chaincode["version"] = version
    context.chaincode["channelID"] = channel
    context.interface.upgrade_chaincode(context, "orderer0.example.com", peer, channel)
    context.interface.post_deploy_chaincode(context, peer, timeout)

@when(u'an admin upgrades the chaincode on channel "{channel}" to version "{version:d}" on peer "{peer}" with args {args}')
def step_impl(context, channel, version, peer, args):
    upgrade_impl(context, channel, version, peer, "mycc", args)

@when(u'an admin upgrades the chaincode with name "{name}" on channel "{channel}" to version "{version:d}" with args {args}')
def step_impl(context, name, channel, version, args):
    upgrade_impl(context, channel, version, "peer0.org1.example.com", name, args)

@when(u'an admin upgrades the chaincode on channel "{channel}" to version "{version:d}" on peer "{peer}"')
def step_impl(context, channel, version, peer):
    upgrade_impl(context, channel, version, peer)

@when(u'an admin upgrades the chaincode on channel "{channel}" on peer "{peer}" with args {args}')
def step_impl(context, channel, peer, args):
    upgrade_impl(context, channel, 1, peer, args)

@when(u'an admin upgrades the chaincode on channel "{channel}" on peer "{peer}"')
def step_impl(context, channel, peer):
    upgrade_impl(context, channel, 1, peer)

@when(u'an admin upgrades the chaincode to version "{version}" on peer "{peer}" with args {args}')
def step_impl(context, version, peer, args):
    upgrade_impl(context, context.interface.TEST_CHANNEL_ID, version, peer, "mycc", args)

@when(u'an admin upgrades the chaincode on peer "{peer}" with args {args}')
def step_impl(context, peer, args):
    upgrade_impl(context, context.interface.TEST_CHANNEL_ID, 1, peer, args)

@when(u'an admin upgrades the chaincode on peer "{peer}"')
def step_impl(context, channel, peer):
    upgrade_impl(context, context.interface.TEST_CHANNEL_ID, 1, peer)

@when(u'an admin instantiates the chaincode on channel "{channel}" on peer "{peer}"')
def instantiate_impl(context, peer, channel, username="Admin", timeout=120):
    context.chaincode["channelID"] = channel
    context.interface.instantiate_chaincode(context, peer, username)
    context.interface.post_deploy_chaincode(context, peer, timeout)

@when(u'an admin instantiates the chaincode on "{peer}"')
def step_impl(context, peer):
    instantiate_impl(context, peer, context.chaincode["channelID"])

@when(u'an admin queries for channel information')
def step_impl(context):
    get_chain_info_impl(context, context.interface.TEST_CHANNEL_ID)

@when(u'an admin queries for channel information on channel "{channel}"')
def get_chain_info_impl(context, channel):
    chaincode = {"args": '["GetChainInfo","{}"]'.format(channel),
                 "chaincodeId": 'qscc',
                 "name": 'qscc'}

    result = context.interface.query_chaincode(context, chaincode, "peer0.org1.example.com", channel, user="Admin")
    context.result["peer0.org1.example.com"] = marshal.dumps(result["peer0.org1.example.com"])
    context.result["peer0.org1.example.com"] = result["peer0.org1.example.com"].encode("ascii", "ignore")

@when(u'an admin queries for the first block')
def step_impl(context):
    get_block_num_impl(context, "1", context.interface.TEST_CHANNEL_ID)

@when(u'an admin queries for the first block on the channel "{channel}"')
def step_impl(context, channel):
    get_block_num_impl(context, "1", channel)

@when(u'an admin queries for block number "{number}" on the channel "{channel}"')
def get_block_num_impl(context, number, channel):
    updated_env = config_util.updateEnviron(context)
    time.sleep(2)
    chaincode = {"args": '["GetBlockByNumber","{0}","{1}"]'.format(channel, number),
                 "chaincodeId": 'qscc',
                 "name": 'qscc'}
    context.result = context.interface.query_chaincode(context, chaincode, "peer0.org1.example.com", channel, user="Admin")

@when(u'an admin queries for last transaction using the transaction ID')
def step_impl(context, number, channel):
    chaincode = {"args": '["GetTransactionByID","{0}","{1}"]'.format(channel, txId),
                 "chaincodeId": 'qscc',
                 "name": 'qscc'}
    context.result = context.interface.query_chaincode(context, chaincode, "peer0.org1.example.com", channel, user="Admin")

@when(u'a user queries on the channel "{channel}" using chaincode named "{name}" for the random key with args {args} on "{peer}"')
def step_impl(context, channel, name, args, peer):
    query_impl(context, channel, name, args.format(random_key=context.random_key), peer)

@when(u'a user queries on the chaincode named "{name}" for the random key with args {args} on "{peer}"')
def step_impl(context, name, args, peer):
    query_impl(context, context.interface.TEST_CHANNEL_ID, name, args.format(random_key=context.random_key), str(peer))

@when(u'a user queries on the chaincode named "{name}" for the random key with args {args}')
def step_impl(context, name, args):
    query_impl(context, context.interface.TEST_CHANNEL_ID, name, args.format(random_key=context.random_key), "peer0.org1.example.com")

@when(u'a user queries on the chaincode for the random key with args {args}"')
def step_impl(context, args):
    query_impl(context, context.interface.TEST_CHANNEL_ID, "mycc", args.format(random_key=context.random_key), "peer0.org1.example.com")

@when(u'a user queries on the chaincode named "{name}" with args {args} on the initial leader peer of "{org}"')
def step_impl(context, name, args, org):
    query_impl(context, context.interface.TEST_CHANNEL_ID, name, args, context.interface.get_initial_leader(context, org))

@when(u'a user queries on the chaincode named "{name}" with args {args} on the initial non-leader peer of "{org}"')
def step_impl(context, name, args, org):
    query_impl(context, context.interface.TEST_CHANNEL_ID, name, args, context.interface.get_initial_non_leader(context, org))

@when(u'a user queries on the chaincode named "{name}" with dynamic args {args} on "{peer}"')
def step_impl(context, name, args, peer):
    # Temporarily sleep for 2 sec. This delay should be able to be removed once we start using events for being sure the invokes are complete
    time.sleep(2)
    chaincode = {"args": args.format(last_key=context.last_key),
                 "chaincodeId": str(name),
                 "name": str(name)}
    context.result = context.interface.query_chaincode(context, chaincode, str(peer), context.interface.TEST_CHANNEL_ID, user="User1")

@when(u'a user queries on version "{version:d}" of the channel "{channel}" using chaincode named "{name}" with args {args} on "{peer}"')
def query_impl(context, channel, name, args, peer, targs='', version=0, user="User1", opts={}):
    # Temporarily sleep for 2 sec. This delay should be able to be removed once we start using events for being sure the invokes are complete
    time.sleep(2)
    chaincode = {"args": args,
                 "chaincodeId": str(name),
                 "version": version,
                 "name": str(name)}
    context.result = context.interface.query_chaincode(context, chaincode, peer, channel, targs, user=user, opts=opts)

@when(u'a user queries on the channel "{channel}" using chaincode named "{name}" with args {args} on "{peer}"')
def step_impl(context, channel, name, args, peer):
    query_impl(context, channel, name, args, peer)

@when(u'a user "{user}" queries on the channel "{channel}" using chaincode named "{name}" with args {args} on "{peer}"')
def step_impl(context, user, channel, name, args, peer):
    query_impl(context, channel, name, args, peer, user=user)

@when(u'a user queries on the chaincode named "{name}" with args {args} and generated transient args {targs} on "{peer}"')
def step_impl(context, name, args, peer, targs):
    # This is a workaround to allow targs to send a json structure
    generated = targs[2:-2].format(**context.command_result)
    query_impl(context, context.interface.TEST_CHANNEL_ID, name, args, str(peer), targs[:2] + generated+ targs[-2:])

@when(u'a user queries on the chaincode named "{name}" with args {args} and generated transient args {targs}')
def step_impl(context, name, args, targs):
    # This is a workaround to allow targs to send a json structure
    generated = targs[2:-2].format(**context.command_result)
    query_impl(context, context.interface.TEST_CHANNEL_ID, name, args, "peer0.org1.example.com", targs[:2] + generated + targs[-2:])

@when(u'a user queries on the chaincode named "{name}" with args {args} and transient args {targs} on "{peer}"')
def step_impl(context, name, args, peer, targs):
    query_impl(context, context.interface.TEST_CHANNEL_ID, name, args, str(peer), targs)

@when(u'a user queries on the chaincode named "{name}" with args {args} and transient args {targs}')
def step_impl(context, name, args, targs):
    query_impl(context, context.interface.TEST_CHANNEL_ID, name, args, "peer0.org1.example.com", targs)

@when(u'a user queries on the chaincode named "{name}" with args {args} on "{peer}"')
def step_impl(context, name, args, peer):
    query_impl(context, context.interface.TEST_CHANNEL_ID, name, args, str(peer))

@when(u'a user "{user}" queries on the chaincode named "{name}" with args {args} on "{peer}"')
def step_impl(context, user, name, args, peer):
    query_impl(context, context.interface.TEST_CHANNEL_ID, name, args, str(peer), user=user)

@when(u'a user queries on the chaincode named "{name}" on channel "{channel}" with args {args}')
def step_impl(context, name, channel, args):
    query_impl(context, channel, name, args, "peer0.org1.example.com")

@when(u'a user "{user}" queries on the chaincode named "{name}" on channel "{channel}" with args {args}')
def step_impl(context, user, name, channel, args):
    query_impl(context, channel, name, args, "peer0.org1.example.com", user=user)

@when(u'a user queries on the chaincode named "{name}" with args {args}')
def step_impl(context, name, args):
    query_impl(context, context.interface.TEST_CHANNEL_ID, name, args, "peer0.org1.example.com")

@when(u'a user "{user}" queries on the chaincode named "{name}" with args {args}')
def step_impl(context, user, name, args):
    query_impl(context, context.interface.TEST_CHANNEL_ID, name, args, "peer0.org1.example.com", user=user)

@when(u'a user evaluates a transaction on the chaincode named "{name}" with args {args}')
def step_impl(context, name, args):
    query_impl(context, context.interface.TEST_CHANNEL_ID, name, args, "peer0.org1.example.com", opts={"network-model": "true"})

@when(u'a user queries on the channel "{channel}" using chaincode named "{name}" with args {args}')
def step_impl(context, channel, name, args):
    query_impl(context, channel, name, args, "peer0.org1.example.com")

@when(u'a user "{user}" queries on the channel "{channel}" using chaincode named "{name}" with args {args}')
def step_impl(context, user, channel, name, args):
    query_impl(context, channel, name, args, "peer0.org1.example.com", user=user)

@when(u'a user queries on the chaincode on channel "{channel}" with args {args}')
def step_impl(context, channel, args):
    query_impl(context, channel, context.chaincode["name"], args, "peer0.org1.example.com")

@when(u'a user "{user}" queries on the chaincode on channel "{channel}" with args {args}')
def step_impl(context, user, channel, args):
    query_impl(context, channel, context.chaincode["name"], args, "peer0.org1.example.com", user=user)

@when(u'a user queries on the chaincode with args {args} from "{peer}"')
def step_impl(context, args, peer):
    query_impl(context, context.interface.TEST_CHANNEL_ID, context.chaincode["name"], args, str(peer))

@when(u'a user "{user}" queries on the chaincode with args {args} from "{peer}"')
def step_impl(context, user, args, peer):
    query_impl(context, context.interface.TEST_CHANNEL_ID, context.chaincode["name"], args, str(peer), user=user)

@when(u'a user queries on the chaincode with args {args}')
def step_impl(context, args):
    query_impl(context, context.interface.TEST_CHANNEL_ID, context.chaincode["name"], args, "peer0.org1.example.com")

@when(u'a user "{user}" queries on the chaincode with args {args}')
def step_impl(context, user, args):
    query_impl(context, context.interface.TEST_CHANNEL_ID, context.chaincode["name"], args, "peer0.org1.example.com", user=user)

@when(u'a user queries on the chaincode named "{name}"')
def step_impl(context, name):
    query_impl(context, context.interface.TEST_CHANNEL_ID, name, '["query","a"]', "peer0.org1.example.com")

@when(u'a user queries on the chaincode')
def step_impl(context):
    query_impl(context, context.interface.TEST_CHANNEL_ID, context.chaincode["name"], '["query","a"]', "peer0.org1.example.com")

@when(u'a user invokes {numInvokes:d} times on the channel "{channel}" using chaincode named "{name}" with args {args} on "{peer}" using orderer "{orderer}"')
def invokes_impl(context, numInvokes, channel, name, args, peer, orderer="orderer0.example.com", targs='', user="User1", opts={}):
    chaincode = {"args": args,
                 "name": str(name),
                 "chaincodeId": str(name)}
    for count in range(numInvokes):
        context.result = context.interface.invoke_chaincode(context, chaincode, orderer, peer, channel, targs, user=user, opts=opts)

@when(u'a user invokes {numInvokes:d} times on the channel "{channel}" using chaincode named "{name}" with args {args} on "{peer}"')
def step_impl(context, numInvokes, channel, name, args):
    invokes_impl(context, numInvokes, channel, name, args, "peer0.org1.example.com")

@when(u'a user invokes {numInvokes:d} times on the channel "{channel}" using chaincode named "{name}" with args {args}')
def step_impl(context, numInvokes, channel, name, args):
    invokes_impl(context, numInvokes, channel, name, args, "peer0.org1.example.com")

@when(u'a user invokes {numInvokes:d} times using chaincode with args {args}')
def step_impl(context, numInvokes, args):
    invokes_impl(context, numInvokes, context.interface.TEST_CHANNEL_ID, context.chaincode["name"], args, "peer0.org1.example.com")

@when(u'a user invokes {numInvokes:d} times using chaincode named "{name}" with args {args}')
def step_impl(context, numInvokes, name, args):
    invokes_impl(context, numInvokes, context.interface.TEST_CHANNEL_ID, name, args, "peer0.org1.example.com")

@when(u'a user invokes marble {startNum:d} to {endNum:d} with the last {numShare:d} of them with owner "{owner}", color "{color}" and size "{size}" in channel named "{channel}" in chaincode "{cc_name}"')
def step_impl(context, startNum, endNum, numShare, owner, color, size, channel, cc_name):
    for x in range(startNum, endNum+1-numShare):
        args="[\"initMarble\",\"marble"+str(x)+"\",\"blue\",\"35\",\"jane\"]"
        invokes_impl(context, 1, channel, cc_name, args, "peer0.org1.example.com")
    for x in range(endNum+1-numShare, endNum+1):
        args="[\"initMarble\",\"marble"+str(x)+"\",\""+color+"\",\""+size+"\",\""+owner+"\"]"
        invokes_impl(context, 1, channel, cc_name, args, "peer0.org1.example.com")

@when(u'a user invokes marble {startNum:d} to {endNum:d} with owner "{owner}", color "{color}" and size "{size}"')
def step_impl(context, startNum, endNum, owner, color, size):
    for x in range(startNum, endNum+1):
        args="[\"initMarble\",\"marble"+str(x)+"\",\""+color+"\",\""+size+"\",\""+owner+"\"]"
        invokes_impl(context, 1, context.interface.TEST_CHANNEL_ID, "mycc", args, "peer0.org1.example.com")

@when(u'a user invokes marble {startNum:d} to {endNum:d}')
def step_impl(context, startNum, endNum):
    for x in range(startNum, endNum+1):
        args="[\"initMarble\",\"marble"+str(x)+"\",\"blue\",\"35\",\"jane\"]"
        invokes_impl(context, 1, context.interface.TEST_CHANNEL_ID, "mycc", args, "peer0.org1.example.com")

@when(u'a user "{user}" invokes on the channel "{channel}" using chaincode named "{name}" with args {args} on "{peer}"')
def step_impl(context, user, channel, name, args, peer):
    invokes_impl(context, 1, channel, name, args, peer, user=user)

@when(u'a user invokes on the channel "{channel}" using chaincode named "{name}" with args {args} on "{peer}"')
def step_impl(context, channel, name, args, peer):
    invokes_impl(context, 1, channel, name, args, peer)

@when(u'a user invokes on the chaincode named "{name}" with args {args} and generated transient args {targs} on "{peer}"')
def step_impl(context, name, args, targs, peer):
    # This is a workaround to allow targs to send a json structure
    generated = targs[2:-2].format(**context.command_result)
    invokes_impl(context, 1, context.interface.TEST_CHANNEL_ID, name, args, str(peer), targs=targs[:2] + generated + targs[-2:])

@when(u'a user invokes on the chaincode named "{name}" with args {args} and generated transient args {targs}')
def step_impl(context, name, args, targs):
    # This is a workaround to allow targs to send a json structure
    generated = targs[2:-2].format(**context.command_result)
    invokes_impl(context, 1, context.interface.TEST_CHANNEL_ID, name, args, "peer0.org1.example.com", targs=targs[:2] + generated + targs[-2:])

@when(u'a user invokes on the chaincode named "{name}" with args {args} and transient args {targs} on "{peer}"')
def step_impl(context, name, args, peer, targs):
    invokes_impl(context, 1, context.interface.TEST_CHANNEL_ID, name, args, str(peer), targs=targs)

@when(u'a user invokes on the chaincode named "{name}" with args {args} and transient args {targs}')
def step_impl(context, name, args, targs):
    invokes_impl(context, 1, context.interface.TEST_CHANNEL_ID, name, args, "peer0.org1.example.com", targs=targs)

@when(u'a user invokes on the chaincode named "{name}" with args {args} on "{peer}"')
def step_impl(context, name, args, peer):
    invokes_impl(context, 1, context.interface.TEST_CHANNEL_ID, name, args, str(peer))

@when(u'a user invokes on the chaincode with args {args} on "{peer}"')
def step_impl(context, args, peer):
    invokes_impl(context, 1, context.interface.TEST_CHANNEL_ID, "mycc", args, str(peer))

@when(u'a user "{user}" invokes on the chaincode with args {args} on "{peer}"')
def step_impl(context, user, args, peer):
    invokes_impl(context, 1, context.interface.TEST_CHANNEL_ID, "mycc", args, str(peer), user=user)

@when(u'a user invokes on the chaincode with args {args}')
def step_impl(context, args):
    invokes_impl(context, 1, context.interface.TEST_CHANNEL_ID, context.chaincode["name"], args, "peer0.org1.example.com")

@when(u'a user "{user}" invokes on the chaincode with args {args}')
def step_impl(context, user, args):
    invokes_impl(context, 1, context.interface.TEST_CHANNEL_ID, context.chaincode["name"], args, "peer0.org1.example.com", user=user)

@when(u'a user invokes on the channel "{channel}" using chaincode named "{name}" with args {args}')
def step_impl(context, channel, name, args):
    invokes_impl(context, 1, channel, name, args, "peer0.org1.example.com")

@when(u'a user invokes on the chaincode named "{name}" with args {args} on the initial leader peer of "{org}"')
def step_impl(context, name, args, org):
    invokes_impl(context, 1, context.interface.TEST_CHANNEL_ID, name, args, context.interface.get_initial_leader(context, org))

@when(u'a user invokes on the chaincode named "{name}" with args {args} on the initial non-leader peer of "{org}"')
def step_impl(context, name, args, org):
    invokes_impl(context, 1, context.interface.TEST_CHANNEL_ID, name, args, context.interface.get_initial_non_leader(context, org))

@when(u'a user "{user}" invokes on the chaincode named "{name}" with args {args} on "{peer}"')
def step_impl(context, user, name, args, peer):
    invokes_impl(context, 1, context.interface.TEST_CHANNEL_ID, name, args, str(peer), user=user)

@when(u'a user invokes on the chaincode named "{name}" with args {args}')
def step_impl(context, name, args):
    invokes_impl(context, 1, context.interface.TEST_CHANNEL_ID, name, args, "peer0.org1.example.com")

@when(u'a user "{user}" invokes on the chaincode named "{name}" with args {args}')
def step_impl(context, user, name, args):
    invokes_impl(context, 1, context.interface.TEST_CHANNEL_ID, name, args, "peer0.org1.example.com", user=user)

@when(u'a user submits a transaction on the chaincode named "{name}" with args {args}')
def step_impl(context, name, args):
    invokes_impl(context, 1, context.interface.TEST_CHANNEL_ID, name, args, "peer0.org1.example.com","orderer0.example.com", opts={"network-model": "true"})

@when(u'a user invokes {numInvokes:d} times on the chaincode')
def step_impl(context, numInvokes):
    invokes_impl(context, numInvokes, context.interface.TEST_CHANNEL_ID, context.chaincode["name"], '["invoke","a","b","5"]', "peer0.org1.example.com")

@when(u'a user invokes random args {args} of length {length:d} {numInvokes:d} times on the chaincode named "{name}"')
def step_impl(context, args, length, numInvokes, name):
    for num in range(numInvokes):
        random_invoke_impl(context, name, args, length, "peer0.org1.example.com", "orderer0.example.com")

@when(u'a user invokes args with {count:d} random key/values of length {length:d} on the chaincode named "{name}"')
def step_impl(context, count, length, name):
    keyVals = []
    for index in range(count):
        key = 'a{index}'.format(index=index)
        keyVals.append('"{}"'.format(key))
        payload = ''.join(random.choice(string.ascii_letters) for _ in range(length))
        keyVals.append('"{}"'.format(payload))
        context.last_key = key
        context.payload = {"payload": payload, "len": length}

    keyValStr = ",".join(keyVals)
    chaincode = {"args": '["put",{}]'.format(keyValStr),
                 "chaincodeId": str(name),
                 "name": str(name)}
    print("chaincode: {}".format(chaincode))
    context.result = context.interface.invoke_chaincode(context, chaincode, "orderer0.example.com", "peer0.org1.example.com", context.interface.TEST_CHANNEL_ID)

@when(u'a user invokes on the channel "{channel}" using chaincode named "{name}" with random args {args} of length {length:d} on peer "{peer}" using orderer "{orderer}"')
def random_invoke_impl(context, name, args, length, peer, orderer, channel):
    payload = ''.join(random.choice(string.ascii_letters) for _ in range(length))
    random_key = str(random.randint(0, sys.maxint))
    context.payload = {"payload": payload,
                    "len": length}
    context.random_key=random_key
    chaincode = {"args": args.format(random_value=payload, random_key=random_key),
                 "chaincodeId": str(name),
                 "name": str(name)}
    context.result = context.interface.invoke_chaincode(context, chaincode, orderer, peer, channel)

@when(u'a user invokes on the channel "{channel}" using chaincode named "{name}" with random args {args} of length {length:d}')
def step_impl(context, channel, name, args, length):
    random_invoke_impl(context, name, args, length, "peer0.org1.example.com", "orderer0.example.com", channel)

@when(u'a user invokes on the chaincode named "{name}" with random args {args} of length {length:d} on peer "{peer}" using orderer "{orderer}"')
def step_impl(context, name, args, length):
    random_invoke_impl(context, name, args, length, str(peer), orderer, context.interface.TEST_CHANNEL_ID)

@when(u'a user invokes on the chaincode named "{name}" with random args {args} of length {length:d} on peer "{peer}"')
def step_impl(context, name, args, length):
    random_invoke_impl(context, name, args, length, str(peer), "orderer0.example.com", context.interface.TEST_CHANNEL_ID)

@when(u'a user invokes on the chaincode named "{name}" with random args {args} of length {length:d}')
def step_impl(context, name, args, length):
    random_invoke_impl(context, name, args, length, "peer0.org1.example.com", "orderer0.example.com", context.interface.TEST_CHANNEL_ID)

@when(u'a user invokes on the chaincode named "{name}" with random args {args}')
def step_impl(context, name, args):
    random_invoke_impl(context, name, args, 1024, "peer0.org1.example.com", "orderer0.example.com", context.interface.TEST_CHANNEL_ID)

@when(u'a user invokes on the chaincode named "{name}"')
def step_impl(context, name):
    invokes_impl(context, 1, context.interface.TEST_CHANNEL_ID, name, '["invoke","a","b","5"]', "peer0.org1.example.com")

@when(u'a user invokes on the chaincode')
def step_impl(context):
    invokes_impl(context, 1, context.interface.TEST_CHANNEL_ID, "mycc", '["invoke","a","b","5"]', "peer0.org1.example.com")

@when(u'a user using a {identityType} identity invokes on the chaincode named "{name}" with args {args}')
def step_impl(context, identityType, name, args):
    peer = "peer0.org1.example.com"
    org = "org1.example.com"

    # Save env vars from peer if it is present otherwise save the defaults
    backup = context.composition.getEnv(peer)
    if peer not in context.composition.environ.keys():
        context.composition.environ[peer] = {}

    # Change env vars for peer to certs for the specified identity
    if identityType == "peer":
        context.composition.environ[peer]["CORE_PEER_TLS_CERT_FILE"] = "/var/hyperledger/tls/server.crt"
        context.composition.environ[peer]["CORE_PEER_TLS_KEY_FILE"] = "/var/hyperledger/tls/server.key"
    elif identityType == "client":
        context.composition.environ[peer]["CORE_PEER_TLS_CERT_FILE"] = "/var/hyperledger/users/Admin@{}/tls/client.crt".format(org)
        context.composition.environ[peer]["CORE_PEER_TLS_KEY_FILE"] = "/var/hyperledger/users/Admin@{}/tls/client.key".format(org)
    elif identityType == "orderer":
        context.composition.environ[peer]["CORE_PEER_TLS_CERT_FILE"] = "/var/hyperledger/configs/{}/ordererOrganizations/example.com/orderers/orderer0.example.com/tls/server.crt".format(context.projectName)
        context.composition.environ[peer]["CORE_PEER_TLS_KEY_FILE"] = "/var/hyperledger/configs/{}/ordererOrganizations/example.com/orderers/orderer0.example.com/tls/server.key".format(context.projectName)
    else:
        assert identityType in ('peer', 'client', 'orderer'), "Unknown identity type {} for invoking on the chaincode".format(identityType)

    invokes_impl(context, 1, context.interface.TEST_CHANNEL_ID, name, args, peer)

    # Reinstate the certs saved for the composition for the specified peer
    if backup.get(peer, None) is not None:
        context.composition.environ[peer] = backup.get(peer)
    else:
        context.composition.environ.pop(peer)

@when(u'an admin creates a channel named "{channelId}" using orderer "{orderer}')
def create_channel_impl(context, channelId, orderer):
    # Be sure there is a transaction block for this channel
    if not os.path.exists("./configs/{0}/{1}.tx".format(context.projectName, channelId)):
        config_util.generateChannelConfig(channelId, config_util.CHANNEL_PROFILE, context)
    context.interface.create_channel(context, orderer, channelId)

@when(u'an admin creates a channel named "{channelId}"')
def step_impl(context, channelId):
    create_channel_impl(context, channelId, "orderer0.example.com")

@when(u'an admin creates a channel')
def step_impl(context):
    create_channel_impl(context, context.interface.TEST_CHANNEL_ID, "orderer0.example.com")

@when(u'an admin makes all peers join the channel "{channelId}"')
def join_channel_impl(context, channelId):
    peers = context.interface.get_peers(context)
    context.interface.join_channel(context, peers, channelId)

@when(u'an admin makes all peers join the channel')
def step_impl(context):
    join_channel_impl(context, context.interface.TEST_CHANNEL_ID)

@when(u'an admin makes peer "{peer}" join the channel "{channelId}"')
def step_impl(context, channelId, peer):
    context.interface.join_channel(context, [peer], channelId)

@when(u'an admin makes peer "{peer}" join the channel')
def step_impl(context, peer):
    context.interface.join_channel(context, [peer], context.interface.TEST_CHANNEL_ID)

@when(u'an admin fetches genesis information at block {block} using peer "{peer}"')
def step_impl(context, block, peer):
    context.interface.fetch_channel(context, [peer], "orderer0.example.com", context.interface.TEST_CHANNEL_ID, None, block=block)

@when(u'an admin fetches genesis information for a channel "{channelID}" using peer "{peer}" from "{orderer}" to location "{location}"')
def fetch_impl(context, channelID, peer, orderer, location, ext="block"):
    context.interface.fetch_channel(context, [peer], orderer, channelID, location, ext=ext)

@when(u'an admin fetches genesis information for a channel "{channelID}" using peer "{peer}" to location "{location}"')
def step_impl(context, channelID, peer, location):
    fetch_impl(context, channelID, peer, "orderer0.example.com", location, ext='tx')

@when(u'an admin fetches genesis information for a channel "{channelID}" using peer "{peer}"')
def step_impl(context, channelID, peer):
    fetch_impl(context, channelID, peer, "orderer0.example.com", None)

@when(u'an admin fetches genesis information using peer "{peer}" from "{orderer}" to location "{location}"')
def step_impl(context, peer, orderer, location):
    fetch_impl(context, context.interface.TEST_CHANNEL_ID, peer, orderer, location)

@when(u'an admin fetches genesis information using peer "{peer}" from "{orderer}"')
def step_impl(context, peer, orderer):
    fetch_impl(context, context.interface.TEST_CHANNEL_ID, peer, orderer, None)

@when(u'an admin fetches genesis information using peer "{peer}"')
def step_impl(context, peer):
    fetch_impl(context, context.interface.TEST_CHANNEL_ID, peer, "orderer0.example.com", None)

@when('the admin updates the "{channel}" channel using the peer "{peer}"')
def update_impl(context, peer, channel):
    if not hasattr(context, "block_filename"):
        filename = "/var/hyperledger/configs/{0}/update{1}.pb".format(context.composition.projectName, channel)
    else:
        filename = "/var/hyperledger/{}".format(context.block_filename)

    # If this is a string and not a list, convert to list
    peers = peer
    if type(peer) == str:
        peers = [peer]
    context.interface.update_channel(context, peers, channel, "orderer0.example.com", filename)

@when('the admin updates the channel using peer "{peer}"')
def step_impl(context, peer):
    update_impl(context, [peer], context.interface.TEST_CHANNEL_ID)

@when('the admin updates the channel for all peers')
def step_impl(context):
    peers = context.interface.get_peers(context)
    update_impl(context, peers, context.interface.TEST_CHANNEL_ID)

@when(u'the admin changes the policy to {policy} on channel "{channel}" with args "{args}"')
def policyChannelUpdate_impl(context, policy, channel, args=None):
    context.chaincode["policy"] = policy
    context.chaincode["version"] = 2
    if args is not None:
        context.chaincode["args"] = args

    peers = context.interface.get_peers(context)
    context.interface.install_chaincode(context, peers, user="Admin")
    context.chaincode["version"] = 3
    context.interface.upgrade_chaincode(context, "orderer0.example.com", channel)
    context.interface.post_deploy_chaincode(context, "peer0.org1.example.com", 120)

@when(u'the admin changes the policy to {policy} with args "{args}"')
def step_impl(context, policy, args):
    policyChannelUpdate_impl(context, policy, context.interface.TEST_CHANNEL_ID, args)

@when(u'the admin changes the policy to {policy}')
def step_impl(context, policy):
    policyChannelUpdate_impl(context, policy, context.interface.TEST_CHANNEL_ID)

@when('the peer admin from "{peer}" signs the updated channel config for channel "{channel}"')
def sign_impl(context, peer, channel):
    if not hasattr(context, "block_filename"):
        filename = "/var/hyperledger/configs/{0}/update{1}.pb".format(context.composition.projectName, channel)
    else:
        filename = "/var/hyperledger/{}".format(context.block_filename)

    # If this is a string and not a list, convert to list
    peers = peer
    if type(peer) == str:
        peers = [peer]
    context.interface.sign_channel(context, peers, filename)

@when('the peer admin from "{peer}" signs the updated channel config')
def step_impl(context, peer):
    sign_impl(context, [peer], context.interface.TEST_CHANNEL_ID)

@when('all organization admins sign the updated channel config')
def step_impl(context):
    peers = context.interface.get_peers(context)
    sign_impl(context, peers, context.interface.TEST_CHANNEL_ID)

@when(u'a user requests to get the design doc "{ddoc_name}" for the chaincode named "{cc_name}" in the channel "{ch_name}" and from the CouchDB instance "{couchdb_instance}"')
def step_impl(context, ddoc_name, cc_name, ch_name, couchdb_instance):
    cmd=["curl",  "-k",  "-X", "GET", couchdb_instance+"/"+ch_name+"_"+cc_name+"/_design/"+ddoc_name]
    print("cmd is: "+" ".join(str(p) for p in cmd)+"\n")
    context.result=subprocess.check_output(cmd, env=os.environ)
    print("result is: "+context.result+"\n")

@then(u'a user receives {status} response of [{response}] from the couchDB container')
def step_impl(context, status, response):
    print("response is: "+response)
    if status == "success":
        assert "error" not in context.result, "Error, recieved unexpected error message from CouchDB container: "+context.result
    elif status == "error":
        assert "error" in context.result, "Error, recieved unexpected message with no error from CouchDB container: "+context.result
    else:
        assert False, "Error: Unknown response type defined in feature file."

    assert response in context.result, "Error, recieved unexpected response from CouchDB container: "+context.result

@then(u'a user receives {status} response of {response} from the initial leader peer of "{org}"')
def step_impl(context, response, org, status):
    expected_impl(context, response, context.interface.get_initial_leader(context, org))

@then(u'a user receives {status} response of {response} from the initial non-leader peer of "{org}"')
def step_impl(context, response, org, status):
    expected_impl(context, response, context.interface.get_initial_non_leader(context, org))

@then(u'a user receives {status} response of {response} from "{peer}"')
def expected_impl(context, response, peer, status="a success"):
    assert peer in context.result, "There is no response from {0}".format(peer)
    if status == "a success":
        assert str(context.result[peer].strip()) == str(response.strip()), \
               "Expected response was {0}; received {1}".format(response,
                                                                context.result[peer])
    elif status == "an error":
        assert "Error:" in context.result[peer], "There was not an error response: {0}".format(context.result[peer])
        assert response in context.result[peer], "Expected response was {0}; received {1}".format(response, context.result[peer])
    else:
        assert False, "Unknown response type: {}. Please choose success or error".format(status)

@then(u'a user receives {status} response of {response}')
def step_impl(context, response, status="a success"):
    expected_impl(context, response, "peer0.org1.example.com", status)

@then(u'a user receives a response with the {valueType} value from "{peer}"')
def set_response_impl(context, valueType, peer):
    assert peer in context.result, "There is no response from {0}".format(peer)
    assert "Error endorsing query" not in context.result[peer], "There was an error response: {0}".format(context.result[peer])
    if valueType == "length":
        assert len(context.result[peer].replace('\n', '').replace('"', '')) == context.payload["len"], \
             "Expected response to be of length {0}; received length {1}; Result: {2}".format(context.payload["len"],
                                                                                              len(context.result[peer]),
                                                                                              context.result[peer])
    elif valueType == "random":
        assert context.payload["payload"] in context.result[peer], \
             "Expected response does not match the actual response; Result: {0}".format(context.result[peer])
    else:
        assert False, "Unknown value type {}. This type may need to be implemented in the framework.".format(valueType)

@then(u'a user receives a response with the {valueType} value')
def step_impl(context, valueType):
    set_response_impl(context, valueType, "peer0.org1.example.com")

@then(u'a user receives a response containing a value of length {length:d} from "{peer}"')
def length_impl(context, length, peer):
    assert peer in context.result, "There is no response from {0}".format(peer)
    assert "Error endorsing query" not in context.result[peer], "There was an error response: {0}".format(context.result[peer])
    assert len(context.result[peer].replace('\n', '').replace('"', '')) == length, \
        "Expected response to be of length {0}; received length {1}; Result: {2}".format(length,
                                                                                         len(context.result[peer]),
                                                                                         context.result[peer])

@then(u'a user receives a response containing a value of length {length:d}')
def step_impl(context, length):
    length_impl(context, length, "peer0.org1.example.com")

@then(u'a user receives a response containing {response} from "{peer}"')
def containing_impl(context, response, peer):
    assert peer in context.result, "There is no response from {0}".format(peer)
    if type(response) == type(context.result[peer]):
        assert response in context.result[peer], u"Expected response was {0}; received {1}".format(response, context.result[peer])
    else:
        assert str(response) in context.result[peer], "Expected response was {0}; received {1}".format(response, context.result[peer])

@then(u'a user receives a response containing {response}')
@then(u'an admin receives a response containing {response}')
def step_impl(context, response):
    containing_impl(context, response, "peer0.org1.example.com")

@then(u'a user receives a response not containing {response} from "{peer}"')
def not_containing_impl(context, response, peer):
    assert peer in context.result, "There is no response from {0}".format(peer)
    assert response not in context.result[peer], "Received response {0} (Expected it to NOT contain {1})".format(context.result[peer], response)

@then(u'a user receives a response not containing {response}')
def step_impl(context, response):
    not_containing_impl(context, response, "peer0.org1.example.com")

@then(u'the "{fileName}" file is fetched from peer "{peer}" at location "{location}"')
def block_found_impl(context, fileName, peer, location=None):
    if location is None:
        location = "/var/hyperledger/configs/{0}".format(context.projectName)

    output = context.composition.docker_exec(["ls", location], [peer])
    assert fileName in output[peer], "The channel block file has not been fetched"

@then(u'the config block file is fetched from peer "{peer}" at location "{location}"')
def step_impl(context, peer, location):
    block_found_impl(context, context.interface.TEST_CHANNEL_ID, peer, location)

@then(u'the config block file is fetched from peer "{peer}"')
def step_impl(context, peer):
    block_found_impl(context, context.interface.TEST_CHANNEL_ID, peer)

@then(u'the "{fileName}" file is fetched from peer "{peer}"')
def step_impl(context, fileName, peer):
    info = fileName.split('.')
    block_found_impl(context, info[0], peer, None)

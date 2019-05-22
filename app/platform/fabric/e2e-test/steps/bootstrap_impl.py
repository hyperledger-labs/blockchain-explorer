#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#

from behave import *
import os
import config_util
import orderer_util
import common_util

TEST_CHANNEL_ID = "syschannel"

@given(u'I have a fabric config file')
def step_impl(context):
    if not hasattr(context, "projectName"):
        config_util.generateCrypto(context)
    config_util.setupConfigs(context, TEST_CHANNEL_ID)

@given(u'I have a crypto config file with {numOrgs} orgs, {numPeers} peers, {numOrderers} orderers, and {numUsers} users')
def step_impl(context, numOrgs, numPeers, numOrderers, numUsers):
    config_util.buildCryptoFile(context, numOrgs, numPeers, numOrderers, numUsers)

@given(u'I register the orderers using fabric-ca')
def step_impl(context):
    orderers = context.interface.get_orderers(context)
    context.interface.registerIdentities(context, orderers)

@given(u'I register the peers using fabric-ca')
def step_impl(context):
    peers = context.interface.get_peers(context)
    context.interface.registerIdentities(context, peers)

@given(u'I enroll the following users using fabric-ca')
def step_impl(context):
    assert 'table' in context, "Expected table with user, organization, password, and role"
    context.users = {}
    for row in context.table.rows:
        context.users[row['username']] = {'organization': row['organization'],
                                          'password': row['password'],
                                          'role': row['role']}
    context.interface.enrollUsersFabricCA(context)

@when(u'the network is bootstrapped for an orderer of type {ordererType}')
def ordererBootstrap_impl(context, ordererType):
    context.ordererProfile = config_util.PROFILE_TYPES.get(ordererType, "SampleInsecureSolo")
    config_util.generateOrdererConfig(context, context.interface.SYS_CHANNEL_ID, context.ordererProfile, "orderer.block")
    config_util.generateChannelConfig(context.interface.SYS_CHANNEL_ID, config_util.CHANNEL_PROFILE, context)

@when(u'the network is bootstrapped for an orderer')
def step_impl(context):
    ordererBootstrap_impl(context, "solo")

@when(u'the network is bootstrapped for a channel named "{channelId}"')
def step_impl(context, channelId):
    config_util.generateChannelConfig(channelId, config_util.CHANNEL_PROFILE, context)

@when(u'the crypto material is generated for TLS network')
@when(u'the crypto material is generated')
def step_impl(context):
    config_util.generateCrypto(context, "./configs/{0}/crypto.yaml".format(context.projectName))

@then(u'crypto directories are generated containing certificates for {numOrgs} orgs, {numPeers} peers, {numOrderers} orderers, and {numUsers} users')
def step_impl(context, numOrgs, numPeers, numOrderers, numUsers):
    config_util.generateCryptoDir(context, numOrgs, numPeers, numOrderers, numUsers, tlsExist=False)

@then(u'crypto directories are generated containing tls certificates for {numOrgs} orgs, {numPeers} peers, {numOrderers} orderers, and {numUsers} users')
def step_impl(context, numOrgs, numPeers, numOrderers, numUsers):
    config_util.generateCryptoDir(context, numOrgs, numPeers, numOrderers, numUsers, tlsExist=True)

@then(u'the "{fileName}" file is generated')
def step_impl(context, fileName):
    assert hasattr(context, "projectName"), "There is no projectName assigned for this test"
    assert os.path.exists("./configs/{0}/{1}".format(context.projectName, fileName)), "The file {0} does not exist".format(fileName)

@then(u'the updated config block does not contain {value}')
def step_impl(context, value):
    blockInfo = config_util.inspectOrdererConfig(context, "{}.block".format(context.interface.TEST_CHANNEL_ID), context.interface.SYS_CHANNEL_ID)
    assert str(value) not in str(blockInfo)

@then(u'the updated config block contains {value}')
@then(u'the orderer block contains {value}')
def step_impl(context, value):
    blockInfo = config_util.inspectOrdererConfig(context, "{}.block".format(context.interface.TEST_CHANNEL_ID), context.interface.SYS_CHANNEL_ID)
    assert str(value) in str(blockInfo)

@then(u'the updated config block "{fileName}" contains {value}')
@then(u'the orderer block "{fileName}" contains {value}')
def step_impl(context, fileName, value):
    blockInfo = config_util.inspectOrdererConfig(context, fileName, context.interface.SYS_CHANNEL_ID)
    assert str(value) in str(blockInfo)

@then(u'the channel transaction file contains {value}')
def step_impl(context, value):
    blockInfo = config_util.inspectChannelConfig(context, "{}.tx".format(context.interface.TEST_CHANNEL_ID), context.interface.SYS_CHANNEL_ID)
    assert str(value) in str(blockInfo)

@then(u'the channel transaction file "{fileName}" contains {value}')
def step_impl(context, fileName, value):
    blockInfo = config_util.inspectChannelConfig(context, fileName, context.interface.SYS_CHANNEL_ID)
    assert str(value) in str(blockInfo)

@when('the orderer node logs receiving the orderer block')
def step_impl(context):
     orderers = orderer_util.getOrdererList(context)
     for orderer in orderers:
       assert common_util.is_in_log([orderer], "with genesis block hash"), "The genesis block is not received"

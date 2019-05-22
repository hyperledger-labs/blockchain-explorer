#
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#

from behave import *
import os
import subprocess
import time
import orderer_util
import basic_impl
import compose_util
import common_util


ORDERER_TYPES = ["solo",
                 "kafka",
                 "solo-msp"]

PROFILE_TYPES = {"solo": "SampleInsecureSolo",
                 "kafka": "SampleInsecureKafka",
                 "solo-msp": "SampleSingleMSPSolo"}


# @given(u'I test the access to the generated python protobuf files')
# def step_impl(context):
#     orderer_util._testAccessPBMethods()

@given(u'a bootstrapped orderer network of type {ordererType}')
def step_impl(context, ordererType):
    basic_impl.bootstrapped_impl(context, ordererType)

@given(u'an unbootstrapped network using "{dockerFile}"')
def compose_impl(context, dockerFile):
    pass

@given(u'an orderer connected to the kafka cluster')
def step_impl(context):
    pass

@given(u'the {key} environment variable is {value}')
def step_impl(context, key, value):
    if not hasattr(context, "composition"):
        context.composition = compose_util.Composition(context, startContainers=False)
    changedString = common_util.changeFormat(value)
    context.composition.environ[key] = changedString

@given(u'the peer "{peer}" is setup to use a client identity')
def step_impl(context, peer):
    if not hasattr(context, "composition"):
        context.composition = compose_util.Composition(context, startContainers=False)
    peerInfo = peer.split('.')
    if peer not in context.composition.environ:
        context.composition.environ[peer] = {}
    context.composition.environ[peer]["CORE_PEER_TLS_CERT_FILE"] = "/var/hyperledger/users/Admin@{}.example.com/tls/client.crt".format(peerInfo[1])
    context.composition.environ[peer]["CORE_PEER_TLS_KEY_FILE"] = "/var/hyperledger/users/Admin@{}.example.com/tls/client.key".format(peerInfo[1])

@given(u'a certificate from {organization} is added to the kafka orderer network')
def step_impl(context, organization):
    pass

@given(u'a kafka cluster')
def step_impl(context):
    pass

@when(u'a message is broadcasted')
def step_impl(context):
    broadcast_impl(context, 1)

@when(u'{count} unique messages are broadcasted')
def broadcast_impl(context, count):
    pass

@when(u'I {takeDownType} the current kafka topic partition leader on {orderer}')
def stop_leader_impl(context, orderer, takeDownType):
    brokers = orderer_util.getKafkaBrokerList(context, orderer)
    kafkas = orderer_util.getKafkaIPs(context, brokers)
    leader = orderer_util.getKafkaPartitionLeader(kafkaBrokers=kafkas)

    # Save stopped broker
    if not hasattr(context, "stopped_brokers"):
        context.stopped_brokers = []
    context.stopped_brokers.append(leader)
    # Now that we know the kafka leader, stop it
    basic_impl.bringdown_impl(context, leader, takeDownType)

    if not hasattr(context, "prevLeader"):
       context.prevLeader = leader

@when(u'I {bringUpType} a former kafka topic partition leader')
def step_impl(context, bringUpType):
    start_leader_impl(context, "orderer0.example.com", bringUpType)

@when(u'I {takeDownType} the current kafka topic partition leader')
def step_impl(context, takeDownType):
    stop_leader_impl(context, "orderer0.example.com", takeDownType)

@when(u'a kafka broker that is not in the ISR set is stopped on {orderer}')
def stop_non_isr_impl(context, orderer):
    brokers = orderer_util.getKafkaBrokerList(context, orderer)
    kafkas = orderer_util.getKafkaIPs(context, brokers)
    kafka = orderer_util.getNonISRKafkaBroker(kafkaBrokers=kafkas)

    if not hasattr(context, "stopped_non_isr"):
        context.stopped_non_isr = []
    context.stopped_non_isr.append(kafka)
    context.composition.stop([kafka])

@when(u'a kafka broker that is not in the ISR set is stopped')
def step_impl(context):
    stop_non_isr_impl(context, "orderer0.example.com")

@when(u'I {bringUpType} a former kafka topic partition leader for {orderer}')
def start_leader_impl(context, orderer, bringUpType):
    # Get the last stopped kafka broker from the stopped broker list
    broker = context.stopped_brokers.pop()
    basic_impl.bringup_impl(context, broker, bringUpType)

@when(u'a new organization {organization} certificate is added')
def step_impl(context, organization):
    pass

@when(u'authorization for {organization} is removed from the kafka cluster')
def step_impl(context, organization):
    pass

@when(u'authorization for {organization} is added to the kafka cluster')
def step_impl(context, organization):
    pass

@then(u'ensure kafka ISR set contains {count:d} brokers')
def step_impl(context, count):
    brokers = orderer_util.getKafkaBrokerList(context, "orderer0.example.com")
    kafkas = orderer_util.getKafkaIPs(context, brokers)
    _, isr_list = orderer_util.getKafkaTopic(kafkaBrokers=kafkas)
    assert len(isr_list) == count, "len of isr_list: {0} does not match expected number of brokers: {1}".format(len(isr_list), count)

@then(u'the broker is reported as down')
def step_impl(context):
    brokers = orderer_util.getKafkaBrokerList(context, "orderer0.example.com")
    kafkas = orderer_util.getKafkaIPs(context, brokers)
    _, isr_list = orderer_util.getKafkaTopic(kafkaBrokers=kafkas)

    #as long as we have 1 broker in isr_list, check that none from stopped_brokers list exist in isr_list
    if isr_list >= 1:
        for kafka in context.stopped_brokers:
            assert kafka not in isr_list, "stopped broker still exists in isr_set and is not removed"

    #for each broker in isr_list check logs
    for kafka in isr_list:
        assert common_util.is_in_log([kafka], "Shutdown completed (kafka.server.ReplicaFetcherThread)"), \
                                          "could not verify in the remaining broker logs that prevLeader is down"

@then(u'the broadcasted message is delivered')
def step_impl(context):
    verify_deliver_impl(context, 1, 1)

@then(u'all {count} messages are delivered in {numBlocks} block')
def step_impl(context, count, numBlocks):
    verify_deliver_impl(context, count, numBlocks)

@then(u'all {count} messages are delivered within {timeout} seconds')
def step_impl(context, count, timeout):
    verify_deliver_impl(context, count, None, timeout)

@then(u'all {count} messages are delivered in {numBlocks} within {timeout} seconds')
def verify_deliver_impl(context, count, numBlocks, timeout=60):
    pass

@then(u'I get a successful broadcast response')
def step_impl(context):
    recv_broadcast_impl(context, 1)

@then(u'I get {count} successful broadcast responses')
def recv_broadcast_impl(context, count):
    pass

@then(u'the {organization} cannot connect to the kafka cluster')
def step_impl(context, organization):
    pass

@then(u'the {organization} is able to connect to the kafka cluster')
def step_impl(context, organization):
    pass

@then(u'the zookeeper notifies the orderer of the disconnect')
def step_impl(context):
    pass

@then(u'the orderer functions successfully')
def step_impl(context):
    # Check the logs for certain key info - be sure there are no errors in the logs
    pass

@then(u'the orderer stops sending messages to the cluster')
def step_impl(context):
    pass

@then(u'the {key} environment variable is {value} on node "{node}"')
def step_impl(context, key, value, node):
    assert hasattr(context, "composition"), "There are no containers running for this test"
    changedString = common_util.changeFormat(value)
    containerValue = context.composition.getEnvFromContainer(node, key)
    assert containerValue == changedString, "The environment variable on the container was set to '{0}' (expected value: '{1}')".format(containerValue, changedString)

#
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#

import os
import sys
import datetime
from pykafka import KafkaClient
import endorser_util

# try:
#     pbFilePath = "../feature-upgrade"
#     sys.path.insert(0, pbFilePath)
#     from common import common_pb2
# except:
#     print("ERROR! Unable to import the protobuf libraries from the ../feature-upgrade directory: {0}".format(sys.exc_info()[0]))
#     sys.exit(1)

def getOrdererList(context):
    # Get the Orderers list from the orderer container name
    orderers = list()
    for container in context.composition.containerDataList:
        if 'orderer' in container.containerName:
             orderers.append(container.containerName)
    return orderers

def getKafkaBrokerList(context, orderer):
    # Get the kafka broker list from the orderer environment var
    kafkaBrokers = ""
    for container in context.composition.containerDataList:
        if orderer in container.containerName:
            kafkaBrokers = container.getEnv('CONFIGTX_ORDERER_KAFKA_BROKERS')
            break

    # Be sure that kafka broker list returned is not an empty string
    assert kafkaBrokers != "", "There are no kafka brokers set in the orderer environment"
    brokers = kafkaBrokers[1:-1].split(',')
    return brokers

def getKafkaIPs(context, kafkaList):
    kafkas = []
    for kafka in kafkaList:
        containerName = kafka.split(':')[0]
        container = context.composition.getContainerFromName(containerName, context.composition.containerDataList)
        kafkas.append("{0}:9092".format(container.ipAddress))
    return kafkas

def getKafkaTopic(kafkaBrokers=["0.0.0.0:9092"], channel=endorser_util.SYS_CHANNEL_ID):
    kafkas = ",".join(kafkaBrokers)
    client = KafkaClient(hosts=kafkas)
    if client.topics == {} and channel is None:
        topic = client.topics[endorser_util.TEST_CHANNEL_ID]
    elif client.topics == {} and channel is not None:
        topic = client.topics[channel]
    elif channel is not None and channel in client.topics:
        topic = client.topics[channel]
    elif channel is None and client.topics != {}:
        topic_list = client.topics.keys()
        topic = client.topics[topic_list[0]]

    # Print brokers in ISR
    print("ISR: {}".format(["kafka{}".format(broker.id) for broker in topic.partitions[0].isr]))
    isr_set = ["kafka{}".format(broker.id) for broker in topic.partitions[0].isr]
    return topic, isr_set

def getKafkaPartitionLeader(kafkaBrokers=["0.0.0.0:9092"], channel=endorser_util.SYS_CHANNEL_ID):
    topic, isr_set = getKafkaTopic(kafkaBrokers, channel)
    leader = "kafka{0}".format(topic.partitions[0].leader.id)
    print("current leader: {}".format(leader))
    return leader

def getNonISRKafkaBroker(kafkaBrokers=["0.0.0.0:9092"], channel=endorser_util.SYS_CHANNEL_ID):
    topic, isr_set = getKafkaTopic(kafkaBrokers, channel)
    kafka = None
    for kafkaNum in range(len(kafkaBrokers)):
        if str(kafkaNum) not in topic.partitions[0].isr:
            kafka = "kafka{0}".format(kafkaNum)
    return kafka

# def generateMessageEnvelope():
#     channel_header = common_pb2.ChannelHeader(channel_id=endorser_util.TEST_CHANNEL_ID,
#                                               type=common_pb2.ENDORSER_TRANSACTION)
#     header = common_pb2.Header(channel_header=channel_header.SerializeToString(),
#                                signature_header=common_pb2.SignatureHeader().SerializeToString())
#     payload = common_pb2.Payload(header=header,
#                                  data=str.encode("Functional test: {0}".format(datetime.datetime.utcnow())) )
#     envelope = common_pb2.Envelope(payload=payload.SerializeToString())
#     return envelope

# def _testAccessPBMethods():
#     envelope = generateMessageEnvelope()
#     assert isinstance(envelope, common_pb2.Envelope), "Unable to import protobufs from feature-upgrade directory"

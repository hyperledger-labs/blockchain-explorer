#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#


import subprocess
import os
import sys
from shutil import copyfile
import uuid
import json
import common_util

ORDERER_TYPES = ["solo",
                 "kafka",
                 "solo-msp"]

PROFILE_TYPES = {"solo": "SampleInsecureSolo",
                 "kafka": "SampleInsecureKafka",
                 "solo-msp": "SampleSingleMSPSolo"}

CHANNEL_PROFILE = "SysTestChannel"

CFGTX_ORG_STR = '''
---
Organizations:
    - &{orgName}
        Name: {orgName}
        ID: {orgMSP}
        MSPDir: ./peerOrganizations/{orgMSP}/peers/peer0.{orgMSP}/msp
        AnchorPeers:
            - Host: peer0.{orgMSP}
              Port: 7051 '''

ORDERER_STR = '''
OrdererOrgs:
  - Name: ExampleCom
    Domain: example.com
    Specs: '''

ORDERER_HOST = '''
      - Hostname: orderer{count} '''

PEER_ORG_STR = '''
  - Name: {name}
    Domain: {domain}
    EnableNodeOUs: {ouEnable}
    Template:
      Count: {numPeers}
    Users:
      Count: {numUsers}
'''

def updateEnviron(context):
    updated_env = os.environ.copy()
    if hasattr(context, "composition"):
        updated_env.update(context.composition.getEnv())
    return updated_env

def makeProjectConfigDir(context, returnContext=False):
    # Save all the files to a specific directory for the test
    if not hasattr(context, "projectName") and not hasattr(context, "composition"):
        context.projectName = str(uuid.uuid1()).replace('-','')
    elif hasattr(context, "composition"):
        context.projectName = context.composition.projectName

    testConfigs = "configs/%s" % context.projectName
    if not os.path.isdir(testConfigs):
        os.mkdir(testConfigs)
    if returnContext:
        return testConfigs, context
    return testConfigs

def buildCryptoFile(context, numOrgs, numPeers, numOrderers, numUsers, orgMSP=None, ouEnable=False):
    testConfigs = makeProjectConfigDir(context)

    # Orderer Stanza
    ordererHostStr = ""
    for count in range(int(numOrderers)):
        ordererHostStr += ORDERER_HOST.format(count=count)
    ordererStr = ORDERER_STR + ordererHostStr

    # Peer Stanza
    peerStanzas = ""
    for count in range(int(numOrgs)):
        name = "Org{0}ExampleCom".format(count+1)
        domain = "org{0}.example.com".format(count+1)
        if orgMSP is not None:
            name = orgMSP.title().replace('.', '')
            domain = orgMSP
        if type(ouEnable) == bool:
            ouEnableStr = common_util.convertBoolean(ouEnable)
        elif ouEnable == name:
            ouEnableStr = "true"
        else:
            ouEnableStr = "false"
        peerStanzas += PEER_ORG_STR.format(name=name, domain=domain, numPeers=numPeers, numUsers=numUsers, ouEnable=ouEnableStr)
    peerStr = "PeerOrgs:" + peerStanzas

    cryptoStr = ordererStr + "\n\n" + peerStr
    with open("{0}/crypto.yaml".format(testConfigs), "w") as fd:
        fd.write(cryptoStr)

def setCAConfig(context):
    testConfigs, context = makeProjectConfigDir(context, returnContext=True)
    orgDirs = getOrgs(context)
    for orgDir in orgDirs:
        with open("configs/fabric-ca-server-config.yaml", "r") as fd:
            config_template = fd.read()
            config = config_template.format(orgName=orgDir)
        with open("{0}/{1}/fabric-ca-server-config.yaml".format(testConfigs, orgDir), "w") as fd:
            fd.write(config)
    return context

def setupConfigsForCA(context, channelID):
    testConfigs, context = makeProjectConfigDir(context, returnContext=True)
    print("testConfigs: {0}".format(testConfigs))

    configFile = "configtx_fca.yaml"
    if os.path.isfile("configs/%s.yaml" % channelID):
        configFile = "%s.yaml" % channelID

    copyfile("configs/%s" % configFile, "%s/configtx.yaml" % testConfigs)

    orgDirs = getOrgs(context)
    print("Org Dirs: {}".format(orgDirs))

    for orgDir in orgDirs:
        copyfile("{0}/configtx.yaml".format(testConfigs),
                 "{0}/{1}/msp/config.yaml".format(testConfigs, orgDir))

        os.mkdir("{0}/{1}/msp/cacerts".format(testConfigs, orgDir))
        os.mkdir("{0}/{1}/msp/admincerts".format(testConfigs, orgDir))
        copyfile("{0}/ca.{1}-cert.pem".format(testConfigs, orgDir),
                 "{0}/{1}/msp/cacerts/ca.{1}-cert.pem".format(testConfigs, orgDir))
        copyfile("{0}/ca.{1}-cert.pem".format(testConfigs, orgDir),
                 "{0}/{1}/msp/admincerts/ca.{1}-cert.pem".format(testConfigs, orgDir))

def certificateSetupForCA(context):
    testConfigs, context = makeProjectConfigDir(context, returnContext=True)
    orgDirs = [d for d in os.listdir("./{0}/".format(testConfigs)) if (("example.com" in d) and (os.path.isdir("./{0}/{1}".format(testConfigs, d))))]
    for orgDir in orgDirs:
        if os.path.isdir("{0}/{1}/orderer0.example.com".format(testConfigs, orgDir)):
            copyfile("{0}/configtx.yaml".format(testConfigs),
                     "{0}/{1}/orderer0.example.com/msp/config.yaml".format(testConfigs, orgDir))
            copyfile("{0}/{1}/orderer0.example.com/msp/signcerts/cert.pem".format(testConfigs, orgDir),
                     "{0}/{1}/msp/admincerts/cert.pem".format(testConfigs, orgDir))
            copyfile("{0}/ca.{1}-cert.pem".format(testConfigs, orgDir),
                     "{0}/{1}/msp/cacerts/ca.{1}-cert.pem".format(testConfigs, orgDir))

def setupConfigs(context, channelID):
    testConfigs = makeProjectConfigDir(context)
    print("testConfigs: {0}".format(testConfigs))

    configFile = "configtx.yaml"
    if os.path.isfile("configs/%s.yaml" % channelID):
        configFile = "%s.yaml" % channelID

    copyfile("configs/%s" % configFile, "%s/configtx.yaml" % testConfigs)

    # Copy config to orderer org structures
    for orgDir in os.listdir("./{0}/ordererOrganizations".format(testConfigs)):
        copyfile("{0}/configtx.yaml".format(testConfigs),
                 "{0}/ordererOrganizations/{1}/msp/config.yaml".format(testConfigs,
                                                                       orgDir))
    # Copy config to peer org structures
    for orgDir in os.listdir("./{0}/peerOrganizations".format(testConfigs)):
        copyfile("{0}/configtx.yaml".format(testConfigs),
                 "{0}/peerOrganizations/{1}/msp/config.yaml".format(testConfigs,
                                                                    orgDir))
        copyfile("{0}/configtx.yaml".format(testConfigs),
                 "{0}/peerOrganizations/{1}/users/Admin@{1}/msp/config.yaml".format(testConfigs,
                                                                                    orgDir))

def inspectOrdererConfig(context, filename, channelID):
    testConfigs = makeProjectConfigDir(context)
    updated_env = updateEnviron(context)
    try:
        command = ["configtxgen", "-inspectBlock", filename,
                   "-configPath", ".",
                   "-channelID", channelID]
        return subprocess.check_output(command, cwd=testConfigs, env=updated_env)
        #return subprocess.check_output(command, env=updated_env)
    except:
        print("Unable to inspect orderer config data: {0}".format(sys.exc_info()[1]))

def inspectChannelConfig(context, filename, channelID):
    testConfigs = makeProjectConfigDir(context)
    updated_env = updateEnviron(context)
    try:
        command = ["configtxgen", "-inspectChannelCreateTx", filename,
                   "-configPath", ".",
                   "-channelID", channelID]
        return subprocess.check_output(command, cwd=testConfigs, env=updated_env)
        #return subprocess.check_output(command, env=updated_env)
    except:
        print("Unable to inspect channel config data: {0}".format(sys.exc_info()[1]))

def generateConfigForCA(context, channelID, profile, ordererProfile, block="orderer.block"):
    setupConfigsForCA(context, channelID)
    generateOrdererConfig(context, channelID, ordererProfile, block)
    generateChannelConfig(channelID, profile, context)
    generateChannelAnchorConfig(channelID, profile, context)
    certificateSetupForCA(context)

def generateConfig(context, channelID, profile, ordererProfile, block="orderer.block"):
    setupConfigs(context, channelID)
    generateOrdererConfig(context, channelID, ordererProfile, block)
    generateChannelConfig(channelID, profile, context)
    generateChannelAnchorConfig(channelID, profile, context)

def generateOrdererConfig(context, channelID, ordererProfile, block):
    testConfigs = makeProjectConfigDir(context)
    updated_env = updateEnviron(context)
    try:
        command = ["configtxgen", "-profile", ordererProfile,
                   "-outputBlock", block,
                   "-configPath", ".",
                   "-channelID", channelID]
        subprocess.check_call(command, cwd=testConfigs, env=updated_env)
        #subprocess.check_call(command, env=updated_env)
    except:
        print("Unable to generate orderer config data: {0}".format(sys.exc_info()[1]))

def generateChannelConfig(channelID, profile, context):
    testConfigs = makeProjectConfigDir(context)
    updated_env = updateEnviron(context)
    try:
        command = ["configtxgen", "-profile", profile,
                   "-outputCreateChannelTx", "%s.tx" % channelID,
                   "-configPath", ".",
                   "-channelID", channelID]
        subprocess.check_call(command, cwd=testConfigs, env=updated_env)
        #subprocess.check_call(command, env=updated_env)
    except:
        print("Unable to generate channel config data: {0}".format(sys.exc_info()[1]))

def getOrgs(context):
    testConfigs, context = makeProjectConfigDir(context, returnContext=True)
    if os.path.exists("./{0}/peerOrganizations".format(testConfigs)):
        orgs = os.listdir("./{0}/peerOrganizations".format(testConfigs)) + os.listdir("./{0}/ordererOrganizations".format(testConfigs))
    else:
        orgs = [d for d in os.listdir("./{0}/".format(testConfigs)) if (("example.com" in d) and (os.path.isdir("./{0}/{1}".format(testConfigs, d))))]

    return orgs

def generateChannelAnchorConfig(channelID, profile, context):
    testConfigs = makeProjectConfigDir(context)
    updated_env = updateEnviron(context)
    for org in os.listdir("./{0}/peerOrganizations".format(testConfigs)):
        try:
            command = ["configtxgen", "-profile", profile,
                       "-outputAnchorPeersUpdate", "{0}{1}Anchor.tx".format(org, channelID),
                       "-channelID", channelID,
                       "-configPath", testConfigs,
                       "-asOrg", org.title().replace('.', '')]
            #subprocess.check_call(command, cwd=testConfigs, env=updated_env)
            subprocess.check_call(command, env=updated_env)
        except:
            print("Unable to generate channel anchor config data: {0}".format(sys.exc_info()[1]))

def generateCrypto(context, cryptoLoc="./configs/crypto.yaml"):
    testConfigs = makeProjectConfigDir(context)
    updated_env = updateEnviron(context)
    try:
        subprocess.check_call(["cryptogen", "generate",
                               '--output={0}/.'.format(testConfigs),
                               '--config={0}'.format(cryptoLoc)],
                              env=updated_env)
        cmd = ['find {0} -iregex \'.*_sk$\' -type f | xargs -I[] dirname [] | xargs -I[] bash -c \'pushd [] && ln -s *_sk sk && popd\''.format(testConfigs)]
        subprocess.call(cmd, shell=True, env=updated_env)
    except:
        print("Unable to generate crypto material: {0}".format(sys.exc_info()[1]))

def traverse_orderer(projectname, numOrderers, tlsExist):
    # orderer stanza
    opath = 'configs/' +projectname+ '/ordererOrganizations/example.com/'
    capath = opath + 'ca/'
    caCertificates(capath)

    msppath = opath + 'msp/'
    rolebasedCertificate(msppath)

    for count in range(int(numOrderers)):
        ordererpath = opath + 'orderers/' + "orderer" +str(count)+".example.com/"
        mspandtlsCheck(ordererpath, tlsExist)

    userpath = opath + 'users/Admin@example.com/'
    mspandtlsCheck(userpath, tlsExist)

def traverse_peer(projectname, numOrgs, numPeers, numUsers, tlsExist, orgMSP=None):
    # Peer stanza
    pppath = 'configs/' +projectname+ '/peerOrganizations/'
    for orgNum in range(int(numOrgs)):
        if orgMSP is None:
            orgMSP = "org" + str(orgNum) + ".example.com"
        for peerNum in range(int(numPeers)):
            orgpath = orgMSP + "/"
            ppath = pppath + orgpath
            peerpath = ppath +"peers/"+"peer"+str(peerNum)+ "."+ orgpath

            mspandtlsCheck(peerpath, tlsExist)

            capath = ppath + 'ca/'
            caCertificates(capath)

            msppath = ppath + 'msp/'
            rolebasedCertificate(msppath)
            keystoreCheck(msppath)

            userAdminpath = ppath +"users/"+"Admin@"+orgpath
            mspandtlsCheck(userAdminpath, tlsExist)

            for count in range(int(numUsers)):
                userpath = ppath + "users/"+"User"+str(count)+"@"+orgpath
                mspandtlsCheck(userpath, tlsExist)

def generateCryptoDir(context, numOrgs, numPeers, numOrderers, numUsers, tlsExist=True, orgMSP=None):
    projectname = context.projectName
    traverse_peer(projectname, numOrgs, numPeers, numUsers, tlsExist, orgMSP)
    traverse_orderer(projectname, numOrderers, tlsExist)

def mspandtlsCheck(path, tlsExist):
    msppath = path + 'msp/'
    rolebasedCertificate(msppath)
    keystoreCheck(msppath)

    if not tlsExist:
       tlspath = path + 'tls/'
       tlsCertificates(tlspath)

def fileExistWithExtension(path, message, fileExt=''):
    for root, dirnames, filenames in os.walk(path):
        assert len(filenames) > 0, "{0}: len: {1}".format(message, len(filenames))
        fileCount = [filename.endswith(fileExt) for filename in filenames]
        assert fileCount.count(True) >= 1

def rolebasedCertificate(path):
    adminpath = path + "admincerts/"
    fileExistWithExtension(adminpath, "There is not .pem cert in {0}.".format(adminpath), '.pem')

    capath = path + "cacerts/"
    fileExistWithExtension(capath, "There is not .pem cert in {0}.".format(capath), '.pem')

    signcertspath = path + "signcerts/"
    fileExistWithExtension(signcertspath, "There is not .pem cert in {0}.".format(signcertspath), '.pem')

    tlscertspath = path + "tlscerts/"
    fileExistWithExtension(tlscertspath, "There is not .pem cert in {0}.".format(tlscertspath), '.pem')

def caCertificates(path):
    # There are no ca directories containing pem files
    fileExistWithExtension(path, "There are missing files in {0}.".format(path), '_sk')
    fileExistWithExtension(path, "There is not .pem cert in {0}.".format(path), '.pem')

def tlsCertificates(path):
    for root, dirnames, filenames in os.walk(path):
        assert len(filenames) == 3, "There are missing certificates in the {0} dir".format(path)
        for filename in filenames:
            assert filename.endswith(('.crt','.key')), "The files in the {0} directory are incorrect".format(path)

def keystoreCheck(path):
    keystorepath = path + "keystore/"
    fileExistWithExtension(keystorepath, "There are missing files in {0}.".format(keystorepath), '')

def buildConfigtx(testConfigs, orgName, mspID):
    configtx = CFGTX_ORG_STR.format(orgName=orgName, orgMSP=mspID)
    with open("{}/configtx.yaml".format(testConfigs), "w") as fd:
        fd.write(configtx)

def getNewOrg(context, mspID):
    testConfigs, context = makeProjectConfigDir(context, returnContext=True)
    updated_env = updateEnviron(context)

    orgName = mspID.title().replace(".", "")
    copyfile("{}/configtx.yaml".format(testConfigs), "{}/orig_configtx.yaml".format(testConfigs))
    buildConfigtx(testConfigs, orgName, mspID)
    try:
        command = ["configtxgen", "-printOrg", orgName]
        args = subprocess.check_output(command, cwd=testConfigs, env=updated_env)
        print("Result of printOrg: ".format(args))
    except:
        print("Unable to inspect orderer config data: {0}".format(sys.exc_info()[1]))
        args = ""

    # Save the org config and reinstate the original configtx.yaml
    copyfile("{}/configtx.yaml".format(testConfigs), "{}/configtx_org3.yaml".format(testConfigs))
    copyfile("{}/orig_configtx.yaml".format(testConfigs), "{}/configtx.yaml".format(testConfigs))
    return {orgName: json.loads(args)}

def delNewOrg(context, group, mspID, channel):
    updated_env = updateEnviron(context)
    testConfigs = "./configs/{0}".format(context.projectName)
    inputFile = "{0}.block".format(channel)

    # configtxlator proto_decode --input config_block.pb --type common.Block | jq .data.data[0].payload.data.config > config.json
    configStr = subprocess.check_output(["configtxlator", "proto_decode", "--input", inputFile, "--type", "common.Block"], cwd=testConfigs , env=updated_env)
    config = json.loads(configStr)

    with open("{0}/config.json".format(testConfigs), "w") as fd:
        fd.write(json.dumps(config["data"]["data"][0]["payload"]["data"]["config"], indent=4))

    # configtxlator proto_encode --input config.json --type common.Config --output config.pb
    subprocess.check_output(["configtxlator", "proto_encode", "--input", "config.json", "--type", "common.Config", "--output", "config.pb"],
                                        cwd=testConfigs,
                                        env=updated_env)

    config["data"]["data"][0]["payload"]["data"]["config"]["channel_group"]["groups"][group]["groups"].pop(mspID)
    return config

def getCaCert(context, node, fca):
    #fabric-ca-client getcacert -d -u https://$CA_HOST:7054 -M $ORG_MSP_DIR
    if node.startswith("orderer"):
        mspdir = context.composition.getEnvFromContainer(node, 'ORDERER_GENERAL_LOCALMSPDIR')
    elif node.startswith("peer"):
        mspdir = context.composition.getEnvFromContainer(node, 'CORE_PEER_MSPCONFIGPATH')
    output = context.composition.docker_exec(["fabric-ca-client getcacert -d -u https://{0}:7054 -M {1}".format(fca, mspdir)], [node])
    print("Output getcacert: {}".format(output))

def getUserPass(context, container_name):
    for container in context.composition.containerDataList:
        if container_name in container.containerName:
            userpass = container.getEnv('BOOTSTRAP_USER_PASS')
            break

def registerUsers(context):
    for user in context.users.keys():
        #fabric-ca-client register -d --id.name $ADMIN_NAME --id.secret $ADMIN_PASS
        org = context.users[user]['organization']
        passwd = context.users[user]['password']
        role = context.users[user]['role']
        fca = 'ca.{}'.format(org)
        output = context.composition.docker_exec(["fabric-ca-client register -d --id.name {0} --id.secret {1}".format(user, passwd)], [fca])
        print("user register: {}".format(output))

def registerWithABAC(context, user):
    '''
    ABAC == Attribute Based Access Control
    '''
    org = context.users[user]['organization']
    passwd = context.users[user]['password']
    role = context.users[user]['role']
    fca = 'ca.{}'.format(org)
    attr = []
    for abac in context.abac.keys():
        if context.abac[abac] == 'required':
            attr.append("{0}=true:ecert".format(abac))
        else:
            attr.append("{0}=true".format(abac))
    #fabric-ca-client register -d --id.name $ADMIN_NAME --id.secret $ADMIN_PASS --id.attrs "hf.admin=true:ecert"
    attr_reqs = ",".join(attr)
    output = context.composition.docker_exec(['fabric-ca-client register -d --id.name {0} --id.secret {1} --id.attrs "{2}"'.format(user, passwd, attr_reqs)], [fca])
    print("ABAC register: {}".format(output))

def addNewOrg(context, config_update, group, channel):
    updated_env = updateEnviron(context)
    testConfigs = "./configs/{0}".format(context.projectName)
    inputFile = "{0}.block".format(channel)

    # configtxlator proto_decode --input config_block.pb --type common.Block | jq .data.data[0].payload.data.config > config.json
    configStr = subprocess.check_output(["configtxlator", "proto_decode", "--input", inputFile, "--type", "common.Block"], cwd=testConfigs , env=updated_env)
    config = json.loads(configStr)

    with open("{0}/config.json".format(testConfigs), "w") as fd:
        fd.write(json.dumps(config["data"]["data"][0]["payload"]["data"]["config"], indent=4))

    # configtxlator proto_encode --input config.json --type common.Config --output config.pb
    subprocess.check_output(["configtxlator", "proto_encode", "--input", "config.json", "--type", "common.Config", "--output", "config.pb"],
                                        cwd=testConfigs,
                                        env=updated_env)

    # groups = "Application"
    # config_update = {"Org3ExampleCom": <data>}
    config["data"]["data"][0]["payload"]["data"]["config"]["channel_group"]["groups"][group]["groups"].update(config_update)
    return config

def configUpdate(context, config, group, channel):
    updated_env = updateEnviron(context)
    testConfigs = "./configs/{0}".format(context.projectName)

    with open("{0}/modified_config.json".format(testConfigs), "w") as fd:
        fd.write(json.dumps(config["data"]["data"][0]["payload"]["data"]["config"], indent=4))

    print("Modified config: {}".format(config["data"]["data"][0]["payload"]["data"]["config"]["channel_group"]["groups"][group]["groups"]))

    # configtxlator proto_encode --input config.json --type common.Config --output config.pb
    subprocess.check_output(["configtxlator", "proto_encode", "--input", "config.json", "--type", "common.Config", "--output", "config.pb"],
                                        cwd=testConfigs,
                                        env=updated_env)

    # configtxlator proto_encode --input modified_config.json --type common.Config --output modified_config.pb
    subprocess.check_output(["configtxlator", "proto_encode", "--input", "modified_config.json", "--type", "common.Config", "--output", "modified_config.pb"],
                                        cwd=testConfigs,
                                        env=updated_env)

    # configtxlator compute_update --channel_id $CHANNEL_NAME --original config.pb --updated modified_config.pb --output update.pb
    subprocess.check_output(["configtxlator", "compute_update", "--channel_id", channel, "--original", "config.pb", "--updated", "modified_config.pb", "--output", "update.pb"],
                                        cwd=testConfigs,
                                        env=updated_env)

    # configtxlator proto_decode --input update.pb --type common.ConfigUpdate | jq . > org3_update.json
    configStr = subprocess.check_output(["configtxlator", "proto_decode", "--input", "update.pb", "--type", "common.ConfigUpdate"],
                                        cwd=testConfigs,
                                        env=updated_env)
    config = json.loads(configStr)

    # echo '{"payload":{"header":{"channel_header":{"channel_id":"mychannel", "type":2}},"data":{"config_update":'$(cat org3_update.json)'}}}' | jq . > org3_update_in_envelope.json
    updatedconfig = {"payload": {"header": {"channel_header": {"channel_id": channel,
                                                               "type":2}
                                           },
                                 "data": {"config_update": config}
                                }
                    }

    with open("{0}/update.json".format(testConfigs), "w") as fd:
        fd.write(json.dumps(updatedconfig, indent=4))

    # configtxlator proto_encode --input org3_update_in_envelope.json --type common.Envelope --output org3_update_in_envelope.pb
    subprocess.check_output(["configtxlator", "proto_encode", "--input", "update.json", "--type", "common.Envelope", "--output", "update{0}.pb".format(channel)],
                                        cwd=testConfigs,
                                        env=updated_env)

    return "{0}/update{1}.pb".format(testConfigs, channel)

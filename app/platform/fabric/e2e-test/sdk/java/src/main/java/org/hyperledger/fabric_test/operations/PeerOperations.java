/*
 *SPDX-License-Identifier: Apache-2.0
 */

package org.hyperledger.fabric_test.operations;

import com.beust.jcommander.JCommander;
import com.beust.jcommander.Parameter;
import com.google.gson.*;
import org.hyperledger.fabric.sdk.exception.*;
import org.hyperledger.fabric_ca.sdk.exception.EnrollmentException;
import org.hyperledger.fabric_ca.sdk.exception.InfoException;
import org.hyperledger.fabric_test.structures.AppUser;
import org.apache.log4j.BasicConfigurator;
import org.apache.commons.lang.WordUtils;
import org.hyperledger.fabric.sdk.*;
import org.hyperledger.fabric.sdk.security.CryptoSuite;
import org.hyperledger.fabric.sdk.security.CryptoPrimitives;

import java.io.*;
import java.lang.reflect.InvocationTargetException;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.spec.InvalidKeySpecException;
import java.security.cert.CertificateException;
import java.util.*;
import java.util.AbstractMap.SimpleEntry;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class PeerOperations {

    // Globals
    //   Configuration Path
    @Parameter(names={"--configpath", "-c"})
    private static String configPath = "../../configs";

    //   Peer name
    @Parameter(names={"--peername", "-n"})
    private static String peerName = "peer0.org1.example.com";
     //   Peer IP address
    @Parameter(names={"--peerip", "-i"})
    private static String peerIp;
    //   Peer port
    @Parameter(names={"--peerport", "-p"})
    private static String peerPort;
    //   Command
    @Parameter(names={"--operation", "-o"})
    private static String operationStr;
    //   Organization Name
    @Parameter(names={"--mspid", "-r"})
    private static String mspId = "org1.example.com";

    //   Orderer
    @Parameter(names={"--orderer", "-d"})
    private static String orderer = "orderer0.example.com";
    //   Network ID
    @Parameter(names={"--networkid", "-e"})
    private static String networkID = "";
    //   CA Certificate Path
    @Parameter(names={"--cacertpath", "-a"})
    private static String cacertPath;
    //   Server CA Certificate Path
    @Parameter(names={"--srvcertpath", "-s"})
    private static String srvcertPath;

    //   Channel Name
    @Parameter(names={"--channelname", "-h"})
    private static String channelName;
    //   Chaincode Name
    @Parameter(names={"--ccname", "-m"})
    private static String ccName;
    //   Chaincode version
    @Parameter(names={"--ccversion", "-v"})
    private static String ccVersion;
    //   Chaincode Path
    @Parameter(names={"--ccpath", "-t"})
    private static String ccPath;
    //   Chaincode Func
    @Parameter(names={"--ccfunc", "-f"})
    private static String ccFunc;
    //   Chaincode Args
    @Parameter(names={"--ccargs", "-g"})
    private static String ccargs;

    //   UserName
    @Parameter(names={"--user", "-u"})
    private static String userName;
    //   User Password
    @Parameter(names={"--userpasswd", "-w"})
    private static String userPassword;

    private static Map<String, Operation> operationMap() {
        return Collections.unmodifiableMap(Stream.of(
                new SimpleEntry<>("join", Operation.CHANNEL_JOIN),
                new SimpleEntry<>("install", Operation.CC_INSTALL),
                new SimpleEntry<>("instantiate", Operation.CC_INSTANTIATE),
                new SimpleEntry<>("upgrade", Operation.CC_UPGRADE),
                new SimpleEntry<>("query", Operation.CC_QUERY),
                new SimpleEntry<>("invoke", Operation.CC_INVOKE)
        ).collect(Collectors.toMap(SimpleEntry::getKey, SimpleEntry::getValue)));
    }
    private static JsonObject connectionProfile;

    public static void main(String ... argv) throws Exception {
        PeerOperations main = new PeerOperations();
        JCommander.newBuilder()
                .addObject(main)
                .build()
                .parse(argv);
        main.run();
    }

    public void run() throws IOException, InvalidArgumentException, ProposalException, TransactionException, IllegalAccessException, InstantiationException, ClassNotFoundException, NoSuchMethodException, InvocationTargetException, CryptoException, InfoException, org.hyperledger.fabric_ca.sdk.exception.InvalidArgumentException, EnrollmentException, InvalidKeySpecException, NoSuchAlgorithmException, NetworkConfigurationException, CertificateException {
        BasicConfigurator.configure();

        // Using enums and putting this check up here instead of just using a switch-case statement directly
        // so as to avoid unnecessary overhead by setting up client and peer
        Operation operation = operationMap().getOrDefault(operationStr, Operation.INVALID);
        if (operation == Operation.INVALID) {
            System.out.println("Unknown command.");
            System.exit(1);
        }

        String orgName = WordUtils.capitalize(mspId.replace(".", " ")).replace(" ", "");
        connectionProfile = getConnectionProfile();
        String enrollId = String.format("%s@%s", userName, mspId);

        HFClient _client = HFClient.createNewInstance();
        _client.setCryptoSuite(CryptoSuite.Factory.getCryptoSuite());

        AppUser appUser = new AppUser(enrollId, orgName, mspId);

        JsonObject peerInfo = connectionProfile.getAsJsonObject("peers").getAsJsonObject(peerName);
        String peerLocation = peerInfo.get("url").getAsString();

        Properties peerProperties = new Properties();
        peerProperties.put("pemBytes",
                peerInfo.getAsJsonObject("tlsCACerts").get("pem").getAsString().getBytes());
        peerProperties.put("grpc.NettyChannelBuilderOption.keepAliveTime", new Object[] {8L, TimeUnit.MINUTES});
        peerProperties.put("grpc.NettyChannelBuilderOption.keepAliveTimeout", new Object[] {8L, TimeUnit.SECONDS});
        peerProperties.put("grpc.NettyChannelBuilderOption.keepAliveWithoutCalls", new Object[] {true});

        appUser.setEnrollment(getEnrollment(connectionProfile, mspId, userName, userPassword));
        _client.setUserContext(appUser);

        Peer peer = _client.newPeer(peerName, peerLocation, peerProperties);
        Channel channel = getChannel(channelName, _client);

        System.out.println("Perform operation...");
        if (operation == Operation.CC_INSTALL) {
            installChaincode(ccName, ccVersion, ccPath, _client, Collections.singletonList(peer));
            System.exit(0);
        }

        if (operation != Operation.CHANNEL_JOIN) {
            channel.addPeer(peer);
            channel.initialize();
        }

        // Cases CC_INSTALL and INVALID are unreachable at this point
        switch (operation) {
            case CHANNEL_JOIN:
                joinChannel(channel, peer);
                break;
            case CC_INSTANTIATE: {
                ArrayList<String> ccArgs = arrayFromJsonString(ccargs);
                instantiateChaincode(ccName, ccVersion, channel, ccArgs, _client, Collections.singletonList(peer));
                break;
            }
            case CC_UPGRADE: {
                upgradeChaincode(ccName, ccVersion, channel, _client, Collections.singletonList(peer));
                break;
            }
            case CC_QUERY: {
                System.out.println(ccargs);
                ArrayList<String> ccArgs = arrayFromJsonString(ccargs);
                sendQuery(ccName, ccFunc, ccArgs, channel, _client);
                break;
            }
            case CC_INVOKE: {
                ArrayList<String> ccArgs = arrayFromJsonString(ccargs);
                invokeTransaction(ccName, ccFunc, ccArgs, channel, _client, Collections.singletonList(peer));
                break;
            }
        }
    }

    private static Enrollment getEnrollment(JsonObject connectionProfile, String mspId, String userName, String password) throws NetworkConfigurationException, IOException, InvalidArgumentException, org.hyperledger.fabric_ca.sdk.exception.InvalidArgumentException, IllegalAccessException, InvocationTargetException, InstantiationException, NoSuchMethodException, CryptoException, ClassNotFoundException, EnrollmentException, InvalidKeySpecException, NoSuchAlgorithmException, CertificateException {
        String enrollId = String.format("%s@%s", userName, mspId);
        Path filePath = Paths.get(configPath,"peerOrganizations", mspId, "users", enrollId, "msp", "keystore");
        File keyDir = new File(filePath.toString());
        File[] listOfFiles = keyDir.listFiles();
        System.out.println(filePath.toString());
        assert listOfFiles != null : "There are no files in the filepath";
        System.out.println(listOfFiles[0].getName());
        Path keyPath = Paths.get(configPath,"peerOrganizations", mspId, "users", enrollId, "msp", "keystore", listOfFiles[0].getName());
        String keyString = new String(Files.readAllBytes(keyPath));
        PrivateKey keyPem = getPrivateKeyFromPEMString(keyString);
        Path certPath = Paths.get(configPath,"peerOrganizations", mspId, "users", enrollId, "msp", "signcerts", String.format("%s-cert.pem", enrollId));
        String certPem = new String(Files.readAllBytes(certPath));
        return new Enrollment() {
            @Override
            public PrivateKey getKey() {
                return keyPem;
            }
            @Override
            public String getCert() {
                return certPem;
            }
        };
    }

    private static JsonObject getConnectionProfile() throws IOException {
        String connectionProfileStr =
                new String(Files.readAllBytes(Paths.get(configPath, "network-config.json")));
        return new JsonParser().parse(connectionProfileStr).getAsJsonObject();
    }

    private static <T> ArrayList<T> arrayFromJsonString(String jsonArrayStr) {
        JsonArray jsonArray = new JsonParser().parse(jsonArrayStr).getAsJsonArray();
        System.out.println(jsonArrayStr);
        System.out.println(jsonArray);
        ArrayList<T> myArray = new ArrayList<>();
        for (JsonElement item : jsonArray) {
            myArray.add((T) item.getAsString());
        }
        return myArray;
    }

    private static PrivateKey getPrivateKeyFromPEMString(String privatePem) throws IOException, NoSuchAlgorithmException, InvalidKeySpecException, IllegalAccessException, InstantiationException, ClassNotFoundException, CryptoException, InvalidArgumentException, CertificateException {
        CryptoPrimitives crypto = new CryptoPrimitives();
        crypto.init();
        return crypto.bytesToPrivateKey(privatePem.getBytes());
    }

    private static Channel getChannel(String channelName, HFClient client)
            throws InvalidArgumentException, NetworkConfigurationException, IOException, TransactionException {
        System.out.println("Fetching channel " + channelName);

        File configFile = new File(Paths.get(configPath, "network-config.json").toString());
        NetworkConfig config = NetworkConfig.fromJsonFile(configFile);
        Channel channel = client.loadChannelFromConfig(channelName, config);

        Properties ordererProperties = new Properties();
        ordererProperties.put("pemBytes",
                connectionProfile.getAsJsonObject("orderers")
                        .getAsJsonObject("orderer0.example.com")
                        .getAsJsonObject("tlsCACerts").get("pem").getAsString().getBytes());
        ordererProperties.put("grpc.NettyChannelBuilderOption.keepAliveTime", new Object[] {5L, TimeUnit.MINUTES});
        ordererProperties.put("grpc.NettyChannelBuilderOption.keepAliveTimeout", new Object[] {8L, TimeUnit.SECONDS});
        ordererProperties.put("grpc.NettyChannelBuilderOption.keepAliveWithoutCalls", new Object[] {true});
        ordererProperties.put("grpc.NettyChannelBuilderOption.forTarget", new Object[] {"example.com"});
        Orderer orderer = client.newOrderer(
                "orderer0.example.com",
                connectionProfile.getAsJsonObject("orderers")
                        .getAsJsonObject("orderer0.example.com").get("url").getAsString(),
                ordererProperties
        );
        channel.addOrderer(orderer);

        return channel;
    }

    private static void joinChannel(Channel channel, Peer peer) {
        System.out.println("Joining channel...");

        try {
            channel.joinPeer(peer);
            System.out.println("Joined channel " + channel.getName());
        } catch (ProposalException ex) {
            System.out.println("Channel join failed. Is the peer " + peer.getName()
                    + " already joined to channel " + channel.getName() + "?");
            ex.printStackTrace();
        }
    }

    private static void installChaincode(String ccName, String ccVersion, String ccPath,
                                         HFClient client, Collection<Peer> peers)
            throws InvalidArgumentException, ProposalException {
        System.out.println("Installing chaincode " + ccName + ":" + ccVersion + " (located at $GOPATH/src/" + ccPath
        + " on peers " + peers + ".");
        InstallProposalRequest installProposalRequest = client.newInstallProposalRequest();
        String gopath = Paths.get(System.getenv("GOPATH")).toString();
        installProposalRequest.setChaincodeSourceLocation(new File(gopath));
        installProposalRequest.setChaincodeName(ccName);
        installProposalRequest.setChaincodeVersion(ccVersion);
        installProposalRequest.setChaincodePath(ccPath);
        installProposalRequest.setArgs(new ArrayList<>());
        client.sendInstallProposal(installProposalRequest, peers);
    }

    private static void instantiateChaincode(String ccName, String ccVersion,
                                             Channel channel, ArrayList<String> ccArgs,
                                             HFClient client, Collection<Peer> peers)
            throws InvalidArgumentException, ProposalException {
        System.out.println("Instantiating chaincode " + ccName + ":" + ccVersion
                + " on channel " + channel.getName() + ".");
        InstantiateProposalRequest instantiateRequest = client.newInstantiationProposalRequest();
        instantiateRequest.setChaincodeName(ccName);
        instantiateRequest.setChaincodeVersion(ccVersion);
        instantiateRequest.setArgs(ccArgs);
        instantiateRequest.setTransientMap(Collections.emptyMap());

        Collection<ProposalResponse> responses = channel.sendInstantiationProposal(instantiateRequest, peers);

        System.out.println("Sending transaction to orderer to be committed in the ledger.");
        channel.sendTransaction(responses, client.getUserContext());
        System.out.println("Transaction committed successfully.");
    }

    private static void upgradeChaincode(String ccName, String ccVersion,
                                         Channel channel, HFClient client, Collection<Peer> peers)
            throws InvalidArgumentException, ProposalException {
        System.out.println("Upgrading chaincode " + ccName + " to version " + ccVersion
                + " on channel " + channel.getName() + ".");
        UpgradeProposalRequest upgradeRequest = client.newUpgradeProposalRequest();
        upgradeRequest.setChaincodeName(ccName);
        upgradeRequest.setChaincodeVersion(ccVersion);
        upgradeRequest.setArgs(new ArrayList<>());
        upgradeRequest.setTransientMap(Collections.emptyMap());

        Collection<ProposalResponse> responses = channel.sendUpgradeProposal(upgradeRequest, peers);

        System.out.println("Sending transaction to orderer to be committed in the ledger.");
        channel.sendTransaction(responses, client.getUserContext());
        System.out.println("Transaction committed successfully.");
    }

    private static void sendQuery(String ccName, String function, List<String> args,
                                  Channel channel, HFClient client)
            throws InvalidArgumentException, ProposalException {
        System.out.println("Querying " + channel.getName() + " with function " + function + " using " + ccName + ".");
        QueryByChaincodeRequest query = client.newQueryProposalRequest();
        query.setChaincodeID(ChaincodeID.newBuilder()
                .setName(ccName)
                .build());
        query.setChaincodeName(ccName);
        query.setFcn(function);
        query.setArgs(new ArrayList<>(args));

        ArrayList<ProposalResponse> responses = new ArrayList<>(channel.queryByChaincode(query));
        System.out.println("Response:");
        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        JsonParser parser = new JsonParser();
        JsonElement element = parser.parse(new String(responses.get(0).getChaincodeActionResponsePayload(),
                Charset.defaultCharset()));
        System.out.println(gson.toJson(element));
    }

    private static void invokeTransaction(String ccName, String function, List<String> args,
                                          Channel channel, HFClient client, Collection<Peer> peers)
            throws InvalidArgumentException, ProposalException {
        System.out.println("Sending transaction proposal to " + channel.getName() + " with function "
                + function + " using " + ccName + ".");
        System.out.println("\t Args: " + args);
        TransactionProposalRequest invokeRequest = client.newTransactionProposalRequest();
        invokeRequest.setChaincodeID(ChaincodeID.newBuilder()
                .setName(ccName)
                .build());
        invokeRequest.setChaincodeName(ccName);
        invokeRequest.setFcn(function);
        invokeRequest.setArgs(new ArrayList<>(args));

        Collection<ProposalResponse> responses = channel.sendTransactionProposal(invokeRequest, peers);

        System.out.println("Sending transaction to orderer to be committed in the ledger.");
        channel.sendTransaction(responses, client.getUserContext());
    }

    private enum Operation {
        CHANNEL_JOIN, CC_INSTALL, CC_INSTANTIATE, CC_UPGRADE, CC_QUERY, CC_INVOKE, INVALID
    }
}

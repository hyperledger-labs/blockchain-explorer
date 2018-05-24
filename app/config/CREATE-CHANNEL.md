Create channel
=======



# Requirements
  Setup your own network if you do not have it using [Build your network](http://hyperledger-fabric.readthedocs.io/en/latest/build_network.html) tutorial from Fabric.

# Generate binary config files
    -Use the configtxgen tool to produce the binary config files.
    From the sample directory fabric-samples/

     -Setup FABRIC_CFG_PATH
        `export FABRIC_CFG_PATH=$PWD`
        `./bin/configtxgen -outputBlock channelname.block -profile TwoOrgsOrdererGenesis`
        `./bin/configtxgen -channelID channelname -outputCreateChannelTx channelname.tx -profile TwoOrgsChannel`

        **channelname is the name of your channel you want to create

    -Update "fabric-path" in file /blockchain-explorer/app/config/network-config-tls.yaml to your fabric network path

    -Everytime you create a new channel you need to define it in file:
    /blockchain-explorer/app/config/network-config-tls.yaml
    Search for keyword newchannel, and update it to the name of your new channel

    - Use Web UI ADMIN PANEL to create and manage a channel

[More on "How to create a Hyperledger Fabric channel"](https://fabric-sdk-node.github.io/tutorial-channel-create.html )


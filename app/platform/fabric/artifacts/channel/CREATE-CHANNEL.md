Create channel
=======



# Requirements
  Setup your own network if you do not have it using [Build your network](http://hyperledger-fabric.readthedocs.io/en/latest/build_network.html) tutorial from Fabric.

  [Channel policies remain separate from other channels configured on the same network](http://hyperledger-fabric.readthedocs.io/en/latest/network/network.html)

  -- Adding a new channel
        Organizations are what form and join channels, and channel configurations can be amended to add organizations as the network grows. When adding a new channel to the network, channel policies remain separate from other channels configured on the same network.

# Setup path

     -Setup FABRIC_CFG_PATH
      - `fabric-samples/first-network` - is the location of your fabric samples
      -  `export FABRIC_CFG_PATH=fabric-samples/first-network`
      -  or add to your .bashrc profile
      -  update config.json "configtxgenToolPath":"fabric-path/fabric-samples/bin"
      - "fabric-path/fabric-samples/bin" is the path to the configtxgen tool
     -
# Channel configuration
     -File /blockchain-explorer/app/config/network-config-tls.yaml can be used as a template when creating a new channel
        **newchannel is the name of your channel you want to create

    -Update "fabric-path" in file /blockchain-explorer/app/config/network-config-tls.yaml to your fabric network path

    - Use Web UI ADMIN PANEL to create and manage a channel

[More on "How to create a Hyperledger Fabric channel"](https://fabric-sdk-node.github.io/tutorial-channel-create.html )


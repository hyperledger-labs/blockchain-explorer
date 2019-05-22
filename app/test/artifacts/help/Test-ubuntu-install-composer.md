
<!-- (SPDX-License-Identifier: CC-BY-4.0) -->  <!-- Ensure there is a newline before, and after, this line -->

**How to install Composer on a Ubuntu 16.04**

**Create Another User**

**Step 1: Open new Terminal Run below command**

        Code : sudo adduser playground

You will now be asked to create a password for this new user. After entering a password. You will be asked some general questions (Full Name, Room Number, etc.). These can be left blank if you&#39;d like. Once, you&#39;ve gone through that, you will be asked to confirm if the information is correct, type:

        Code : Y

**Step 2: Grant &quot;playground&quot; User Sudo Rights**
Now we need to grant this new user with sudo rights. To do this run:

        Code : sudo usermod -aG sudo playground

Don&#39;t worry if your terminal didn&#39;t send a response and just went to the next line. That&#39;s normal.

**Step 3: Switch To &quot;playground&quot; User**
Now let&#39;s run:

        Code : su - playground

**Step 4: Downloading Fabric Composer Tools**
Now it&#39;s time to start getting our tools installed. Thankfully, the Hyperledger Fabric team has put all of our required tools into an easy-to-run script. Let&#39;s download that script now by running:

        Code : curl -O https://hyperledger.github.io/composer/latest/prereqs-ubuntu.sh

Now to change permissions run:

        Code : chmod u+x prereqs-ubuntu.sh

Now to install the tooling run: (Note: this will take a few minutes)

        Code : ./prereqs-ubuntu.sh

**Step 5: Logout Then Login**
You will now notice a message &quot;Please logout then login before continuing.&quot; This isn&#39;t just a pre-cautionary suggestion, if you fail to follow this step you will run into some serious issues further on. Believe me, I&#39;ve already tried skipping this step.

If you&#39;re using Putty, just exit the program and re-open it. .  You will need to log back into the &quot;playground&quot; user:

        code : su – playground

**Step 6: Installing Final NPM Packages**
Alright! We&#39;re almost done. Now we need to install some final NPM packages.

Essential CLI tools:

        code : npm install -g composer-cli

Utility for running a REST Server on your machine to expose your business networks as RESTful APIs:

        code : npm install -g composer-rest-server

Useful utility for generating application assets:

        Code : npm install -g generator-hyperledger-composer

Yeoman is a tool for generating applications, which utilises generator-hyperledger-composer:

        Code : npm install -g yo

Browser app for simple editing and testing Business Networks:

        Code : npm install -g composer-playground

**Step 7: Install Hyperledger Fabric**
Now we&#39;ve got all of our tools setup, it&#39;s time to install what we&#39;ve all come here for.. Hyperledger Fabric.
Run:

        Code : mkdir ~/fabric-tools && cd ~/fabric-tools

        Code : curl -O https://raw.githubusercontent.com/hyperledger/composer-tools/master/packages/fabric-dev-servers/fabric-dev-servers.tar.gz

        Code : tar -xvf fabric-dev-servers.tar.gz

Use the scripts you just downloaded and extracted to download a local Hyperledger Fabric runtime:

        Code : cd ~/fabric-tools

        Code : ./downloadFabric.sh

## **Step 8 : Starting and stopping Hyperledger Fabric**

You control your runtime using a set of scripts which you&#39;ll find in ~/fabric-tools if you followed the suggested defaults.

The first time you start up a new runtime, you&#39;ll need to run the start script, then generate a PeerAdmin card:

        Code : cd ~/fabric-tools

        Code : ./startFabric.sh

        Code : ./createPeerAdminCard.sh

You can start and stop your runtime using ~/fabric-tools/stopFabric.sh, and start it again with ~/fabric-tools/startFabric.sh.

At the end of your development session, you run~/fabric-tools/stopFabric.sh and then~/fabric-tools/teardownFabric.sh. Note that if you&#39;ve run the teardown script, the next time you start the runtime, you&#39;ll need to create a new PeerAdmin card just like you did on first time startup

You&#39;re done!
To start your playground server, run:

        Code : composer-playground

It will typically open your browser automatically, at the following address:  [http://localhost:8080/login](http://localhost:8080/login)

You should see thePeerAdmin@hlfv1Card you created with thecreatePeerAdminCardscript on your &quot;My Business Networks&quot; screen in the web app: if you don&#39;t see this, you may not have correctly started up your runtime!

**Appendix : Destory a previous setup**

If you&#39;ve previously used an older version of  **Hyperledger Composer**  and are now setting up a new install, you may want to kill and remove all previous Docker containers, which you can do with these commands:

        Code : docker kill $(docker ps -q)

        Code : docker rm $(docker ps -aq)

        Code : docker rmi $(docker images dev-* -q)

l**Step 9 : Configure to Hyperledger Explorer**

Before Configure the Explorer config.json

Execute the below command and check peer/orderer is running and verify ip too.

        Code : docker ps

you can open the ~/fabric-tools/DevServer\_connectio.json and check , channels , organizations,orderers and peers

**based on that above file configuration we need to configure in Hyperledger Explorer config json ( network-config – name,mspid,peer(requests,events,server-hostname,tls\_cacerts),admin(key,cert),channel and orderers(mspid,server\_hostname,requests,tls\_cacerts).**

{

 &quot;network-config&quot;: {

  &quot;org1&quot;: {

   &quot;name&quot;: &quot;Org1&quot;,

   &quot;mspid&quot;: &quot;Org1MSP&quot;,

   &quot;peer1&quot;: {

    &quot;requests&quot;: &quot;grpc://127.0.0.1:7051&quot;,

    &quot;events&quot;: &quot;grpc://127.0.0.1:7053&quot;,

    &quot;server-hostname&quot;: &quot;peer0.org1.example.com&quot;,

    &quot;tls\_cacerts&quot;: &quot;/home/playground/fabric-tools/fabric-scripts/hlfv11/composer/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt&quot;

   },

   &quot;admin&quot;: {

    &quot;key&quot;: &quot;/home/playground/fabric-tools/fabric-scripts/hlfv11/composer/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore&quot;,

    &quot;cert&quot;: &quot;/home/playground/fabric-tools/fabric-scripts/hlfv11/composer/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/signcerts&quot;

   }

  }

 },

 &quot;channel&quot;: &quot;composerchannel&quot;,

 &quot;orderers&quot;:[

    {

    &quot;mspid&quot;: &quot;OrdererMSP&quot;,

    &quot;server-hostname&quot;:&quot;orderer.example.com&quot;,

    &quot;requests&quot;:&quot;grpc://127.0.0.1:7050&quot;,

    &quot;tls\_cacerts&quot;:&quot;/home/playground/fabric-tools/fabric-scripts/hlfv11/composer/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/tls/ca.crt&quot;

    }

    ],

 &quot;keyValueStore&quot;: &quot;/tmp/fabric-client-kvs&quot;,

 &quot;configtxgenToolPath&quot;: &quot;/home/playground/fabric-samples/bin&quot;,

 &quot;SYNC\_START\_DATE\_FORMAT&quot;:&quot;YYYY/MM/DD&quot;,

 &quot;syncStartDate&quot;:&quot;2018/01/01&quot;,

 &quot;eventWaitTime&quot;: &quot;30000&quot;,

 &quot;license&quot;: &quot;Apache-2.0&quot;,

 &quot;version&quot;: &quot;1.1&quot;

 }

**Step 10 : Run Hyperledger Explorer** :

        Code : cd blockchain-explorer/

        code : ./start.sh (It will have the backend up)

Launch the Hyperledger explorer URL



var ClientScanner = require("./ClientScanner.js");
var helper = require("../../helper.js");
var logger = helper.getLogger("FabricEvent");

process.on('unhandledRejection', up => {
    process.send({ error: up });
    throw up
});

var clientProcessor;

var clientArgs = process.argv.slice(2);
console.log('child pid is ' + process.pid + ' for ' + clientArgs[0] + ' : ' + clientArgs[1]);
console.log('clientArgs: ', clientArgs);

async function start() {
    if (clientArgs.length > 1) {
        try {
            clientProcessor = new ClientScanner(clientArgs[0], clientArgs[1]);
            await clientProcessor.initialize();
        } catch (e) {
            process.send({ error: "Failed to start the client process " + e });
            if (clientProcessor) {
                clientProcessor.close();
            }
            process.exit(1);
        }
    } else {
        process.send({ error: "Client Processor required network name and client name " });
        process.exit(1);
    }
}

start();

process.on('message', (msg) => {
    console.log('Message from parent:', msg);
});



// this function is called when you want the server to die gracefully
// i.e. wait for existing connections
var shutDown = function () {

    if (clientProcessor) {
        clientProcessor.close();
    }
    process.exit(1);
}
// listen for TERM signal .e.g. kill
process.on('SIGTERM', shutDown);
// listen for INT signal e.g. Ctrl-C
process.on('SIGINT', shutDown);
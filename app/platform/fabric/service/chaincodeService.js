/*
*SPDX-License-Identifier: Apache-2.0
*/
var child_process = require("child_process");
var fs = require('fs');
// var path = "/chaincode/chaincode_example02/go/";
var path = "/home/maedwards/example_cc/";
// var path = "/doesntexist/nope";
var regXjs = "[a-z,A-Z,0-9]*.js$"
var regXgo = "[a-z,A-Z,0-9]*.go$"
var location;
const errors = {
    lnf: "Location not found",
    erf: "Error reading file"
};
async function loadChaincodeSrc(path) {
    if (path.substring(0, 10) === "github.com") {
        path = path.slice(10);
    }
    try {
        location = await child_process.execSync('locate -r ' + path + regXgo).toString();
    } catch (error) {
        try {
            location = await child_process.execSync('locate -r ' + path + regXjs).toString();
        } catch (error) {
            try {
                location = await child_process.execSync('locate -r ' + path).toString();
            } catch (error) {
                location = errors.lnf;
            }
        }
    }
    if (location === errors.lnf) {
        return errors.lnf;
    }
    var ccSource;
    try {
       ccSource = await child_process.execSync('cat ' + location);

    } catch (error) {
        return  errors.erf;
    }
    ccSource = ccSource.toString();
    return ccSource;

};

loadChaincodeSrc(path);
// getPath();
exports.loadChaincodeSrc = loadChaincodeSrc
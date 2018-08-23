/*
 Copyright ONECHAIN 2017 All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

'use strict';
var log4js = require('log4js/lib/log4js');
var appList = [];

var path = require('path');
var fs = require('fs-extra');

function readAllFiles(dir) {
  var files = fs.readdirSync(dir);
  var certs = [];
  files.forEach(file_name => {
    let file_path = path.join(dir, file_name);
    let data = fs.readFileSync(file_path);
    certs.push(data);
  });
  return certs;
}

/*
Please assign the logger with the filename for the application logging
and assign the logger with "pgservice" for database logging for any filename. Please find an example below.
To stacktrace, please pass the error.stack object to the logger. If there is no error.stack object pass in a
string with description.

var helper = require("./app/helper");
var logger = helper.getLogger("main");
logger.setLevel('INFO');


*/

var getLogger = function(moduleName) {
  if (moduleName == 'pgservice') {
    var logger = log4js.getLogger('pgservice');
  } else {
    appList.push(moduleName);
    var logger = log4js.getLogger(moduleName);
  }

  var appLog = 'logs/app/app.log';
  var dbLog = 'logs/db/db.log';
  fs.ensureFileSync(appLog);
  fs.ensureFileSync(dbLog);
  log4js.configure({
    appenders: [
      {
        type: 'dateFile',
        filename: appLog,
        pattern: '-yyyy-MM-dd',
        category: appList
      },
      {
        type: 'dateFile',
        filename: dbLog,
        pattern: '-yyyy-MM-dd',
        category: ['pgservice']
      }
    ]
  });
  logger.setLevel('DEBUG');
  return logger;
};

exports.getLogger = getLogger;
exports.readAllFiles = readAllFiles;

'use strict';
const fs = require('fs');
let data = JSON.stringify(process.env);
fs.writeFileSync('/tmp/process.env.json', data);

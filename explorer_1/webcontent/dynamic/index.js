/*Copyright DTCC 2016 All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
	
	http://www.apache.org/licenses/LICENSE-2.0
	
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.*/
var path = require('path')
	, fs = require('fs');

function req(name) {
	var module = require("./" + name);
	delete exports[name];
	return exports[name] = module;
}

fs.readdirSync(__dirname).forEach(function(file) {
	if ((file === 'index.js') || (file[0] === '_')) { return; }
	var ext = path.extname(file);
	var stats = fs.statSync(__dirname + '/' + file);
	if (stats.isFile() && !(ext in require.extensions)) { return; }
	var basename = path.basename(file, '.js');
  	exports.__defineGetter__(basename, function(){ return req(basename); });
});

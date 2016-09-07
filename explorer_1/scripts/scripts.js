/*
Copyright DTCC 2016 All Rights Reserved.

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

var App = angular.module("explorer", ['ngAnimate']);
const REST_ENDPOINT = '';

// http request to get get chain information
App.factory("SERVICE_HEIGHT", function(){
	return{
		getData: function(){
			return ledgerData.chain;
	}}
});

/* http request to retrieve information related to a specific block number found on the chain, chain_index is the block number that we wish to retrieve
Since each request comes back at a different time and out of order, the order with which we recieve the response cannot be tracked, array_location is thus passed in and is added
as metadata to keep track of the 0-9 index where the data should be added to the array in the BLOCKS_and_TRANSACTIONS controller that holds the final retrieved inorder result
avoids sorting in the future */
App.factory("SERVICE_BLOCK", function($http) {
   return {
     getData: function(chain_index, array_location) {
     	// initially returns only a promise 
       return $http.get(REST_ENDPOINT +"/chain/blocks/"+ chain_index).then(function(result) {
       		// add metadata 
       		result.data.location = array_location; // will always be 0-9 since the explorer displays the 10 most recent blocks
       		result.data.block_origin = chain_index; // can be any number from 0 to the current height of the chain 
           return result.data // retrieved data returned only after response from server is made 
       });
   }
}
});

// http request to get block information by block#, used in search, doesn't add any metadata
App.factory("REST_SERVICE_BLOCK", function($http) {
	return {
		getData: function(chain_index) {
			return ledgerData.blocks[chain_index];
		}}
});

// http request to get transaction information by UUID, used in search 
App.factory("REST_SERVICE_TRANSACTIONS", function($http){
	return{
		getData: function(uuid){
			return $http.get(REST_ENDPOINT+ "/transactions/"+ uuid).then(function(result){
				return result.data;
			});
		}}
});

/* factory to share information between controllers, the BLOCK controller gets the 10 most recent blocks, parses the information 
and then puts the all the transactions from the 10 recent blocks into an array that gets broadcasted to the TRANSACTION controller that displays it. Likewise, chain
information also broadcasted to controllers one retrieved
*/
App.factory("SHARE_INFORMATION", function($rootScope){
	var BlockInfo = {};

	BlockInfo.load_broadcast_transactions = function(data){
		this.transactions = data;
		this.broadcastItem();
	}
	BlockInfo.load_broadcast_chain = function(data){
		this.chain = data;
		this.broadcastItem();
	}
	BlockInfo.broadcastItem = function(){
		$rootScope.$broadcast("handle_broadcast");
	}
	
	var rc= $rootScope;
	var latestBlock = -1;
	window.addEventListener("load", function () {
		var socket = io('http://'+window.location.host);
		
		socket.on('update', function (msg) {
			var data = JSON.parse(msg);
			if(data.chain) {
				ledgerData.chain = data.chain;
				ledgerData.chain.cssClass = 'fade';
			}
			if(data.peers) {
				for( var i = 0; i < data.peers.length; i++) {
					data.peers[i].cssClass='fade';
				}
				ledgerData.peers = data.peers;
			}
			if(data.blocks) {
				if(latestBlock > 0)
					for( var i = latestBlock; i < ledgerData.blocks.length; i++) {
						ledgerData.blocks[i].cssClass= undefined;
						for( var j = 0; j < ledgerData.blocks[i].transactions.length; j++) {
							ledgerData.blocks[i].transactions[j].cssClass=undefined;
						}
					}
				latestBlock = ledgerData.blocks.length;
				for( var i = 0; i < data.blocks.length; i++) {
					data.blocks[i].cssClass='fade';
					for( var j = 0; j < data.blocks[i].transactions.length; j++) {
						data.blocks[i].transactions[j].cssClass='fade';
					}
				}
				ledgerData.blocks = ledgerData.blocks.concat(data.blocks);
			}
			BlockInfo.chain = data.chain;
			rc.$broadcast("handle_broadcast_upd");	
			
		});
		
		 socket.on('connect', function(){
			 
			 console.log('connect')
		 });

		socket.on('disconnect', function(){
			  
			console.log('disconnect')
		});

	})

	return BlockInfo;
})

/*-----------------------------Controllers for HTML div elements------------------------------------ */

App.controller("HEADER", 
	function(){	
	}
)

App.controller("NAVIGATION", 
	function(){
	}
)


App.controller("CURRENT", 
	function($scope, SERVICE_HEIGHT, SHARE_INFORMATION)
	{
		var loadFunc = function() { 
			$scope.info = ledgerData.chain;
			SHARE_INFORMATION.load_broadcast_chain($scope.info);
		}
		$scope.$on("handle_broadcast_upd",function(){
 			$scope.info = {};
			setTimeout(function(){
				$scope.info = ledgerData.chain;
				$scope.$apply();
			},30);
			
 		});
		loadFunc();
	}
)

App.controller("SEARCH", 
	function($scope, REST_SERVICE_TRANSACTIONS, REST_SERVICE_BLOCK)
	{
	    	$scope.search = function(){
	    		$scope.found = 0;
			// first we search by UUID
			REST_SERVICE_TRANSACTIONS.getData($scope.response).then(function(data){
				$scope.info = data;
				$scope.found = 1;
	
				// convert transaction seconds to date 
				var date = new Date(null);
				date.setSeconds(data.timestamp.seconds);
				data.date = date;
				
				// updated variables for output						   
		    		$scope.message = "Transaction succesfully found";
		    		$scope.text1 = "Chaincode ID: " +$scope.info.chaincodeID;
		    		$scope.text2 = "UUID: " +$scope.info.uuid;
		    		$scope.text3 = "Seconds: " +$scope.info.timestamp.seconds;
		    		$scope.text4 = "Nanos: " +$scope.info.timestamp.nanos;
		    		$scope.text5 = null;
		    		$scope.text6 = null;
		    		$scope.text7 = "Date: " +$scope.info.date ;
			});
			// Search by block number
			var data = REST_SERVICE_BLOCK.getData($scope.response);
			if(data){
				$scope.info = data;
				$scope.found =1;

				// convert block timestamp
				var date = new Date(null);
				date.setSeconds(data.nonHashData.localLedgerCommitTimestamp.seconds);
				date.toISOString().substr(11, 8);
				data.nonHashData.localLedgerCommitTimestamp.date = date;

				//convert timestamps of all transactions on block
				for(var k=0; k<data.transactions.length; k++){
					var date2 = new Date(null);
					date2.setSeconds(data.transactions[k].timestamp.seconds);
					data.transactions[k].date = date2;
				}

		    		$scope.message = "Block succsefully found";
		    		$scope.text1 =  "StateHash: " + $scope.info.stateHash;
		    		$scope.text2 =  "Previous Hash: " + $scope.info.previousBlockHash;
		    		$scope.text3 =  "Consensus Meta: " + ($scope.info.consensusMetadata||'');
		    		$scope.text4 =  "Seconds: " + $scope.info.nonHashData.localLedgerCommitTimestamp.seconds;
		    		$scope.text5 =  "Nanos: " + $scope.info.nonHashData.localLedgerCommitTimestamp.nanos;
		    		$scope.text6 = null; // clear in to avoid displaying previous transaciton count if new block search has 0 
		    		$scope.text6 = 	"Transactions: " + $scope.info.transactions.length;
		    		$scope.text7 =  "Date: " + ($scope.info.date||'');
		    		
		    		// display "View Transactions" button at bottom of information panel
		    		if($scope.info.transactions.length != null){
	     				document.getElementById("change").style.display = "block";
	     			} else {
	     				$scope.text6 = 0;	
	     				document.getElementById("change").style.display = "none";
	     			}
			};	

			// if nothing is found searching by UUID or block number
			if($scope.found == 0){
				$scope.message = "no information found";
				$scope.info = null;
				$scope.text1 = null;
				$scope.text2 = null;
				$scope.text3 = null;
				$scope.text4 =  null;
				$scope.text5 = null;
				$scope.text6 = null;
				$scope.text7 = null;
				document.getElementById("change").style.display = "none";
			}
			
			//animate slideout only after the the information is ready to display
			setTimeout(function(){ 
		    		if(document.getElementById("panel").style.display != "none"){
				// don't slide since panel is already visible
				} else{
					$(document).ready(function(){
					$("#panel").slideToggle(1000);});	
				}}, 400);
		};
		$scope.clear = function(){
			$scope.response = "";
			if(document.getElementById("panel").style.display == "none"){
				// already hidden, don't wan't to animate again
				$scope.found= 0;
				$scope.info = null;
			    	$scope.message = null;
				$scope.text1 =  null;
				$scope.text2 =  null;
			    	$scope.text3 =  null;
			    	$scope.text4 =  null;
			    	$scope.text5 =  null;
			    	$scope.text6 = null; 
			    	$scope.text7 = null;
			}
			else{
				// panel is visible, we need to hide it, JQuery used for animation 	
				$(document).ready(function(){
					$("#panel").slideToggle(1000);		
				});	
				// after slideout animation is complete, clear everything
				setTimeout(function(){ 
					$scope.found = 0;
					$scope.info = null;
					$scope.message = null;
					$scope.text1 =  null;
					$scope.text2 =  null;
					$scope.text3 =  null;
					$scope.text4 =  null;
					$scope.text5 =  null;
					$scope.text6 = null; 
					$scope.text7 = null;
				}, 100);
			}
		}
	}
)

App.controller("NETWORK", 
	function($scope)
	{
		$scope.info = ledgerData.peers;
		$scope.$on("handle_broadcast_upd",function(){
 			$scope.info = {};
			setTimeout(function(){
				$scope.info = ledgerData.peers;
				$scope.$apply();
			},20);
			
 		});
	}
)

// directive for dependency injection, creates html element that gets injected into index.html with charts
App.directive("barsChart", function ($parse) {
     var object = {
       		restrict: "E",
        	replace: false,
        	scope: {data: "=chartData"},
         	link: function (scope, element, attrs) {
			var chart = d3.select(element[0]);
			 chart.append("div").attr("class", "chart")
			 	.selectAll("div")
				.data(scope.data).enter().append("div")
				.transition().ease("elastic")
				.style("width", function(d) { return d + "%"; })
				.text(function(d) { return d; })
        } 
      };
      return object;
});

App.controller("GRAPH",
	function($scope){
		// TODO, just placeholders atm with no meaningful data
		$scope.latency = 50;
		$scope.capacity = "10.1K";
		$scope.data_1= [10,20,30,40,60];
		$scope.data_2= [100,40,20,90,60];

		$scope.data = {
			Options: [
				{id: "1", name: "Option A"},
				{id: "2", name: "Option B"},
				{id: "3", name: "Option C"}
				],
			selected: {id: "1", name: "Option A"}
		};
		$scope.data2 = {
			Options: [
				{id: "1", name: "Option A"},
				{id: "2", name: "Option B"},
				{id: "3", name: "Option C"}
				],
			selected: {id: "1", name: "Option A"}
		};
	}
);

App.controller("BAR_GRAPH", 
	function($scope){
		//TODO, at the moment, data is meaningless, doesn't show anythinig useful
		$scope.graph_data = [{x: 2,y: 4}, {x: 19,y: 21}, {x: 38,y: 8}, {x: 63,y: 28}, {x: 77,y: 6}, {x: 91,y: 60}];

		var Bar_graph = d3.select("#bar_graph"),

			// set width, height, margins
			Width = 500,
			Height = 400,
			Margins = {top: 50, bottom: 50, left: 50, right: 50},

			// set x and y domain and range
			xRange = d3.scale.ordinal().rangeRoundBands([Margins.left, Width - Margins.right], 0.1).domain($scope.graph_data.map(function(d) {
				return d.x;
			}));

			yRange = d3.scale.linear().range([Height - Margins.top, Margins.bottom]).domain([0, d3.max($scope.graph_data, function(d) { 
				return d.y; 
			})]);

			// generate x axis
			xAxis = d3.svg.axis()
				.scale(xRange)
				.tickSize(3)
				.tickSubdivide(true),

			// generate y axis
			yAxis = d3.svg.axis()
				.scale(yRange)
				.tickSize(2)
				.orient("left")
				.tickSubdivide(true);

			// draw x axis
			Bar_graph.append("svg:g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + (Height - Margins.bottom) + ")")
				.call(xAxis);

			// draw y axis
			Bar_graph.append("svg:g")
				.attr("class", "y axis")
				.attr("transform", "translate(" + (Margins.left) + ",0)")
				.call(yAxis);

			// draw graph title 
			Bar_graph.append("text")
				.attr("x", (Width / 2))             
				.attr("y", 20)
				.attr("text-anchor", "middle")  
				.style("font-size", "20px") 
				.style("fill", "#FFFFFF")
				.style("text-decoration", "underline")  
				.text("X vs Y Bar Graph");

			// draw x axis title
			Bar_graph.append("text")
				.attr("x", (Width / 2))             
				.attr("y", Height- 15)
				.attr("text-anchor", "middle")  
				.style("font-size", "14px")
				.style("fill", "#FFFFFF") 
				.text("X axis");

			// draw y axis title
			Bar_graph.append("text")
				.attr("x", -170)             
				.attr("y", 20)
				.style("font-size", "14px")
				.style("text-anchor", "end")
				.style("fill", "#FFFFFF")
				.attr("transform", "rotate(-90)" )
				.text("Y axis");

			// draw data
			Bar_graph.selectAll("rect")
				.data($scope.graph_data)
				.enter()
				.append("rect")
				.attr("x", function(d) {  return xRange(d.x); })
				.attr("y", function(d) { return yRange(d.y); })
				.attr("width", xRange.rangeBand()) 
				.attr("height", function(d) { return ((Height - Margins.bottom) - yRange(d.y)); })
				.attr("fill", "#103E69");  
})

App.controller("LINE_GRAPH",
	function($scope){
		//TODO, at the moment, data is meaningless, doesn't show anythinig useful
		$scope.data_4= [{x: 10,y: 5}, {x: 14,y: 11}, {x: 21,y: 13} , {x: 27,y: 21}, {x: 41,y: 27}];

		var graph = d3.select("#line_graph"),

			// set height, width and margins
			Height = 400
			Width = 500
			Margins = { top: 50, bottom:50, left: 50, right: 20},

			// set range and domain for x
			xRange = d3.scale.linear().range([Margins.left, Width - Margins.right]).domain([d3.min($scope.data_4, function(d) {
				return d.x;
			}), 
				d3.max($scope.data_4, function(d) { 
					return d.x; 
			})]),

			// set range and domain for y 
			yRange = d3.scale.linear().range([Height - Margins.top, Margins.bottom]).domain([d3.min($scope.data_4, function(d) {
				return d.y;
			}), 
				d3.max($scope.data_4, function(d) {
					return d.y;
			})]);

			// generate y axis
			xAxis = d3.svg.axis()
				.scale(xRange)
				.tickSize(2)
				.ticks(10)
				.tickSubdivide(true);

			// generate y axis
			yAxis = d3.svg.axis()
				.scale(yRange)
				.tickSize(2)
				.ticks(10)
				.orient("left")
				.tickSubdivide(true);

			// draw x axis
			graph.append("svg:g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + (Height - Margins.bottom) + ")")
				.call(xAxis);

			// draw y axis
			graph.append("svg:g")
				.attr("class", "y axis")
				.attr("transform", "translate(" + (Margins.left) + ",0)")
				.call(yAxis);

			// draw graph title
			graph.append("text")
				.attr("x", (Width / 2))             
				.attr("y", 20)
				.attr("text-anchor", "middle") 
				.style("fill", "#FFFFFF") 
				.style("font-size", "20px") 
				.style("text-decoration", "underline")  
				.text("X vs Y Line Graph");

			// draw x axis label
			graph.append("text")
				.attr("x", (Width / 2))             
				.attr("y", Height- 15)
				.attr("text-anchor", "middle")  
				.style("font-size", "14px") 
				.style("fill", "#FFFFFF")
				.text("X axis");

			// draw y axis label
			graph.append("text")
				.attr("x", -170)             
				.attr("y", 20)
				.style("font-size", "14px")
				.style("text-anchor", "end")
				.style("fill", "#FFFFFF")
				.attr("transform", "rotate(-90)" )
				.text("Y axis");

			 // generate line
			var generate_line = d3.svg.line()
				.x(function(d) {
					return xRange(d.x);
				})
				.y(function(d) {
					return yRange(d.y);
				})
				.interpolate("linear");
				
			// draw line on graph
			graph.append("svg:path")
				.attr("d", generate_line($scope.data_4))
				.attr("stroke", "#FFFFFF")
				.attr("fill", "none")
				.attr("stroke-width", 3);
	}
)

App.controller("TRIGGER",
	function($scope){
		// collapse and expand navigation menu in mobile/smaller resolution view 
		$scope.activate = function(){
			x = document.getElementById("navigation").style.display;
				if(x =="none"){
					document.getElementById("navigation").style.display = "block";
				} else {
					document.getElementById("navigation").style.display = "none";
				}
			}
	}
)

App.controller("BLOCKS", 
	function($scope, SERVICE_BLOCK, SERVICE_HEIGHT,SHARE_INFORMATION){
		// Used to update which block or transaction information should display once user chooses view or expand button from table
		$scope.selected = 0;
		$scope.initial = 0;
		
		$scope.loader= {
			loading: true,
		};
		$scope.hideloader = function(){
			$scope.loader.loading = false;
		}

		$scope.update = function(height){
			
			if(ledgerData.blocks.length > 10)
				$scope.number_of_blocks_to_display = 10;
			else
				$scope.number_of_blocks_to_display = height;
			
			var array_location = 0; // array location server response must be stored at
			var count = 0; // number of responses returned from server
			var len = $scope.info.length;
			$scope.info= [];
			$scope.info2= [];
			//for(var chain_index = height; chain_index>(height-len) && chain_index > 0; chain_index--){
			for(var chain_index = 0; chain_index < height; chain_index++){
				var data = ledgerData.blocks[height - chain_index]; 
				var date = new Date(null);
				date.setSeconds(data.nonHashData.localLedgerCommitTimestamp.seconds);
				date.toISOString().substr(11, 8);
				data.nonHashData.localLedgerCommitTimestamp.date = date;
				// using the array index that we passed in previously and added as metadata, we use it to store it in the correct array index, avoids sorting when mulitple requests happen asynchronously
				data.location = count;
				data.block_origin = height - chain_index;
				$scope.info2[data.location] = data;
				if( data.transactions && data.transactions.length )
					for(var k=0; k<data.transactions.length; k++){
						var date2 = new Date(null);
						date2.setSeconds(data.transactions[k].timestamp.seconds);
						data.transactions[k].date = date2;
						data.transactions[k].origin = data.block_origin;
					}
				
				var temp = data.block_origin;
				$scope.trans2[height-temp] = data.transactions;
				count++;

				// once all 10 GET requests are recieved and correctly stored inorder in array, we turn off loading symbol, and proceed to get all transactions from recieved blocks
				if(count == $scope.number_of_blocks_to_display || chain_index+1 == height){
					$scope.hideloader();
					
					$scope.trans = [];
					for(var i=0; i<$scope.trans2.length; i++){
						$scope.trans = $scope.trans.concat($scope.trans2[i]);
					}
					// after all the block information is ready, $scope.range is initialized which is used in ng-repeat to itterate through all blocks, initialzed now to maintain smooth animation
					$scope.range = [0,1,2,3,4,5,6,7,8,9];
					setTimeout(function() { $scope.info = $scope.info.concat($scope.info2); $scope.$apply(); }, 40);
					// once all the transactions are loaded, then we broadcast the information to the Transaction controller that will use it to display the information
					setTimeout(function() {SHARE_INFORMATION.load_broadcast_transactions($scope.trans); }, 60);
				}
				array_location++;
			}
		}
		
		// array used to keep track of 10 most recent blocks, if more than 10 would like to be dislpayed at a time, change $scope.number_of_block_to_display and $scope.range in $scope.update()
		if(ledgerData.blocks.length > 10)
			$scope.number_of_blocks_to_display = 10;
		else
			$scope.number_of_blocks_to_display = ledgerData.length;
		$scope.info = new Array($scope.number_of_blocks_to_display);
	
		// will be used to keep track of most recent transactions, initially array of objects with transcations from each block, in the end concated to $scope.trans with a single transaction at each index
		$scope.trans2 = new Array($scope.number_of_blocks_to_display);

		// broadcast reciever get chain information from CURRENT controller that initially calls http request, once height is known, specific blocks begin to be retrieved in $scope.update()
		$scope.$on("handle_broadcast",function(){
 			$scope.size = SHARE_INFORMATION.chain.height;
      			// if 0, then it's the initial startup of the controller, only run at the beggining once to get information
			if($scope.initial == 0){
				$scope.initial++;
				$scope.update($scope.size-1);
			}
 		});
		$scope.$on("handle_broadcast_upd",function(){
			$scope.size = SHARE_INFORMATION.chain.height;
      		$scope.update($scope.size-1);
 		});

		// updates selected block number and displays form with transaction info based on selection
		$scope.Update_selected_block = function(x){
			$scope.selected = x;
			document.forms["change2"].submit();
		}
	}
)
App.controller("TRANSACTIONS",
 	function(SHARE_INFORMATION, $scope){

 		// controls number of rows to display in the table, initially set to 10
		$scope.row_amount2 = 10;

		/* used to display form with extra transaction information, onclick, transaction_selected is set to the $index of the table row, the displayed form knows
		which transaction information to display getElementById looking at this number*/
		$scope.transaction_selected = 0;

		// loading icon, is displayed while data is loading
		$scope.loader= {
			loading: true,
		};
		$scope.hideloader = function(){
			$scope.loader.loading = false;
		}

		// handle recieving information from the BLOCKS controller that initally calls the http requests
 		$scope.$on("handle_broadcast",function(){
 			$scope.trans = SHARE_INFORMATION.transactions;
 			$scope.hideloader();
			$scope.$apply()
 		});

 		// update seleted2 index and update form with corresponding transaction info
 		$scope.Update_transaction_selection_index = function(x){
			$scope.transaction_selected = x;
			document.forms["change3"].submit();
		}
})
// used to keep navigation menu displayed horizontally when resolution change from menu button to navigation bar, runs whenever window resizes 
function restore() {
	var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
	if(width > 600 ){
		document.getElementById("navigation").style.display = "block";
	} else {
		document.getElementById("navigation").style.display = "none";
	} 
}

import common from '../common';

module.exports = function(id) {
	var extended = {
		name: 'blockinfo',
		title: 'blockinfo',
		size: 'medium',
		widgetId: id, //needed for dashboard

		hideLink: true,

		customButtons: '<li><i class="show_bock_detailorgin fa fa-expand"></i></li>',

		template: _.template('<div class="info-table"> <table style="width: 100%; table-layout: fixed;" class="table table-striped"> ' +
			'<tbody><tr> <td  style="width: 120px;">number</td> <td class="value" contentEditable="false" style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden;"><%= res.number %></td> </tr>' +
			'<tr> <td  style="width: 120px;">previous_hash</td> <td class="value" contentEditable="false" style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden;"><%= res.previous_hash %></td> </tr>' +
			'<tr> <td  style="width: 120px;">data_hash</td> <td class="value" contentEditable="false" style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden;"><%= res.data_hash %></td> </tr>' +
			'<tr><td style="width: 100px;">Transactions</td><td style="text-overflow: ellipsis; overflow: hidden;"><%= transtions %></td></tr>'+
			'</tbody> </table> <div>'),

		templateTxnRow: _.template('<tr><td style="width: 100px;">Transactions</td><td style="text-overflow: ellipsis; overflow: hidden;"><%= value %></td></tr>'),



		setData: function(data) {
			this.data = data;
			this.title = 'Block #' + this.data.a;
		},



		fetch: function() {


			var _this = this;
			var bocknum = _this.data.bocknum;

			//alert( bocknum );

			$.when(

				utils.load({ url: '/api/block/getinfo' , data:{number:bocknum} }),//channellist

			).fail(function (res) {




			}).done(function (res) {

				//Dashboard.render.widget(_this.name, _this.shell.tpl);
				//alert('I am blockinfo !!!!!'+_this.data.c.currchannel);

				_this.title = 'Block #' + _this.data.bocknum;

				var transtions = res.transactions;
				var transtions_str = '';

				if(transtions != null ){

					var txnHtml = [];

					_.each(transtions, function(txn) {
						txnHtml.push('<a href="#">' + txn.payload.header.channel_header.tx_id  + '</a>')
					});

					transtions_str = txnHtml.join('<br/>');



				}else{
					transtions_str = " ";
				}



				$('#widget-' + _this.shell.id).css({
					'height': '240px',
					'margin-bottom': '10px',
					'overflow-x': 'hidden',
					'width': '100%'
				}).html( _this.template({
					res: res,
					transtions:transtions_str
				}) );



				$('#widget-shell-' + _this.shell.id + ' .panel-title span').html(_this.title);

				$('#widget-shell-' + _this.shell.id + ' i.show_bock_detailorgin').unbind("click");
				$('#widget-shell-' + _this.shell.id + ' i.show_bock_detailorgin').click(function(e) {

					openblockdetail(_this.data.bocknum);
				});


				$('#widget-' + _this.shell.id + ' a').click(function(e) {

					e.preventDefault();
					Dashboard.show({ widgetId: 'txdetail', section: 'channel', data: {txid:$(this).text()}, refetch: true });

				});

				_this.postRender();
				$(document).trigger("WidgetInternalEvent", ["widget|rendered|" + _this.name]);


			})


		},


	};


	var widget = _.extend({}, widgetRoot, extended);

	// register presence with screen manager
	Dashboard.addWidget(widget);
};

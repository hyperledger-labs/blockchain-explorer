
module.exports = function(id) {
	var extended = {
		name: 'txdetail',
		title: 'Txdetail',
		size: 'medium',
		widgetId: id, //needed for dashboard

		hideLink: true,

        customButtons: '<li><i id="button_showtxjson" class="show_tx_detailorgin1 fa fa-expand"></i></li>',


		template: _.template('<div class="info-table"> <table style="width: 100%; table-layout: fixed;" class="table table-striped"> ' +
			''+
			'<tbody>'+
            '<tr> <td  style="width: 120px;">tx_id</td> <td class="value" contentEditable="false" style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden;"><%=res.tx_id %></td> </tr>' +
			'<tr> <td  style="width: 120px;">timestamp</td> <td class="value" contentEditable="false" style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden;"><%=res.timestamp %></td> </tr>' +
			'<tr> <td  style="width: 120px;">channel_id</td> <td class="value" contentEditable="false" style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden;"><%=res.channel_id %></td> </tr>' +
			'<tr> <td  style="width: 120px;">type</td> <td class="value" contentEditable="false" style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden;"><%=res.type %> </td> </tr>' +
			'</tbody> </table> <div>'),



        setData: function(data) {

		    this.data = data;

            if( this.data.txid != '0' )
                this.title = 'Transaction #' + this.data.txid;
            else
                this.title = 'No Transaction ';

		},



        /*

		render: function() {

			//Dashboard.render.widget(this.name, this.shell.tpl);

            this.fetch();

			$('#widget-' + this.shell.id).css({
				'height': '240px',
				'margin-bottom': '10px',
				'overflow-x': 'hidden',
				'width': '100%'
			}).html( this.template({
				app: "",
				desc: "",
				numUser: "",
				url: ""
			}) );
			this.postRender();
			$(document).trigger("WidgetInternalEvent", ["widget|rendered|" + this.name]);
		},

        */


        fetch: function() {


            var _this = this;


            //alert( bocknum );

            $.when(

                utils.load({ url: '/api/tx/getinfo' , data:{ txid:this.data.txid } } )

            ).fail(function (res) {




            }).done(function (res) {

                //Dashboard.render.widget(_this.name, _this.shell.tpl);
                //alert('I am blockinfo !!!!!'+_this.data.c.currchannel);

                _this.title = 'Transaction' ;

                if( _this.data.txid != '0' )
                    _this.title = 'Transaction' ;
                else
                    _this.title = 'No Transaction ';



                /*var transtions = res.transactions;
                var transtions_str = '';

                if(transtions != null ){

                    var txnHtml = [];

                    _.each(transtions, function(txn) {
                        txnHtml.push('<a href="#">' + txn.payload.header.channel_header.tx_id  + '</a>')
                    });

                    transtions_str = txnHtml.join('<br/>');



                }else{
                    transtions_str = " ";
                }*/

                if( _this.data.txid != '0' ){


                    $('#widget-' + _this.shell.id).css({
                        'height': '240px',
                        'margin-bottom': '10px',
                        'overflow-x': 'hidden',
                        'width': '100%'
                    }).html( _this.template({
                        res: res,test:'ddd'

                    }) );

                }



                $('#widget-shell-' + _this.shell.id + ' .panel-title span').html(_this.title);

                $('#button_showtxjson').unbind("click");

                $('#button_showtxjson').click(function(e) {
                    e.preventDefault();
                    opentxdetail(_this.data.txid);
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

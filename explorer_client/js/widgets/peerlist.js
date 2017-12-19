
module.exports = function(id) {
	var extended = {
		name: 'peerlist',
		title: 'peerlist',
		size: 'medium',
		widgetId: id, //needed for dashboard
		url: 'peerlist',
		hideLink: true,


		template: _.template('<div class="info-table"> '+
			'<table style="width: 100%; table-layout: fixed;" class="table table-striped">' +
			'<thead style="font-weight: bold;">'+
			'<tr><td width="20%">org</td><td width="20%">request</td></tr></thead>'+
			'<tbody><%= rows %></tbody>'+
			' </table> <div>'),

		templateRow: _.template('<tr> <td><%=server_hostname%></td><td><%= requests %></td></tr>'),
		fetch: function() {			
			var _this = this;
			var rows = [];
			$.when(
                utils.load({ url: 'peerlist' }),
            ).done(function(data) {
               
                data.forEach(function(item,index){
					rows.push(_this.templateRow(item))
                })

				$('#widget-' + _this.shell.id).html( _this.template({ rows: rows.join('') }) );
				_this.postFetch();
            })			
		}
	};
		
	var widget = _.extend({}, widgetRoot, extended);

	// register presence with screen manager
	Dashboard.addWidget(widget);
};

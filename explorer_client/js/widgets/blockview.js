
module.exports = function(id) {
	var extended = {
		name: 'blockview',
		title: 'Blockview',
		size: 'small',
		widgetId: id, //needed for dashboard

		hideLink: true,


		template: _.template(
			'  <div class="form-group">' +
			'    <label for="block-id">Identifier [number, hash, tag]</label>' +
			'    <input type="text" class="form-control" id="block-id">' +
			'  </div>'+
			'  <div class="radio">' +
			'    <label>' +
			'      <input type="radio" id="searchType" name="searchType" value="block" checked="checked"/>' +
			'      Block' +
			'    </label>' +
			'  </div>' +
			'  <div class="radio">' +
			'    <label>' +
			'      <input type="radio" id="searchType" name="searchType" value="txn"/>' +
			'      Transaction' +
			'    </label>' +
			'  </div>' +
			'  <div class="form-group pull-right">' +
			'    <button type="button" class="btn btn-primary">Find</button>' +
			'  </div>'+
			'  <div id="notification">' +
			'  </div>'),




		render: function() {
			Dashboard.render.widget(this.name, this.shell.tpl);
			this.fetch();

			$('#widget-' + this.shell.id).css({
				'height': '240px',
				'margin-bottom': '10px',
				'overflow-x': 'hidden',
				'width': '100%'
			}).html( this.template() );


			$('#widget-' + this.shell.id + ' button').click(this._handler);


			this.postRender();
			$(document).trigger("WidgetInternalEvent", ["widget|rendered|" + this.name]);


		},

		_handler: function(ev) {
			var _this = widget,
				id = $('#widget-' + _this.shell.id + ' #block-id'),
				type = $('#widget-' + _this.shell.id + ' #searchType:checked');

			if (id.val() ) {

				if( type.val() == 'block' ){

					Dashboard.show({ widgetId: 'blockinfo', section: 'channel', data: {bocknum:id.val()}, refetch: true });

				}else if( type.val() == 'txn'){

					Dashboard.show({ widgetId: 'txdetail', section: 'channel', data: {txid:id.val()}, refetch: true });


				}

				//Dashboard.show({ widgetId: type.val() + '-detail', section: 'explorer', data: id.val(), refetch: true });


			}

		}

	};


	var widget = _.extend({}, widgetRoot, extended);

	// register presence with screen manager
	Dashboard.addWidget(widget);
};

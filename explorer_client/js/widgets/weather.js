
module.exports = function(id) {
	var extended = {
		title: 'Weather',
		size: 'third',
		widgetId: id,

		hideLink: true,

		template: _.template('<i class="fa fa-sun-o fa-5x slow-spin weather-container" aria-hidden="true"></i>'),

		render: function() {
			Dashboard.render.widget(this.name, this.shell.tpl);

			this.fetch();

			$('#widget-' + this.shell.id).css({
				'height': '240px',
				'margin-bottom': '10px',
				'overflow-x': 'hidden',
				'width': '100%'
			}).html( this.template() );

			this.postRender();
			$(document).trigger("WidgetInternalEvent", ["widget|rendered|" + this.name]);
		},
	};

	var widget = _.extend({}, widgetRoot, extended);

	// register presence with screen manager
	Dashboard.addWidget(widget);
};

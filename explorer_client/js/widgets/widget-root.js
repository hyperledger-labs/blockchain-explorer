/**
 *	Widget template.
 *
 *	Loading flow:
 *		1. Register in a section for displaying
 *		2. Widget is pulled down
 *		3. addWidget called on screenManager
 *		4. screenManager calls widget.init
 *			5. widget.setData is called by widget.init
 *			6. widget.initialized is toggled
 *			7. widget.ready is called by widget.init
 *				8. widget.render is called by widget.init
 *					9. widget.fetch is called by widget.render
 *					10. widget.postRender is called by widget.render
 *			11. widget.subscribe is called by widget.init
 */

window.widgetRoot = {
	hideLink: false,
	hideRefresh: false,

	initialized: false,

	ready: function() {
		this.render();
	},

	setData: function(data) {
		this.data = data;
	},

	fetch: function() {
		this.postFetch();
	},

	postFetch: function() { },

	subscribe: function() { },

	init: function(data) {
		Dashboard.Utils.emit('widget|init|' + this.name);

		if (data) {
			this.setData(data);
		}

		this.shell = Dashboard.TEMPLATES.widget({
			name: this.name,
			title: this.title,
			size: this.size,
			hideLink: this.hideLink,
			hideRefresh: this.hideRefresh,
			customButtons: this.customButtons
		});

		this.initialized = true;

		Dashboard.Utils.emit('widget|ready|' + this.name);

		this.ready();

		Dashboard.Utils.emit('widget|render|' + this.name);

		this.subscribe();
	},

	render: function() {
		Dashboard.render.widget(this.name, this.shell.tpl);

		this.fetch();

		$('#widget-' + this.shell.id).css({
			'height': '240px',
			'margin-bottom': '10px',
			'overflow-x': 'hidden',
			'width': '100%'
		});

		this.postRender();
		$(document).trigger("WidgetInternalEvent", ["widget|rendered|" + this.name]);
	},

	refresh: function() {

	},

	postRender: function() { },
};

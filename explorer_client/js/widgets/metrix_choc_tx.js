import utils from '../utils';

module.exports = function(id) {
	var extended = {
		name: 'metrix_choc_tx',
		title: 'chaincode transtion',
		size: 'large',
		widgetId: id, //needed for dashboard

		hideLink: true,
        topic: '/topic/metrics/txPerChaincode',

        subscribe: function() {
            utils.subscribe(this.topic, this.onData);
        },

		fetch: function() {
			$('#widget-' + widget.shell.id).html( '<div id="' + widget.name + '" class="epoch category10" style="width:100%; height: 210px;"></div>' );

			widget.chart = $('#' + widget.name).epoch({
				type: 'bar',
				data: [
					// First bar series
					{
						label: 'Series 1',
						values: [
							{ x: 'chaincode1', y: 30 },
							{ x: 'chaincode2', y: 10 },
							{ x: 'chaincode3', y: 12 },
							{ x: 'chaincode4', y: 12 },
						]
					},
				],
			});
		},

		onData: function(data) {
            if (!data) {
                return;
            }
            widget.chart = $('#' + widget.name).epoch({
                type: 'bar',
                data: [
                    // First bar series
                    {
                        label: 'Series 1',
                        values: [
                            data
                        ]
                    },
                ],
            });
		},
	};


	var widget = _.extend({}, widgetRoot, extended);

	// register presence with screen manager
	Dashboard.addWidget(widget);
};

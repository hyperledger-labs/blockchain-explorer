export default {
	load: function(opts) {
		var config = {
			headers: {
				'janus_user': 'V442113'
			},
			type: opts.method ? opts.method : 'POST',
			url: opts.url,
			contentType: opts.type ? opts.type : 'application/json',
			cache: false,
			async: true
		};

		if (opts.data) {
			config.data = JSON.stringify(opts.data);
		}

		if (opts.complete) {
			config.complete = opts.complete;
		}

		return $.ajax(config);
	},


	prettyUpdate: function(oldValue, newValue, el) {
		if (oldValue !== newValue) {
			el.css({
				'opacity': 0
			});

			setTimeout(function() {
				el.html($('<span>', {
					html: newValue
				}));

				el.css({
					'opacity': 1
				});
			}, 500);
		}
	},

	prettyMoneyPrint: function(val) {
		if (val) {
			var sign = '';

			if (val < 0) {
				sign = '-';
			}

			return sign + '$' + Math.abs(val).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
		}
	},

	capitalize: function(str) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	},

	camelToRegularForm: function(t) {
		var ret = t.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\b([A-Z]+)([A-Z])([a-z])/, '$1 $2$3').replace(/^./, function(str){ return str.toUpperCase(); });

		if ( (ret.toLowerCase() === 'id') ||
			(ret.toLowerCase() === 'url') ||
			(ret.toLowerCase() === 'txn') ||
			(ret.toLowerCase() === 'abi') ) {
			ret = ret.toUpperCase();
		} else if (ret.toLowerCase().indexOf(' url') >= 0) {
			ret = ret.substring(0, ret.indexOf(' Url')) +
				' URL' +
				ret.substring(ret.indexOf(' Url') + 4, ret.indexOf(' Url').length)
		} else if (ret.toLowerCase().indexOf(' txn') >= 0) {
			ret = ret.substring(0, ret.indexOf(' Txn')) +
				' TXN' +
				ret.substring(ret.indexOf(' Txn') + 4, ret.indexOf(' Txn').length)
		} else if (ret.toLowerCase().indexOf(' id') >= 0) {
			ret = ret.substring(0, ret.indexOf(' Id')) +
				' ID' +
				ret.substring(ret.indexOf(' Id') + 4, ret.indexOf(' Id').length)
		}

		return ret;
	},

	idAlwaysFirst: function(arr) {
		// remove ID from wherever it is, and make it first
		arr = _.without(arr, 'id');

		// insert ID as first element
		arr.splice(0, 0, 'id');

		return arr;
	},

	makeAreaEditable: function(selector) {
		$(selector).click(function(e) {
			var isEditable = !!$(this).prop('contentEditable');
			$(this).prop('contentEditable', isEditable);

			$(this).focus();

			$(this).selectText();
		});
	},

	copyToClipboard: function(e) {
		var t = e.target,
		 c = t.dataset.copytarget,
		 inp = (c ? document.querySelector(c) : null);

		// is element selectable?
		if (inp && inp.select) {
			// select text
			inp.select();

			try {
				// copy text
				document.execCommand('copy');
				inp.blur();
			} catch (err) {}
		}
	},

	truncAddress: function(addr) {
		var len = addr.startsWith('0x') ? 10 : 8;

		return addr.substring(0, len);
	}
};




jQuery.fn.selectText = function() {
	var doc = document,
	 element = this[0];

	if (doc.body.createTextRange) {
		var range = document.body.createTextRange();
		range.moveToElementText(element);
		range.select();
	} else if (window.getSelection) {
		var selection = window.getSelection(),
		 range = document.createRange();

		range.selectNodeContents(element);
		selection.removeAllRanges();
		selection.addRange(range);
	}
};

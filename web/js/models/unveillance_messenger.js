var UnveillanceMessenger = Backbone.Model.extend({
	constructor: function() {
		Backbone.Model.apply(this, arguments);

		if(!this.has('message_map')) {
			return;
		}

		var task_channel = UV.TASK_CHANNEL_URL;
		var web_socket = new SockJS(task_channel + "/annex_channel", null, { protocols_whitelist : ['websocket']});

		web_socket.onopen = this.onSocketOpen;
		web_socket.onclose = this.onSocketClose;
		web_socket.onmessage = _.bind(this.onSocketMessage, this);

		this.set('web_socket', web_socket);
		window.onbeforeunload = _.bind(this.disconnect, this);
	},
	connect: function() {
		try {
			this.onSocketConnect();
		} catch(err) { console.warn(err); }
	},
	disconnect: function() {
		this.get('web_socket').close();
	},
	onSocketOpen: function() {},
	onSocketClose: function() {},
	onSocketConnect: function() {},
	onSocketMessage: function(message) {
		if(!this.has('message_map')) {
			return;
		}

		_.each(this.get('message_map'), function(func) {			
			try {
				func = _.compose(func);
				func(message['data']);

			} catch(err) { console.warn(err); }	
		});
	}
});
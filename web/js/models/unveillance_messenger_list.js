var UnveillanceMessengerList = Backbone.Model.extend({
	constructor: function() {
		Backbone.Model.apply(this, arguments);

		this.set('li_tmpl', getTemplate("messenger_tray_li.html"));
	},
	parseDefaultTaskMessage: function(message) {
		console.info(this);
		if(!message._id) {
			return;
		}

		if(message.doc_id) {
			try {
				message.file_name = this.get('ctx').data.findWhere({ _id : message.doc_id }).get('file_name');
			} catch(err) {
				console.warn("could not get file_name from doc_id");
				console.warn(err);
			}
		}

		var li_id = _.template("uv_tray_<%= " + (message.doc_id ? "doc_id" : "_id") + " %>", message);
		var li = _.filter($(this.get('root_el').children("li"), function(li) {
			return $(li).attr("id") == li_id;
		}));

		if(_.isEmpty(li)) {
			$(this.get('root_el')).append(_.template(this.get('li_tmpl', { id : li_id })));
			li = $("#" + id);
		} else {
			li = li[0];
		}

		var status = $(li).find(".uv_messenger_indicator_light")[0];
		status.className = status.className.replace(/uv_mil_\d+/g, '');
		$(status).addClass("uv_mil_" + message.status);

		var text = $(li).find(".uv_messenger_text");
		var text_tmpl = "executing <b><i><%= task_path %></i></b>" + (message.file_name ? ' on document <a href="/unveil?_id=<%= doc_id %>"><%= file_name %></a>' : "");
		$(text).html(_.template(text_tmpl, message));
	}
});
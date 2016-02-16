var document_list, messenger_tray, search_bar;

function setupSearch() {
	search_bar = new UnveillanceSearch({
		root_el : $("#uv_document_search"),
		data : document_list.data ? document_list.data.models : [],
		refresh_el : document_list.get('root_el'),
		search_facets : UV.SEARCH_FACETS
	});
}

function setupDocumentList() {
	document_list = new UnveillanceDocumentList({
		root_el : $("#uv_document_holder").children("ul")[0]
	});
}

function setupMessengerTray() {
	var messenger_tray = $("#uv_notifications_tray").children("ul")[0];
	var messenger_tray_li_tmpl = getTemplate("messenger_tray_li.html");
	
	var message_map = [
		function(message) {
			if(!message._id) {
				return;
			}

			if(message.doc_id) {
				message.file_name = document_list.data.findWhere({ _id : message.doc_id }).get('file_name');
			}

			var id = _.template("uv_tray_<%= " + (message.doc_id ? "doc_id" : "_id") + " %>", message);			
			var tray_li = _.filter($(messenger_tray).children("li"), function(li) {
				return $(li).attr("id") == id;
			});

			if(_.isEmpty(tray_li)) {
				$(messenger_tray).append(_.template(messenger_tray_li_tmpl, { id : id }));
				tray_li = $("#" + id);
			}

			var status = $(tray_li).find(".uv_messenger_indicator_light")[0];
			status.className = status.className.replace(/uv_mil_\d+/g, '');
			$(status).addClass("uv_mil_" + message.status);

			$(tray_li).find(".uv_messenger_text")
				.html(_.template("executing <b><i><%= task_path %></i></b>" + (message.file_name ? ' on document <a href="/unveil?_id=<%= doc_id %>"><%= file_name %></a>' : ""), message));
		}
	];

	setupMessenger({ message_map : message_map });
}

$(document).ready(function($) {
	setupDocumentList();
	setupMessengerTray();
	setupSearch();
});
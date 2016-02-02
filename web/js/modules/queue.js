var queue_list;

function setupQueueList() {
	queue_list = new UnveillanceQueueList({
		root_el : $("#uv_queue_holder").children("ul")[0]
	});
}

$(document).ready(function($) {
	setupQueueList();

	var v = ["mt"];
	
	mt = _.object(_.map(window.location.search.substring(1).split("&"), function(kvp) {
		return kvp.split("=");
	}));

	if(_.size(_.difference(v, _.keys(mt))) != 0) {
		return;
	}

	if(mt.mt) {
		var el = queue_list.data.findWhere({ queue_type : "mime_type", queue_params : UV.MIME_TYPES[mt.mt]});
		if(el) {
			$("#uv_li_" + el.get(el.idAttribute)).addClass("active");
		}
	}
});
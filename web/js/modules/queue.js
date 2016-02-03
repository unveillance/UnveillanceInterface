var queue_list;

function setupQueueList() {
	queue_list = new UnveillanceQueueList({
		root_el : $("#uv_queue_holder").children("ul")[0]
	});
}

$(document).ready(function($) {
	setupQueueList();
});
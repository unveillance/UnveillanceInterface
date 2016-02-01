function loadAsset() {
	var root_el = $("#uv_raw_asset_holder");
	var v = ["_id", "file_name"];

	var p = _.object(_.map(window.location.search.substring(1).split("&"), function(kvp) {
		return kvp.split("=");
	}));

	if(_.size(_.difference(v, _.keys(p))) != 0) {
		$(root_el).append("<h2>Sorry. This asset could not be displayed.</h2");
		return;
	}

	$("#uv_raw_asset_title").html(p.file_name);
	setRawAsset(root_el, _.template(".data/<%= _id %>/<%= file_name %>", p));
}

$(document).ready(function($) {
	loadAsset();
});
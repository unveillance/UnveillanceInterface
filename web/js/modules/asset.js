var asset;

function loadAsset() {
	var root_el = $("#uv_raw_asset_holder");
	var v = ["_id", "file_name"];

	asset = _.object(_.map(window.location.search.substring(1).split("&"), function(kvp) {
		return kvp.split("=");
	}));

	if(_.size(_.difference(v, _.keys(asset))) != 0) {
		$(root_el).append("<h2>Sorry. This asset could not be displayed.</h2");
		return;
	}

	var doc = new UnveillanceDocument({_id : asset._id});
	doc.pull();

	asset.path = _.template(".data/<%= _id %>/<%= file_name %>", asset);
	_.extend(asset, _.findWhere(doc.get('assets'), { file_name : asset.file_name}));

	$("#uv_raw_asset_title")
		.html(asset.file_name)
		.append(' <a onclick="onDownloadRequested(this);">Download</a>');

	setRawAsset(root_el, asset.path);
	_.each(["description"], function(k) {
		$("#uv_raw_asset_info").append(_.template("<li><%= k %> : <%= v %>", { k : k, v : asset[k] }))	
	}, this);
}

function onDownloadRequested(el) {
	$(el).unbind("click");

	var data = getFileContent(this, asset.path, null);
	var is_valid = true;

	console.info(data);
		
	if(_.isNull(data)) {
		is_valid = false;
	} else {
		try {
			if(JSON.parse(data).result == 404) {
				is_valid = false;
			}
		} catch(err) {}
	}

	if(!is_valid) {
		alert("Could not download file");
		return;
	}

	data = new Blob([data], { type : "application/octet-stream" });
	$(el).attr({
		'href' : window.URL.createObjectURL(data),
		'download' : [asset._id, asset.file_name].join('_')
	});
	
	window.setTimeout(function() {
		$(el).click();
		$(el).removeAttr('href');
		$(el).removeAttr('download');
		$(el).click(function() {
			onDownloadRequested(this);
		});
	}, 300);
}

$(document).ready(function($) {
	loadAsset();
});
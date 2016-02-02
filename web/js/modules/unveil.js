var doc, search_bar;

function loadDocument() {
	var root_el = $("#uv_document_holder");
	var v = ["_id"];

	doc = _.object(_.map(window.location.search.substring(1).split("&"), function(kvp) {
		return kvp.split("=");
	}));

	if(_.size(_.difference(v, _.keys(doc))) != 0) {
		$(root_el).append('<h2 class="uv_error">Sorry. This document could not be displayed.</h2>');
		return;
	}

	doc = new UnveillanceDocument(_.extend(doc, {
		root_el : getTemplate("unveil_document_holder.html"),
		asset_list_render_li : getTemplate("unveil_asset_list_render_li.html"),
		uv_date_renderer : _.findWhere(UV.TRANSLATE_VALUES, { func : "uv_date" }),
		getCustomRender : function() {
			return {
				queue_history_render : _.map(doc.get('completed_tasks'), function(t) {
					return _.template("<li><%= t %></li>", { t : t });
				}).join(""),
				asset_list_render : _.map(doc.get('assets'), function(a) {
					return _.template(doc.get('asset_list_render_li'), _.extend(a, { _id : doc.get('_id') }));
				}).join("")
			}
		}	
	}));

	doc.pull();
	doc.setup();

	search_bar = new UnveillanceSearch({
		root_el : $("#uv_document_search"),
		data : [doc],
		search_facets : [
			{
				category : "text",
				batch : function(text) {
					console.info("searching doc for its sweet, sweet texty insides");
					console.info(text)

					return [];
				},
				assert : function(doc, value) {
					console.info(value);
					return false;
				}
			}
		]
	});

	$(root_el).append(doc.refreshView());
}

$(document).ready(function($) {
	loadDocument();
});
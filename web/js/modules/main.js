var document_list, search;

var DocumentList = Backbone.Model.extend({
	constructor: function() {
		Backbone.Model.apply(this, arguments);
		var global_clicks = [
			"onActionRequested"
		];

		_.each(global_clicks, function(f) {
			window[f] = _.bind(this[f], this);
		}, this);

		this.root_el = $("#uv_document_holder").children("ul")[0];

		var documents = doInnerAjax("documents", "post", null, null, false);
		if(documents.result == 200 && documents.data && documents.data.documents) {
			
			var document_main_holder_li = getTemplate("document_main_holder_li.html");
			var asset_list_render = getTemplate("document_main_asset_list_render.html");
			var actions_list_render = getTemplate("document_main_actions_list_render.html");
			var asset_list_render_li = getTemplate("document_main_asset_list_render_li.html");
			var actions_list_render_li = getTemplate("document_main_actions_list_render_li.html");

			this.data = new Backbone.Collection(_.map(documents.data.documents, function(d) {
				return new UnveillanceDocument(_.extend(d, {
					root_el : document_main_holder_li,
					asset_list_render : asset_list_render,
					asset_list_render_li : asset_list_render_li,
					actions_list_render : actions_list_render,
					actions_list_render_li : actions_list_render_li,
					
					getCustomRender : function() {
						var asset_list = _.map(d.assets, function(a) {
							return _.template(d.asset_list_render_li, _.extend(a, {
								_id : d._id
							}));
						}, d);

						var action_list = _.map(["reindex", "log"], function(a) {
							return _.template(d.actions_list_render_li, {
								action : a, 
								_id : d._id 
							});
						}, d).join(" ");

						return {
							asset_list_render : _.template(asset_list_render, { asset_list : asset_list }),
							actions_list_render : _.template(actions_list_render, { action_list : action_list })
						};
					}
				}));
			}, this));

			this.refreshView();
		} else {
			$(this.root_el).append("<li>Sorry, no documents yet.</li>");
		}
		
	},
	refreshView: function() {
		_.each(this.data.models, function(doc) {
			$(this.root_el).append(doc.refreshView());
		}, this);
	},
	onActionRequested: function() {
		console.info("action requested");
		console.info(arguments);
	}
});

function setupDocumentList() {
	document_list = new DocumentList();
}

$(document).ready(function($) {
	setupDocumentList();
});
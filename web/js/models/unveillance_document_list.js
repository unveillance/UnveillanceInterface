var UnveillanceDocumentList = UnveillanceList.extend({
	constructor: function() {
		var global_clicks = [
			"onReindexRequested"
		];

		_.extend(arguments[0], { global_clicks : global_clicks });
		UnveillanceList.apply(this, arguments);
		
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

						var action_list = _.map(["Reindex"], function(a) {
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
	onReindexRequested: function() {
		var el = arguments[0];
		this.setActivatedItem(el);

		doc = this.getActivatedItem();
		if(!doc) {
			return;
		}

		doc[1].reindex();
	}
});
var UnveillanceDocument = Backbone.Model.extend({
	constructor: function() {
		Backbone.Model.apply(this, arguments);
		this.idAttribute = "_id";
	},

	getAssetsByTagName: function(tag) {
		var tagged_assets = [];
		if(this.has("assets")) {
			_.each(this.get("assets"), function(asset) {
				if(asset.tags && asset.tags.indexOf(tag) != -1) {
					tagged_assets.push(asset);
				}
			});
		}
		
		return tagged_assets;
	}
});
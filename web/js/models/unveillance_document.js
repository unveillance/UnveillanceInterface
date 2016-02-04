var UnveillanceDocument = Backbone.Model.extend({
	constructor: function() {
		Backbone.Model.apply(this, arguments);
		this.idAttribute = "_id";

		this.setup();
	},
	setup: function() {
		if(this.has('mime_type')) {
			var mime_type_map = null;
			_.find(UV.MIME_TYPES, function(v, k) {
				if(this.get('mime_type') === v) {
					mime_type_map = k;
					return true;
				}

				return false;
			}, this);

			this.set('mime_type_map', mime_type_map);
		}

		if(this.has('date_added') && this.has('uv_date_renderer')) {
			this.set('date_added_render', this.get('uv_date_renderer').enc(this.get('date_added')));
		}

		this.set('file_alias_render', this.has('file_alias') ? this.get('file_alias') : this.get('file_name'));
	},
	pull: function() {
		var record = doInnerAjax("documents", "post", { _id : this.get('_id') }, null, false);
		if(record.result == 200 && record.data) {
			this.set(record.data);
			this.setup();
		}
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
	},
	reindex: function(callback, task_path) {
		var req = { _id : this.get('_id') };
		if(task_path) { _.extend(req, { task_path : task_path }); }

		return doInnerAjax("reindex", "post", req, callback, false);
	},
	log: function() {

	},
	refreshTags: function() {
		if(!window.current_user) { return; }

		try {
			this.set('tags', _.filter(
				current_user.getDirective('tags').tags,
				function(tag) {
					return _.contains(tag.documents, this.get('data')._id);
				}, this));
		} catch(err) {
			console.info(err);
			this.set('tags', []);
		}


		try {
			onTagsRefreshed();
		} catch(err) { console.warn(err); }
	},
	addTag: function(tag_name) {
		if(!window.current_user) { return; }

		var tag = this.getTagByName(tag_name);
		if(!tag) {
			tag = new UnveillanceDocumentTag({ label : tag_name });
		}

		tag.addDocument(this.get('data')._id);
		this.refreshTags();
	},
	removeTag: function(tag_name) {
		if(!window.current_user) { return; }

		var tag = this.getTagByName(tag_name);
		if(tag) {
			tag.removeDocument(this.get('data')._id);
			this.refreshTags();
		}
	},
	getTagByName: function(tag_name) {
		if(!window.current_user) { return; }

		var tag = _.findWhere(current_user.getDirective('tags').tags, { hash : MD5(tag_name) });
		if(tag) {
			return new UnveillanceDocumentTag(tag);
		}

		return;
	},
	getChildAsset: function(_id, doc_type) {
		return doInnerAjax("documents", "post", {
			doc_type : doc_type,
			_id : _id,
			media_id : this.get('data')._id
		}, null, false).data;
	},
	refreshView: function() {
		var view_render = this.toJSON();
		
		if(this.has('getCustomRender')) {
			view_render = _.extend(view_render, this.get('getCustomRender')());
		}

		return _.template(this.get('root_el'), view_render);
	}
});

var UnveillanceDirectiveItem = Backbone.Model.extend({
	constructor: function() {
		Backbone.Model.apply(this, arguments);

		if(!this.get('hash')) {
			this.set('hash', MD5(this.get('label')));
		}

		this.idAttribute = "hash";
	},
	addDocument: function(doc_id) {
		if(!this.has('documents')) {
			this.set('documents', []);
		}

		if(!(_.contains(this.get('documents'), doc_id))) {
			this.get('documents').push(doc_id);
			this.update();
		}
	},
	removeDocument: function(doc_id) {
		if(!this.has('documents')) { return; }

		var updated = _.without(this.get('documents'), doc_id);

		this.set('documents', updated);
		this.update();
	},
	update: function() {
		var items = current_user.getDirective(this.get('d_name'))[this.get('d_name')];
		var self = _.findWhere(items, { hash : this.get('hash') });

		if(self) {
			items[_.indexOf(items, self)] = this.toJSON();
		} else {
			items.push(this.toJSON());
		}

		current_user.save();
	},
	remove: function() {
		var items = current_user.getDirective(this.get('d_name'))[this.get('d_name')];
		var self = _.findWhere(items, { hash : this.get('hash') });

		if(self) {
			items.splice(_.indexOf(items, self), 1);
			current_user.save();
		}
	}
});

var UnveillanceDocumentTag = UnveillanceDirectiveItem.extend({
	constructor: function() {
		UnveillanceDirectiveItem.prototype.constructor.apply(this, arguments);

		this.set('d_name', "tags");
	}
});
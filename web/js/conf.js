var UV;

function extendCustomConfig() {
	var custom_uv = JSON.parse($.ajax({
		url: "/web/vars.json",
		dataType: "json",
		method: "get",
		async: false
	}).success().responseText);

	_.extend(UV.MIME_TYPE_TASKS, custom_uv.MIME_TYPE_TASKS || {});
	_.extend(UV.MIME_TYPES, custom_uv.MIME_TYPE_MAP || {});
	_.extend(UV.INITIAL_TASKS, custom_uv.INITIAL_TASKS || {});
	_.extend(UV.INTERVAL_TASKS, custom_uv.INTERVAL_TASKS || {});

	UV.TASK_POOL = _.union(UV.TASK_POOL, custom_uv.TASK_POOL || []);
}

UV = JSON.parse($.ajax({
	url: "/web/conf.json",
	dataType: "json",
	method: "get",
	async: false
}).success().responseText);

_.extend(UV, {
	SPLAT_PARAM_IGNORE : [
			"splat", "escapeHTML", 
			"h", "toHash", "toHTML", 
			"keys", "has", "join", "log", "toString"
		],
	TRANSLATE_VALUES : [
			{
				keys: ["uv_date"],
				enc: function(val, obj) {
					if(Number(val) == 0) {
						return "unknown";
					}
					
					return moment(Number(val)).format("MM-DD-YYYY HH:mm");
				},
				dec: function(val) {
					return moment(val, "MM-DD-YYYY HH:mm").unix() * 1000;
				},
				func : "uv_date"
			},
			{
				keys: ["uv_none_if_null"],
				enc: function(val, obj) {
					if(val.length == 0) {
						return "none";
					}
					
					return val;
				}
			},
			{
				keys: ["uv_unknown_if_null"],
				enc: function(val, obj) {
					if(val.length == 0) {
						return "unknown";
					}
					
					return val;
				}
			},
			{
				keys: ["uv_false_if_null"],
				enc: function(val, obj) {
					if(val.length == 0) {
						return "false";
					}
					
					return val;
				}
			},
			{
				keys: ["uv_from_rel"],
				enc: function(val, obj) {
					if(_.contains(["", "undefined", "null"], $(obj).attr('rel'))) {
						return val;
					}

					return $(obj).attr('rel');
				}
			},
			{
				keys: ["uv_truncate_30"],
				enc: function(val, obj) {
					if(val.length > 30) {
						return val.slice(0, 15) + "..." + val.slice(-15);
					}
				}
			}
		],
	SEARCH_FACETS : [
		{
			category : "text",
			build : function(text) {
				var text_matches = doInnerAjax("documents", "post", {
					cast_as : "media_id",
					searchable_text : "[" + text.toLowerCase().replace(/\s/g, ',').replace(/,,/g, ',') + "]"
				}, null, false);
				
				if(text_matches.result == 200 && text_matches.data) {
					return _.pluck(text_matches.data.documents, "_id");
				}

				return [];
			},
			batch : true,
			assert : function(doc, ids) {
				return _.contains(ids, doc.get('_id'));
			}
		},
		{
			category : "Queue",
			values: _.map(_.keys(UV.MIME_TYPES), function(queue) {
				return {
					value : queue,
					label: queue
				};
			}),
			uri_label : "mime_type",
			assert : function(doc, mime_type) {
				return doc.get('mime_type') == UV.MIME_TYPES[mime_type];
			}
		},
		{
			category: "With asset",
			values: _.map(_.pairs(UV.ASSET_TAGS), function(asset_tag) {
				return {
					value: asset_tag[1],
					label: asset_tag[1]
				};
			}),
			uri_label: "assets.tags",
			assert : function(doc, asset_tag) {
				try {
					return !_.isEmpty(_.filter(doc.get('assets'), function(asset) {
						return _.contains(asset.tags, asset_tag);
					}));
				} catch(err) {
					console.warn(err);
				}

				return false;
			}
		},
		{
			category : "Alias",
			values : [],
			uri_label : "file_alias"
		},
		{
			category : "File name",
			values: [],
			uri_label : "file_name"
		},
		{
			category : "ID",
			values : [],
			uri_label : "_id"
		}
	]
});

try {
	extendCustomConfig()
} catch(err) {
	console.warn(err);
}




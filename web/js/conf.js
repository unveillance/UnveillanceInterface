$.ajax({
	url: "/web/conf.json",
	dataType: "json",
	method: "get",
	complete: function(res) {	
		if(res.status == 200) {		
			UV = JSON.parse(res.responseText);
			UV.SEARCH_FACETS = [
				"Mime Type",
				"With Asset",
				"Alias"
			];
			UV.FACET_VALUES = [
				{
					category : "Mime Type",
					values: _.map(UV.MIME_TYPES, function(mime_type) {
						return {
							value : mime_type,
							label: mime_type
						};
					})
				},
				{
					category: "With Asset",
					values: _.map(_.pairs(UV.ASSET_TAGS), function(asset_tag) {
						return {
							value: asset_tag[1],
							label: asset_tag[1]
						};
					})
				}
			];
			UV.SPLAT_PARAM_IGNORE = [
				"splat", "escapeHTML", 
				"h", "toHash", "toHTML", 
				"keys", "has", "join", "log", "toString"
			];
			
			UV.TRANSLATE_VALUES = [
				{
					keys: ["uv_date"],
					enc: function(val) {
						return moment(Number(val)).format("MM-DD-YYYY HH:mm");
					},
					dec: function(val) {
						return moment(val, "MM-DD-YYYY HH:mm").unix() * 1000;
					}
				},
				{
					keys: ["uv_none_if_null"],
					enc: function(val) {
						if(val.length == 0) {
							return "none";
						}
						
						return val;
					}
				},
				{
					keys: ["uv_unknown_if_null"],
					enc: function(val) {
						if(val.length == 0) {
							return "unknown";
						}
						
						return val;
					}
				},
				{
					keys: ["uv_false_if_null"],
					enc: function(val) {
						if(val.length == 0) {
							return "false";
						}
						
						return val;
					}
				}
			];
		}
	}
});
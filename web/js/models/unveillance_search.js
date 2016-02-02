var UnveillanceSearch = Backbone.Model.extend({
	constructor: function() {
		Backbone.Model.apply(this, arguments);

		this.set({
			ctx : VS.init({
				container : this.get('root_el'),
				query : "",
				callbacks : {
					search : _.bind(this.onSearch, this),
					facetMatches : _.bind(this.onFacetMatches, this),
					valueMatches : _.bind(this.onValueMatches, this)
				}
			})
		});
	},
	applyFilter: function(matches, facet, param) {
		return _.intersection(matches || this.get('data'), _.filter(this.get('data'), function(doc) {
			try {
				if(!facet.assert) {
					facet.assert = function(doc, value) {
						if(!doc.has(facet.uri_label)) {
							return false;
						}

						return doc.get(facet.uri_label) === value;
					}
				}

				return facet.assert(doc, param.get('value'));
			} catch(err) {
				console.warn(err);
			}

			return false;
		}, this));
	},
	onSearch: function(query, params) {
		$("li").removeClass("uv_search_result");
		var matches;
		var reduce_batch = [];

		// get the low-hanging fruit matches from what we have in DOM
		_.each(params.models, function(param) {
			var facet = _.findWhere(this.get('search_facets'), { category : param.get('category')});
			
			if(facet.batch) {
				reduce_batch.push([facet, param]);
				return;
			}
			
			matches = this.applyFilter(matches, facet, param);
		}, this);

		// reduce the simply-acquired matches by the more complex one
		_.each(reduce_batch, function(args) {
			var facet = args[0];
			var params = args[1];
			var original_value = params.get('value');

			params.set('value', facet.batch(original_value));
			matches = this.applyFilter(matches, facet, params);
			params.set('value', original_value);

		}, this);

		// update view with results
		if(!_.isEmpty(matches)) {
			var first_el = $(this.get('refresh_el')).children("li")[0];

			_.each(matches, function(m) {
				var el = $("#uv_li_" + m.get(m.idAttribute));

				$(el).addClass('uv_search_result');
				$(el).insertBefore($(first_el));

			}, this);
		}
	},
	onFacetMatches: function(callback) {
		callback(_.pluck(_.reject(this.get('search_facets'), function(f) {
			return f.batch;
		}), 'category'));
	},
	onValueMatches: function(facet, search_term, callback) {
		var values = _.findWhere(this.get('search_facets'), { category : facet});
		if(values) {
			callback(values.values);
		}
	}
});
var UnveillanceList = Backbone.Model.extend({
	constructor: function() {
		Backbone.Model.apply(this, arguments);

		_.each(this.get('global_clicks'), function(f) {
			window[f] = _.bind(this[f], this);
		}, this);
	},
	refreshView: function() {
		_.each(this.data.models, function(l) {
			$(this.get('root_el')).append(l.refreshView());
		}, this);
	},
	setActivatedItem: function(el) {
		var parent_el = $($(el).parents("table")).parents("li");

		_.each($(parent_el).siblings("li"), function(s) {
			$(s).removeClass("active");
		});

		$(parent_el).addClass("active");
	},
	getActivatedItem: function() {
		var parent_el = $(this.get('root_el')).children("li.active");

		if(parent_el) {
			var id = $(parent_el).attr('id').replace("uv_li_", "");

			return [parent_el, _.filter(this.data.models, function(m) {
				return m.get(m.idAttribute) == id;
			})[0]];
		}
	},
	sortView: function() {
		console.info(arguments);
	}
});
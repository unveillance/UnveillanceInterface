var UnveillanceQueue = Backbone.Model.extend({
	constructor: function() {
		Backbone.Model.apply(this, arguments);
	},
	save: function() {
		// save queue via POST to api
	},
	setAlias: function(queue_alias) {
		// set an alias for queue
	},
	setType: function() {
		// on start? at interval? on document of certain mime type?
		this.set('queue_type', arguments[0]);
		this.set('queue_params', arguments[1]);
	},
	addTask: function(task_name) {
		// add a task to the queue
		if(!this.has('queue_list')) {
			this.set('queue_list', []);
		}

		this.get('queue_list').push(task_name);
	},
	removeTask: function(task_index) {
		// remove a task from the queue
		this.get('queue_list').splice(task_index, 1);
	},
	setTaskOpts: function(task_index, opts) {

	},
	refreshView: function(task_on_drag_event) {
		return _.template(this.get('root_el'), _.extend(this.toJSON(), { 
			queue_list_render : this.queueListRender(),
			queue_type_render : this.queueTypeRender(),
			queue_params_render : this.queueParamsRender(),
			cid : this.cid
		}));
	},
	queueListRender: function() {
		if(!this.has('queue_list') || _.isEmpty(this.get('queue_list'))) {
			return this.get('empty_task_li_tmpl');
		}

		return _.map(this.get('queue_list'), function(task_name) {
			return _.template(this.get('task_li_tmpl'), { task_name : task_name });
		}, this).join("");
	},
	queueTypeRender: function() {
		if(!this.has('queue_type')) {
			return this.get('empty_type_tmpl');
		}

		switch(this.get('queue_type')) {
			case "mime_type":
				return "on";
			case "init":
				return "on";
			case "interval":
				return "every";
		}
	},
	queueParamsRender: function() {
		if(!this.has('queue_type')) {
			return "";
		}

		switch(this.get('queue_type')) {
			case "mime_type":
				var mime_type = this.get('queue_type');
				_.find(UV.MIME_TYPES, function(v, k) {
					if(this.get('queue_params') === v) {
						mime_type = k;
						return true;
					}

					return false;
				}, this);
				
				return _.template("<%= mime_type %> added", { mime_type : mime_type });
			case "init":
				return "startup"
			case "interval":
				return this.get('interval_param_tmpl');

		}
	}
});
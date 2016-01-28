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
		console.info(this);

	},
	addTask: function(task_name) {
		// add a task to the queue
		this.get('queue_list').append(task_name);
	},
	removeTask: function(task_index) {
		console.info("removing task!");
		console.info(arguments);
		// remove a task from the queue

	},
	deleteSelf: function() {
		// delete self via POST to api
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
		}, this);
	},
	queueTypeRender: function() {
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

		}
	}
});
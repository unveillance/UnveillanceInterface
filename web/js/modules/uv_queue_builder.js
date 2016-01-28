var queue_list;

var QueueList = Backbone.Model.extend({
	constructor: function() {
		Backbone.Model.apply(this, arguments);

		_.each(["addTaskToQueue", "setQueueType", "onQueueListSave", "onNewQueue", "onQueueEdit", "onQueueDelete", "onTaskDrag", "onTaskDelete"], function(f) {
			window[f] = _.bind(this[f], this);
		}, this);

		this.root_el = $("#uv_queue_holder").children("ul")[0];
		this.tray_el = $("#uv_queue_tray").children("ul")[0];
		this.tray_li_tmpl = getTemplate("tray_li.html");

		var queue_list_li_tmpl = getTemplate("queue_holder_li.html");
		var task_li_tmpl = getTemplate("task_li.html");
		var empty_task_li_tmpl = getTemplate("empty_task_li.html");

		var queue_stub = {
			root_el : queue_list_li_tmpl,
			task_li_tmpl : task_li_tmpl,
			empty_task_li_tmpl : empty_task_li_tmpl
		};

		var mime_type_tasks = _.map(_.keys(UV.MIME_TYPE_TASKS), function(mime_type) {
			return new UnveillanceQueue(_.extend(queue_stub, {
				queue_type : "mime_type",
				queue_params : mime_type,
				queue_list : UV.MIME_TYPE_TASKS[mime_type]
			}));
		});

		var init_tasks = [];
		var interval_tasks = [];

		this.data = new Backbone.Collection(_.union(mime_type_tasks, init_tasks, interval_tasks));
		this.refreshView();

	},
	refreshView: function(){
		_.each(this.data.models, function(queue) {
			$(this.root_el).append(queue.refreshView());
		}, this);
	},
	refreshTray: function(ctx) {
		$(this.tray_el).empty();
		var tray_content;
		
		switch(ctx) {
			case "uv_qh_queue_type":
				var s = "setQueueType(<%= qt %>);";
				var mime_type_content = _.map(_.keys(UV.MIME_TYPES), function(mime_type) {
					return {
						on_tray_option_clicked : _.template(s, { qt : "'mime_type', '" + mime_type + "'" }),
						html : _.template("on <b><i><%= mime_type %></i></b> added", { mime_type : mime_type })
					};
				});

				var init_content = {
					on_tray_option_clicked : _.template(s, { qt : "'init'" }),
					html : "on <b><i>startup</i></b>"
				};

				var interval_content = {
					on_tray_option_clicked : _.template(s, { qt : "'interval'" }),
					html : "<b><i>every x interval</i></b>"
				}

				tray_content = _.union(init_content, interval_content, mime_type_content);

				break;
			case "uv_qh_queue_list":
				tray_content = _.map(UV.TASK_POOL, function(task_name) {
					return {
						on_tray_option_clicked : "addTaskToQueue();",
						html : task_name
					};
				});

				break;
		}

		if(tray_content) {
			$(this.tray_el).append(_.map(tray_content, function(c) {
				return _.template(this.tray_li_tmpl, c);
			}, this));
		}
	},
	onTaskDrag: function() {
		console.info("dragging task");
		console.info(arguments);

		this.setActivatedQueue(arguments[1]);
	},
	onTaskDelete: function() {
		console.info("deleting task");
		console.info(arguments);

		this.setActivatedQueue(arguments[1]);
	},
	onQueueEdit: function() {
		console.info("editing queue");
		this.refreshTray($(arguments[0]).attr('class'));

		this.setActivatedQueue(arguments[0]);
	},
	onQueueDelete: function() {
		console.info("deleting queue");
		console.info(arguments);

		this.setActivatedQueue(arguments[0]);
	},
	onQueueListSave: function() {
		console.info("saving queue list");
		console.info(arguments);
		_.each(this.data.models, function(queue) { queue.save(); }, this);
	},
	onNewQueue: function() {
		console.info("making new queue");
		console.info(arguments);
	},
	setActivatedQueue: function(el) {
		var parent_el = $($(el).parents("table")).parents("li");
		
		_.each($(parent_el).siblings("li"), function(s) {
			$(s).removeClass("active");
		});

		$(parent_el).addClass("active");
	},
	getActivatedQueue: function() {
		var parent_el = $($("#uv_queue_holder").children("ul")[0]).children("li.active");

		if(parent_el) {
			var cid = $(parent_el).attr('id').replace("uv_qh_", "");
			return [parent_el, _.findWhere(this.data.models, { cid : cid })];
		}
	},
	setQueueType: function() {
		console.info("setting queue type");
		console.info(arguments);

		var queue = this.getActivatedQueue();
		if(!queue) {
			return;
		}

		queue[1].setType(arguments[0], UV.MIME_TYPES[arguments[1]]);
		$(queue[0]).replaceWith(queue[1].refreshView());
		$("#uv_qh_" + queue[1].cid).addClass("active");
	},
	addTaskToQueue: function(task_name) {
		console.info("adding task to queue");
		console.info(arguments);
	}
});

function setupQueueList() {
	queue_list = new QueueList();

}

$(document).ready(function($) {
	try {
		setupQueueList();
	} catch(err) {
		console.warn(err);
	}
});
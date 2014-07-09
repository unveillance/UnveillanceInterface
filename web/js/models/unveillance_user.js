var UnveillanceUser = Backbone.Model.extend({
	constructor: function() {
		Backbone.Model.apply(this, arguments);
		
		try {
			this.set(JSON.parse(localStorage.getItem('user')));
		} catch(err) {
			console.warn("COULD NOT LOAD USER DATA");
			console.warn(err);
		}
	},
	
	save: function() {
		try {
			localStorage.setItem('user', JSON.stringify(this.toJSON()));
		} catch(err) {
			console.warn("COULD NOT SAVE USER DATA");
			console.warn(err);
		}
	},
	
	getDirective: function(d_name, create_if_none) {
		var directive;
		if(create_if_none == undefined) {
			create_if_none = true;
		}
		
		try {
			directive = _.pluck(this.get('session_log'), d_name)[0];
		} catch(err) {
			console.warn(err);
		}

		if(!directive) {
			if(create_if_none) {
				this.get('session_log').push(_.object([d_name],[0]));
				directive = _.pluck(this.get('session_log'), d_name)[0];
			}
		}
		
		return directive;
	},
	
	logIn: function(el) {
		var user = {
			username: $($(el).find("input[name=username]")[0]).val(),
			password: $($(el).find("input[name=password]")[0]).val()
		};
	
		doInnerAjax("login", "post", user, function(json) {
			console.info(json);
		
			try {
				json = JSON.parse(json.responseText);
			} catch(err) {
				alert("Could not log in!");
				return;
			}
		
			if(json.result == 200) {
				localStorage.setItem('user', JSON.stringify(json.data));
				window.location = "/";
			} else {
				alert("Could not log you in!");
			}
		});
	},
	
	logOut: function() {
		var user = { username : this.get('username') };
		
		if($("#uv_logout_with_data").css('display') != "none") {
			user = this.toJSON();
			user.password = $($("#uv_logout_with_data")
				.find("input[name=password]")[0]).val();
		}
	
		doInnerAjax("logout", "post", user, function(json) {
			console.info(json);
		
			try {
				json = JSON.parse(json.responseText);
			} catch(err) {
				alert("Could not log out!");
				return;
			}
		
			if(json.result == 200) {
				localStorage.clear();
				window.history.back();
				window.location.reload();
			} else {
				alert("Could not log you out!");
			}
		});
	}
});
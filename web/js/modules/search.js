var app = app || {};//global Backbone
var search;

var Search = {
	onConfLoaded: function() {
		$("#search_content").prepend(getTemplate("search.html", null, "/web/layout/views/module/"));
		
		window.setTimeout(function() {
			search = new InformaCamSearch({
				search_el : $("#ic_visual_search_holder"),
				advanced_el : $("#ic_extended_search_holder"),
				result_el : $("#ic_search_view_holder")
			});
			
		}, 100);
	},
	
	loadSearchResult: function(search_result) {
		if(search_result == null || search_result.result != 200) {
			failOut($("#ic_search_results_holder"));
			return;
		}

		search_result = search_result.data;
		search_result.documents = _.map(search_result.documents, function(doc) {
			return _.extend(doc,
				{ doc_stub : doc.mime_type == "application/pgp" ? "source" : "submission" });
		});
			
		$("#ic_search_results_holder").empty().
			append(Mustache.to_html(getTemplate("search_result.html"), search_result));

//		$("#ic_export_holder").append(getTemplate("export.html"));
		
		$('#results_list a').click(function(e) {
			e.preventDefault();
//			app.docid = $($(this).siblings('input[type=checkbox]')[0]).attr('data-hash');
			app.docid = $(this).attr('data-hash');
			$('#file_tab a').click();
		});

		$('#ic_search_results_holder input[type=checkbox]').change(function() {
			var hash = $(this).attr('data-hash');
			if ($(this).is(':checked')) {
				app.addDatasetToTSV(hash);
			} else {
				app.removeDatasetFromTSV(hash);
			}
		});
	},
	
	appendAdvancedSearch: function(button) {
		var search = $(getTemplate("search_advanced.html"));
		$('<span/>', {
			class: 'search_plus search_button',
			click: function() {
				Search.appendAdvancedSearch($(this));
			}}).appendTo(search);

		$('<span/>', {
			class: 'search_minus search_button',
			click: function() {
				Search.removeAdvancedSearch($(this));
			}}).appendTo(search);
		search.find('.search_options_main select').change(function() {
			search_section = $(this).parent().parent();
			option = $(this).val();
			search_section.find('.search_option').hide();
			search_section.find('.' + option + '_options').show();
		});
			


		button.parent().after(search);
	},
	
	removeAdvancedSearch: function(button) {
		button.parent().remove();
	},
};

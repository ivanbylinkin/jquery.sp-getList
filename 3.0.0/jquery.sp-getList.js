// Simple GetList plugin to shorten code for gathering data
// Requires listName and fields
$.fn.getList = function(options){
	var deferred = new $.Deferred();
	if (options.listNames){
		return $.fn.getMultiLists(options);
	}
	var fields = $.merge(options.fields,['checkedout', 'ID']),
	// create the CAML view fields
	viewfields = "<ViewFields>",
	mappings = {};
	if (!options.types){
		options.types = [];
		mappings = null;
	}
	for (var i=0; i<fields.length; i++){
		var val = fields[i],
		type = options.types[i];
		viewfields += "<FieldRef Name='"+val+"' />";
		if (type){
			mappings['ows_'+val] = {mappedName: val, objectType: type};
		}
	}
	viewfields += "</ViewFields>";
	options.CAMLViewFields = viewfields;
	options.CAMLQuery = options.query;
	options.mapping = mappings;
	// Add all established values to the SPServices object
	var obj = $.fn.getList.defaults;
	// Add any values specified by the user
	for (var key in obj){
		if (options[key]){
			obj[key] = options[key];
		}
	}
	// Get and return the data
	var call = $().SPServices.SPGetListItemsJson(obj);
	$.when(call).done(function(){
		deferred.resolve(this);
		if (options.completefunc){
			options.completefunc(this);
		}
	});
	return deferred;
};

$.fn.getMultiLists = function(options){
	var calls = [],
	deferred = new $.Deferred();
	for (var s=0; s<options.listNames.length; s++){
		var newdeferred = new $.Deferred();
		if ($.type(options.fields[s]) == 'array'){
			var fields = $.merge($.merge([],options.fields[s]),['checkedout', 'ID']);
		}
		else{
			var fields = $.merge($.merge([],options.fields),['checkedout', 'ID']);
		}
		// create the CAML view fields
		var viewfields = "<ViewFields>",
		mappings = {},
		types = [];
		if (!options.types){
			mappings = null;
		}
		else {
			types = options.types;
			if ($.type(options.types[s]) == 'array'){
				types = options.types[s];
			}
		}
		for (var i=0; i<fields.length; i++){
			var val = fields[i],
			type = types[i];
			viewfields += "<FieldRef Name='"+val+"' />";
			if (type){
				mappings['ows_'+val] = {mappedName: val, objectType: type};
			}
		}
		viewfields += "</ViewFields>";
		options.CAMLViewFields = viewfields;
		if (options.queries){ 
			if (options.queries[s]){ options.CAMLQuery = options.queries[s]; }
			else { alert("getList_error: more lists being queried than queries provided"); }
		}
		else { options.CAMLQuery = options.query; }
		options.mapping = mappings;
		// Add all established values to the SPServices object
		var obj = $.fn.getList.defaults;
		obj.listName = options.listNames[s];
		// Add any values specified by the user
		for (var key in obj){
			if (options[key]){
				obj[key] = options[key];
			}
		}
		// Get and return the data
		calls.push($().SPServices.SPGetListItemsJson(obj));
	}
	$.when.apply($,calls).done(function(){
		deferred.resolve(this);
		if (options.completefunc){
			options.completefunc(this);
		}
	});
	return deferred;
};

$.fn.getListSimple = function(options){
	var fields = $.merge(options.fields,['checkedout', 'ID']),
	// create the CAML view fields
	viewfields = "<ViewFields>",
	mappings = {};
	if (!options.types){
		options.types = [];
	}
	for (var i=0; i<fields.length; i++){
		var val = fields[i],
		type = options.types[i];
		viewfields += "<FieldRef Name='"+val+"' />";
		if (type){
			mappings['ows_'+val] = {mappedName: val, objectType: type};
		}
	}
	viewfields += "</ViewFields>";
	options.CAMLViewFields = viewfields;
	options.CAMLQuery = options.query;
	options.mappings = mappings;
	// Add all established values to the SPServices object
	var obj = $.fn.getListSimple.defaults;
	// Add complete function
	obj.completefunc = function(xData, Status){
		options.data = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
			mapping: options.mappings,
			includeAllAttrs: true
		});
	}
	// Add any values specified by the user
	for (var key in obj){
		if (options[key]){
			obj[key] = options[key];
		}
	}
	// Get and return the data
	$().SPServices(obj);
	return options.data;
};

$.fn.getListColumns = function(options){
	var obj = $.fn.getListColumns.defaults;
	obj.completefunc = function(xData, Status) {
		var r = [];
		$(xData.responseXML).find("Fields > Field").each(function(){
			r.push({
				StaticName: $(this).attr("StaticName"),
				DisplayName: $(this).attr("DisplayName")
			});
		});
		options.data = r;
	}
	// Add any values specified by the user
	for (var key in obj){
		if (options[key]){
			obj[key] = options[key];
		}
	}
	$().SPServices(obj);
	
	return options.data;
};

$.fn.getList.defaults = {
	webURL: "",
	listName: "",
	viewName: "",
	CAMLQuery: "<Query><OrderBy Override='TRUE'><FieldRef Ascending='FALSE' Name='ID' /></OrderBy><Where><IsNotNull><FieldRef Name='ID' /></IsNotNull></Where></Query>",
	CAMLViewFields: "",
	CAMLRowLimit: 5000,
	CAMLQueryOptions: "",
	changeToken: "",
	contains: "",
	mapping: null,
	mappingOverrides: null,
	debug: true
};

$.fn.getListSimple.defaults = {
	webURL: "",
	operation: "GetListItems",
	async: false,
	listName: "",
	CAMLViewFields: "",
	CAMLQuery: "<Query><OrderBy Override='TRUE'><FieldRef Ascending='FALSE' Name='ID' /></OrderBy><Where><IsNotNull><FieldRef Name='ID' /></IsNotNull></Where></Query>",
	CAMLRowLimit: 5000
};

$.fn.getListColumns.defaults = {
	operation: "GetList",
	listName: '',
	async: false
};

$.fn.getList.help = "Using getList:\n\n $.fn.getList({ listName: YOURLIST, fields: [FIELD,FIELD,FIELD, etc] }); \n\n help on accessing data is available through $.fn.getList.help_access";
$.fn.getList.help_access = "In order to access the data please use this format\n\n$.when(YOURVARIABLE).done(function(){ var data = this.data; });\n\nInside the function you can see 4 values: changeToken, mapping, data, deletedIds.\n\nFor more info on these please see $.fn.getList.help_THEVALUE";
$.fn.getList.help_changeToken = "Passing this parameter back into getList will return all changes since your last call";
$.fn.getList.help_mapping = "The mapping used to parse the data into JSON. This mapping will include any specific overrides you specified as well as the automatically created mappings. You can pass this mapping into the function on subsequent calls to reduce overhead, though the function saves the mapping in a local data store for reuse."
$.fn.getList.help_data = "The actual data return by getList";
$.fn.getList.help_deletedIds = "If this is call 2 or greater to getList, deletedIds will contain an array of IDs for list items which have been deleted since the prior call."
$.fn.getList.version = 'v3.0.0';

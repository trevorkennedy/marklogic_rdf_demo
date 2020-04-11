'use strict';

function post(context, params, input) {
	const viz = require('/vizFunctions');
	let moduleName = 'getData post ';

	input = xdmp.unquote(xdmp.quote(input));
	input = fn.head(input).root;

	let prefixes = input.prefixes;
	let select = input.select;
	let orderBys = input.orderBys;
	let postFix = input.postFix;
	let sparqlQuery = '';
	var searchQuery = cts.parse(input.searchText);

	var results = '';
	var orderBy = ' ';
	if(fn.stringLength(orderBys) > 0 ) {
		orderBy = viz.orderBys(orderBys);
	};
	sparqlQuery = prefixes + select + orderBy + postFix;
//	xdmp.log(moduleName + ' sparql: ' + sparqlQuery);
//	xdmp.log(moduleName + ' searchQuery: ' + searchQuery);
	if(fn.stringLength(xdmp.quote(searchQuery)) > 0) {
		results = sem.sparql(sparqlQuery,[],[],searchQuery);
	} else {
		results = sem.sparql(sparqlQuery);
	};

	results = results.toArray();

	var unConstitutedResults = viz.unConstituteResults(results);
	var objects = viz.reConstituteResults(unConstitutedResults,results);
	let nodes = '{"nodes": [' + viz.makeNodes(unConstitutedResults) + ']';
	let edges = '"edges": [' + viz.makeEdges(objects) + ']}';
	let data = '{"results": ' + nodes + ', ' + edges + '}';

	xdmp.addResponseHeader("Access-Control-Allow-Origin",xdmp.quote(xdmp.getRequestHeader('Origin')));
	xdmp.addResponseHeader("Access-Control-Allow-Credentials","true");
	xdmp.addResponseHeader("Access-Control-Allow-Methods","PUT, POST, OPTIONS, GET");
	context.outputTypes = [];
	context.outputTypes.push('text/javascript; charset=utf-8');
	context.outputStatus = [201,"Success"];

	return data
};

function put(context, params, input) {
	let moduleName = 'getData put';
	var URI = input;
	let doc = fn.doc(URI).toString();
	xdmp.log(moduleName + ' input data is: ' + URI);
	xdmp.eval(doc);
	xdmp.documentDelete(URI.toString());
};

exports.PUT = put
exports.POST = post


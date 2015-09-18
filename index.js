var {Cc, Ci} = require("chrome");

var gcSvc = Cc["@mozilla.org/grammarcheck;1"].getService(Ci.nsIEditorGrammarCheck);
var xmlhttp = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);
var { setTimeout, clearTimeout } = require("sdk/timers");

xmlhttp.addEventListener("error", function(result) {
	console.error("API request ended in error");
});
xmlhttp.addEventListener("abort", function(result) {
	console.error("API request aborted");
});
xmlhttp.addEventListener("loadend", function(result) {
	handleResponse(result);
});

let checkerUrl = "https://languagetool.org:8081/";

function handleResponse(text) {
	var xml = xmlhttp.responseXML;
	var errors = xml.getElementsByTagName("error");
	var startPositions = [];
	var endPositions = [];
	var replacements = [];
	var messages = [];
	for (var i = 0; i < errors.length; i++) {
		//console.error("Got match: " + errors[i].getAttribute("offset") + ", len: " + errors[i].getAttribute("errorlength"));
		var startPos = parseInt(errors[i].getAttribute("offset"));
		var endPos = startPos + parseInt(errors[i].getAttribute("errorlength"));
		startPositions.push(startPos);
		endPositions.push(endPos);
		replacements.push(errors[i].getAttribute("replacements"));
		messages.push(errors[i].getAttribute("msg"));
	}
	gcSvc.errorsFound(startPositions, endPositions, startPositions.length);
	for (var j = 0; j < errors.length; j++) {
		var suggestions = replacements[j].split("#");
		for (var k = 0; k < suggestions.length; k++) {
			if (suggestions[k] !== "") {
				gcSvc.addSuggestionForError(j, suggestions[k], messages[j]);
			}
		}
	}
}

function sendRequest(text) {
	//console.error("TEXT: " + text);
	// TODO: add logic to avoid too many API requests (timeout)

	/*setTimeout(function() {
		var sp = [0, 15];
		var ep = [5, 17];
		gcSvc.errorsFound(sp, ep, sp.length);
		gcSvc.addSuggestionForError(0, "bsuggestion 1", "message 1");
		gcSvc.addSuggestionForError(1, "bsuggestion 2", "message 2");
		gcSvc.addSuggestionForError(1, "bsuggestion 3", "message 2");
	}, 500);*/

	xmlhttp.open("POST", checkerUrl, true);
	xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	var data = "autodetect=1&text=" + text;
	xmlhttp.send(data);
}
				
gcSvc.registerAddon(sendRequest);

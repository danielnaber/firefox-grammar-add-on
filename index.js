var {Cc, Ci} = require("chrome");

var gcSvc = Cc["@mozilla.org/grammarcheck;1"].getService(Ci.nsIEditorGrammarCheck);
var currentText;

let checkerUrl = "https://languagetool.org:8081/";

function handleResponse(result, textAtRequestTime, xmlhttp) {
	if (currentText != textAtRequestTime) {
		return;
	}
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
		if (suggestions.length === 0 || (suggestions.length === 1 && suggestions[0] === '')) {
			// TODO: should not just be an empty text:
			gcSvc.addSuggestionForError(j, "", messages[j]);
		}
		for (var k = 0; k < suggestions.length; k++) {
			if (suggestions[k] !== "") {
				gcSvc.addSuggestionForError(j, suggestions[k], messages[j]);
			}
		}
	}
}

function sendRequest(text) {	
	currentText = text;
	
	var xmlhttp = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);
	// TODO: error handling does not seem to work, e.g. when server returns "too many requests" error:
	xmlhttp.addEventListener("error", function(result) {
		console.error("API request ended in error");
	});
	xmlhttp.addEventListener("abort", function(result) {
		console.error("API request aborted");
	});
	xmlhttp.addEventListener("loadend", function(result) {		
		handleResponse(result, text, xmlhttp);
	});
	
	console.error("TEXT: " + text);
	// TODO: add logic to avoid too many API requests (timeout)

	xmlhttp.open("POST", checkerUrl, true);
	xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	var data = "autodetect=1&text=" + text;
	xmlhttp.send(data);
}
				
gcSvc.registerAddon(sendRequest);

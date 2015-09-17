var {Cc, Ci} = require("chrome");

var gcSvc = Cc["@mozilla.org/grammarcheck;1"].getService(Ci.nsIEditorGrammarCheck);
var xmlhttp = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);

let checkerUrl = "https://languagetool.org:8081/";

function handleText(text) {
	// TODO: add logic to avoid too many API requests (timeout)
	var oReq = xmlhttp;
	oReq.addEventListener("load", function(result) {
		var xml = oReq.responseXML;
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
					// TODO: avoid duplications
					gcSvc.addSuggestionForError(j, suggestions[k], messages[j]);
				}
			}
		}
		//gcSvc.addSuggestionForError(0, "suggestion", "message");
	});

	oReq.open("POST", checkerUrl, true);
	oReq.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	var data = "autodetect=1&text=" + text;
	oReq.send(data);
}
				
gcSvc.registerAddon(handleText);

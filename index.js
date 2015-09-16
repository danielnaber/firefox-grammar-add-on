var {Cc, Ci} = require("chrome");

var gcSvc = Cc["@mozilla.org/grammarcheck;1"].getService(Ci.nsIEditorGrammarCheck);
var xmlhttp = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);

let checkerUrl = "https://languagetool.org:8081/";

function handleText(text) {
	var oReq = xmlhttp;
	oReq.addEventListener("load", function(result) {
		var xml = oReq.responseXML;
		var errors = xml.getElementsByTagName("error");
		var startPositions = [];
		var endPositions = [];
		var replacements = [];
		for (var i = 0; i < errors.length; i++) {
			//console.error("Got match: " + errors[i].getAttribute("offset") + ", len: " + errors[i].getAttribute("errorlength"));
			var startPos = parseInt(errors[i].getAttribute("offset"));
			var endPos = startPos + parseInt(errors[i].getAttribute("errorlength"));
			startPositions.push(startPos);
			endPositions.push(endPos);
			replacements.push(errors[i].getAttribute("replacements"));
			// TODO: use 'msg' attribute
		}
		gcSvc.errorsFound(startPositions, endPositions, startPositions.length);
		for (var j = 0; j < errors.length; j++) {
			// TODO: split at '#'
			gcSvc.addSuggestionForError(j, replacements[j]);
		}
	});
	oReq.open("POST", checkerUrl, true);
	oReq.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	//var data = "language=en&text=" + text;
	var data = "autodetect=1&text=" + text;
	oReq.send(data);
}
				
gcSvc.registerAddon(handleText);

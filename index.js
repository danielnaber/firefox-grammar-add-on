var {Cc, Ci} = require("chrome");

var gcSvc = Cc["@mozilla.org/grammarcheck;1"].
				getService(Ci.nsIEditorGrammarCheck);

var xmlhttp = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);

function handleWord(word) 
{
	var oReq = xmlhttp;
	oReq.addEventListener("load", function(result) {
		console.log("LOAD!!");
		console.log(result);
		console.log(oReq.responseXML);
		var xml = oReq.responseXML;
		var errors = xml.getElementsByTagName("error");
		var startPositions = [];
		var endPositions = [];
		for (var i = 0; i < errors.length; i++) {
			console.log("ERROR: " + errors[i].getAttribute("offset") + ", len: " + errors[i].getAttribute("errorlength"));
			var startPos = parseInt(errors[i].getAttribute("offset"));
			var endPos = startPos + parseInt(errors[i].getAttribute("errorlength"));
			startPositions.push(startPos);
			endPositions.push(endPos);
			// msg, replacements (#)
		}
		//gcSvc.errorsFound(startPositions, endPositions, startPositions.length);
		for (var j = 0; j < errors.length; j++) {
			//gcSvc.addSuggestionForError(0, "[this will be replaced]");

		}
		console.log("START: " + startPositions);
		console.log("END: " + endPositions);
	});
	oReq.open("POST", "https://languagetool.org:8081/", true);
	oReq.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	var data = "language=en&text=this is an test";
	oReq.send(data);
	console.log("POSTED");

	var startPos = [0,4];
	var endPos = [2,9];
	
	gcSvc.errorsFound(startPos, endPos, startPos.length);
	gcSvc.addSuggestionForError(0, "[this will be replaced]");
	gcSvc.addSuggestionForError(1, "[another suggestion]");
}

				
gcSvc.registerAddon(handleWord);

var {Cc, Ci} = require("chrome");

var gcSvc = Cc["@mozilla.org/grammarcheck;1"].
				getService(Ci.nsIEditorGrammarCheck);
var { setTimeout, clearTimeout } = require("sdk/timers");	

var currentText;

function dispatchErrors(text)
{
	if(currentText != text)
		return;
	
	var startPos = [1,4];
	var endPos = [2,9];
	gcSvc.errorsFound(startPos, endPos, startPos.length);
	gcSvc.addSuggestionForError(0, "replaced", "msg1");
	gcSvc.addSuggestionForError(1, "suggestion1", "msg2");
	gcSvc.addSuggestionForError(1, "suggestion2", "msg2");
}

function handleText(text) 
{
	currentText = text;
	console.error("Handle Word");
	//setTimeout(dispatchErrors(text), 500)  // this works
	setTimeout(function() { dispatchErrors(text) }, 500)  // this doesn't work on replace
}
				
gcSvc.registerAddon(handleText);

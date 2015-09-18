var {Cc, Ci} = require("chrome");

var gcSvc = Cc["@mozilla.org/grammarcheck;1"].
				getService(Ci.nsIEditorGrammarCheck);
var { setTimeout, clearTimeout } = require("sdk/timers");	

function handleWord(word) 
{

	console.error("Handle Word");
	
	var startPos = [1,4];
	var endPos = [2,9];

	setTimeout(function() {
		gcSvc.errorsFound(startPos, endPos, startPos.length);
		gcSvc.addSuggestionForError(0, "replaced", "msg1");
		gcSvc.addSuggestionForError(1, "suggestion1", "msg2");
		gcSvc.addSuggestionForError(1, "suggestion2", "msg2");
        }, 500)
}

				
gcSvc.registerAddon(handleWord);

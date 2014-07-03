/*
 * All the world is programmable, and codes merely hacks!
 */

WordTreeData.doc_class = new Object();
WordTreeData.doc_class.variable = null;
WordTreeData.doc_class.positive = [];
WordTreeData.doc_class.negative = [];

// WordTreeData.feedback = new Object();
// WordTreeData.feedback.selected = null;
// WordTreeData.feedback.root = null;

function updateRootStats() {
    updateSentenceStats(WordTreeData.matchedList);
}

function updateSentenceStats(docs){
    // percentange = 100*matches/(WordTreeData.total).toFixed(2);
    // d = jQuery.unique(docs);
    appCtrl.setWordTreePercentage(docs.length, WordTreeData.total); 
    appCtrl.setSearchFilter(docs);
    appCtrl.$apply(); 
}

function updateFeedback(selected, root){
    console.log(selected);
    appCtrl.setWordTreeFeedback(selected, root); 
    appCtrl.$apply(); 
    }

function updateClass(variable, positive, negative){
    // console.log(variable);
    // console.log(positive);
    // console.log(negative);

    WordTreeData.doc_class.variable = variable;
    WordTreeData.doc_class.positive = positive;
    WordTreeData.doc_class.negative = negative;
}

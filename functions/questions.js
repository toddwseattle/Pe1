var questionGroups = [{
    header: 'Trade Show/Demo',
    questions: [{
        text: 'Concise (less than 3 minutes) and informative interactive demo provided that linked value proposition to targeted customer',
        label: 'concise demo',
        type: 'range'
    }, {
        text: 'Questions answered concisely and accurately and feedback listened to',
        label: 'concise answers',
        type: 'range'
    }]
}, {
    header: 'Pitch',
    questions: [{
        text: 'Team has Product Market Fit',
        label: 'product-market fit',
        type: 'range'
    }, {
        text: 'The team has a good understanding of their target users and customers who would buy/use their solution',
        label: 'understands target users',
        type: 'range'
    }, {
        text: 'Solid customer acquisition and market traction results',
        label: 'traction',
        type: 'range'
    }, {
        text: 'Financial model and pricing are viable',
        label: 'pricing',
        type: 'range'
    }, {
        text: 'The overall pitch was compelling and left you wanting to learn more',
        label: 'compelling',
        type: 'range'
    }, {
        text: 'Should the team continue after class',
        label: 'continue',
        heading: 'Continue?',
        type: 'radio'
    }]
}];
// Utility function to run a function on each question in a questionGroups object
var forEachQuestion = function (questionGroup, func, callback) {
    for (var i = 0; i < questionGroup.length; i++) {
        var group = questionGroup[i];
        for (var j = 0; j < group.questions.length; j++) {
            if (func(group.questions[j]) === false) {
                return;
            }
        }
    }
    if (callback === undefined) return;
    callback();
}
var questions = [];
forEachQuestion(questionGroups, function (question) {
    questions.push(question);
});

module.exports = {
    questionGroups: questionGroups,
    forEachQuestion: forEachQuestion,
    questions: questions,
}
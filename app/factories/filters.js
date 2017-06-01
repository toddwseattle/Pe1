angular.module('PitchEvaluator').filter('rating', function () {
    return function (value) {
        if (value === undefined) return;
        if (typeof value === 'boolean') {
            return value ? 'Y' : 'N';
        } else {
            return value.toFixed(2);
        }
    }
}).filter('header', function () {
    return function (question, index) {
        return question.header || 'Q' + (index + 1);
    }
});
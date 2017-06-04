angular.module('PitchEvaluator').filter('rating', () => {
    return value => {
        if (value === undefined) return;
        if (typeof value === 'boolean') {
            return value ? 'Y' : 'N';
        } else {
            return value.toFixed(2);
        }
    }
}).filter('header', () => {
    return (question, index) => {
        return question.header || 'Q' + (index + 1);
    }
}).filter('hasComments', () => {
    return (reviews, label) => {
        return reviews.filter(review => review.comments && review.comments[label]);
    }
});
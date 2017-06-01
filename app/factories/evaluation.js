angular.module('PitchEvaluator').factory('Evaluation', function($rootScope) {
    class Evaluation {
        constructor(user, questionGroups) {
            this.user = user;
            this.ratings = {};
            this.comments = {};
            this.average = 0;

            var count = 0;
            $rootScope.forEachQuestion(questionGroups, (question) => {
                // Skip questions that don't have a value
                // False is a valid radio question value
                if (!question.value && question.value !== false) return;
                this.ratings[question.label] = question.value;
                if (question.type === 'range') {
                    this.average += question.value;
                    count++;
                }
                // Don't include a comment if there is none
                if (!question.comment) return;
                this.comments[question.label] = question.comment;
            }, () => this.average /= count);
        }

        hasComments() {
            return Object.keys(this.comments).length > 0;
        }
    }
    return Evaluation;
});
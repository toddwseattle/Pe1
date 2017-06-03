angular
    .module('PitchEvaluator')
    .factory('statsService', function ($rootScope) {

        function calculateQuestionAvgs(responses, subKey) {
            // Sum up and count all reviews
            var counts = {};
            var sums = {};
            var rankCount = 0;
            var rankSum = 0;
            for (var key in responses) {
                var review = responses[key];
                for (var label in review[subKey]) {
                    counts[label] = (counts[label] || 0) + 1;
                    sums[label] = (sums[label] || 0) + review[subKey][label];
                }
            }

            var result = {};
            // Calculate average of questions and overall average
            result.averages = {};
            var overallAverage = 0;
            var radioCount = 0;
            for (var i = 0; i < $rootScope.questions.length; i++) {
                var question = $rootScope.questions[i];
                var label = $rootScope.questions[i].label;
                if (!(label in sums)) continue;
                result.averages[label] = sums[label] / counts[label];
                if (question.type !== 'radio') {
                    // Don't include radio averages in the overall
                    // Radio ranges from 0 to 1 instead of 1 to 7
                    overallAverage += result.averages[label];
                } else {
                    radioCount++;
                }
            };
            if (Object.keys(result.averages).length === 0) return result;
            overallAverage = overallAverage / (Object.keys(result.averages).length - radioCount);
            result.averages['overall'] = overallAverage;
            return result;
        }

        function updateTeamAvgs(teamRef) {
            // Transactions are atomic, to prevent weirdness
            return teamRef.transaction(function (team) {
                // Team data hasn't downloaded yet, return false so transaction is called again
                if (!team) return false;

                var reviews = team.reviews;
                Object.assign(team, calculateQuestionAvgs(reviews, 'ratings'));

                // Sum up and count rankings
                var rankCount = 0;
                var rankSum = 0;
                for (var key in reviews) {
                    var review = reviews[key];
                    if (review.rank) {
                        rankCount += 1;
                        rankSum += review.rank;
                    }
                }

                // Calculate rank average
                if (rankCount) {
                    team.averages['rank'] = rankSum / rankCount;
                }
                return team;
            });
        }

        function updateSessionAvgs() {
            // Transactions are atomic, to prevent weirdness
            return firebase.database().ref($rootScope.sessionRef).transaction(function (session) {
                // Session data hasn't downloaded yet, return false so transaction is called again
                if (!session) return false;

                Object.assign(session, calculateQuestionAvgs(session.teams, 'averages'));
                return session;
            });
        }

        return {
            updateTeamAvgs: updateTeamAvgs,
            updateSessionAvgs: updateSessionAvgs
        }
    });
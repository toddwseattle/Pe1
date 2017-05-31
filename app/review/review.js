'use strict';
angular
	.module('PitchEvaluator')
	.controller('ReviewCtrl', function ($rootScope, $scope, permissionsService, $firebaseObject, $firebaseArray, $location, teamService, loggedinCheck, Evaluation) {
		loggedinCheck.check();

		if (!permissionsService.isPermitted('Review')) {
			$location.path('summary');
		}

		$scope.sliderOptions = {
			floor: 0,
			ceil: 7,
			showTicksValues: true,
			onEnd: function () {
				dirty = true;
			}
		};

		var teamsRef = firebase.database().ref($rootScope.sessionRef + "/teams");
		$scope.teams = $firebaseArray(teamsRef);
		$scope.selectedTeam = null;
		// Clone questions from rootScope to we can add rating data to it
		$scope.questionGroups = JSON.parse(JSON.stringify($rootScope.questionGroups));
		var dirty = false;

		if (teamService.get()) {
			$scope.teams.$loaded(function () {
				$scope.selectedTeam = teamService.get();
				teamService.set(null);
				loadPreviousReview();
			});
		}

		// Populate previous evaluation values when a team is selected
		$scope.$watch(function (scope) { return $scope.selectedTeam }, loadPreviousReview);

		function loadPreviousReview() {
			if (dirty || !$scope.selectedTeam) return;
			var reviewRef = teamsRef.child($scope.selectedTeam.$id).child('reviews').child($rootScope.user);
			$firebaseObject(reviewRef).$loaded(function (review) {
				if (review.ratings) {
					// We reviewed this team before
					updateResponses(review);
				} else {
					// No review found, meaning we haven't reviewed this team
					clearResponses();
				}
			});
		}

		function clearResponses() {
			dirty = false;

			$rootScope.forEachQuestion($scope.questionGroups, function (question) {
				delete question.value;
				delete question.comment;
			});
		}

		function updateResponses(review) {
			dirty = false;

			$rootScope.forEachQuestion($scope.questionGroups, function (question) {
				if (!review.ratings[question.label]) return;
				question.value = review.ratings[question.label];
				if (!review.comments || !review.comments[question.label]) return;
				question.comment = review.comments[question.label];
			});
		}

		// Calculate response stats from a data object
		// Keys can be anything
		// Values are Evaluation objects
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
			result.overallAverage = 0;
			var radioCount = 0;
			for (var i = 0; i < $rootScope.questions.length; i++) {
				var question = $rootScope.questions[i];
				var label = $rootScope.questions[i].label;
				if (!(label in sums)) return;
				result.averages[label] = sums[label] / counts[label];
				if (question.type !== 'radio') {
					// Don't include radio averages in the overall
					// Radio ranges from 0 to 1 instead of 1 to 7
					result.overallAverage += result.averages[label];
				} else {
					radioCount++;
				}
			};
			result.overallAverage = result.overallAverage / (Object.keys(result.averages).length - radioCount);
			return result;
		}

		function updateTeamAvgs() {
			// Transactions are atomic, to prevent weirdness
			return teamsRef.child($scope.selectedTeam.$id).transaction(function (team) {
				// Team data hasn't downloaded yet, return false so transaction is called again
				if (!team) return false;

				var reviews = team.reviews;

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
					team.averageRank = rankSum / rankCount;
				}

				Object.assign(team, calculateQuestionAvgs(reviews, 'ratings'));
				return team;
			});
		}

		function updateSessionAvgs() {
			var sessionRef = firebase.database().ref($rootScope.sessionRef);
			// Transactions are atomic, to prevent weirdness
			return sessionRef.transaction(function (session) {
				// Session data hasn't downloaded yet, return false so transaction is called again
				if (!session) return false;

				Object.assign(session, calculateQuestionAvgs(session.teams, 'averages'));
				return session;
			});
		}

		function showAlert(role, message) {
			$scope.alertVisible = true;
			$scope.alertRole = role;
			$scope.alertMessage = message;
		}

		$scope.onSubmit = function () {
			var user = $rootScope.user;

			// If no team was selected, show an error
			if ($scope.selectedTeam == null && user != "") {
				showAlert('danger', 'Please select a team to grade');
				return;
			} else {
				$scope.alertVisible = false;
			}

			var reviewRef = teamsRef.child($scope.selectedTeam.$id).child('reviews').child($rootScope.user);
			var review = $firebaseObject(reviewRef);

			var evaluation = new Evaluation(user, $scope.selectedTeam.name, $scope.questionGroups);
			if (!evaluation.hasComments()) {
				// No comments entered
				var confirmNoComments = confirm("You didn't type in any comments/ Are you sure you want to submit the form?");
				if (!confirmNoComments) {
					return;
				}
			}

			// Push the update review to Firebase
			Object.assign(review, evaluation);
			review.$save().then(function () {
				// Calculate new team and class stats
				updateTeamAvgs().then(updateSessionAvgs).then(function () {
					showAlert('success', 'Evaluation saved!');
					clearResponses();
					$scope.$digest();
				});
			});
		}
	});

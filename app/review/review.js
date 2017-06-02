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
				var rating = review.ratings[question.label];
				if (!rating && rating !== false) return;
				question.value = rating;
				if (!review.comments || !review.comments[question.label]) return;
				question.comment = review.comments[question.label];
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

			var reviewRef = teamsRef.child(`${$scope.selectedTeam.$id}/reviews/${$rootScope.user}`);
			var review = $firebaseObject(reviewRef);

			var evaluation = new Evaluation(user, $scope.questionGroups);
			if (!evaluation.hasComments()) {
				// No comments entered
				var confirmEmptyAnswers = confirm("No comments provided. Are you sure you want to submit the form?");
				if (!confirmEmptyAnswers) {
					return;
				}
			}
			for (var i = 0; i < $rootScope.questions.length; i++) {
				var question = $rootScope.questions[i];
				if (evaluation.ratings[question.label] === undefined) {
					var confirmEmptyAnswers = confirm("Not every question is answered. Are you sure you want to submit the form?");
					if (!confirmEmptyAnswers) {
						return;
					}
				}
			}

			// Push the update review to Firebase
			review.$loaded().then(function() {
				Object.assign(review, evaluation);

				// If we haven't ranked them, give them a rank
				if (review.rank === undefined) {
					var reviewedCount = 0;
					for (var i = 0; i < $scope.teams.length; i++) {
						if ($scope.teams[i].reviews && $scope.teams[i].reviews[$rootScope.user]) {
							reviewedCount++;
						}
					}
					review.rank = reviewedCount + 1;
				}

				review.$save().then(function () {
					showAlert('success', 'Evaluation saved!');
				});
			});
		}
	});

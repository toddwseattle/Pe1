'use strict';
angular
	.module('PitchEvaluator')
	.controller('JudgeCtrl', function ($timeout, $rootScope, $scope, permissionsService, $firebaseObject, $firebaseArray, $location, loggedinCheck, teamService, statsService) {
		loggedinCheck.check();

		if (!permissionsService.isPermitted('JudgeView')) {
			if ($rootScope.role == 'Team') {
				$location.path('team');
			}
		}

		$scope.reviewTeam = function (team) {
			teamService.set(team);
			$location.path('review');
		}

		$scope.sessionAverages = $firebaseObject(firebase.database().ref($rootScope.sessionRef).child('averages'));
		$scope.reviewedTeams = [];
		$scope.unReviewedTeams = [];
		var teamsRef = firebase.database().ref($rootScope.sessionRef + "/teams");
		var teamList = $firebaseArray(teamsRef);
		teamList.$loaded(function () {
			for (var i = 0; i < teamList.length; i++) {
				var team = teamList[i];
				if (team.reviews && team.reviews[$rootScope.user]) {
					// We've reviewed this team
					$scope.reviewedTeams.push(team);
				} else {
					// We haven't reviewed this team
					$scope.unReviewedTeams.push(team);
				}
			}
			$scope.reviewedTeams.sort(function (a, b) { return a.reviews[$rootScope.user].rank - b.reviews[$rootScope.user].rank });
		});

		function dragStart(e, ui) {
			// Create a temporary attribute on the element with old index
			ui.item.data('start', ui.item.index());
		}

		function dragEnd(e, ui) {
			// Get the new and old index
			var start = ui.item.data('start');
			var end = ui.item.index();

			// Move the item to its new index
			$scope.reviewedTeams.splice(end, 0, $scope.reviewedTeams.splice(start, 1)[0]);

			var min = Math.min(start, end);
			var max = Math.max(start, end);
			for (var i = min; i <= max; i++) {
				var team = $scope.reviewedTeams[i];
				// Update the team's rank in the review and in the model
				var teamRef = teamsRef.child(team.$id);
				team.reviews[$rootScope.user].rank = i + 1;
				teamRef.child(`/reviews/${$rootScope.user}`).update({ rank: i + 1 });
				statsService.updateTeamAvgs(teamRef);
				team.moved = true;
			}

			statsService.updateSessionAvgs();

			$timeout(function () {
				for (var i = 0; i < $scope.reviewedTeams.length; i++) {
					$scope.reviewedTeams[i].moved = false;
				}
			}, 1000);
		}

		var sortableOptions = {
			start: dragStart,
			update: dragEnd
		};

		// Drag and drop only with the handle on small screens
		if ($scope.isSmallScreen) {
			sortableOptions.handle = '.drag-handle';
		}

		$('#sortable').sortable(sortableOptions);
	});

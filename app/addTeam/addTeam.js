'use strict';
angular
	.module('PitchEvaluator')
	.controller('addTeamCtrl', function ($rootScope, $scope, permissionsService, $firebaseObject, $firebaseArray, $location, db_url, loggedinCheck) {
		loggedinCheck.check();

		if (!permissionsService.isPermitted('addTeam')) {
			$location.path('summary');
		}

		$scope.name = "";
		$scope.product = "";
		$scope.desc = "";
		$scope.teamPass = ""

		function showWarning(text) {
			$scope.alertVisible = true;
			$scope.alertRole = 'danger';
			$scope.alertMessage = text;
		}

		$scope.addTeam = function () {
			if (!$rootScope.session) {
				showWarning("Invalid or No Session");
				return;
			}

			var teamsRef = firebase.database().ref(`${$rootScope.sessionRef}/teams`);
			var teams = $firebaseArray(teamsRef);
			teams.$loaded(function () {
				for (var i = 0; i < teams.length; i++) {
					if (teams[i].name == $scope.name) {
						showWarning("Team already exists");
						return;
					}
				}

				teams.$add({
					name: $scope.name,
					product: $scope.product,
					desc: $scope.desc,
					teamPass: $scope.teamPass
				}).then(() => {
					$scope.alertVisible = true;
					$scope.alertRole = 'success';
					$scope.alertMessage = "Team added!";
				});
			});
		}
	});

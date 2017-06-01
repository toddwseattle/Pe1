'use strict';
angular
	.module('PitchEvaluator')
	.controller('newSessionCtrl', function ($rootScope, $scope, permissionsService, $firebaseObject, $firebaseArray, $location, loggedinCheck) {

		loggedinCheck.check();
		if (!permissionsService.isPermitted('newSession')) {
			$location.path('summary');
		}

		$scope.name = "";
		$scope.desc = "";
		$scope.judgePass = "";

		$scope.createSession = function () {
			var refSessions = $firebaseArray(firebase.database().ref('sessions'));
			var refNew = refSessions.$add({
				name: $scope.name,
				desc: $scope.desc,
				judgePass: $scope.judgePass
			}).then(function (ref) {
				var sessionList = $firebaseArray(firebase.database().ref('sessionList'));
				sessionList.$add({
					name: $scope.name,
					ref: "sessions/" + ref.key
				});
				$rootScope.session = $scope.name;
				$rootScope.sessionRef = "sessions/" + ref.key;
				$location.path('summary');
			});
		}
	});

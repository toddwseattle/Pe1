'use strict';
angular
	.module('PitchEvaluator')
	.controller('TeamCtrl', function ($rootScope, $scope, permissionsService, $firebaseObject, $firebaseArray, $location, loggedinCheck) {
		loggedinCheck.check();

		if (!permissionsService.isPermitted('TeamView')) {
			if ($rootScope.role == 'Admin') {
				$location.path('summary');
			} else if ($rootScope.role == 'Judge') {
				$location.path('judge');
			} else {
				$location.path('login');
			}
		}

		var sessionRef = firebase.database().ref($rootScope.sessionRef);
		$scope.sessionAverages = $firebaseObject(sessionRef.child('averages'));
		var teamRef = firebase.database().ref(`${$rootScope.sessionRef}/teams/${$rootScope.teamID}`);
		$scope.team = $firebaseObject(teamRef);
		$scope.reviews = $firebaseArray(teamRef.child('reviews'));
	});
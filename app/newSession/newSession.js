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
			var refSessions = firebase.database().ref('sessions');
			var refNew = refSessions.push({
				name: $scope.name,
				desc: $scope.desc,
				judgePass: $scope.judgePass
			});
			console.log(refNew.toString());
			var refSessionList = firebase.database().ref('sessionList');
			if (refNew.path.o.length == 2) refSessionList.push({ name: $scope.name, ref: refNew.path.o[0] + "/" + refNew.path.o[1] });

			$rootScope.session = $scope.name;
			$rootScope.sessionRef = refNew.toString();
			$location.path('summary');
		}
	});

'use strict';
angular
	.module('PitchEvaluator')
	.controller('indexCtrl', function ($rootScope, $scope, $location, userService, loggedinCheck, permissionsService) {
		userService.set(null);
		$rootScope.user = null;
		$rootScope.loggedin = false;
		$rootScope.session = null;
		$rootScope.role = null;
		$rootScope.sessionRef = null;
		$rootScope.isSmallScreen = matchMedia("screen and (max-width: 768px)").matches;

		$scope.login_background = null;
		$scope.hideUser = true;

		/* Testing as Admin
		$rootScope.user = 'Admin';
		$rootScope.role = 'Admin';
		$rootScope.session = "Spring Final Pitches and Demos";
		$rootScope.sessionRef = "sessions/-KlQOGH5SBAFnMi5pvJi";
		$rootScope.loggedin = true;
		userService.set('Admin');
		//*/

		/* Testing as Judge
		$rootScope.user = 'test';
		$rootScope.role = 'Judge';
		$rootScope.session = "Spring Final Pitches and Demos";
		$rootScope.sessionRef = "sessions/-KlQOGH5SBAFnMi5pvJi";
		$rootScope.loggedin = true;
		userService.set('Me');
		//*/

		/* Testing as Team
		$rootScope.user = 'A';
		$rootScope.role = 'Team';
		$rootScope.session = "Spring Final Pitches and Demos";
		$rootScope.sessionRef = "sessions/-KlQOGH5SBAFnMi5pvJi";
		$rootScope.loggedin = true;
		$rootScope.teamID = "-KlQRqeG2Lzr4lkHHqH0";
		userService.set('A');
		//*/

		firebase.initializeApp({
			apiKey: "AIzaSyD9XgBYtKYFzKFChf7R8ZT6RU4k4AcoG3s",
			authDomain: "pitchevaluator-e74d8.firebaseapp.com",
			databaseURL: "https://pitchevaluator-e74d8.firebaseio.com",
			storageBucket: "pitchevaluator-e74d8.appspot.com",
			messagingSenderId: "866109741450"
		});

		$rootScope.questionGroups = [{
			header: 'Pitch',
			questions: [{
				text: 'Problem/Need team is pursuing was clearly explained and understood',
				label: 'problem/need',
				type: 'range'
			}, {
				text: 'The team has a good understanding of their target users and customers who would buy/use their solution.',
				label: 'target customers',
				type: 'range'
			}, {
				text: 'Demo addresses the problem/need adequately.',
				label: 'demo',
				type: 'range'
			}, {
				text: 'The overall pitch was *compelling* and left you wanting to learn more.',
				label: 'compelling',
				type: 'range'
			}, {
				text: 'Should the team pivot?',
				label: 'pivot',
				header: 'Pivot?',
				type: 'radio'
			}]
		}];
		// Utility function to run a function on each question in a questionGroups object
		$rootScope.forEachQuestion = function (questionGroup, func, callback) {
			for (var i = 0; i < questionGroup.length; i++) {
				var group = questionGroup[i];
				for (var j = 0; j < group.questions.length; j++) {
					if (func(group.questions[j]) === false) {
						return;
					}
				}
			}
			if (callback === undefined) return;
			callback();
		}
		$rootScope.questions = [];
		$rootScope.forEachQuestion($rootScope.questionGroups, function (question) {
			$rootScope.questions.push(question);
		});

		$rootScope.$watch(function (rootScope) { return rootScope.role },
			function () {
				if ($rootScope.role == 'Admin') {
					$scope.user = $rootScope.user;
					$scope.tabs = [
						{ link: '/summary', label: 'Overview' },
						{ link: '/addTeam', label: 'Add a Team' },
						{ link: '/newSession', label: 'Create a New Session' },
					];
				}
				else if ($rootScope.role == 'Judge') {
					$scope.user = $rootScope.user;
					$scope.tabs = [
						{ link: '/judge', label: 'Overview' },
						{ link: '/review', label: 'Review Teams' },
						{ link: '/summary', label: 'Summary' }
					];
				}
				else {
					$scope.user = $rootScope.user;
					$scope.tabs = [
						{ link: '/login', label: 'Team Overview' }
					];
				}
			});

		$scope.adminFlag = false;

		$scope.logOut = function () {
			userService.set(null);
			$rootScope.user = null;
			$rootScope.loggedin = false;
			$rootScope.session = null;
			$rootScope.role = null;
			$rootScope.sessionRef = null;
			$scope.adminFlag = false;
			$location.path('login');
		}

		$rootScope.$on('$locationChangeSuccess', function (event) {
			// console.log($location.path());
			if ($location.path() === "/login") {
				$scope.login_background = {
					"background": "rgb(103, 58, 183)"
				}
				$scope.hideUser = true;
			}
			if ($location.path() != "/login") {
				$scope.login_background = {
					"background": "rgb(251, 247, 255)"
				}
				$scope.hideUser = false;
			}
		})

		$scope.isActive = function (route) {
			return route === $location.path();
		};

		$scope.onLogin = function () {
			if ($location.path() == "/login") {
				return true;
			}
			return false;
		}

		$scope.$watch(function (scope) { return scope.role },
			function (newValue, oldValue) {
				if (newValue == 'Admin') {
					$scope.adminFlag = true;
					$scope.user = 'Admin';
				}
				else {
					$scope.adminFlag = false;
				}
			}
		);
	});

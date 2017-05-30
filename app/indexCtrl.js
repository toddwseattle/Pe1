'use strict';
angular
	.module('PitchEvaluator')
	.controller('indexCtrl', function ($rootScope, $scope, $location, userService, loggedinCheck, permissionsService) {

		// loggedinCheck.check();
		userService.set(null);
		$rootScope.user = null;
		$rootScope.loggedin = false;
		$rootScope.session = null;
		$rootScope.role = null;
		$rootScope.sessionRef = null;
		$scope.login_background = null;
		$scope.hideUser = true;


		// // TESTING PURPOSES..........
		// $rootScope.user = 'Admin';
		// $rootScope.role = 'Admin';
		// $rootScope.session = "Test Session";
		// $rootScope.sessionRef = "https://pitchevaluator.firebaseio.com/sessions/-KIdcRUghsu2TwybVf5L";
		// $rootScope.loggedin = true;
		// userService.set('Admin');
		// // END

		// // TESTING PURPOSES..........
		// $rootScope.user = 'Me';
		// $rootScope.role = 'Judge';
		// $rootScope.session = "Test Session";
		// $rootScope.sessionRef = "https://pitchevaluator.firebaseio.com/sessions/-KIzGu8j1-UDUYTj795B";
		// $rootScope.loggedin = true;
		// userService.set('Me');
		// // END

		// // TESTING PURPOSES..........
		// $rootScope.user = 'New Team';
		// $rootScope.role = 'Team';
		// $rootScope.session = "Test Session";
		// $rootScope.sessionRef = "https://pitchevaluator.firebaseio.com/sessions/-KIzGu8j1-UDUYTj795B";
		// $rootScope.loggedin = true;
		// $rootScope.teamID = "-KIzGxTmvXpcgrwOl3Q_";
		// userService.set('New Team');
		// // END
		$rootScope.fbconfig = {
			apiKey: "AIzaSyCTFYgrrMO6_3uaYY-4HCmAnQaVglarjM0",
			authDomain: "nuvention-final-17.firebaseapp.com",
			databaseURL: "https://nuvention-final-17.firebaseio.com",
			projectId: "nuvention-final-17",
			storageBucket: "nuvention-final-17.appspot.com",
			messagingSenderId: "197433838846"
		};
		$rootScope.masterref = firebase.initializeApp($rootScope.fbconfig);
		// bug bug merge questionstext and questionslabel into single structure
		$rootScope.questionsText = [
			"Concise (less than 3 minutes) and informative interactive demo provided that linked value proposition to targeted customer",
			"Questions answered concisely and accurately and feedback listened to",
			"Team has Product Market Fit",
			"The team has a good understanding of their target users and customers who would buy/use their solution",
			"Solid customer acquisition and market traction results",
			"Financial model and pricing are viable",
			"The overall pitch was compelling and left you wanting to learn more",
			"Should the continue after class?"
		];
		$rootScope.questionLabel = [
			'concise demo',
			'concise answers',
			'product-market fit',
			'understands target users',
			'traction',
			'pricing',
			'compelling',
			'continue'
		];

		//  firebase.initializeApp(config);
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

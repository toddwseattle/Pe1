'use strict';
angular
	.module('PitchEvaluator')
	.controller('SummaryCtrl', function ($rootScope, $scope, permissionsService, $firebaseObject, $firebaseArray, $location, loggedinCheck, teamService) {
		loggedinCheck.check();

		if (!permissionsService.isPermitted('Overview')) {
			if ($rootScope.role == 'Team') {
				$location.path('team');
			}
		}

		$scope.reviewTeam = function (team) {
			if ($rootScope.role === 'Judge') {
				teamService.set(team);
				$location.path('review');
			}
		}

		var sessionRef = firebase.database().ref($rootScope.sessionRef);
		$scope.sessionAverages = $firebaseObject(sessionRef.child('averages'));
		var teamsRef = firebase.database().ref($rootScope.sessionRef + "/teams");
		$scope.teams = $firebaseArray(teamsRef);

		$scope.teams.$loaded(function () {
			$scope.teams.sort(function (a, b) {
				if (a.averages === undefined || a.averages['rank'] === undefined) {
					return 1;
				}
				if (b.averages === undefined || b.averages['rank'] === undefined) {
					return -1;
				}
				return a.averages['rank'] - b.averages['rank'];
			});
		});

		// Initialize CSV headers for summary and detail CSVs
		var summaryHeader = ["name", "rank", "average"];
		var detailHeader = ["name", "reviewer", "rank", "average"];
		$rootScope.questions.forEach(question => {
			var label = question.label;
			summaryHeader.push(label);
			detailHeader.push(label);
			detailHeader.push(label) + ' (comments)';
		});

		// Takes an array of columns and an array of data objects
		// Outputs a CSV string with data header
		function convertDataToCSV(columns, data) {
			var columnDelimiter = ',';
			var lineDelimiter = '\n';

			var result = 'data:text/csv;charset=utf-8,';
			result += columns.join(columnDelimiter);
			result += lineDelimiter;

			data.forEach(function (item) {
				columns.forEach(function (key, i) {
					if (i > 0) result += columnDelimiter;
					result += item[key];
				});
				result += lineDelimiter;
			});

			return result;
		}

		function downloadCSV(csvData, fileName) {
			var encoded = encodeURI(csvData);

			var link = document.createElement('a');
			link.setAttribute('href', encoded);
			link.setAttribute('download', fileName);

			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}

		$scope.downloadSummary = function () {
			Promise.all([$scope.sessionAverages.$loaded(), $scope.teams.$loaded()]).then(() => {
				var summaryData = [];

				$scope.teams.forEach(team => {
					var data = {
						[summaryHeader[0]]: team.name,
						[summaryHeader[1]]: team.averages['rank'],
						[summaryHeader[2]]: team.averages['overall'],
					}

					$rootScope.questions.forEach(question => {
						var label = question.label;
						data[label] = team.averages[label];
					});

					summaryData.push(data);
				});

				var classData = {
					[summaryHeader[0]]: "Class",
					[summaryHeader[1]]: $scope.sessionAverages['rank'],
					[summaryHeader[2]]: $scope.sessionAverages['overall'],
				}

				$rootScope.questions.forEach(question => {
					var label = question.label;
					classData[label] = $scope.sessionAverages[label];
				});

				summaryData.push(classData);

				downloadCSV(convertDataToCSV(summaryHeader, summaryData),
					"summary.csv");
			});
		}

		$scope.downloadReviews = function (teamName) {
			$scope.teams.$loaded(() => {
				var allReviews = [];

				$scope.teams.forEach(team => {
					// Only get data for a certain team if specified
					if (teamName !== undefined && team.name !== teamName) return;
					for (var reviewer in team.reviews) {
						var review = team.reviews[reviewer];
						var data = {
							[detailHeader[0]]: team.name,
							[detailHeader[1]]: reviewer,
							[detailHeader[2]]: review.rank,
							[detailHeader[3]]: review.average,
						}

						$rootScope.questions.forEach(question => {
							var label = question.label;
							data[label] = review.ratings[label];
							data[label + " (comments)"] = review.comments[label];
						});

						allReviews.push(data);
					}
				});

				var fileName;
				if (teamName !== undefined) {
					fileName = `${teamName}-reviews.csv`;
				} else {
					fileName = "all-reviews.csv";
				}

				downloadCSV(convertDataToCSV(detailHeader, allReviews), fileName);
			});
		}
	});

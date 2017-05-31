'use strict';
angular
  .module('PitchEvaluator')
  .controller('JudgeCtrl', function ($timeout, $rootScope, $scope, permissionsService, $firebaseObject, $firebaseArray, $location, loggedinCheck, teamService) {
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

    $scope.header = function (question, index) {
      return question.header || 'Q' + (index + 1);
    }

    $scope.isSmallScreen = function () {
      return matchMedia("screen and (max-width: 768px)").matches;
    }

    function rankings() {
      var count = 0;
      for (var i = 0; i < $scope.reviewedTeams.length; i++) {
        if ($scope.reviewedTeams[i].color.rank != 'none') {
          count += 1;
        }
      }
      for (var i = 0; i < $scope.reviewedTeams.length; i++) {
        if ($scope.reviewedTeams[i].color.rank == 'none') {
          count += 1;
          $scope.reviewedTeams[i].color.rank = count;
        }
      }
      for (var team of $scope.reviewedTeams) {
        var revRef = firebase.database().ref($rootScope.sessionRef + "/teams/" + team.teamID + "/reviews/" + team.reviewID);
        revRef.update({ rank: team.rank });
      }
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
      $scope.reviewedTeams.sort(function (a, b) { return a.rank - b.rank });
    });

    $scope.dragStart = function (e, ui) {
      ui.item.data('start', ui.item.index());
    }// create a temporary attribute on the element with old index
    $scope.dragEnd = function (e, ui) {
      var start = ui.item.data('start'),
        end = ui.item.index();//get the new and old index

      if (start < end) {
        for (var i = 0; i < start; i++) {
          $scope.reviewedTeams[i].color = null;
        }
        for (var i = end + 1; i < $scope.reviewedTeams.length; i++) {
          $scope.reviewedTeams[i].color = null;
        }

        $scope.reviewedTeams[start].color.rank = end + 1;
        for (var i = start + 1; i <= end; i++) {
          $scope.reviewedTeams[i].color.rank -= 1;
        }

        $scope.reviewedTeams[end].color = 'red';
        for (var i = start; i < end; i++) {
          $scope.reviewedTeams[i].color = 'green';
        }
      } else {
        for (var i = 0; i < end; i++) {
          $scope.reviewedTeams[i].color = null;
        }
        for (var i = start + 1; i < $scope.reviewedTeams.length; i++) {
          $scope.reviewedTeams[i].color = null;
        }
        $scope.reviewedTeams[start].color.rank = end + 1;
        for (var i = end; i < start; i++) {
          $scope.reviewedTeams[i].color.rank += 1;
        }

        $scope.reviewedTeams[end].color = 'green';
        for (var i = end + 1; i <= start; i++) {
          $scope.reviewedTeams[i].color = 'red';
        }
      }

      for (var team of $scope.reviewedTeams) {
        var revRef = firebase.database().ref($rootScope.sessionRef + "/teams/" + team.teamID + "/reviews/" + team.reviewID);
        revRef.update({ rank: team.rank });

        var team = firebase.database().ref($rootScope.sessionRef + "/teams/" + team.teamID);
        calcAvgRank(team);
      }

      $scope.reviewedTeams.sort(function (a, b) { return a.rank - b.rank })
      $timeout(function () {
        for (var i = 0; i < $scope.reviewedTeams.length; i++) {
          $scope.reviewedTeams[i].color = null;
        }
      }, 2500);
    }

    var sortableOptions = {
      start: $scope.dragStart,
      update: $scope.dragEnd
    };

    // Drag and drop only with the handle on small screens
    if ($scope.isSmallScreen()) {
      sortableOptions.handle = '.drag-handle';
    }

    $('#sortable').sortable(sortableOptions);

    var calcAvgRank = function (team) {
      var rank;
      var ranksum = 0;

      var reviewArray = $firebaseArray(team.child("reviews"));

      reviewArray.$loaded().then(function () {
        console.log(reviewArray);
        for (var i = 0; i < reviewArray.length; i++) {
          ranksum += parseFloat(reviewArray[i].rank);
        }

        console.log(ranksum);

        rank = ranksum / reviewArray.length;
        rank = rank.toFixed(2);

        team.update({
          rank: rank
        })
      });
    }
  });

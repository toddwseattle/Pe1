'use strict';
angular
  .module('PitchEvaluator')
  .controller('JudgeCtrl', function($timeout, $rootScope, $scope, permissionsService, $firebaseObject, $firebaseArray, $location, loggedinCheck, teamService, userService, db_url) {
    $scope.checking = false;
    loggedinCheck.check();

    if (!permissionsService.isPermitted('JudgeView')) {
      if ($rootScope.role == 'Team'){
          $location.path('team');
      }
    }

    $scope.teamClasses = [];
    $scope.saveTeam = function(teamName) {
      teamService.set(teamName);
      $location.path('review');
    }

    function rankings() {
      // console.log('RANKINGSSSS');
      // for (var i=0; i<$scope.reviewedTeams.length; i++) {
      //   console.log(i,'=',$scope.reviewedTeams[i].rank);
      // }
      var count = 0;
      for (var i=0; i<$scope.reviewedTeams.length; i++) {
        if ($scope.reviewedTeams[i].rank!='none') {
          // console.log('Assigned');
          count+=1;
        }
      }
      // console.log('count=', count);
      for (var i=0; i<$scope.reviewedTeams.length; i++) {
        if ($scope.reviewedTeams[i].rank=='none') {
          // console.log('NotAssigned');
          count += 1;
          $scope.reviewedTeams[i].rank = count;
        }
      }
      // console.log('count=', count);
      for (var team of $scope.reviewedTeams) {
        var revRef=firebase.database().ref($rootScope.sessionRef+"/teams/"+team.teamID+"/reviews/" + team.reviewID);
        //var revRef = (new Firebase($rootScope.sessionRef+"/teams/"+team.teamID+"/reviews/" + team.reviewID));
        revRef.update({rank: team.rank});
      }
    }

    $scope.reviewedTeams = [];
    $scope.notReviewedTeams = [];
    var teamsRef=firebase.database().ref($rootScope.sessionRef+"/teams");
    //var teamsRef = new Firebase($rootScope.sessionRef+"/teams");
    var averagesRef = teamsRef.parent.child("averages");
    $scope.averagesArray = $firebaseArray(averagesRef);
    var teamList = $firebaseArray(teamsRef);
    var teamsLoadedCount = 0;
    teamList.$loaded(function() {
      //teamList.sort(function(a,b) {return a.rank-b.rank});
      teamList.forEach(function(team, index) {
       // var reviews = $firebaseArray(new Firebase($rootScope.sessionRef+"/teams/"+team.$id+"/reviews"));
        var reviews = $firebaseArray(firebase.database().ref($rootScope.sessionRef+"/teams/"+team.$id+"/reviews"));
        var alreadyReviewed = false;
        reviews.$loaded(function() {
          teamsLoadedCount+=1;
          for (var review of reviews) {
            if (review.user==$rootScope.user) {
              alreadyReviewed = true;

              var judgeSum = parseFloat(review.q1) + parseFloat(review.q2) + parseFloat(review.q3) + parseFloat(review.q4);
              var judgeAvg = judgeSum/4.0;
              var judgeAvg = judgeAvg.toFixed(2);

              var temp = {
                teamID: team.$id,
                reviewID: review.$id,
                name: team.name,
                product: team.product,
                q1Val: review.q1,
                q2Val: review.q2,
                q3Val: review.q3,
                q4Val: review.q4,
                rank: review.rank,
                avgrank: team.rank,
                ovrAvg: judgeAvg
              }
              $scope.reviewedTeams.push(temp);
              $scope.teamClasses.push(null);
              break;
            }
          }
          if (!alreadyReviewed) {
            $scope.notReviewedTeams.push(team);
          }
          if (teamsLoadedCount==teamList.length) {
            rankings();
            $scope.reviewedTeams.sort(function(a,b) {return a.rank-b.rank});
          }
        });

      });

    }) //end teamList.$loaded



    $scope.dragStart = function(e, ui) {
      ui.item.data('start', ui.item.index());
       //console.log(ui.item.index());

    }// create a temporary attribute on the element with old index
    $scope.dragEnd = function(e, ui) {
      var start = ui.item.data('start'),
          end = ui.item.index();//get the new and old index

      if (start<end) {
        for (var i=0; i<start;i++) {
          $scope.teamClasses[i] = null;
        }
        for (var i=end+1; i<$scope.reviewedTeams.length;i++) {
          $scope.teamClasses[i] = null;
        }

        $scope.reviewedTeams[start].rank = end+1;
        for (var i=start+1; i<=end;i++) {
          $scope.reviewedTeams[i].rank-=1;
        }

        $scope.teamClasses[end] = 'red';
        for (var i=start; i<end;i++) {
          $scope.teamClasses[i] = 'green';
        }
      }
      else {
        // console.log('start>end');
        for (var i=0; i<end;i++) {
          $scope.teamClasses[i] = null;
        }
        for (var i=start+1; i<$scope.reviewedTeams.length;i++) {
          $scope.teamClasses[i] = null;
        }
        $scope.reviewedTeams[start].rank = end+1;
        for (var i=end; i<start;i++) {
          $scope.reviewedTeams[i].rank+=1;
        }

        $scope.teamClasses[end] = 'green';
        for (var i=end+1; i<=start;i++) {
          $scope.teamClasses[i] = 'red';
        }

      }


      // for (var i=0; i<$scope.reviewedTeams.length;i++) {
      //   console.log($scope.reviewedTeams[i].name, $scope.reviewedTeams[i].rank);
      // }
      // console.log($scope.reviewedTeams);
      for (var team of $scope.reviewedTeams) {
        var revRef = firebase.database().ref($rootScope.sessionRef+"/teams/"+team.teamID+"/reviews/" + team.reviewID);
        //var revRef = (new Firebase($rootScope.sessionRef+"/teams/"+team.teamID+"/reviews/" + team.reviewID));
        revRef.update({rank: team.rank});

 //       var team = new Firebase($rootScope.sessionRef+"/teams/"+team.teamID);
        var team = firebase.database().ref($rootScope.sessionRef+"/teams/"+team.teamID);
        calcAvgRank(team);
      }

      $scope.reviewedTeams.sort(function(a,b) {return a.rank-b.rank})
      $timeout(function() {
        for (var i=0; i<$scope.teamClasses.length;i++) {
          $scope.teamClasses[i] = null;
        }
      }, 2500);
      // for (var i=0; i<$scope.reviewedTeams.length;i++) {
      //   console.log($scope.reviewedTeams[i].name, $scope.reviewedTeams[i].rank);
      // }
    }

    $('#sortable').sortable({
      start: $scope.dragStart,
      update: $scope.dragEnd,
      delay: 1000
    });

    var calcAvgRank = function(team) {
      var rank;
      var ranksum = 0;

      var reviewArray = $firebaseArray(team.child("reviews"));

      reviewArray.$loaded().then(function() {
        console.log(reviewArray);
        for (var i = 0; i < reviewArray.length; i++) {
          ranksum += parseFloat(reviewArray[i].rank);
        }

        console.log(ranksum);

        rank = ranksum/reviewArray.length;
        rank = rank.toFixed(2);

        team.update({
          rank: rank
        })

      });

    }

  })

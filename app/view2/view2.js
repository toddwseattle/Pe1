'use strict';
angular
.module('PitchEvaluator')
.controller('View2Ctrl', function($scope, $firebaseObject, $firebaseArray, $location) {
	var teamsRef = new Firebase("https://pitchevaluator.firebaseio.com/teams");
  $scope.loadingTeams = true;
	var teamList = $firebaseArray(teamsRef);
	teamList.$loaded(function() {
    $scope.loadingTeams = false;
    $scope.teams = teamList;
  });

	var curTeamName, curTeamIndex, curTeamKey, curTeamObject, curTeamRef;
	var q1, q2, q3, q4, q5, cmt1, cmt2, cmt3, cmt4, cmt5;

	var dbUpdate = function(team, q1, cmt1, q2, cmt2, q3, cmt3, q4, cmt4, q5, cmt5) {
		if (q1 != undefined) {
			team.update({q1Val: q1});
		}
		if (q2 != undefined) {
			team.update({q2Val: q2});
		}
		if (q3 != undefined) {
			team.update({q3Val: q3});
		}
		if (q4 != undefined) {
			team.update({q4Val: q4});
		}
		if (q5 != undefined) {
			team.update({q5Val: q5});
		}
		if (cmt1 != "") {
			team.update({q1cmt: cmt1});
		}
		if (cmt2 != "") {
			team.update({q2cmt: cmt2});
		}
		if (cmt3 != "") {
			team.update({q3cmt: cmt3});
		}
		if (cmt4 != "") {
			team.update({q4cmt: cmt4});
		}
		if (cmt5 != "") {
			team.update({q5cmt: cmt5});
		}
		if (q1 != undefined && q2 != undefined && q3 != undefined & q4 != undefined) {
			var teamavg = (parseFloat(q1) + parseFloat(q2) + parseFloat(q3) + parseFloat(q4))/4.0;
			teamavg = teamavg.toFixed(2);
			team.update({teamavgval: teamavg});
		}
	}

  class Evaluation {
    constructor(user, teamName, q1, cmt1, q2, cmt2, q3, cmt3, q4, cmt4, q5, cmt5) {
      this.user = user;
      this.teamName = teamName;
      this.q1 = q1;
      this.cmt1 = cmt1;
      this.q2 = q2;
      this.cmt2 = cmt2;
      this.q3 = q3;
      this.cmt3 = cmt3;
      this.q4 = q4;
      this.cmt4 = cmt4;
      this.q5 = q5;
      this.cmt5 = cmt5;
    }
  }
	$scope.onSubmit = function() {
		curTeamName = document.getElementById("team-select").value;

		q1 = $('input[name="q1radio"]:checked').val();
		q2 = $('input[name="q2radio"]:checked').val();
		q3 = $('input[name="q3radio"]:checked').val();
		q4 = $('input[name="q4radio"]:checked').val();
		q5 = $('input[name="q5radio"]:checked').val();

		cmt1 = document.getElementById("q1textarea").value;
		cmt2 = document.getElementById("q2textarea").value;
		cmt3 = document.getElementById("q3textarea").value;
		cmt4 = document.getElementById("q4textarea").value;
		cmt5 = document.getElementById("q5textarea").value;

		// for (var i = 0; i < teamList.length; i++) {
		// 	if (teamList[i].name == curTeamName) {
		// 		curTeamIndex = i;
		// 		curTeamKey = teamList.$keyAt(curTeamIndex);
		// 		curTeamObject = $firebaseObject(teamsRef.child(curTeamKey))
    //
		// 		curTeamRef = teamsRef.child(curTeamKey);
    //
		// 		dbUpdate(curTeamRef, q1, cmt1, q2, cmt2, q3, cmt3, q4, cmt4, q5, cmt5);
		// 	}
		// }

    //@TODO: implemented user auth
    var user = "John Doe"

    var evaluation = new Evaluation(user, curTeamName, q1, cmt1, q2, cmt2, q3, cmt3, q4, cmt4, q5, cmt5);
    console.log(evaluation);
    for (var i = 0; i < teamList.length; i++) {
			if (teamList[i].name == curTeamName) {
        var teamRef = teamsRef + "/" + teamList[i].$id;
        var team = new Firebase(teamRef);
        var reviews = team.child('reviews');
        reviews.push(evaluation);
        break;
      }
    }

    // $location.path('#/view1');
	};
});

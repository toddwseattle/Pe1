'use strict';
angular
  .module('PitchEvaluator')
  .controller('View1Ctrl', function($rootScope, $scope, permissionsService, $firebaseObject, $firebaseArray, $location, loggedinCheck, teamService, userService, db_url) {

    loggedinCheck.check();
    if (!permissionsService.isPermitted('Overview')) {
      // if ($rootScope.role == 'Judge') {
      //   $location.path('judge');
      // }
      if ($rootScope.role == 'Team'){
          $location.path('team');
      }
    }

    var teamsForCSV = [];
    var fullCSV = [];
    var tempTeam = [];
    var teamArray = [];

    var ref = $rootScope.masterref;
    var sessListRef = firebase.database().ref().child("sessionList");
    //var sessListRef = new Firebase(db_url+"/sessionList");
    var temp = new $firebaseArray(sessListRef);
    temp.$loaded(function() {
      temp.forEach(function(session) {
        if (session.name==$rootScope.session) {
          var teamsRef=firebase.database().ref(session.ref).child('teams')
//          var teamsRef = new Firebase(session.ref+"/teams");
          var averagesRef = teamsRef.parent.child("averages");
          $scope.averagesArray = $firebaseArray(averagesRef);

          $scope.teamArray = $firebaseArray(firebase.database().ref(session.ref).child("teams"));
//          $scope.teamArray = $firebaseArray(new Firebase(session.ref+"/teams"));
          $scope.teamList = $firebaseArray(firebase.database().ref(session.ref).child("teams"));
      //    $scope.teamList = $firebaseArray(new Firebase(session.ref+"/teams"));
          $scope.teamList.$loaded(function() {
            $scope.teamList.sort(function(a,b) {return a.rank-b.rank});

            // to create the arrayOfObjects you'll print to CSV
            for (var i = 0; i < $scope.teamList.length; i++) {
              //to make the simple team
              var curTeam = $scope.teamList[i];
              var teamy = new Team(curTeam.name, curTeam.product,curTeam.rank,curTeam.q1Val,
                curTeam.q2Val, curTeam.q3Val, curTeam.q4Val, curTeam.ovrAvg);
              teamsForCSV.push(teamy);
            }//end for loop

            //data snapshot
            teamsRef.once("value", function(snapshot) {
              snapshot.forEach(function(childSnapshot) {
                var teamSnap = childSnapshot;
                var reviewsSnap = teamSnap.child("reviews");
                reviewsSnap.forEach(function(childSnapshot) {
                  //save each review as an object, from which you can grab field's
                  var rev = childSnapshot.val();
                  var fullEval = new Eval(rev.teamName, rev.user, rev.rank, rev.q1, rev.cmt1,
                    rev.q2, rev.cmt2, rev.q3, rev.cmt3, rev.q4, rev.cmt4, rev.cmt8);
                  fullCSV.push(fullEval);
                  tempTeam.push(fullEval);
                }); //end review loop
                teamArray.push(tempTeam);
                tempTeam = [];
              }); //end team loop
            });

          }) //end teamList.$loaded
        } //end if
      }); //end temp.forEach
    }); //end temp.$loaded

    //Function to store the team in the teamService
    $scope.saveTeam = function(teamID, teamName) {
      $rootScope.teamID = teamID;
      $rootScope.teamName = teamName;
      $location.path('team');
    }

    $scope.setSelectedTab = function(tab) {
      $location.path(tab);
    }

    var calcAvgRank = function(team) {
      var rank;
      var ranksum = 0;

      var reviewArray = $firebaseArray(team.child("reviews"));

      reviewArray.$loaded().then(function() {
        for (var i = 0; i < teamsArray.length; i++) {
          ranksum += parseFloat(teamsArray[i]);
        }

        rank = ranksum/reviewArray.length;
        rank = rank.toFixed(2);

        team.update({
          rank: rank
        })

      });

    }

//Team Class for Summary CSV w/o comments
  class Team {
    constructor(name,product,rank, q1, q2, q3, q4, TA) {
      this.Team_Name = name+' ('+product+')';
      this.Rank=rank;
      this[$rootScope.questionLabel[0]] = q1;
      this[$rootScope.questionLabel[1]] = q2;
      this[$rootScope.questionLabel[2]] = q3;
      this[$rootScope.questionLabel[3]] = q4;
      this.Team_Average = TA;
    }
  }

//Eval Class for Summary CSV w/ Comments & Individual Team CSVs
  class Eval {
    constructor(teamName, Reviewer, Rank,
      q1, q1c, q2, q2c, q3, q3c, q4, q4c, q8c) {
      this.Team_Name = teamName;
      this.Reviewer = Reviewer;
      this.Rank = Rank;
      this[$rootScope.questionLabel[0]] = q1;
      this[$rootScope.questionLabel[1]] = q2;
      this[$rootScope.questionLabel[2]] = q3;
      this[$rootScope.questionLabel[3]] = q4;
      this[$rootScope.questionLabel[0]+"_Comments"] = q1c.replace(/\n/g,' // ');
      this[$rootScope.questionLabel[1]+"_Comments"] = q2c.replace(/\n/g,' // ');
      this[$rootScope.questionLabel[2]+"_Comments"] = q3c.replace(/\n/g,' // ');
      this[$rootScope.questionLabel[3]+"_Comments"] = q4c.replace(/\n/g,' // ');
      this[$rootScope.questionLabel[4]+"_Comments"] = q8c.replace(/\n/g,' // ');
    }
  }

  function convertArrayOfObjectsToCSV(args) {
    var result, ctr, keys, columnDelimiter, lineDelimiter, data;

    data = args.data || null;
    if (data == null || !data.length) {
        return null;
    }

    columnDelimiter = args.columnDelimiter || ',';
    lineDelimiter = args.lineDelimiter || '\n';

    keys = Object.keys(data[0]);

    result = '';
    result += keys.join(columnDelimiter);
    result += lineDelimiter;

    data.forEach(function(item) {
        ctr = 0;
        keys.forEach(function(key) {
            if (ctr > 0) result += columnDelimiter;

            result += item[key];
            ctr++;
        });
        result += lineDelimiter;
    });

    return result;
  }

  $scope.downloadCSV = function(args) {
    var data, filename, link;

    var csv = convertArrayOfObjectsToCSV({
        data: teamsForCSV
    });
    if (csv == null){
        window.alert("No Evaulation Report Available");
        return;
    }

    filename = args.filename || 'export.csv';

    if (!csv.match(/^data:text\/csv/i)) {
        csv = 'data:text/csv;charset=utf-8,' + csv;
    }
    data = encodeURI(csv);

    link = document.createElement('a');
    link.setAttribute('href', data);
    link.setAttribute('download', filename);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  $scope.downloadFullCSV = function(args) {
    var data, filename, link;
    var csv = convertArrayOfObjectsToCSV({
      data: fullCSV
    });
    if (csv == null){
        window.alert("No Evaulation Report Available");
        return;
    }
    filename = args.filename || 'export.csv';
     if (!csv.match(/^data:text\/csv/i)) {
          csv = 'data:text/csv;charset=utf-8,' + csv;
      }
      data = encodeURI(csv);

      link = document.createElement('a');
      link.setAttribute('href', data);
      link.setAttribute('download', filename);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  }

  $scope.downloadTeamCSV = function(args) {
    var data, filename, link, index;
    index = args.index;
    console.log(index);
    var csv = convertArrayOfObjectsToCSV({
      data: teamArray[index]
    });
    if (csv == null){
      window.alert("No Evaulation Report Available");
      return;
    }
    filename = args.filename || 'export.csv';
     if (!csv.match(/^data:text\/csv/i)) {
          csv = 'data:text/csv;charset=utf-8,' + csv;
      }
      data = encodeURI(csv);

      link = document.createElement('a');
      link.setAttribute('href', data);
      link.setAttribute('download', filename);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

});

'use strict';

angular
  .module('PitchEvaluator', ['ngRoute', 'firebase'])
  .constant('db_url', "https://pitchevaluator.firebaseio.com")
  .config(function($routeProvider) {
    $routeProvider
      .when('/summary', {
        templateUrl: 'summary/summary.html',
        controller: 'SummaryCtrl',
        css: 'summary/summary.css'
      })
      .when('/judge', {
        templateUrl: 'judge/judge.html',
        controller: 'JudgeCtrl',
        css: 'judge/judge.css'
      })
      .when('/team', {
        templateUrl: 'team/team.html',
        controller: 'TeamCtrl',
        css: 'team/team.css'
      })
      .when('/view2', {
        templateUrl: 'view2/view2.html',
        controller: 'View2Ctrl',
        css : 'view2/view2.css'
      })
      .when('/addTeam', {
        templateUrl: 'addTeam/addTeam.html',
        controller: 'addTeamCtrl',
        css: 'addTeam.css'
      })
      .when('/teamSummary', {
        templateUrl: 'teamSummary/teamSummary.html',
        controller: 'teamSummaryCtrl',
        css: 'teamSummary.css'
      })
      .when('/login', {
        templateUrl: 'login/login.html',
        controller: 'loginCtrl',
        css: 'login/login.css'
      })
      .when('/newSession', {
        templateUrl: 'newSession/newSession.html',
        controller: 'newSessionCtrl',
        css: 'newSession.css'
      })
      .otherwise({
        redirectTo: 'summary'
      });
  });

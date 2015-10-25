var app = angular.module('LoginApp', ['ngMaterial', 'ngRoute']).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider
    .when('/login', {
    	
    });
  	$locationProvider.html5Mode(true);
}]);

app.controller('LoginCtrl', ['$scope', '$mdSidenav', '$location', '$http', function($scope, $mdSidenav, $location, $http){

}]);
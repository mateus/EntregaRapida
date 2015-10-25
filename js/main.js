var app = angular.module('EntregaRapidaApp', ['ngMaterial', 'ngRoute']).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider
    .when('/', {
      redirectTo: '/pedidos'
    })
    .when('/pedidos',{
      controller:'AppCtrl',
      templateUrl:'templates/pedidos.html'
    })
    .when('/nova-entrega',{
      controller: 'AppCtrl',
      templateUrl: 'templates/nova-entrega.html'
    })
    .when('/pedidos/status',{
      controller: 'AppCtrl',
      templateUrl: 'templates/status.html'
    })
    .otherwise({
      redirectTo: '/'
    });
  $locationProvider.html5Mode(true);
}]);

app.controller('AppCtrl', ['$scope', '$mdSidenav', '$location', '$http', function($scope, $mdSidenav, $location, $http){

  $scope.$on('$viewContentLoaded', function readyToTrick() {
    $scope.novo_id_pedido = localStorage.getItem("novo_pedido_id");
  });

  $scope.signOut = function(){
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
      window.location.href = '/login/';
    });
  }

  $scope.toggleSidenav = function(menuId) {
    $mdSidenav(menuId).toggle();
  };

  $scope.filtroRadioBtn = 'todos';

  $scope.novaEntrega = {"tipo":"1", 'fragil': true, "status": 1};

  $scope.googleUserName = 'Usuário';
  $scope.googleUserPhoto = 'img/user.png';

  $scope.abrirItem = function($event){
    if (angular.element($event.currentTarget).hasClass("open")) {
      angular.element($event.currentTarget).removeClass("open");
    }else{
      angular.element($event.currentTarget).addClass("open");
    };
  }

  var webserviceIP = "http://localhost:8080";
  $http.get(webserviceIP + '/api/entregas')
    .success(function(data) {
        $scope.entregas = data;
        console.log(data);
    })
    .error(function(data) {
        console.log('Error: ' + data);
  });

  $scope.submitNovaEntrega = function(form) {
    console.log($scope.novaEntrega);
    $http.post(webserviceIP + '/api/entregas', $scope.novaEntrega)
    .success(function(data) {
        $scope.novaEntrega = {"tipo":"1", 'fragil': true, "status": 1};
        localStorage.setItem("novo_pedido_id", data.id);
        $location.path('/pedidos/status');
        // console.log(data.id);
    })
    .error(function(data) {
        console.log('Error: ' + data);
    });
  }
  
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; 

  var yyyy = today.getFullYear();
  if(dd<10){
    dd='0'+dd
  } 
  if(mm<10){
    mm='0'+mm
  } 
  var today = dd+'/'+mm+'/'+yyyy;
  $scope.novaEntrega.data_pedido = today;

  $scope.imagePath = "img/pacote.png";


  // {
  // origin: LatLng | String | google.maps.Place,
  // destination: LatLng | String | google.maps.Place,
  // travelMode: TravelMode,
  // transitOptions: TransitOptions,
  // unitSystem: UnitSystem,
  // durationInTraffic: Boolean,
  // waypoints[]: DirectionsWaypoint,
  // optimizeWaypoints: Boolean,
  // provideRouteAlternatives: Boolean,
  // avoidHighways: Boolean,
  // avoidTolls: Boolean,
  // region: String
  // }
  
  var directionsService;
  var directionsDisplay;

  function calcRoute() {
    var inicio = $scope.novaEntrega.origem.lat+","+$scope.novaEntrega.origem.lon;
    var fim = $scope.novaEntrega.destino.lat+","+$scope.novaEntrega.destino.lon;
    var request = {
      origin:inicio,
      destination:fim,
      travelMode: google.maps.TravelMode.DRIVING
    };
    directionsService.route(request, function(result, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setOptions({ preserveViewport: true });
        directionsDisplay.setDirections(result);
      }
    });
  }

  function updateScope(lat, lon, endereco, type){
    $scope.$apply(function () {
      if (type == 'origem') {
        $scope.novaEntrega.origem.lat = lat;
        $scope.novaEntrega.origem.lon = lon;
        $scope.novaEntrega.origem.nome = endereco;
      }else{
        $scope.novaEntrega.destino.lat = lat;
        $scope.novaEntrega.destino.lon = lon;
        $scope.novaEntrega.destino.nome = endereco;
      }
    });
  };

  var bounds;
  var podeDaZoom = true;
  var marker1, marker2;
  function initAutocomplete(input, map, type){
    var autocomplete = new google.maps.places.Autocomplete(input);

    autocomplete.bindTo('bounds', map);

    autocomplete.addListener('place_changed', function() {
      var place = autocomplete.getPlace();
      if (!place.geometry) {
        console.log("Autocomplete's returned place contains no geometry");
        return;
      }
      updateScope(place.geometry.location.lat(), place.geometry.location.lng(), place.formatted_address, type);
      
      if (!bounds) {
        bounds = new google.maps.LatLngBounds();
      }; 
      if (type == 'origem') {
        marker1.setPosition(place.geometry.location);
        bounds.extend(marker1.getPosition());
      }else{
        marker2.setPosition(place.geometry.location);
        bounds.extend(marker2.getPosition());
        calcRoute();
      }     
      map.fitBounds(bounds);

      if (podeDaZoom) {
        map.setZoom(18);
        podeDaZoom = false;
      };
    });
  }

  angular.element(document).ready(function () {
    var auth2;
    var googleUser;

    var signinChanged = function (val) {
      $scope.$apply(function(){
        $scope.googleUserName = googleUser.zt.Ei;
        $scope.googleUserPhoto = googleUser.zt.Na;
      });
      if (!val) {
        window.location.href = '/login/';
      };
    };

    var initSigninV2 = function() {
      auth2 = gapi.auth2.init({
          client_id: '1080669249343-4l9ikapbpoqpk2v715cs77lvih8das68.apps.googleusercontent.com',
          scope: 'profile'
      });
      auth2.isSignedIn.listen(signinChanged);

      if (auth2){
        googleUser = auth2.currentUser.get();
      }
    };

    gapi.load('auth2', initSigninV2);

    if (document.getElementById('map')) {


      var map = new google.maps.Map(document.getElementById('map'), {
       center: {lat: -19.916681, lng: -43.934493},
       zoom: 12,
       disableDefaultUI: true,
       styles: [ {
           featureType: "poi",
           elementType: "labels",
           stylers: [
               { visibility: "off" }
           ]
        } ],
      });
      directionsDisplay = new google.maps.DirectionsRenderer({
        suppressMarkers: true
      });
      directionsDisplay.setMap(map);
      directionsService = new google.maps.DirectionsService();

      var input1 = (document.getElementById('autocomplete-google1'));
      var input2 = (document.getElementById('autocomplete-google2'));
      initAutocomplete(input1, map, 'origem');
      initAutocomplete(input2, map, 'destino');
      marker1 = new google.maps.Marker({
        map: map,
        draggable: true,
        raiseOnDrag: true,
        icon: '../img/azul.png',
      });
      marker2 = new google.maps.Marker({
        map: map,
        draggable: true,
        raiseOnDrag: true,
        icon: '../img/verde.png',
      });
      google.maps.event.addListener(marker1, 'dragend', function() {
        $scope.$apply(function(){
          $scope.novaEntrega.origem.lat = marker1.position.lat();
          $scope.novaEntrega.origem.lon = marker1.position.lng();
          if ($scope.novaEntrega.destino && $scope.novaEntrega.origem) {
            calcRoute();
          };
        });
      });
      google.maps.event.addListener(marker2, 'dragend', function() {
        $scope.$apply(function(){
          $scope.novaEntrega.destino.lat = marker2.position.lat();
          $scope.novaEntrega.destino.lon = marker2.position.lng();
          if ($scope.novaEntrega.destino && $scope.novaEntrega.origem) {
            calcRoute();
          };
        });
      });
    };
  }); 
}]);

app.controller('progressCtrl', ['$scope', '$interval', '$http', function($scope, $interval, $http) {
    var self = this, j= 0, counter = 0;
    self.mode = 'query';
    self.activated = true;
    self.determinateValue = 0;
    self.determinateValue2 = 1;
    self.modes = [];

    $scope.status = 1;

    $scope.mudaStatus = function(status){
      var max = 0;
      if(status == 1){
        max = 0;
      }
      else if(status == 2){
        max = 33;
      }
      else if(status == 3){
       max = 66; 
      }
      else if(status == 4){
        max = 100;
      }
      var loops = 10.0;
      var qtde = max - self.determinateValue;
      $interval(function() {
          if(self.determinateValue+qtde/loops < max){
            self.determinateValue += qtde/loops;
          }
          else if(self.determinateValue+qtde/loops > max){
            self.determinateValue += max - self.determinateValue;
          }
          self.determinateValue2 = 1;
          // self.determinateValue2 += 1;
          // if (self.determinateValue > 100) self.determinateValue = 30;
          // if (self.determinateValue2 > 100) self.determinateValue2 = 30;
            // Incrementally start animation the five (5) Indeterminate,
            // themed progress circular bars
            if ( counter++ % 4 == 0 ) j++;
            // Show the indicator in the "Used within Containers" after 200ms delay
            if ( j == 2 ) self.contained = "indeterminate";
        }, 100, loops, true);
    }

    console.log(localStorage.getItem("novo_pedido_id"));
    var webserviceIP = "http://localhost:8080";
    $interval(function() {
        $http.get(webserviceIP + '/api/entrega?id=' + localStorage.getItem("novo_pedido_id"))
        .success(function(data) {
            if($scope.status != data.status){
              $scope.mudaStatus(data.status);
              $scope.status = data.status;
              console.log("mudou status");
              var circulo = document.querySelector('.status' + data.status);
              circulo.className += ' show';
              console.log(circulo);
            }
        })
        .error(function(data) {
            console.log('Error: ' + data);
        }, 5000, 0, true);
    });

    // $scope.mudaStatus(1);
    self.determinateValue2 = 0;
    
    /**
     * Turn off or on the 5 themed loaders
     */
    $interval(function() {
      self.determinateValue += 1;
      self.determinateValue2 = 1;
      // self.determinateValue2 += 1;
      // if (self.determinateValue > 100) self.determinateValue = 30;
      // if (self.determinateValue2 > 100) self.determinateValue2 = 30;
        // Incrementally start animation the five (5) Indeterminate,
        // themed progress circular bars
        if ( (j < 2) && !self.modes[j] && self.activated ) {
          self.modes[j] = (j==0) ? 'buffer' : 'query';
        }
        // if ( counter++ % 4 == 0 ) j++;
        // Show the indicator in the "Used within Containers" after 200ms delay
        // if ( j == 2 ) self.contained = "indeterminate";
    }, 100, 1, true);
    // $interval(function() {
    //   self.mode = (self.mode == 'query' ? 'determinate' : 'query');
    // }, 7200, 0, true);
  }]);
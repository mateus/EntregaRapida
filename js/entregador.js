var app = angular.module('EntregadorApp', ['ngMaterial', 'ngRoute']).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider
    .when('/entregador', {
		controller:'EntregadorCtrl',
		templateUrl:'templates/entregador/principal.html',
		reloadOnSearch: false
    }).when('/entregador/pedido',{
    	controller:'EntregadorCtrl',
    	templateUrl:'templates/entregador/pedido.html',
    	reloadOnSearch: false
    });
  	$locationProvider.html5Mode(true);
}]).service('sharedProperties', function () {
    var uniEdit = 0;

    return {
        getUni: function () {
            return uniEdit;
        },
        setUni: function(value) {
            uniEdit = value;
        }
    };
});

app.controller('EntregadorCtrl', ['$scope', '$mdSidenav', '$location', '$http', function($scope, $mdSidenav, $location, $http){
	var lat, lon;
  	var bounds;
	var podeDaZoom = true;
	var marker1, marker2;
	var map;
	var webserviceIP = "http://localhost:8080";
	
	$scope.$on('$viewContentLoaded', function readyToTrick() {
		$scope.id_entrega = localStorage.getItem("pedido_id");
		if ($scope.id_entrega) {
			$http.get(webserviceIP + '/api/entrega?id=' + $scope.id_entrega)
			.success(function(data) {
			    console.log('STATUS: ' + data.status);
			    $scope.eleRecuperado = data;
			})
			.error(function(data) {
			    console.log('Error: ' + data);
			});
		};
	});

	$scope.entregas = {};

	$http.get(webserviceIP + '/api/entregas/todos')
	.success(function(data) {
	    $scope.entregas.todos = data;
	    $scope.ecopacotes(false);
	    console.log($scope.entregas.todos);
	})
	.error(function(data) {
	    console.log('Error: ' + data);
	});

	$http.get(webserviceIP + '/api/entregas/ecopacote')
	.success(function(data) {
	    $scope.entregas.ecopacotes = data;
	    console.log($scope.entregas.ecopacotes);
	})
	.error(function(data) {
	    console.log('Error: ' + data);
	});

	$scope.abrirItemEntregador = function($event){
	    if (angular.element($event.currentTarget).hasClass("open")) {
	      angular.element($event.currentTarget).removeClass("open");
	    }else{
	      angular.element($event.currentTarget).addClass("open");
	    };
  	}

  	$scope.aceitarPedido = function(elem){
  		elem.status = 2;
  		
  		elem.entregador = 'Arthur Assuncao';
  		$http.post(webserviceIP + '/api/entregas/update', elem)
		.success(function(data) {
		    console.log('Aceitou pedido: ' + elem._id);
		    localStorage.setItem("pedido_id", elem._id);
		    $location.path('/entregador/pedido');    
		})
		.error(function(data) {
		    console.log('Error: ' + data);
		});
  	}

  	$scope.confirmarEntrega = function(){
  		var elemColetado = $scope.eleRecuperado;
  		elemColetado.status = 4;
  		var d = new Date();
		var h = d.getHours();
		var m = d.getMinutes();
		elemColetado.hora_entrega = h + ":" + m;

  		$http.post(webserviceIP + '/api/entregas/update', elemColetado)
		.success(function(data) {
		    console.log('Colegou: ' + elemColetado._id);
			$location.path('/entregador');
		})
		.error(function(data) {
		    console.log('Error: ' + data);
		});
  	}

  	$scope.coletaPendente = true;
  	function entregarPacoteRota(){
		if (!bounds) {
			bounds = new google.maps.LatLngBounds();
		}; 
		marker1.setPosition(new google.maps.LatLng($scope.eleRecuperado.origem.lat,$scope.eleRecuperado.origem.lon));
        bounds.extend(marker1.getPosition());
        marker2.setPosition(new google.maps.LatLng($scope.eleRecuperado.destino.lat,$scope.eleRecuperado.destino.lon));
        bounds.extend(marker2.getPosition());
        calcRoute(new google.maps.LatLng($scope.eleRecuperado.origem.lat,$scope.eleRecuperado.origem.lon), new google.maps.LatLng($scope.eleRecuperado.destino.lat,$scope.eleRecuperado.destino.lon));
      	map.fitBounds(bounds);
      	$scope.coletaPendente = false;
  	};

  	$scope.confirmarColeta = function(){
  		var elemColetado = $scope.eleRecuperado;
  		elemColetado.status = 3;

  		$http.post(webserviceIP + '/api/entregas/update', elemColetado)
		.success(function(data) {
		    console.log('Colegou: ' + elemColetado._id);
		    console.log(elemColetado);
		    entregarPacoteRota();
		})
		.error(function(data) {
		    console.log('Error: ' + data);
		});
  	}

  	$scope.mapView = false;
  	$scope.trocaView = function(){
		$scope.mapView = !$scope.mapView;
  	}

  	$scope.entregas_selecionadas = $scope.entregas.todos;
  	$scope.ecopacotes = function(bool){
  		bool ? $scope.entregas_selecionadas = $scope.entregas.ecopacotes : $scope.entregas_selecionadas = $scope.entregas.todos;
  	}

  	function calcRoute(origem, destino) {
	    var inicio = origem;
	    var fim = destino;
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

  	function addUsuarioPos(){
  		if (!bounds) {
			bounds = new google.maps.LatLngBounds();
		}; 
		marker1.setPosition(new google.maps.LatLng(lat,lon));
        bounds.extend(marker1.getPosition());
        marker2.setPosition(new google.maps.LatLng($scope.eleRecuperado.origem.lat,$scope.eleRecuperado.origem.lon));
        bounds.extend(marker2.getPosition());
        calcRoute(new google.maps.LatLng(lat,lon), new google.maps.LatLng($scope.eleRecuperado.origem.lat,$scope.eleRecuperado.origem.lon));
      	map.fitBounds(bounds);
  	}

	  	angular.element(document).ready(function () {
	  		if (document.getElementById('map')) {
		      	navigator.geolocation.getCurrentPosition(function(pos){
		          lat = pos.coords.latitude;
		          lon = pos.coords.longitude;
		          console.log('Latitude and Longitude: Ready');
		          addUsuarioPos();
		        });

				map = new google.maps.Map(document.getElementById('map'), {
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

		      marker1 = new google.maps.Marker({
		        map: map,
		        icon: '../img/azul.png',
		      });
		      marker2 = new google.maps.Marker({
		        map: map,
		        icon: '../img/verde.png',
		      });
		  }
  	});
}]);

var app = angular.module('appVeiculo', ['ngRoute']);

app.config(['$routeProvider', '$locationProvider',
  function ($routeProvider, $locationProvider) {
      $locationProvider.html5Mode(true);
      $routeProvider.
      when('/', {
          templateUrl: 'partial/index.html'
      }).
      when('/vender', {
          templateUrl: 'partial/listaVeiculo.html',
          controller: 'ListaVeiculoCtrl'
      }).
      when('/partial/:id', {
          templateUrl: 'cadastroVeiculo.html',
          controller: 'CadastroVeiculoCtrl'
      }).
      when('/veiculo', {
          templateUrl: 'partial/cadastroVeiculo.html',
          controller: 'CadastroVeiculoCtrl'
      }).
      otherwise({
          redirectTo: '/'
      });
  } ]);

app.directive('focus', function ($timeout, $parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            scope.$watch(attrs.focus, function (newValue, oldValue) {
                if (newValue) { element[0].focus(); }
            });
            element.bind("blur", function (e) {
                $timeout(function () {
                    scope.$apply(attrs.focus + "=false");
                }, 0);
            });
            element.bind("focus", function (e) {
                $timeout(function () {
                    scope.$apply(attrs.focus + "=true");
                }, 0);
            })
        }
    }
});

app.factory('veiculoService', ['$rootScope', function ($rootScope) {

    var service = {

        model: {
            id: '',
            veiculo: '',
            vendedor: '',
            telefone: '',
            valor: '',
            foto: ''
        },

        New: function(){
            service.model.id = '';
            service.model.veiculo = '';
            service.model.vendedor = '';
            service.model.telefone = '';
            service.model.valor = '';
            service.model.foto = '';
        },

        SaveState: function () {
            //sessionStorage.userService = angular.toJson(service.model);
            var veiculos = angular.fromJson(localStorage.getItem('veiculos')) || [];

            if (service.model.id) {
                var veiculo = veiculos.filter(function (vei) { return vei.id == service.model.id });
                veiculo[0].veiculo = service.model.veiculo;
                veiculo[0].vendedor = service.model.vendedor;
                veiculo[0].telefone = service.model.telefone;
                veiculo[0].valor = service.model.valor;
                veiculo[0].foto = service.model.foto;
            }
            else {
                service.model.id = new Date().getTime();
                veiculos.push(service.model);
            }

            localStorage.setItem('veiculos', angular.toJson(veiculos));
        },

        RestoreState: function () {
            //service.model = angular.fromJson(sessionStorage.userService);
            return angular.fromJson(localStorage.getItem('veiculos'));
        }
    }

    $rootScope.$on("savestate", service.SaveState);
    $rootScope.$on("restorestate", service.RestoreState);

    return service;
} ]);

app.controller('CadastroVeiculoCtrl', function CadastroVeiculoCtrl($scope, $routeParams, $location, $sce, veiculoService) {

    $scope.someFocusVariable = true;

    $scope.veiculo = '';
    $scope.vendedor = '';
    $scope.telefone = '';
    $scope.valor = '';
    $scope.foto = '';

    var renderImage = function (src) {
        var span = document.createElement('span');
        span.innerHTML = '<img src="' + src + '"/>';

        document.getElementById('list').innerHTML = '';
        document.getElementById('list').insertBefore(span, null);
    }

    var handleFileSelect = function handleFileSelect(evt) {
        var files = evt.target.files; // FileList object

        // Loop through the FileList and render image files as thumbnails.
        for (var i = 0, f; f = files[i]; i++) {

            // Only process image files.
            if (!f.type.match('image.*')) {
                continue;
            }

            var reader = new FileReader();

            // Closure to capture the file information.
            reader.onload = (function (theFile) {
                return function (e) {
                    // Render thumbnail.
                    renderImage(e.target.result);
                    $scope.foto = e.target.result;
                };
            })(f);

            // Read in the image file as a data URL.
            reader.readAsDataURL(f);
        }
    }

    document.getElementById('fotoVeiculo').addEventListener('change', handleFileSelect, false);

    var limparCampos = function () {
        $scope.veiculo = '';
        $scope.vendedor = '';
        $scope.telefone = '';
        $scope.valor = '';
        $scope.foto = '';
        $scope.someFocusVariable = true;
    }

    if ($routeParams.id) {
        var veiculos = veiculoService.RestoreState();

        var veiculo = veiculos.filter(function (vei) { return vei.id == $routeParams.id });

        $scope.veiculo = veiculo[0].veiculo;
        $scope.vendedor = veiculo[0].vendedor;
        $scope.telefone = veiculo[0].telefone;
        $scope.valor = veiculo[0].valor;
        $scope.foto = veiculo[0].foto;
        renderImage($scope.foto);
    }

    //$scope.lstVeiculo = ["Vectra", "Gol", "Uno", "Gol 1.0", "Saveiro", "Jetta"];
    //$scope.salvarVeiculo = function () {
    //    if ($scope.lstVeiculo.indexOf($scope.veiculo) === -1) {
    //        $scope.lstVeiculo.push($scope.veiculo);
    //    }
    //};    

    $scope.voltar = function () {
        $location.path("/");
    }

    $scope.salvarVeiculo = function () {

        veiculoService.New();
        if ($routeParams.id) {
            veiculoService.model.id = ($routeParams.id);
        }

        veiculoService.model.veiculo = $scope.veiculo;
        veiculoService.model.vendedor = $scope.vendedor;
        veiculoService.model.telefone = $scope.telefone;
        veiculoService.model.valor = $scope.valor;
        veiculoService.model.foto = $scope.foto;
        veiculoService.SaveState();
        limparCampos();

        $location.path("/");

    }
});

app.controller('ListaVeiculoCtrl', function ListaVeiculoCtrl($scope, $location, veiculoService) {
    $scope.someFocusVariable = true;

    $scope.veiculos = veiculoService.RestoreState();

    $scope.voltar = function () {
        $location.path("/");
    }

});


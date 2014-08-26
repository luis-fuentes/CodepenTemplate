var _currentuser;
var _currentsouser;
var _currentlocation;

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1);
    var a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI/180)
}

function getCurrentUserID() {
    if (_currentuser)
        return _currentuser.id;
    else
        return null;
}

function setCurrentUser (secureUser, $firebase) {
    _currentuser = secureUser;
    log.info("currentuser url: " + BASE_URL + "/users/" + getCurrentUserID() + "/");
    _currentsouser = $firebase(new Firebase(BASE_URL + "/users/" + getCurrentUserID() + "/"));
}

function getCurrentUserAlias() {
    if (_currentsouser)
        return _currentsouser.alias;
    else
        return null;
}

angular.module('starter.controllers', ['firebase', 'ionic', 'angularGeoFire'])

    .controller('AppCtrl', function ($state, $scope, $window, $rootScope, $firebase, $ionicLoading, $ionicPopup) {
        log.info("app started");

        $rootScope.postTotip = function (post, tipId, callback) {
            var tipRef = new Firebase(BASE_URL + "/tips/geoFire/dataById/" + tipId);
            tipRef.child("posts").push({
                post: post,
                posterId: getCurrentUserID(),
                posterAlias: getCurrentUserAlias(),
                postedDateTime: new Date().getTime(),
                latitude: _currentlocation[0],
                longitude: _currentlocation[1]
            });
        }

        $scope.initLocation = function() {
            $scope.loading = $ionicLoading.show({
                content: 'Localizando...'
            });

            _currentlocation = null;

            if (navigator.geolocation !== 'undefined') {
                navigator.geolocation.getCurrentPosition(
                    function(pos) {
                        _currentlocation = [
                                Math.round(pos.coords.latitude * 100) / 100,
                                Math.round(pos.coords.longitude * 100) / 100
                        ];

                        log.info("Updated location: " + _currentlocation);

                        $scope.loading.hide();

                        locationWatchId = navigator.geolocation.watchPosition(function(updatedPos) {
                                _currentlocation = [
                                        Math.round(updatedPos.coords.latitude * 100) / 100,
                                        Math.round(updatedPos.coords.longitude * 100) / 100
                                ];
                                log.info("Updated location: " + _currentlocation);
                            },
                            function (err) {
                                log.error("Failed updating location: " + err);
                            },
                            {
                                maximumAge: 3000,
                                timeout: 60000,
                                enableHighAccuracy: true
                            });
                    },
                    function (err) {
                        $scope.loading.hide();
                        $ionicPopup.alert({
                            title: 'No localizado',
                            content: 'Antes de ejecutar esta aplicación verifique que los servicios de Ubicación estén activados en su dispositivo. La funcionalidad será limitada sin ellos.'});
                    },
                    {
                        maximumAge: 3000,
                        timeout: 60000,
                        enableHighAccuracy: true
                    }
                );
            } else {
                $scope.loading.hide();
                $ionicPopup.alert({
                    title: 'No Localizado',
                    content: 'Antes de ejecutar esta aplicación verifique que los servicios de Ubicación estén activados en su dispositivo. La funcionalidad será limitada sin ellos.'
                });
            }
        }

        $scope.initAuth = function () {
            shoutoutRef = new Firebase(BASE_URL);

            auth = new FirebaseSimpleLogin(shoutoutRef, function (error, user) {
                if ($rootScope.loading)
                    $rootScope.loading.hide();

                if (error) {
                    // an error occurred while attempting login
                    log.error(error);
                    $ionicPopup.alert({
                        title: 'Fallo Ingreso',
                        content: "Email o passworn invalidos"
                    });
                    $state.go("app.login");
                } else if (user) {
                    // user authenticated with Firebase
                    log.info('User ID: ' + user.uid + ', Provider: ' + user.provider);
                    setCurrentUser (user, $firebase);

                    $state.go("app.tips");
                } else {
                    // user is logged out
                    log.info("user is logged out");
                    $state.go("app.login");
                }
            });
        }

        $scope.initAuth();
        $scope.initLocation();
    })

    .controller('LoginCtrl', function ($scope, $state, $rootScope, $ionicLoading, $ionicPopup) {

        $scope.login = function($event) {
            log.info($event);

            $rootScope.loading = $ionicLoading.show({
                content: 'Ingresando...'
            });

            auth.login('password', {
                email: $scope.email,
                password: $scope.password
            });
        }

        $scope.register = function() {
            $state.go('app.register');
        }
    })

    .controller('LogoutCtrl', function () {
        var confirmPopup = $ionicPopup.confirm({
                 title: 'Cerrar Sesión',
                 template: '¿Estas Seguro?'
        })
        confirmPopup.then(function(res) {
             if(res) {
                log.info("logging out..");
                // auth.logout();
             } else {
           console.log('You are not sure');
            }
        })
    })

    .controller('RegisterCtrl', function ($scope, $rootScope, $state, $firebase, $ionicLoading, $ionicPopup) {
        $scope.register = function () {

            if (!$scope.password || $scope.password == '') {
                $ionicPopup.alert({
                    title: 'Mal Password',
                    content: "Password no puede estar en blanco."
                });

                return;
            } else if ($scope.password != $scope.passwordConfirm) {
                    $ionicPopup.alert({
                        title: 'Password Erroneo',
                        content: "Passwords no coincide."
                    });

                    return;
            }

            $rootScope.loading = $ionicLoading.show({
                content: 'Registrando, por favor espere...'
            });

            auth.createUser($scope.email, $scope.password, function(error, user) {
                if (!error) {
                    setCurrentUser(user, $firebase);
                    var userRef = new Firebase(BASE_URL + "/users/" + getCurrentUserID());

                    userRef.set(
                        {
                            alias: $scope.alias,
                            email: $scope.email,
                            radius: "unlimited",
                            tipIdList: []
                        }
                    );

                    auth.login('password', {
                        email: $scope.email,
                        password: $scope.password
                    });

                } else {
                    $rootScope.loading.hide();

                    $ionicPopup.alert({
                        title: 'Fallo Registro',
                        content: error
                    });
                }
            });
        }
    })

    .controller('tipsCtrl', function ($scope, $geofire, $interval, $ionicPopup) {
        $scope.tips = [];
        $scope.searchInteval;
        $scope.findShoutsInMyArea = function() {

            if (!angular.isDefined(_currentsouser))
                return;

            var geo = $geofire(new Firebase(BASE_URL + "/tips"));

            if ($scope.lastSearch)
                geo.$offPointsNearLoc($scope.lastSearch.latLon, $scope.lastSearch.radius, "geo:search");


            var radius;
            if (_currentsouser.radius === 'undefined' || _currentsouser.radius == 'unlimited') {
                radius = 200;
            } else {
                radius = _currentsouser.radius;
            }

            $scope.lastSearch = {
                latLon: _currentlocation,
                radius: angular.copy(_currentsouser.radius)
            }

            geo.$onPointsNearLoc($scope.lastSearch.latLon, $scope.lastSearch.radius, 'geo:search');
        }

        $scope.startSearchingAreaForShoutouts = function startSearchingAreaForShoutouts() {
            if (angular.isDefined($scope.searchInteval))
                return;

            $scope.searchInteval = $interval(function() {
                $scope.findShoutsInMyArea();
            }, SHOUTOUT_SCAN_INTERVAL);

            $scope.findShoutsInMyArea();
        }

        $scope.stopSearchingAreaForShoutouts = function stopSearchingAreaForShoutouts() {
            $interval.cancel($scope.searchInteval);
        }

        $scope.$on('$destroy', function destroytipsCtrlScope() {
            $scope.stopSearchingAreaForShoutouts();
        });

        $scope.$on("geo:search", function onGeoSearch (event, latLon, radius, shouts) {
            $scope.tips = [];
            $scope.$apply(function() {
                for (var i = 0; i < shouts.length; i++) {
                    var shout = shouts[i];
                    var distance = getDistanceFromLatLonInKm(shout.location[0], shout.location[1],
                        _currentlocation[0], _currentlocation[1]);
                    var color = 'gray';

                    if (distance > 1) {
                        distance = (Math.round(distance * 10)/10) + " km de distancia";
                    } else if (distance > 0 && distance < 1) {
                        distance = (distance * 1000) + " m de distancia";
                        color = 'black';
                    } else {
                        distance = "¡El tip esta justo junto a ti!";
                        color = 'red';
                    }

                    angular.extend(shout, {
                        distance: distance,
                        color: color
                    });

                    $scope.tips.push(shout);
                }

                $scope.$broadcast('scroll.refreshComplete');
            });
        });

        $scope.startSearchingAreaForShoutouts();
    })

    .controller('MytipsCtrl', function ($scope, $firebase) {
        $scope.tips = [];

        if (!angular.isDefined(_currentuser))
            return;

        var tipIdListRef = new Firebase(BASE_URL + "/users/"+getCurrentUserID() + "/tipIdList");
        tipIdListRef.on("value", function(snapshot) {
            snapshot.forEach(function(tipListItem) {
                var tipVal = $firebase(new Firebase(BASE_URL + "/tips/geoFire/dataById/" + tipListItem.val().tipId));

                $scope.tips.push(tipVal);
            });
        });
    })

    .controller('ViewtipCtrl', function ($scope, $rootScope, $ionicLoading, $ionicScrollDelegate, $firebase, $stateParams) {
        var postsRef = new Firebase(BASE_URL + "/tips/geoFire/dataById/" + $stateParams.tipId + "/posts");
        $scope.posts = $firebase(postsRef);

        $scope.newtipPost = function() {
            if ($scope.newpost && $scope.newpost.length > 0) {
                log.info("Posting: " + $scope.newpost + ", tipid: " + $stateParams.tipId);
                $rootScope.postTotip(angular.copy($scope.newpost), $stateParams.tipId);
                $scope.newpost = "";
            }
        }

        $scope.trySubmit = function($event) {
            if ($event.keyCode == '13') {
                $scope.newtipPost();
            }
        }

        postsRef.on("child_added", function() {
            log.info("child added");
            $ionicScrollDelegate.scrollBottom();
        });
    })

    .controller('NewtipCtrl', function ($scope, $rootScope, $ionicLoading, Camera, $state, $geofire, $stateParams, $window) {
        


        $scope.newtip = function () {
            $scope.loading = $ionicLoading.show({
                content: 'Creando tip...'
            });

            var tipsRef = new Firebase(BASE_URL + "/tips");
            var geo = $geofire (tipsRef);
            var myImg = $scope.imageURI;

            var tip = {
                id: getCurrentUserID() + "_" + new Date().getTime(),
                title: $scope.title,
                createdByAlias: getCurrentUserAlias(),
                createdByID: getCurrentUserID(),
                location: _currentlocation,
                postedDateTime: new Date().getTime(),
                // tipcontenido: $scope.tipcontenido,
                image: myImg,
                posts: []
            };

            geo.$insertByLocWithId(_currentlocation, tip.id, tip).catch(
                function(err) {
                    $ionicPopup.alert({
                        title: 'Fallo',
                        content: err
                    });
                }
            ).then(function() {
                var userRef = new Firebase(BASE_URL + "/users/"+getCurrentUserID());
                userRef.child("tipIdList").push({
                    tipId: tip.id
                });

                $rootScope.postTotip($scope.post, tip.id);
                $state.go("app.viewtip", {tipId: tip.id});

                $scope.loading.hide();
            });
        }

        $scope.back = function () {
            $window.history.back();
        }
    })

    .controller('SettingsCtrl', function ($scope, $firebase) {
        var userRef = new Firebase(BASE_URL + "/users/" + getCurrentUserID());
        $scope.user = $firebase(userRef);

        $scope.updateRadius = function() {
            log.info("updating radius to: " + $scope.user.radius);
            userRef.child("radius").set($scope.user.radius);
        }
    })

    .controller('MapCtrl', function ($scope, $geofire, $interval, $ionicPopup, $firebase, $document, $ionicPlatform) {
        
        var myLatlng = new google.maps.LatLng(_currentlocation[0], _currentlocation[1]);

        var mapOptions = {center: myLatlng, zoom: 12};

       
        var map = new google.maps.Map(document.getElementById("google-map"), mapOptions);

        $scope.tips = [];
        $scope.searchInteval;
        $scope.findShoutsInMyArea = function() {

            if (!angular.isDefined(_currentsouser))
                return;

            var geo = $geofire(new Firebase(BASE_URL + "/tips"));

            

            var radius;
            if (_currentsouser.radius === 'undefined' || _currentsouser.radius == 'unlimited') {
                radius = 200;
            } else {
                radius = _currentsouser.radius;
            }

            $scope.lastSearch = {
                latLon: _currentlocation,
                radius: angular.copy(_currentsouser.radius)
            }

            geo.$onPointsNearLoc($scope.lastSearch.latLon, $scope.lastSearch.radius, 'geo:search');
        }

        $scope.startSearchingAreaForShoutouts = function startSearchingAreaForShoutouts() {
            if (angular.isDefined($scope.searchInteval))
                return;

            $scope.searchInteval = $interval(function() {
                
            }, SHOUTOUT_SCAN_INTERVAL);

            $scope.findShoutsInMyArea();
        }

        $scope.stopSearchingAreaForShoutouts = function stopSearchingAreaForShoutouts() {
            $interval.cancel($scope.searchInteval);
        }



        $scope.$on("geo:search", function onGeoSearch (event, latLon, radius, shouts) {
                $scope.tips = [];
                var marker, i, infowindow, contenido;
                for (var i = 0; i < shouts.length; i++) {
                    var shout = shouts[i];                 
                    marker = new google.maps.Marker({
                      position: new google.maps.LatLng(shout.location[0], shout.location[1]),
                      map: map,
                      icon: 'img/logo.png'
                    });
                    contenido = shout.title;
                    infowindow = new google.maps.InfoWindow({content: contenido});
                    // contenido = shout.title
                    // var infowindow = new google.maps.InfoWindow({
                    // content: contenido
                    // });

                    google.maps.event.addListener(marker, 'click', (function(marker, infowindow, i) {
                      return function() {
                        // infowindow.setContent(locations[i][0]);
                        infowindow.open(map, marker);
                      }
                    })(marker, infowindow, i));      

                }

            marker.setMap(map);
        });

        $scope.startSearchingAreaForShoutouts();

      //              var contentString = '<div id="content">'+
      // '<div id="siteNotice">'+
      // '</div>'+
      // '<h1 id="firstHeading" class="firstHeading">Uluru</h1>'+
      // '<div id="bodyContent">'+
      // '<p><b>Uluru</b>, also referred to as <b>Ayers Rock</b>, is a large ' +
      // 'sandstone rock formation in the southern part of the '+
      // 'Northern Territory, central Australia. It lies 335&#160;km (208&#160;mi) '+
      // 'south west of the nearest large town, Alice Springs; 450&#160;km '+
      // '(280&#160;mi) by road. Kata Tjuta and Uluru are the two major '+
      // 'features of the Uluru - Kata Tjuta National Park. Uluru is '+
      // 'sacred to the Pitjantjatjara and Yankunytjatjara, the '+
      // 'Aboriginal people of the area. It has many springs, waterholes, '+
      // 'rock caves and ancient paintings. Uluru is listed as a World '+
      // 'Heritage Site.</p>'+
      // '<p>Attribution: Uluru, <a href="http://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">'+
      // 'http://en.wikipedia.org/w/index.php?title=Uluru</a> '+
      // '(last visited June 22, 2009).</p>'+
      // '</div>'+
      // '</div>';

      // var contentString = 'hola';

      //   var pinColor = "1aacc3";  //"FE7569";
               
      //   var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
      //                  new google.maps.Size(21, 34),
      //                  new google.maps.Point(0, 0),
      //                  new google.maps.Point(10, 34));
    })

    .controller('picturesCtrl', function ($scope, $rootScope, $ionicModal, $firebase, $timeout){
        // $scope.pictures = Pictures.all();
        
        //for calling uploading page
        $ionicModal.fromTemplateUrl('templates/upload.html', function(modal){
            $scope.modal = modal;
        });

        $scope.upload = function(){
            $scope.modal.show();
        }
        
        $scope.images = [];
        var imageList = new Firebase(BASE_URL + escapeEmailAddress($rootScope.userEmail));

        //using on listener for value event using snapshot of firebase
        imageList.on('value', function(snapshot){
            var image = snapshot.val();
            $scope.images = [];
            $timeout(function(){    
                for (var key in image){
                    if (image.hasOwnProperty(key)){
                        image[key].key = key;
                        $scope.images.push(image[key]);
                        console.log(image[key]);
                    }
                }

            if ($scope.images.length == 0) {
                    $scope.noImage = true;
                        } else { 
                            $scope.noImage = false;
                        }

                
            });
        });

        //deteling single picture
        $scope.deleteImage = function (key){
            var notesList = new Firebase(BASE_URL);
            imageList.child(key).remove();
            console.log('deleted');
        };
    })

    .controller('uploadCtrl', function ($scope, $rootScope, $ionicLoading, $geofire, $stateParams, $window, $state, $ionicModal, $firebase, Camera, $timeout){
        $scope.newtip = function () {
            $scope.loading = $ionicLoading.show({
                content: 'Creando tip...'
            });

            var tipsRef = new Firebase(BASE_URL + "/tips");
            var geo = $geofire (tipsRef);
            var myImg = $scope.imageURI;

            var tip = {
                id: getCurrentUserID() + "_" + new Date().getTime(),
                title: $scope.title,
                createdByAlias: getCurrentUserAlias(),
                createdByID: getCurrentUserID(),
                location: _currentlocation,
                postedDateTime: new Date().getTime(),
                // tipcontenido: $scope.tipcontenido,
                image: myImg,
                posts: []
            };

            geo.$insertByLocWithId(_currentlocation, tip.id, tip).catch(
                function(err) {
                    $ionicPopup.alert({
                        title: 'Fallo',
                        content: err
                    });
                }
            ).then(function() {
                var userRef = new Firebase(BASE_URL + "/users/"+getCurrentUserID());
                userRef.child("tipIdList").push({
                    tipId: tip.id
                });

                $rootScope.postTotip($scope.post, tip.id);
                $state.go("app.viewtip", {tipId: tip.id});

                $scope.loading.hide();
            });
        }

        $scope.back = function () {
            $window.history.back();
        }



            //for closing the modal
        $scope.close = function (modal){
            $scope.modal.hide();

            $scope.imageURI = "";

        };


        $scope.getPhoto = function(){
            Camera.getPicture().then(function(imageData){
                $scope.imageURI = "data:image/png;base64," + imageData;
            }, function(err){
                console.log(err);
            });
        };


        $scope.PhotoLibrary = function (){
            if (navigator.camera){
                 navigator.camera.getPicture( photoSuccess, photoError,
                     {  quality: 50,
                        sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM,
                        destinationType: navigator.camera.DestinationType.DATA_URL,
                        correctOrientation: true
                        }

                       );
                } else {
                    alert('camera not found');
                }
            };

         function photoSuccess(imageData) {
            $scope.image = document.getElementById('smallimage');
            // hack until cordova 3.5.0 is released
            $timeout(function(){    
                if (imageData.substring(0,21)=="content://com.android") {
                var photo_split=imageData.split("%3A");
                imageData="content://media/external/images/media/"+photo_split[1];
                }
            
                $scope.imageURI = "data:image/png;base64," + imageData;
                $scope.image.src = $scope.imageURI;
            });


        }

          function photoError(message) {
            console.log('Failed because: ' + message);
        }


        //for uploading

        $scope.UploadPicture = function() {   
            var myImg = $scope.imageURI;
            var image = {
                image: myImg,
                created: Date.now()
            }
            var imageList = new Firebase(BASE_URL + escapeEmailAddress($rootScope.userEmail));

            $firebase(imageList).$add(image);
            $scope.modal.hide();
            $scope.imageURI = "";
    }

    function onUploadSuccess(imageData){
    var imageList = new Firebase(BASE_URL + escapeEmailAddress($rootScope.userEmail));               
    
    $firebase(imageList).$add(imageData);
    
    }

    function onUploadFail(message){
        alert('Failed because:' + message);
    }




    })
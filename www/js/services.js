angular.module('starter.services', [])

    .factory('EventMapService', function () {
       
        //var eventsList = [
        //['Boring', 39.5297185, -76.82239269999999, 4],
        //['Butler', 39.5354989, -76.72807270000001, 5],
        //['Cockeysville', 39.538196, -76.57582499999999, 3],
        //['Hunt Valley', 39.4957769, -76.6458191, 2],
        //['Sparks Glencoe', 39.5897081, -76.6115339, 1]
        //      ];
        var currentlocation =  { lat: -38.738196, long: -72.60582499999999 };//{ lat: -33.9, long: 151.2 };//
        
        var eventsList = [
            { name: 'Robert', title: 'Dodge 2010',  type: 'scheduled', address: '21020', lat: 39.5297185, long: -76.82239269999999, zorder: 5},
            { name: 'Jack', title: 'Dodge 2010', type: 'scheduled', address: '21023', lat: 39.5354989, long: -76.72807270000001, zorder: 4},
            { name: 'Robin', title: 'Dodge 2010', type: 'unscheduled', address: '21030', lat: 39.538196, long: -76.57582499999999, zorder: 3 },
            { name: 'Scott', title: 'Dodge 2010', type: 'unscheduled', address: '21031', lat: 39.4957769, long: -76.6458191, zorder: 2 },
            { name: 'Mike', title: 'Dodge 2010', type: 'scheduled', address: '21152', lat: 39.5897081, long: -76.6115339, zorder:1 }
        ];
        
        
        return {
          
            all: function () {
                return eventsList;
            },
            initialize: function(map)
            {
               
            },
            refreshmap: function () {
                var myLatlng = new google.maps.LatLng(currentlocation['lat'], currentlocation['long']);
                var mapOptions = {
                    center: myLatlng,// new google.maps.LatLng(39.538196, -76.57582499999999),//(-33.9, 151.2)
                    zoom: 11,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };

                

                // var map = new google.maps.Map(document.getElementById("google-map"), mapOptions);
                //  console.log(map);
                //var marker = new google.maps.Marker({
                //    position: myLatlng,
                //    map: map,
                //    //title: "This is a marker!",
                //    animation: google.maps.Animation.DROP
                //});
               // this.setMarkers(map);//, eventsList);
                return mapOptions;
            },
            setCurrentLocation : function(map)
            {
                var shape = {
                    coords: [1, 1, 1, 20, 18, 20, 18, 1],
                    type: 'poly'
                };

                var pinColor = "1aacc3";  //"FE7569";
               
                var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
                    new google.maps.Size(21, 34),
                    new google.maps.Point(0, 0),
                    new google.maps.Point(10, 34));
                var pinShadow = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_shadow",
                    new google.maps.Size(40, 37),
                    new google.maps.Point(0, 0),
                    new google.maps.Point(12, 35));

                var myLatlng = new google.maps.LatLng(currentlocation['lat'], currentlocation['long']);
                //  To add the marker to the map, use the 'map' property
                var marker = new google.maps.Marker({
                    position: myLatlng,
                    map: map,
                    icon: pinImage,
                    shadow: pinShadow,
                    title: "My Current Location",
                    shape: shape
                });
            },
            renderdirection: function (map){//,start, end) {
                var directionsDisplay;
                var directionsService = new google.maps.DirectionsService();
                directionsDisplay = new google.maps.DirectionsRenderer();
                directionsDisplay.setMap(map);
               
                var start = new google.maps.LatLng(currentlocation['lat'], currentlocation['long']);
                var end = new google.maps.LatLng(eventsList[0].lat, eventsList[0].long);

                var request = {
                    origin:start,
                    destination:end,
                    travelMode: google.maps.TravelMode.DRIVING
                };
                directionsService.route(request, function(response, status) {
                    if (status == google.maps.DirectionsStatus.OK) {
                        directionsDisplay.setDirections(response);
                    }
                });
            },
            setMarkers: function (map) {
                var shape = {
                    coords: [1, 1, 1, 20, 18, 20, 18 , 1],
                    type: 'poly'
                };
                for (var i = 0; i < eventsList.length; i++) {
                    var beach = eventsList[i];
                    var myLatLng = new google.maps.LatLng(beach['lat'], beach['long']);

                    var pinColor = "FFCC00";  //"FE7569";
                    if (i % 2 == 0)
                        pinColor = "FE7569";
                    var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
                        new google.maps.Size(21, 34),
                        new google.maps.Point(0, 0),
                        new google.maps.Point(10, 34));
                    var pinShadow = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_shadow",
                        new google.maps.Size(40, 37),
                        new google.maps.Point(0, 0),
                        new google.maps.Point(12, 35));

                    var marker = new google.maps.Marker({
                        position: myLatLng,
                        map: map,
                        icon: pinImage,
                        shadow: pinShadow,
                        shape: shape,
                        //title: 'dddddsss'
                        // title: beach[0],
                        zIndex: beach['zorder']


                    });
                    var infowindow = new google.maps.InfoWindow();
                    
                    var today = new Date();
                    var currentDate = new Date();
                    var day = currentDate.getDate();
                    var month = currentDate.getMonth() + 1;
                    var year = currentDate.getFullYear();
                   
                    var event = "<b>" + beach['title'] + "</b><br>";
                    event = event + "<b>" + day + "/" + month + "/" + year + " "+ currentDate.getHours() + ":" + currentDate.getMinutes();
                   
                    if (currentDate.getHours() > 12)
                        event = event + "PM" + "</b>";
                    else
                        event = event + "AM" + "</b>";
                    event = "<b> 2010 Dodge Journey <br> May 21, 2014 8:00 am </b>";
                    marker.myHtml = "<h5>" + event + "</h5>";
                    //google.maps.event.addDomListener(marker, 'mousedown', function (e) {
                    //    //e.preventDefault();
                    //    return false;
                    //});
                    google.maps.event.addListener(marker, 'click', function (event) {
                        infowindow.setContent(this.myHtml);
                        infowindow.open(map, this);
                   
                    });
                }
            }
        }

    })

    .factory('Camera', ['$q', function($q){
        return {
            getPicture: function(options){
                var q = $q.defer();
                navigator.camera.getPicture(function(imageData){
                    q.resolve(imageData);
                }, function(err){
                    q.reject(err);
                }, {
                quality: 75,
                targetWidth:320,
                targetHeight: 320,
                saveToPhotoAlbum: false,
                correctOrientation: true,
                destinationType: Camera.DestinationType.DATA_URL
                });

                return q.promise;
            }
        }
    }])

    .factory('Favorites', function($firebase) {
        var favorites = $firebase(new Firebase('https://ruta-tips.firebaseio.com/favorites'));

        return{
            all: function() {
                return favorites;
            },
            get: function(key) {
                return favorites[key];
            },
            getKeyByThoughtAndEmail: function(thoughtId, userEmail) {
                for (var key in favorites) {
                    if (favorites[key] !== null){
                        if ((favorites[key].thoughtId === thoughtId) && 
                                (favorites[key].userEmail === userEmail)){
                            return key;
                        }
                    }
                }
            },
            getThoughtFavorites: function(thoughtId) {
                var thgFavorites = [];
                for (var key in favorites) {
                    if (favorites[key] !== null) {
                        if (favorites[key].thoughtId === thoughtId) {
                            thgFavorites.push(favorites[key]);
                        }
                    }
                }
                return thgFavorites;
            },
            getUserFavorites: function(userEmail) {
                var usrFavorites = [];
                for (var key in favorites) {
                    if (favorites[key] !== null) {
                        if (favorites[key].userEmail === userEmail) {
                            usrFavorites.push(favorites[key]);
                        }
                    }
                }
                return usrFavorites;
            },
            getIfUserFavoritedThought: function(thoughtId, userEmail) {
                var thgFavorites = this.getThoughtFavorites(thoughtId);
                for (var key in thgFavorites) {
                    if (thgFavorites[key].userEmail === userEmail) {
                        return true;
                    }
                }
                return false;
            },
            push: function(favorite) {
                favorites.$add(favorite);
            },
            remove: function(thoughtId, userEmail) {
                favorites.$remove(this.getKeyByThoughtAndEmail(thoughtId, userEmail));
            }
        };
    })

    .factory('Comments', function($firebase) {
        var comments = $firebase(new Firebase('https://ruta-tips.firebaseio.com/comments'));

        return{
            all: function() {
                return comments;
            },
            get: function(key) {
                return comments[key];
            },
            getThoughtComments: function(thoughtKey) {
                var thComments = [];
                for (var key in comments) {
                    if(comments[key] !== null){
                        if (comments[key].thoughtId === thoughtKey) {
                            thComments.push(comments[key]);
                        }
                    }
                }
                return thComments;
            },
            push: function(comment) {
                comments.$add(comment);
            }
        };
    })

    .factory('Thoughts', function($firebase) {
        var thoughts = $firebase(new Firebase('https://ruta-tips.firebaseio.com/thoughts'));

        return{
            all: function() {
                return thoughts;
            },
            get: function(key) {
                return thoughts[key];
            },
            getUserThoughts: function(email) {
                var userThoughts = [];
                for (var key in thoughts) {
                    if (thoughts[key].userEmail === email) {
                        userThoughts.push(thoughts[key]);
                    }
                }
                return userThoughts;
            },
            push: function(thought) {
                thoughts.$add(thought);
            }
        }
    })

    .factory('Users', function($firebase){
        var users = $firebase(new Firebase('https://ruta-tips.firebaseio.com/users'));

        return{
                    all: function(){
                        return users;
                    },
            get: function(key){
                return users[key];
            },
            getUserByEmail: function(email){
                for(var key in users){
                    if(users[key].email===email){
                        return users[key];
                    }
                }
            },
            push: function(user){
                users.$add(user);
            }
        }
    });
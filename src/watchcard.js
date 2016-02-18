'use strict';

var UI = require('ui');
var Settings = require('settings');
var ajax = require('ajax');
var Locations = require('locations');

exports.getCard = function(coords) {
  var main = new UI.Card({
    title: 'Watch',
    body: 'Waiting for the signal.'
  });
    
  main.on('click', 'up', function(e) {
  });
  
//   main.on('click', 'select', function(e) {
//     navigator.geolocation.getCurrentPosition(function(position) {
//       Settings.data(START_LOCATION, position);
//       console.log(position);
//       var url = 'http://nominatim.openstreetmap.org/reverse?format=json&lat=' + position.coords.latitude + '&lon=' + position.coords.longitude + '&zoom=18&addressdetails=1';
//       ajax(
//     {
//       url: url,
//       type: 'json'
//     },
//     function(data, status, request) {
//       console.log('ADDRESS: ' + data.display_name);
//     },
//     function(error, status, request) {
//       console.log('The ajax request failed: ' + error);
//     }
//   );
  
//     });
//   });
  
  main.on('click', 'down', function(e) {
  });
  
  var watchID = navigator.geolocation.watchPosition(function(position) {
  //   console.log(position.coords.latitude, position.coords.longitude);
    var body = "Location:" + position.coords.latitude + "," + position.coords.longitude;
    var startPoint = coords;
    if (position.coords.speed) {
      //Returns a double representing the velocity of the device in meters per second. This value can be null.
      body += "\nSpeed:" + position.coords.speed;
    }
    if (position.coords.altitude) {
      //Returns a double representing the position's altitude in metres, relative to sea level. This value can be null if the implementation cannot provide the data.
      body += "\nAltitude:" + position.coords.altitude;
    }
    
    if (position.coords.accuracy) {
      body += "\nLocAccuracy:" + position.coords.accuracy;
    }
    
    if (startPoint) {
      var dist = distance(startPoint.longitude, startPoint.latitude, position.coords.longitude, position.coords.latitude);
      body += "\nDistance:" + dist + "KM";
    }
    
    main.body(body);
  });
  
  return main;  
};

  function distance(lon1, lat1, lon2, lat2) {
    var R = 6371; // Radius of the earth in km
    var dLat = (lat2-lat1).toRad();  // Javascript functions in radians
    var dLon = (lon2-lon1).toRad(); 
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * 
            Math.sin(dLon/2) * Math.sin(dLon/2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
  }
  


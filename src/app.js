/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var Settings = require('settings');
var ajax = require('ajax');
var Locations = require('locations');

var START_LOCATION = 'startLocation';

var menu = Locations.getMenu();
menu.show();

var main = new UI.Card({
  title: 'Pebble.js',
  icon: 'images/menu_icon.png',
  body: 'Waiting for the signal.',
  subtitleColor: 'indigo', // Named colors
  bodyColor: '#9a0036' // Hex colors
});

//main.show();

main.on('click', 'up', function(e) {
});

main.on('click', 'select', function(e) {
  navigator.geolocation.getCurrentPosition(function(position) {
    Settings.data(START_LOCATION, position);
    console.log(position);
    var url = 'http://nominatim.openstreetmap.org/reverse?format=json&lat=' + position.coords.latitude + '&lon=' + position.coords.longitude + '&zoom=18&addressdetails=1';
    ajax(
  {
    url: url,
    type: 'json'
  },
  function(data, status, request) {
    console.log('ADDRESS: ' + data.display_name);
  },
  function(error, status, request) {
    console.log('The ajax request failed: ' + error);
  }
);

  });
});

main.on('click', 'down', function(e) {
});

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

/** Converts numeric degrees to radians */
if (typeof(Number.prototype.toRad) === "undefined") {
  Number.prototype.toRad = function() {
    return this * Math.PI / 180;
  }
}

var watchID = navigator.geolocation.watchPosition(function(position) {
//   console.log(position.coords.latitude, position.coords.longitude);
  var body = "Location:" + position.coords.latitude + "," + position.coords.longitude;
  var startPoint = Settings.data(START_LOCATION);
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
    var dist = distance(startPoint.coords.longitude, startPoint.coords.latitude, position.coords.longitude, position.coords.latitude);
    body += "\nDistance:" + dist + "KM";
  }
  
  main.body(body);
});
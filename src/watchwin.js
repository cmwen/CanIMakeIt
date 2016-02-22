'use strict';

var UI = require('ui');
var Settings = require('settings');
var ajax = require('ajax');
var Locations = require('locations');
var Vector2 = require('vector2');

var HOUR_MILLI = 1000 * 60 * 60;

exports.getWindow = function(coords) {
  var startTime = Date.now();
  var startPosition;

  var main = new UI.Window({
    fullscreen: true
  });

  // Address
  // ETA
  // Distance
  // Line *---- X---- *
  // Speed
  // Accu/ alttitute ?
  var address = new UI.Text({
    text: "Berowra Station, Pacific Hightway",
     position: new Vector2(0, 0),
    size: new Vector2(144, 15),
    font: 'gothic-14',
    textOverflow: 'ellipsis'
  });
  main.add(address);

  var etaLabel = new UI.Text({
    text: "ETA",
    position: new Vector2(0, 15),
    size: new Vector2(72, 15),
    font: 'gothic-14',
    textAlign: 'center'
  });
  main.add(etaLabel);

  var timeLabel = new UI.Text({
    text: "Time",
    position: new Vector2(72, 15),
    size: new Vector2(72, 15),
    font: 'gothic-14',
    textAlign: 'center'
  });
  main.add(timeLabel);

  var eta = new UI.Text({
    text: "8:27",
     position: new Vector2(0, 25),
    size: new Vector2(72, 45),
  font: 'gothic-28-bold',
  color: 'white',
  textAlign: 'center'
  });
  main.add(eta);

 var currentTime = new UI.TimeText({
    position: new Vector2(72, 25),
    size: new Vector2(72, 45),
    text: "%H:%M",
    font: 'gothic-28-bold',
    color: 'white',
    textAlign: 'center'
  });
  main.add(currentTime);

  // 55  ~ 75
  var line = new UI.Rect({
  position: new Vector2(10, 75),
  size: new Vector2(124, 3),
  backgroundColor: 'white'
});
  main.add(line);

  var start = new UI.Circle({
  position: new Vector2(10, 76),
  radius: 4,
  backgroundColor: 'black',
  borderColor: 'white'

});
  main.add(start);

var end = new UI.Circle({
  position: new Vector2(134, 76),
  radius: 4,
  backgroundColor: 'black',
  borderColor: 'white'

});
  main.add(end);

var current = new UI.Circle({
  position: new Vector2(74, 76),
  radius: 6,
  backgroundColor: 'white',
  borderColor: 'white'
});
  main.add(current);

  var distanceToTarget = new UI.Text({
     text: "Distance: 1.5km",
     position: new Vector2(0, 95),
     size: new Vector2(72, 30),
     textOverflow: 'wrap'
  });
  main.add(distanceToTarget);

  var speed = new UI.Text({
    text: "Speed: 5km/h",
     position: new Vector2(72, 95),
    size: new Vector2(72, 30),
    textOverflow: 'wrap'
  });
  main.add(speed);


  main.on('click', 'up', function(e) {
    var pos = current.position();
pos.x += 10;
current.animate('position', pos);
  });

  main.on('click', 'down', function(e) {
    var pos = current.position();
    pos.x -= 10;
    current.animate('position', pos);
  });

  var watchID;
  main.on('show', function(){
    watchID = navigator.geolocation.watchPosition(function(position) {
      var distToTarget = distance(coords.longitude, coords.latitude, position.coords.longitude, position.coords.latitude);

      if (startPosition) {
        // Speed
        var dist = distance(startPoint.longitude, startPoint.latitude, position.coords.longitude, position.coords.latitude);
        var duration = Date.now() - startTime;
        var speed = dist / (duration / HOUR_MILLI);
        var estimateTime = distToTarget / speed; // in hour

        // Moving away from target? Check the accuracy. If true, reset the start point
        if (dist + startPoint.accuracy * 1000 > distToTarget + coords.accuracy + 1000) {
          startPoint = position.coords;
        }
      } else {
        startPosition = position.coords;
      }

      main.body(body);
    }, function(error){
      console.log(error);
    }, {
        enableHighAccuracy: true
    });
  });

  main.on('hide', function(){
    if (watchID) {
      navigator.geolocation.clearWatch(watchID);
    }
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

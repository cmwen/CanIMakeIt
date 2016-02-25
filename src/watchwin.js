'use strict';

var UI = require('ui');
var Locations = require('locations');
var Vector2 = require('vector2');
var Store = require('store');
var Vibe = require('ui/vibe');


var HOUR_MILLI = 1000 * 60 * 60;

exports.getWindow = function(/*object*/coords, /*String*/ address) {
  var startTime = Date.now();
  var startPosition;

  var watchWindow = new UI.Window({
    fullscreen: true
  });

  // Address
  // ETA  Current
  // ProgressBar *---- X---- *
  // Distance Speed
  // Accu/ alttitute ?
  var addressLabel = new UI.Text({
    text: address,
    position: new Vector2(0, 0),
    size: new Vector2(144, 15),
    font: 'gothic-14',
    textOverflow: 'ellipsis'
  });
  watchWindow.add(addressLabel);

  var etaLabel = new UI.Text({
    text: "Estimate Time",
    position: new Vector2(0, 15),
    size: new Vector2(72, 15),
    font: 'gothic-14',
    textAlign: 'center'
  });
  watchWindow.add(etaLabel);

  var timeLabel = new UI.Text({
    text: "Current Time",
    position: new Vector2(72, 15),
    size: new Vector2(72, 15),
    font: 'gothic-14',
    textAlign: 'center'
  });
  watchWindow.add(timeLabel);

  var eta = new UI.Text({
    text: "--:--",
     position: new Vector2(0, 25),
    size: new Vector2(72, 45),
    font: 'gothic-28-bold',
    color: 'white',
    textAlign: 'center'
  });
  watchWindow.add(eta);

 var currentTime = new UI.TimeText({
    position: new Vector2(72, 25),
    size: new Vector2(72, 45),
    text: "%H:%M",
    font: 'gothic-28-bold',
    color: 'white',
    textAlign: 'center'
  });
  watchWindow.add(currentTime);

  // Begin Progress Bar
  // backgournd of progress bar
  // y: 55 ~ 95
  var progressBg = new UI.Rect({
    position: new Vector2(0, 55),
    size: new Vector2(144, 40),
    progressBgColor: 'white'
  });
  watchWindow.add(progressBg);

  var progressLine = new UI.Rect({
    position: new Vector2(10, 75),
    size: new Vector2(124, 3),
    backgroundColor: 'black'
  });
  watchWindow.add(progressLine);

  var progressStartPoint = new UI.Circle({
    position: new Vector2(10, 76),
    radius: 4,
    backgroundColor: 'white',
    borderColor: 'black'
  });
  watchWindow.add(progressStartPoint);

  var progressEndPoint = new UI.Circle({
    position: new Vector2(134, 76),
    radius: 4,
    backgroundColor: 'white',
    borderColor: 'black'
  });
  watchWindow.add(progressEndPoint);

  var currentProgressPoint = new UI.Circle({
    position: new Vector2(74, 76),
    radius: 6,
    backgroundColor: 'black',
    borderColor: 'black'
  });
  watchWindow.add(currentProgressPoint);

  // End Progress Bar

  var distanceLabel = new UI.Text({
     text: "Distance",
     position: new Vector2(0, 95),
     size: new Vector2(72, 15),
     font: 'gothic-14',
     textAlign: 'center'
  });
  watchWindow.add(distanceLabel);

  var distanceToTargetText = new UI.Text({
     text: "---- m",
     position: new Vector2(0, 110),
     size: new Vector2(72, 30),
    font: 'gothic-28-bold',
    color: 'white',
    textAlign: 'center'
  });
  watchWindow.add(distanceToTargetText);

  var speedLabel = new UI.Text({
    text: "Speed",
     position: new Vector2(72, 95),
     size: new Vector2(72, 15),
     font: 'gothic-14',
     textAlign: 'center'
   });
  watchWindow.add(speedLabel);

  var speedText = new UI.Text({
    text: "-- km/h",
     position: new Vector2(72, 110),
    size: new Vector2(72, 30),
    font: 'gothic-28-bold',
    color: 'white',
    textAlign: 'center'
  });
  watchWindow.add(speedText);

  var accuracyLabel = new UI.Text({
    text: "Accuracy",
     position: new Vector2(0, 144),
     size: new Vector2(72, 15),
     font: 'gothic-14',
     textAlign: 'center'
   });
  watchWindow.add(accuracyLabel);

  var accuracyText = new UI.Text({
    text: "---- m",
    position: new Vector2(72, 144),
    size: new Vector2(72, 15),
    font: 'gothic-14',
    color: 'white',
    textAlign: 'center'
  });
  watchWindow.add(accuracyText);


  watchWindow.on('click', 'up', function(e) {
    Store.vibeWhenETAChanged(!Store.vibeWhenETAChanged());
  });

  watchWindow.on('click', 'down', function(e) {
    Store.showGPSSpeed(!Store.showGPSSpeed());
  });

  watchWindow.on('click', 'select', function(e) {
    Store.highAccuracy(!Store.highAccuracy());
  });

  // accurecy: minute
  var etaReminder;
  // Remember the watchID, when user hide this view, cancel the watch
  var watchID;
  // keep the old gps speed if it's not changed, km/h
  var gpsSpeed = 0;
  var options = {hour: 'numeric', minute: 'numeric'};
  watchWindow.on('show', function(){
    watchID = navigator.geolocation.watchPosition(function(position) {
      var distToTarget = distance(coords.longitude, coords.latitude, position.coords.longitude, position.coords.latitude);
      var duration = Date.now() - startTime;

      if (position.coords.accuracy) {
        accuracyText.text(Math.round(position.coords.accuracy) + "m");
        // First 30 seconds, try to find more accurate start point
        if (duration < 30000 && startPosition && position.coords.accuracy < startPosition.accuracy) {
          startPosition = position.coords;
        }
      }

      if (startPosition) {
        var distanceToStart = distance(startPosition.longitude, startPosition.latitude, position.coords.longitude, position.coords.latitude);
        var calSpeed = 0;
        if (Store.showGPSSpeed()) {
          if (position.coords.speed) {
            calSpeed = position.coords.speed * 60 * 60 / 1000; // Meters per sencod to KM per hour
            gpsSpeed = calSpeed;
          } else {
            calSpeed = gpsSpeed;
          }
        } else {
          calSpeed = distanceToStart / (duration / HOUR_MILLI);
        }
        var estimateTime = (distToTarget / calSpeed) * HOUR_MILLI; // in milli

        speedText.text(Math.round(calSpeed) + " km/h");
        if (estimateTime > 0) {
          var etaTime = new Date(Date.now() + estimateTime);
          var etaInMin = Math.round(estimateTime/ (1000 * 60));
          eta.text(etaTime.toLocaleString(navigator.language, options));
          if (!etaReminder) {
            etaReminder = etaInMin;
          } else if (etaReminder != etaInMin && Store.vibeWhenETAChanged()) {
            Vibe.vibrate('short');
            etaReminder = etaInMin;
          }
        }
        distanceToTargetText.text(Math.round(distToTarget * 1000) + "m");

        var newCurrent = Math.round(124 * (distanceToStart / (distToTarget + distanceToStart))) + 10;
        var pos = currentProgressPoint.position();
        if (newCurrent != pos.x) {
          pos.x = newCurrent;

          currentProgressPoint.animate('position', pos);
        }
      } else {
        startPosition = position.coords;
      }
    }, function(error){
      console.log(error);
    }, {
        enableHighAccuracy: Store.highAccuracy()
    });
  });

  watchWindow.on('hide', function(){
    if (watchID) {
      navigator.geolocation.clearWatch(watchID);
    }
  });

  return watchWindow;
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
    return Math.abs(d);
  }

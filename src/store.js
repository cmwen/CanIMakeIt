'use strict';

var Settings = require('settings');

var MARKED_LOCATIONS = 'markedLocations';
var HIGH_ACCURACY_ENABLED = 'enableHighAccuracy';
var VIBRATE_WHEN_ETA_CHANGED = 'vibeWhenEtaChanged';

// Location format
// {
//   title:
//   subtitle:
//   coords:
// }
exports.addLocation = function (/*object*/ location) {
  var markedLocations = Settings.data(MARKED_LOCATIONS);

  if (!markedLocations) {
    markedLocations = [];
  }
  markedLocations.push(location);
  Settings.data(MARKED_LOCATIONS, markedLocations);
};

exports.getLocations = function() {
  return Settings.data(MARKED_LOCATIONS);
};

exports.resetLocations = function() {
    Settings.data(MARKED_LOCATIONS, []);
};

exports.highAccuracy = function(/*boolean*/ enabled) {
  if (Settings.data(HIGH_ACCURACY_ENABLED) === undefined) {
    // enabled by default
    Settings.data(HIGH_ACCURACY_ENABLED, true); 
  }
  if (enabled === undefined) {
    return Settings.data(HIGH_ACCURACY_ENABLED);
  } else {
    return Settings.data(HIGH_ACCURACY_ENABLED, enabled);
  }
}

exports.vibeWhenETAChanged = function(/*boolean*/ enabled) {
  if (Settings.data(VIBRATE_WHEN_ETA_CHANGED) === undefined) {
    // enabled by default
    Settings.data(VIBRATE_WHEN_ETA_CHANGED, false); 
  }
  if (enabled === undefined) {
    return Settings.data(VIBRATE_WHEN_ETA_CHANGED);
  } else {
    return Settings.data(VIBRATE_WHEN_ETA_CHANGED, enabled);
  }
}
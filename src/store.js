'use strict';

var Settings = require('settings');

var MARKED_LOCATIONS = 'markedLocations';
var HIGH_ACCURACY_ENABLED = 'enableHighAccuracy';

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
  if (enabled === undefined) {
    return Settings.data(HIGH_ACCURACY_ENABLED);
  } else {
    return Settings.data(HIGH_ACCURACY_ENABLED, enabled);
  }
}

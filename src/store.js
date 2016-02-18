'use strict';

var Settings = require('settings');

var MARKED_LOCATIONS = 'markedLocations';


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
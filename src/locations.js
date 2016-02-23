'use strict';

var Store = require('store');
var UI = require('ui');
var ajax = require('ajax');
var WatchView = require('watchcard');
var WatchWin = require('watchwin');


var ADD_NEW_LOCATION= 'New Location';
var DELETE_LOCATIONS = 'Delete Locations';

var ENABLED_HIGH_ACCURACY = 'GPS Accuracy:';
var VIBRATE_WHEN_ETA_CHANGED = 'Vibrate:';

exports.getMenu = function() {
  var menu = new UI.Menu({
    sections: [{
      title: "Locations"
    }, {
      title: "Actions",
      items: [{
        title: ADD_NEW_LOCATION,
        subtitle: "Mark my position"
      }, {
        title: ENABLED_HIGH_ACCURACY + Store.highAccuracy(),
        subtitle: "More accuracy, more powser consumption"
      }, {
        title: VIBRATE_WHEN_ETA_CHANGED + Store.vibeWhenETAChanged(),
        subtitle: "When estimate time changed"

      }, {
        title: DELETE_LOCATIONS,
        subtitle: "Delete all locations"
      }]
    }]
  });

  menu.on('show', function(e) {
    reloadLocation(e.menu);
  });

  menu.on('select', function(e) {
    if (e.item.title == ADD_NEW_LOCATION) {
      navigator.geolocation.getCurrentPosition(function(position) {
      console.log(position);
      var url = 'http://nominatim.openstreetmap.org/reverse?format=json&lat=' + position.coords.latitude + '&lon=' + position.coords.longitude + '&zoom=18&addressdetails=1';
      ajax(
        {
          url: url,
          type: 'json'
        },
        function(data, status, request) {
          var location = {
            title : data.display_name,
            subtitle : data.display_name,
            coords: position.coords
          };
          Store.addLocation(location);
          reloadLocation(menu);
        },
        function(error, status, request) {
          console.log('The ajax request failed: ' + error);
        });
      }, {
        enableHighAccuracy: true
      });
    } else if (e.item.title == DELETE_LOCATIONS) {
      Store.resetLocations();
    } else if (e.item.title.indexOf(ENABLED_HIGH_ACCURACY) === 0) {
      Store.highAccuracy(!Store.highAccuracy());
      e.menu.item(e.sectionIndex, e.itemIndex, {title: ENABLED_HIGH_ACCURACY + Store.highAccuracy()});
    } else if (e.item.title.indexOf(VIBRATE_WHEN_ETA_CHANGED) === 0) {
      Store.vibeWhenETAChanged(!Store.vibeWhenETAChanged());
      e.menu.item(e.sectionIndex, e.itemIndex, {title: VIBRATE_WHEN_ETA_CHANGED + Store.vibeWhenETAChanged()});
    } else {
//       var view = WatchView.getCard(e.item.coords);
      var view = WatchWin.getWindow(e.item.coords, e.item.title);

      view.show();
    }

  });

  return menu;
};

function reloadLocation(menu) {
  var locations = Store.getLocations();
  if (locations) {
      // Sort the triggers by the counter, so the most frequent used will go first
//       triggers = triggers.sort(function(a, b) {
//         return a.counter < b.counter;
//       });

      menu.items(0, locations);
      menu.selection(0, 0);
  }
}

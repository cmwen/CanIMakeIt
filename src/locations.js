'use strict';

var Store = require('store');
var UI = require('ui');
var ajax = require('ajax');
var WatchWin = require('watchwin');


var ADD_NEW_LOCATION= 'Add bookmark';
var DELETE_LOCATIONS = 'Delete Bookmarks';

var ENABLED_HIGH_ACCURACY = 'HIGH GPS Accuracy';
var VIBRATE_WHEN_ETA_CHANGED = 'Vibrate';
var USE_GPS_SPEED = "Use GPS Speed";

exports.getMenu = function() {
  var menu = new UI.Menu({
    sections: [{
      title: "Bookmarks"
    }, {
      title: "Actions",
      items: [{
        title: ADD_NEW_LOCATION,
        subtitle: "Mark my position"
      }, {
        title: ENABLED_HIGH_ACCURACY,
        subtitle: getString(Store.highAccuracy())
      }, {
        title: VIBRATE_WHEN_ETA_CHANGED,
        subtitle: getString(Store.vibeWhenETAChanged())
      }, {
        title: USE_GPS_SPEED,
        subtitle: getString(Store.showGPSSpeed())
      }, {
        title: DELETE_LOCATIONS,
        subtitle: "Delete all locations"
      }]
    }]
  });

  menu.on('show', function(e) {
    reloadLocation(e.menu);
  });

  var MAX_RETRY = 3; // retry 3 times to get more accuracy
  var ACCURACY = 5; // meter
  function getPosition(times) {
    navigator.geolocation.getCurrentPosition(function(position) {
      if (position.coords.accuracy && position.coords.accuracy < ACCURACY
        || times > MAX_RETRY) {
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
          // TODO show a warning when the accuracy is still not statisfied.
      } else {
        getPosition(++times);
      }
    }, {
      enableHighAccuracy: true
    });
  };

  menu.on('select', function(e) {
    if (e.item.title == ADD_NEW_LOCATION) {
      getPosition(1);
    } else if (e.item.title == DELETE_LOCATIONS) {
      Store.resetLocations();
    } else if (e.item.title == ENABLED_HIGH_ACCURACY) {
      Store.highAccuracy(!Store.highAccuracy());
      e.menu.item(e.sectionIndex, e.itemIndex, {subtitle: getString(Store.highAccuracy())});
    } else if (e.item.title == VIBRATE_WHEN_ETA_CHANGED) {
      Store.vibeWhenETAChanged(!Store.vibeWhenETAChanged());
      e.menu.item(e.sectionIndex, e.itemIndex, {subtitle: getString(Store.vibeWhenETAChanged())});
    } else if (e.item.title == USE_GPS_SPEED) {
      Store.showGPSSpeed(!Store.showGPSSpeed());
      e.menu.item(e.sectionIndex, e.itemIndex, {subtitle: getString(Store.showGPSSpeed())});
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

function getString(/** boolean */ on) {
  if (on) {
    return 'On';
  } else {
    return 'Off';
  }
}
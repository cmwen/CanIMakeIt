'use strict';

var Store = require('store');
var UI = require('ui');
var ajax = require('ajax');
var WatchView = require('watchcard');
var WatchWin = require('watchwin');


var ADD_NEW_LOCATION= 'New Location';
var DELETE_LOCATIONS = 'Delete Locations';

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
      });
    } else {
//       var view = WatchView.getCard(e.item.coords);
      var view = WatchWin.getWindow(e.item.coords);

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
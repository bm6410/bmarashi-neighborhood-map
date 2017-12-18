// app.js
// Bijan Marashi
// I realize it was recommended to create the markers as part of the ViewModel,
// but for some reason, I kept receiving an error "google is not defined" whenever
// I tried to do that - couldn't figure out a way out of that.  Instead, I created
// them as part of the map, and kept the markers in an array that I accessed in
// the ViewModel, as needed

// Model - the data ----------------------------------------------------------//

// full set of locations (probably could be expanded).  We will create Location objects for
// each of these, then set the visible property for each as we filter.
var locations = [
  {title: 'Pirates of the Caribbean', location: {lat: 33.811560, lng: -117.920812}},
  {title: 'Haunted Mansion', location: {lat: 33.811761, lng: -117.922254}, yelpID: 'the-haunted-mansion-anaheim'},
  {title: 'Space Mountain', location: {lat: 33.811415, lng: -117.917305}},
  {title: 'Sleeping Beauty Castle', location: {lat: 33.812791, lng: -117.918963}},
  {title: 'Matterhorn Bobsleds', location: {lat: 33.813081, lng: -117.917826}},
  {title: 'Big Thunder Mountain Railroad', location: {lat: 33.812692, lng: -117.920426}},
  {title: "It's a Small World", location: {lat: 33.814746, lng: -117.917845}},
  {title: "Walt Disney's Enchanted Tiki Room", location: {lat: 33.811654, lng: -117.919575}},
  {title: "Star Tours", location: {lat: 33.811905, lng: -117.917971}},
];

// let's make the filterText part of the model so we can do some calculations
// on it later
var filterText = ko.observable("");

// an array of markers for the map.  will need this to be able to connect the filtered
// list to the map
var markers = [];

// the currently selected location - can be set either from the list or by selecting a
// marker on the map directly
var currentLocation = ko.observable();


// a Location object that includes the data for the location, as well as a reference
// to the marker for the map
var Location = function(data) {
  self = this;
  this.title = data.title;
  this.location = data.location;
  this.marker;

  this.getTitle = function() {
    return this.title;
  };

  this.setMarker = function(m) {
    this.marker = m;
  };

  this.getMarker = function() {
    return this.marker;
  };

  // will determine whether or not to show this location based on the filterText
  // the user enters.  need to ignore case, so make both strings lower case
  this.isVisible = ko.computed(function() {
    return this.title.toLowerCase().startsWith(filterText().toLowerCase());
  }, this);
}


// ViewModel - the octopus ---------------------------------------------------//

var ViewModel = function() {
  var self = this;
  this.locationList = ko.observableArray([]);

  locations.forEach(function(locationData) {
    self.locationList.push(new Location(locationData));
  });

  // the currently selected location - can be set either from the list or by selecting a
  // marker on the map directly
  currentLocation = this.locationList()[0];

  this.setCurrentLocation = function(loc) {
    currentLocation = loc;
  };

  this.handleSelection = function(location) {
    self.setCurrentLocation(location);
    var index = self.locationList().indexOf(location);
    handleMarkerClick(markers[index]);
  };

  // this works, but not sure if I did this right.  Called from the View when the user
  // enters some filter text.  seems like there should be a cleaner way to do this.
  // gets the list of locations and checks to see which ones are "visible", i.e., still
  // have some text.  Technically doesn't need to be here in the ViewModel, I don't think,
  // according to knockout.js documentation
  this.filterMap = function() {
    var filteredList = $("#filteredList").children();
    if (filteredList != null) {
      for (var i = 0; i < filteredList.length; i++) {
        var text = filteredList[i].textContent;
        // marker appears to flash if map is already set and we set it again,
        // so only set it if we're changing states
        if (text == "") {
          markers[i].setMap(null);
        } else {
          if (markers[i].getMap() == null) {
            // make sure they're not bouncing around when they reappear
            markers[i].setAnimation(null);
            markers[i].setMap(map);
          }
        }
      }
    }
  };
}

ko.applyBindings(new ViewModel());

// View (Map stuff) ----------------------------------------------------------//

// let's make the map look cooler - will pass this to the map constructor
var styles = [
  {"featureType":"all","elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"color":"#000000"},{"lightness":13}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#144b53"},{"lightness":14},{"weight":1.4}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#08304b"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#0c4152"},{"lightness":5}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#0b434f"},{"lightness":25}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#0b3d51"},{"lightness":16}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"}]},{"featureType":"transit","elementType":"all","stylers":[{"color":"#146474"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#021019"}]}];


// Style the markers a bit. This will be our listing marker icon.
// Borrowed from the Udacity Course
var defaultIcon = null;

// Create a "highlighted location" marker color for when the user
// mouses over the marker.
// Borrowed from the Udacity course
var highlightedIcon = null;

// Our map - need to be able to access it outside of this function
var map = null;

// the currently selected markers
var currentMarker = null;

// our info window to display photos and info
var infoWindow = null;

function initMap() {
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
     center: {lat: 33.812163, lng: -117.918996},
     styles: styles,
     zoom: 17
   }),
   timeoutSeconds = 5,
   usingMap = false;

// NEED TO THINK ABOUT THIS STUFF
  function doAlternateStuff() {
    // do whatever the fallback requires
    alert("howdy, bozo");
  }

  // set a timeout and store the reference
  var timer = window.setTimeout(doAlternateStuff, timeoutSeconds * 1000);

  // now listen for the tilesloaded event
  google.maps.event.addListener(map, 'tilesloaded', function() {
      // cancel the timeout
      window.clearTimeout(timer);
      usingMap = true;
      // etc
  });

   // create the icons
   defaultIcon = makeMarkerIcon('0091ff');
   highlightedIcon = makeMarkerIcon('FFFF24');

   // The following group uses the location array to create an array of markers on initialize.
   for (var i = 0; i < locations.length; i++) {
     // Get the title and position from the location array.
     var title = locations[i].title;
     var position = locations[i].location;

     // Create a marker per location, add them to the map, and put into markers array.
     var marker = new google.maps.Marker({
       position: position,
       title: title,
       animation: google.maps.Animation.DROP,
       icon: defaultIcon,
       id: i
     });

     // info window where we'll display stuff we pull from outside APIs
     infoWindow = new google.maps.InfoWindow({
       content: locations[i].title
     });

     marker.addListener("click", function() {
       handleMarkerClick(this);
     });

     marker.setMap(map);
     markers.push(marker);

     // // update the pointer while we're hovering over the list
     // var listItems = $("#filteredList").children();
     // for (var i = 0; i < listItems.length; i++) {
     //   listItems[i].style.cursor = "pointer"
     // }
   }
}

function loadData() {

    // flickr key/secret
    // 3a851398932669f45a60f2f4223d1cec
    // efa4a439c6b1b204
    // var $body = $('body');
    // var $wikiElem = $('#wikipedia-links');
    // var $nytHeaderElem = $('#nytimes-header');
    // var $nytElem = $('#nytimes-articles');
    // var $greeting = $('#greeting');
    // var $city = $('#city');
    // var $street = $('#street');
    //
    // // clear out old data before new request
    // $wikiElem.text("");
    // $nytElem.text("");
    //
    // var cityStr = $city.val();
    // var streetStr = $street.val();
    // var addr = streetStr + ", " + cityStr;
    //
    // $greeting.text('So, you want to live at ' + addr + "?")
    // // load streetview
    // var apiStr = "http://maps.googleapis.com/maps/api/streetview?size=600x300&location=" + addr;
    // console.log(apiStr);
    // $body.append('<img class="bgimg" src="' + apiStr + '">');
    //
    //
    // // get NYT articles
    // var url = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
    // url += '?' + $.param({
    //   'api-key': "2aff212c7bfc419ea592f6ff923100a9",
    //   'q': cityStr
    // });
    //
    // $.getJSON(url, function( data ) {
    //    var items = [];
    //    $.each( data.response.docs, function( key, val ) {
    //      $nytElem.append(
    //        "<li class='article' id='" + key + "'> <a href='" +
    //        val.web_url + "'>" + val.headline.main + "</a><p>" +
    //        val.snippet + "</p></li>");
    //    });
    // }).fail( function(err) {
    //   $nytHeaderElem.text("New York Times Articles Could Not Be Loaded");
    // });;

    // get wikipedia Articles// Using jQuery
    // build URL with title of currentLocation.  want to make sure the First
    // response is the correct one
    var searchStr = currentLocation.getTitle() + " attraction";
    var wikiUrl = "https://en.wikipedia.org/w/api.php?action=opensearch&search=" + searchStr + "&format=json&callback=wikiCallback";

    $.ajax( {
        url: wikiUrl,
        dataType: 'jsonp',
        success: function(response) {
           // do something with data
           console.log(response);
           // set the data of the infoWindow here
           // infoWindow.setContent(response[1][2]);
        }
    } );

    var settings = {
      "url": "https://api.yelp.com/v3/businesses/the-haunted-mansion-anaheim",
      "headers": {
        "Authorization": "Bearer hcUTq5E3DWN86frxL6CKl1Z56C-dxckhW4NpDWZZVHQQMnF_0LWXowruG8x6Wf7Ox7l_x43k_e2NGTql7dDSiGOIk5RjMRHXZaxqEmYd7_dhvE_buYpiM6AhqUEwWnYx",
        "Cache-Control": "no-cache"
      },
      "async": true,
      "crossDomain": true,
      "dataType": "json",
    }

    $.ajax(settings).done(function (response) {
      console.log(response);
    });

    return false;
};

// $('#form-container').submit(loadData);

// Utility functions ---------------------------------------------------------//

// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
// Borrowed from the Udacity course
function makeMarkerIcon(markerColor) {
  var markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
    '|40|_|%E2%80%A2',
    new google.maps.Size(21, 34),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 34),
    new google.maps.Size(21,34));
  return markerImage;
}

// this function provides the animation behavior to be used by the various listeners
function handleMarkerClick(marker) {

  // NEED to figure out how to get the currentLocation here, as well
  // first, need to stop all the other markers for bouncing.  if we are clicking
  // on a marker that is already bouncing, let's stop it
  if (marker != null) {
    for (var i = 0; i < markers.length; i++) {
      if (marker !== markers[i] || markers[i].getAnimation() != null) {
        markers[i].setAnimation(null);
        markers[i].setIcon(defaultIcon);
      } else {
        markers[i].setAnimation(google.maps.Animation.BOUNCE);
        markers[i].setIcon(highlightedIcon);
        // cache the data when we get it, and check the cache first before
        // making another call
        loadData();
      }
    }
  }

  if (infoWindow != null) {
    // make sure not to load data if the currentLocation hasn't changed
    infoWindow.setContent(marker.title);
    infoWindow.open(map, marker);
  }
}

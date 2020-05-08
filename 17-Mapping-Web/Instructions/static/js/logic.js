// USGS earthquake json - earthquakes in the past 7 days
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a get request to the query URL
function markerSize(magnitude) {
  if (magnitude === 0) {
    return 1;
  }
  return magnitude * 3;
}
// Define functions
function chooseColor(magnitude) {
    switch (true) {
    case magnitude >= 5:
      return "#fc0303";
    case magnitude > 4:
      return "#ff5203";
    case magnitude > 3:
      return "#fc9003";
    case magnitude > 2:
      return "#fcba03";
    case magnitude > 1:
      return "#fcf403";
    default:
      return "#88fc03"
    }
}

function createFeatures(Data) {

  var earthquakes = L.geoJSON(Data, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng, {
        radius: markerSize(feature.properties.mag),
        fillColor: chooseColor(feature.properties.mag),
        color: "#000000",
        fillOpacity: 1,
        opacity: 1,
        stroke: true,
        weight: 0.5
      });
    },
    onEachFeature: function(feature, layer) {
      layer.bindPopup("<h3>Magnitude: " + feature.properties.mag + "</h3><hr><h4>" + feature.properties.place + "</h4>");
    }
  });
  createMap(earthquakes);
}

function createMap(earthquakes) {
  // Define streetmap and darkmap layers
  var outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoid2lsbGdpb3JkYW5vMSIsImEiOiJjazhqbDd2eHAwM2plM2hwZWdjYjZ3Y3kzIn0.l7hUOwxMegQFzl1jNW9lsw", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });

  var graymap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoid2lsbGdpb3JkYW5vMSIsImEiOiJjazhqbDd2eHAwM2plM2hwZWdjYjZ3Y3kzIn0.l7hUOwxMegQFzl1jNW9lsw", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoid2lsbGdpb3JkYW5vMSIsImEiOiJjazhqbDd2eHAwM2plM2hwZWdjYjZ3Y3kzIn0.l7hUOwxMegQFzl1jNW9lsw", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });
  var tectonicplates = new L.LayerGroup();

  var overlayMaps = {
    "Tectonic Plates": tectonicplates,
    "Earthquakes": earthquakes
  }

  // Define baseMaps
  var baseMaps = {
    "Satellite": satellite,
    "Outdoors": outdoors,
    "Gray Map": graymap
  };

  // Create a new map
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 4,
    layers: [outdoors, earthquakes]
  });

  // Create a layer control containing our baseMaps
  // Add an overlay Layer containing the earthquake GeoJSON
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function () {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4, 5];
        color = ["#88fc03", "#fcf403", "#fcba03", "#fc9003", "#ff5203", "#fc0303"];
    
    // Loop through the density intervals
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + color[i] + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
  };
  
  //Add boundaries from fraxen github
  legend.addTo(myMap);
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json", function(plates) {

    L.geoJson(plates, {
      color: "red",
      weight: 2
    })
    .addTo(tectonicplates);

    tectonicplates.addTo(myMap);
  });

}
// final d3.JSON function
d3.json(queryUrl, function(data) {

  createFeatures(data.features);

});

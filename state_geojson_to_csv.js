//
// Download these shapefiles:
// "Statistical Local Areas ASGC Ed 2008 Digital Boundaries in ESRI Shapefile Format"
// http://www.abs.gov.au/AUSSTATS/abs@.nsf/DetailsPage/1259.0.30.0012008?OpenDocument
//
// Generate GeoJSON:
// ogr2ogr -where "STATE_CODE = '5'" -f GeoJSON wa.geojson SLA08aAust.shp
//
// Use GeoJSON for this file, but also generate TopoJSON for D3 maps:
// topojson --id-property SLA_MAIN08 -p name=SLA_NAME08 -p name -o wa.json wa.geojson

var state_codes = {
  1: "NSW",
  2: "Vic",
  3: "Qld",
  4: "SA",
  5: "WA",
  6: "Tas",
  7: "NT",
  8: "ACT"
}

var fs = require('fs');

if (!process.argv[2]) {
  console.log('can haz file to read? geojson preferred!');
  process.exit(1);
}


console.log('"State","Region Name","ASGC 2008 Code"');

fs.readFile(process.argv[2], function (err, data) {
  if (err) throw err;

  var structure = JSON.parse(data.toString('utf-8'));

  structure.features.forEach(function(item) {

    console.log(
      '"' + state_codes[item.properties.STATE_CODE] + '",' +
      '"' + item.properties.SLA_NAME08 + '",' +
      item.properties.SLA_MAIN08);

  });
});




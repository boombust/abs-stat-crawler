

var http = require('http');


// var soap = require('soap');
// var url = "http://stat.abs.gov.au/sdmxws/sdmx.asmx";
// var args = {name: 'value'};

// soap.createClient(url, function(err, client) {
//     client.MyFunction({}, function(err, result) {
//         console.log(result);
//     });
// });



// http.get("http://stat.abs.gov.au/sdmxws/sdmx.asmx", function(http_get_response) {
//   var sdmx_text = "";
//
//   http_get_response.on("data", function(response) {
//     sdmx_text += response.toString('utf-8');
//   });
//
//   http_get_response.on("end", function(response) {
//     console.log(sdmx_text);
//   });
// });


var query_message = '';


// var post_body = '<?xml version="1.0" encoding="utf-8"?><soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope"><soap12:Body><GetGenericData xmlns="http://stats.oecd.org/OECDStatWS/SDMX/"><QueryMessage>' + query_message + '</QueryMessage></GetGenericData></soap12:Body></soap12:Envelope>';

// SOAP 1.2 ------------------------------------------------
// POST /sdmxws/sdmx.asmx HTTP/1.1
// Host: stat.abs.gov.au
// Content-Type: application/soap+xml; charset=utf-8
// Content-Length: length

// var post_options = {
//   host: "stat.abs.gov.au",
//   port: "80",
//   path: "/sdmxws/sdmx.asmx",
//   method: "POST",
//   headers: {
//     'Content-Type': "application/soap+xml; charset=utf-8",
//     'Content-Length': post_body.length
//   }
// }

var post_body = '<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GetGenericData xmlns="http://stats.oecd.org/OECDStatWS/SDMX/"><QueryMessage>' + query_message + '</QueryMessage></GetGenericData></soap:Body></soap:Envelope>';

// SOAP 1.1 ------------------------------------------------
// POST /sdmxws/sdmx.asmx HTTP/1.1
// Host: stat.abs.gov.au
// Content-Type: text/xml; charset=utf-8
// Content-Length: length
// SOAPAction: "http://stats.oecd.org/OECDStatWS/SDMX/GetGenericData"

var post_options = {
  host: "stat.abs.gov.au",
  port: "80",
  path: "/sdmxws/sdmx.asmx",
  method: "POST",
  headers: {
    "Content-Type": "text/xml; charset=utf-8",
    "Content-Length": post_body.length,
    "SOAPAction": "http://stats.oecd.org/OECDStatWS/SDMX/GetGenericData"
  }
}


var post_request = http.request(post_options,
  function(http_response) {
    var sdmx_text = "";

    http_response.on("data", function(response) {
      sdmx_text += response.toString('utf-8');
    });

    http_response.on("end", function() {
      console.log(sdmx_text);
    });
});

post_request.write(post_body);
post_request.end();




var http = require('http');



var query_message = '<message:QueryMessage xmlns="http://www.SDMX.org/resources/SDMXML/schemas/v2_0/query" xmlns:message="http://www.SDMX.org/resources/SDMXML/schemas/v2_0/message" xsi:schemaLocation="http://www.SDMX.org/resources/SDMXML/schemas/v2_0/query http://www.sdmx.org/docs/2_0/SDMXQuery.xsd http://www.SDMX.org/resources/SDMXML/schemas/v2_0/message http://www.sdmx.org/docs/2_0/SDMXMessage.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><Header xmlns="http://www.SDMX.org/resources/SDMXML/schemas/v2_0/message"><ID>none</ID><Test>false</Test><Truncated>false</Truncated><Prepared>2013-06-01T23:17:47</Prepared><Sender id="YourID"><Name xml:lang="en">Your English Name</Name></Sender><Receiver id="ABS"><Name xml:lang="en">Australian Bureau of Statistics</Name><Name xml:lang="fr">Australian Bureau of Statistics</Name></Receiver></Header><Query xmlns="http://www.SDMX.org/resources/SDMXML/schemas/v2_0/message"><DataWhere xmlns="http://www.SDMX.org/resources/SDMXML/schemas/v2_0/query"><And><DataSet>NRP7</DataSet><Dimension id="FREQUENCY">A</Dimension><Attribute id="TIME_FORMAT">P1Y</Attribute><Time><StartTime>2004</StartTime><EndTime>2010</EndTime></Time><Or><Dimension id="DATAITEM">20</Dimension><Dimension id="DATAITEM">37</Dimension><Dimension id="DATAITEM">43</Dimension><Dimension id="DATAITEM">40</Dimension><Dimension id="DATAITEM">5</Dimension><Dimension id="DATAITEM">337</Dimension><Dimension id="DATAITEM">450</Dimension><Dimension id="DATAITEM">331</Dimension><Dimension id="DATAITEM">326</Dimension><Dimension id="DATAITEM">325</Dimension><Dimension id="DATAITEM">340</Dimension><Dimension id="DATAITEM">338</Dimension><Dimension id="DATAITEM">339</Dimension></Or><Or><Dimension id="ASGC_2008">805252349</Dimension></Or></And></DataWhere></Query></message:QueryMessage>';


var post_body = '<?xml version="1.0" encoding="utf-8"?><soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope"><soap12:Body><GetGenericData xmlns="http://stats.oecd.org/OECDStatWS/SDMX/"><QueryMessage>' + query_message + '</QueryMessage></GetGenericData></soap12:Body></soap12:Envelope>';

// SOAP 1.2 ------------------------------------------------
// POST /sdmxws/sdmx.asmx HTTP/1.1
// Host: stat.abs.gov.au
// Content-Type: application/soap+xml; charset=utf-8
// Content-Length: length

var post_options = {
  host: "stat.abs.gov.au",
  port: "80",
  path: "/sdmxws/sdmx.asmx",
  method: "POST",
  headers: {
    'Content-Type': "application/soap+xml; charset=utf-8",
    'Content-Length': post_body.length
  }
}

// var post_body = '<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GetGenericData xmlns="http://stats.oecd.org/OECDStatWS/SDMX/"><QueryMessage>' + query_message + '</QueryMessage></GetGenericData></soap:Body></soap:Envelope>';

// SOAP 1.1 ------------------------------------------------
// POST /sdmxws/sdmx.asmx HTTP/1.1
// Host: stat.abs.gov.au
// Content-Type: text/xml; charset=utf-8
// Content-Length: length
// SOAPAction: "http://stats.oecd.org/OECDStatWS/SDMX/GetGenericData"

// var post_options = {
//   host: "stat.abs.gov.au",
//   port: "80",
//   path: "/sdmxws/sdmx.asmx",
//   method: "POST",
//   headers: {
//     "Content-Type": "text/xml; charset=utf-8",
//     "Content-Length": post_body.length,
//     "SOAPAction": "http://stats.oecd.org/OECDStatWS/SDMX/GetGenericData"
//   }
// }


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


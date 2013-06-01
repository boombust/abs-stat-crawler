

var fs = require('fs');
var http = require('http');
var csv = require('csv');
var parseString = require('xml2js').parseString;


  var query_message = '<message:QueryMessage xmlns="http://www.SDMX.org/resources/SDMXML/schemas/v2_0/query" xmlns:message="http://www.SDMX.org/resources/SDMXML/schemas/v2_0/message" xsi:schemaLocation="http://www.SDMX.org/resources/SDMXML/schemas/v2_0/query http://www.sdmx.org/docs/2_0/SDMXQuery.xsd http://www.SDMX.org/resources/SDMXML/schemas/v2_0/message http://www.sdmx.org/docs/2_0/SDMXMessage.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchemainstance"><Header xmlns="http://www.SDMX.org/resources/SDMXML/schemas/v2_0/message"><ID>ABC123</ID><Test>false</Test><Prepared>2013-06-01T20:26:53</Prepared><Sender id="BoomBust"><Name xml:lang="en">Team BoomBust</Name></Sender><Receiver id="ABS"><Name xml:lang="en">Australian Bureau of Statistics</Name><Name xml:lang="fr">Australian Bureau of Statistics</Name></Receiver></Header><message:Query><query:ReturnDetails/><query:MetadataParameters><query:AttachedObject><Ref package="datastructure" class="Dimension" id="MEASURE" agencyID="ABS"/></query:AttachedObject><query:AttachedDataSet><common:DataProvider><Ref id="ABS" maintainableParentID="" agencyID="ABS"/></common:DataProvider><common:ID>CPI</common:ID></query:AttachedDataSet>                                    </query:MetadataParameters></message:Query></message:QueryMessage>';

//   var post_body = '<?xml version="1.0" encoding="utf-8"?><soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope"><soap12:Body><GetDataStructureDefinition xmlns="http://stats.oecd.org/OECDStatWS/SDMX/"><QueryMessage>' + query_message + '</QueryMessage></GetDataStructureDefinition></soap12:Body></soap12:Envelope>';

  var post_body = '<?xml version="1.0" encoding="utf-8"?><soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope"><soap12:Body><GetDimensionMetadata xmlns="http://stats.oecd.org/OECDStatWS/SDMX/"><QueryMessage>' + query_message + '</QueryMessage></GetDimensionMetadata></soap12:Body></soap12:Envelope>';

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

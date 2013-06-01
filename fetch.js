
var fs = require('fs');
var path = require('path');
var http = require('http');
var csv = require('csv');
var parseString = require('xml2js').parseString;


if (!process.argv[2] || !fs.existsSync(process.argv[2])) {
  console.log('No input file provided! CSV with ASGC codes is required as first argument.');
  process.exit(1);
}

if (!process.argv[3] || !fs.existsSync(process.argv[3])) {
  console.log('No output directory provided! Second argument should be an (ideally empty) directory.');
  process.exit(1);
}

var all_location_codes = {};
var location_codes_to_query = {};
var final_output = {};

fs.readFile(process.argv[2], function(err, input_file_data) {
  if (err) throw err;

  csv()
    .from(input_file_data.toString('utf-8'))
    .on('record', function(row, index) {
      if (index !== 0) {
        location_codes_to_query[row[2]] = true;
        all_location_codes[row[2]] = row;
      }
    })
    .on('end', function(count) {
      console.log("Going to request data for", Object.keys(location_codes_to_query).length, "locations");

      requestNextData();
    });
});


var requestNextData = function() {
  if (Object.keys(location_codes_to_query).length == 0) {
    console.log("Done! Writing output to", process.argv[3]);

    writeOutput(final_output);
    return false;
  }

  var next = Object.keys(location_codes_to_query)[0];

  requestData(next);
  delete location_codes_to_query[next];
}


var writeOutput = function(output) {
  for (var data_name in output) {
    file_data_name = data_name.replace('/', '_');

    var output_file = path.join(process.argv[3], file_data_name) + '.csv';

    // if (!fs.existsSync(output_dir)) {
    //   // yes, I'm lazily cheating and using synchronous functions
    //   fs.mkdirSync(output_dir);
    // }

    var time_keys;
    var rows = '';

    for (var location_code in output[data_name]) {
      // this cheats and assumes time_keys will be the same for each data item type
      time_keys = Object.keys(output[data_name][location_code]);

      var this_row = all_location_codes[location_code].join(',');

      time_keys.forEach(function(time) {
        this_row += ',' + output[data_name][location_code][time];
      });

      rows += this_row + "\n";
    }

    var header = 'State,Region Name,ASGC 2008 Code,';
    header += time_keys.join(',');

    fs.writeFileSync(output_file, header + "\n" + rows);
  }
}


// The API for fetching this seems borked :-(
// ... so! Visit http://stat.abs.gov.au/ and open the National Regional Profile dataset
// Then click Customise and Data Item (so the list of data items is visible), and run:
//--------
// var x = $('iframe')[1].contentDocument.getElementById('M_WebTreeDimMembers_1').children; var items={}; for(var i = 0; i < x.length; i++) { var parts = x[i].title.split(': '); items[parts[0]] = parts[1]; }; console.log(JSON.stringify(items));
//--------

var data_items = {"1":"Estimates of Personal Income (year ended 30 June)- Average Investment income ($)","2":"Estimates of Personal Income (year ended 30 June)- Average other income (excl. Govt. pensions) ($)","3":"Estimates of Personal Income (year ended 30 June)- Average Own unincorporated business income ($)","4":"Estimates of Personal Income (year ended 30 June)- Average Superannuation and annuity income ($)","5":"Estimates of Personal Income (year ended 30 June)- Average Total income (excl. Govt. pensions) ($)","6":"Estimates of Personal Income (year ended 30 June)- Average Wage and salary income ($)","7":"Estimates of Personal Income (year ended 30 June)- Investment earners (Persons)","8":"Estimates of Personal Income (year ended 30 June)- Investment income ($ Millions)","9":"Estimates of Personal Income (year ended 30 June)- Other income (excl. Govt. pensions) ($ Millions)","10":"Estimates of Personal Income (year ended 30 June)- Other income earners (excl. Govt. pensions) (Persons)","11":"Estimates of Personal Income (year ended 30 June)- Own unincorporated business earners (Persons)","12":"Estimates of Personal Income (year ended 30 June)- Own unincorporated business income ($ Millions)","13":"Estimates of Personal Income (year ended 30 June)- Superannuation and annuity earners (Persons)","14":"Estimates of Personal Income (year ended 30 June)- Superannuation and annuity income ($ Millions)","15":"Estimates of Personal Income (year ended 30 June)- Total income (excl. Govt. pensions) ($ Millions)","16":"Estimates of Personal Income (year ended 30 June)- Total income earners (excl. Govt. pensions) (Persons)","17":"Estimates of Personal Income (year ended 30 June)- Wage and salary earners (Persons)","18":"Estimates of Personal Income (year ended 30 June)- Wage and salary income ($ Millions)","19":"Estimates of Unemployment (June qtr)- Unemployed persons (Persons)","20":"Estimates of Unemployment (June qtr)- Unemployment rate (Percent)","21":"Selected Government Pensions & Allowances (at 30 June)- Age Pension- Centrelink (Persons)","22":"Selected Government Pensions & Allowances (at 30 June)- Age Pension- DVA (Persons)","23":"Selected Government Pensions & Allowances (at 30 June)- Carers Payment (Persons)","24":"Selected Government Pensions & Allowances (at 30 June)- Disability Support Pension (Persons)","25":"Selected Government Pensions & Allowances (at 30 June)- Family Tax Benefit- Part A (Persons)","26":"Selected Government Pensions & Allowances (at 30 June)- Family Tax Benefit- Part B (Persons)","27":"Selected Government Pensions & Allowances (at 30 June)- Newstart Allowance (Persons)","28":"Selected Government Pensions & Allowances (at 30 June)- Newstart Allowance- More than 365 days (Percent)","29":"Selected Government Pensions & Allowances (at 30 June)- Parenting Payment- Single (Persons)","30":"Selected Government Pensions & Allowances (at 30 June)- Total Family Tax Benefit recipients (Persons)","31":"Selected Government Pensions & Allowances (at 30 June)- Youth Allowance (Persons)","32":"Selected Government Pensions & Allowances (year ending 30 June)- Baby Bonus (Persons)","33":"Taxation Statistics (year ended 30 June)- Average net tax ($)","34":"Taxation Statistics (year ended 30 June)- Net tax ($ Millions)","35":"Taxation Statistics (year ended 30 June)- Net tax as a proportion of taxable income (Percent)","36":"Taxation Statistics (year ended 30 June)- Non-taxable individuals (Persons)","37":"Taxation Statistics (year ended 30 June)- Non-taxable Individuals- Avg taxable income ($)","38":"Taxation Statistics (year ended 30 June)- Non-taxable Individuals- Taxable income ($ Millions)","39":"Taxation Statistics (year ended 30 June)- Taxable and non-taxable individuals (Persons)","40":"Taxation Statistics (year ended 30 June)- Taxable and non-taxable individuals- Avg taxable income ($)","41":"Taxation Statistics (year ended 30 June)- Taxable and non-taxable individuals- Taxable income ($ Millions)","42":"Taxation Statistics (year ended 30 June)- Taxable individuals (Persons)","43":"Taxation Statistics (year ended 30 June)- Taxable individuals- Avg taxable income ($)","44":"Taxation Statistics (year ended 30 June)- Taxable individuals- Taxable income ($ Millions)","45":"W&S Earners by Age and Sex (year ended 30 June)- Females aged 15 to 24 (Persons)","46":"W&S Earners by Age and Sex (year ended 30 June)- Females aged 25 to 34 (Persons)","47":"W&S Earners by Age and Sex (year ended 30 June)- Females aged 35 to 44 (Persons)","48":"W&S Earners by Age and Sex (year ended 30 June)- Females aged 45 to 54 (Persons)","49":"W&S Earners by Age and Sex (year ended 30 June)- Females aged 55 to 64 (Persons)","50":"W&S Earners by Age and Sex (year ended 30 June)- Females aged 65 and over (Persons)","51":"W&S Earners by Age and Sex (year ended 30 June)- Males aged 15 to 24 (Persons)","52":"W&S Earners by Age and Sex (year ended 30 June)- Males aged 25 to 34 (Persons)","53":"W&S Earners by Age and Sex (year ended 30 June)- Males aged 35 to 44 (Persons)","54":"W&S Earners by Age and Sex (year ended 30 June)- Males aged 45 to 54 (Persons)","55":"W&S Earners by Age and Sex (year ended 30 June)- Males aged 55 to 64 (Persons)","56":"W&S Earners by Age and Sex (year ended 30 June)- Males aged 65 and over (Persons)","57":"W&S Earners by Age and Sex (year ended 30 June)- Persons aged 15 to 24 (Persons)","58":"W&S Earners by Age and Sex (year ended 30 June)- Persons aged 25 to 34 (Persons)","59":"W&S Earners by Age and Sex (year ended 30 June)- Persons aged 35 to 44 (Persons)","60":"W&S Earners by Age and Sex (year ended 30 June)- Persons aged 45 to 54 (Persons)","61":"W&S Earners by Age and Sex (year ended 30 June)- Persons aged 55 to 64 (Persons)","62":"W&S Earners by Age and Sex (year ended 30 June)- Persons aged 65 and over (Persons)","63":"W&S Earners by Age and Sex (year ended 30 June)- Total Females (Persons)","64":"W&S Earners by Age and Sex (year ended 30 June)- Total Males (Persons)","65":"W&S Earners by Age and Sex (year ended 30 June)- Total Persons (Persons)","66":"W&S Earners by Occupation (year ended 30 June)- Clerical and Adminstrative Workers (Persons)","67":"W&S Earners by Occupation (year ended 30 June)- Community and Personal Service Workers (Persons)","68":"W&S Earners by Occupation (year ended 30 June)- Labourers (Persons)","69":"W&S Earners by Occupation (year ended 30 June)- Machinery Operators and Drivers (Persons)","70":"W&S Earners by Occupation (year ended 30 June)- Managers (Persons)","71":"W&S Earners by Occupation (year ended 30 June)- Not Stated (Persons)","72":"W&S Earners by Occupation (year ended 30 June)- Professionals (Persons)","73":"W&S Earners by Occupation (year ended 30 June)- Sales Workers (Persons)","74":"W&S Earners by Occupation (year ended 30 June)- Technicians and Trade Workers (Persons)","75":"W&S Earners by Occupation (year ended 30 June)- Total wage and salary earners (Persons)","200":"Births and Deaths (year ended 31 December)- Births (Persons)","201":"Births and Deaths (year ended 31 December)- Deaths (Persons)","203":"Births and Deaths (year ended 31 December)- Standardised death rate (Persons)","204":"Births and Deaths (year ended 31 December)- Total fertility rate (Persons","205":"Born in Americas (Census 2006)- Percentage of total population (Percent)","206":"Born in North Africa and the Middle East (Census 2006)- Percentage of total population (Percent)","207":"Born in North-East Asia (Census 2006)- Percentage of total population (Percent)","208":"Born in North-West Europe (Census 2006)- Percentage of total population (Percent)","209":"Born in Oceania and Antarctica (excluding Australia) (Census 2006)- Percentage of total population (Percent)","210":"Born in South-East Asia (Census 2006)- Percentage of total population (Percent)","211":"Born in Southern and Central Asia (Census 2006)- Percentage of total population (Percent)","212":"Born in Southern and Eastern Europe (Census 2006)- Percentage of total population (Percent)","213":"Born in Sub-Saharan Africa (Census 2006)- Percentage of total population (Percent)","214":"Estimated Resident Indigenous Population (at 30 June)- Percentage of total population (Percent)","215":"Estimated Resident Population (at 30 June)- Females aged 0 to 4 (Number)","216":"Estimated Resident Population (at 30 June)- Females aged 10 to 14 (Number)","217":"Estimated Resident Population (at 30 June)- Females aged 15 to 19 (Number)","218":"Estimated Resident Population (at 30 June)- Females aged 20 to 24 (Number)","219":"Estimated Resident Population (at 30 June)- Females aged 25 to 29 (Number)","220":"Estimated Resident Population (at 30 June)- Females aged 30 to 34 (Number)","221":"Estimated Resident Population (at 30 June)- Females aged 35 to 39 (Number)","222":"Estimated Resident Population (at 30 June)- Females aged 40 to 44 (Number)","223":"Estimated Resident Population (at 30 June)- Females aged 45 to 49 (Number)","224":"Estimated Resident Population (at 30 June)- Females aged 5 to 9 (Number)","225":"Estimated Resident Population (at 30 June)- Females aged 50 to 54 (Number)","226":"Estimated Resident Population (at 30 June)- Females aged 55 to 59 (Number)","227":"Estimated Resident Population (at 30 June)- Females aged 60 to 64 (Number)","228":"Estimated Resident Population (at 30 June)- Females aged 65 to 69 (Number)","229":"Estimated Resident Population (at 30 June)- Females aged 70 to 74 (Number)","230":"Estimated Resident Population (at 30 June)- Females aged 75 to 79 (Number)","231":"Estimated Resident Population (at 30 June)- Females aged 80 to 84 (Number)","232":"Estimated Resident Population (at 30 June)- Females aged 85 and over (Number)","233":"Estimated Resident Population (at 30 June)- Males aged 0 to 4 (Number)","234":"Estimated Resident Population (at 30 June)- Males aged 10 to 14 (Number)","235":"Estimated Resident Population (at 30 June)- Males aged 15 to 19 (Number)","236":"Estimated Resident Population (at 30 June)- Males aged 20 to 24 (Number)","237":"Estimated Resident Population (at 30 June)- Males aged 25 to 29 (Number)","238":"Estimated Resident Population (at 30 June)- Males aged 30 to 34 (Number)","239":"Estimated Resident Population (at 30 June)- Males aged 35 to 39 (Number)","240":"Estimated Resident Population (at 30 June)- Males aged 40 to 44 (Number)","241":"Estimated Resident Population (at 30 June)- Males aged 45 to 49 (Number)","242":"Estimated Resident Population (at 30 June)- Males aged 5 to 9 (Number)","243":"Estimated Resident Population (at 30 June)- Males aged 50 to 54 (Number)","244":"Estimated Resident Population (at 30 June)- Males aged 55 to 59 (Number)","245":"Estimated Resident Population (at 30 June)- Males aged 60 to 64 (Number)","246":"Estimated Resident Population (at 30 June)- Males aged 65 to 69 (Number)","247":"Estimated Resident Population (at 30 June)- Males aged 70 to 74 (Number)","248":"Estimated Resident Population (at 30 June)- Males aged 75 to 79 (Number)","249":"Estimated Resident Population (at 30 June)- Males aged 80 to 84 (Number)","250":"Estimated Resident Population (at 30 June)- Males aged 85 and over (Number)","251":"Estimated Resident Population (at 30 June)- Persons aged 0 to 4 (Number)","252":"Estimated Resident Population (at 30 June)- Persons aged 10 to 14 (Number)","253":"Estimated Resident Population (at 30 June)- Persons aged 15 to 19 (Number)","254":"Estimated Resident Population (at 30 June)- Persons aged 20 to 24 (Number)","255":"Estimated Resident Population (at 30 June)- Persons aged 25 to 29 (Number)","256":"Estimated Resident Population (at 30 June)- Persons aged 30 to 34 (Number)","257":"Estimated Resident Population (at 30 June)- Persons aged 35 to 39 (Number)","258":"Estimated Resident Population (at 30 June)- Persons aged 40 to 44 (Number)","259":"Estimated Resident Population (at 30 June)- Persons aged 45 to 49 (Number)","260":"Estimated Resident Population (at 30 June)- Persons aged 5 to 9 (Number)","261":"Estimated Resident Population (at 30 June)- Persons aged 50 to 54 (Number)","262":"Estimated Resident Population (at 30 June)- Persons aged 55 to 59 (Number)","263":"Estimated Resident Population (at 30 June)- Persons aged 60 to 64 (Number)","264":"Estimated Resident Population (at 30 June)- Persons aged 65 to 69 (Number)","265":"Estimated Resident Population (at 30 June)- Persons aged 70 to 74 (Number)","266":"Estimated Resident Population (at 30 June)- Persons aged 75 to 79 (Number)","267":"Estimated Resident Population (at 30 June)- Persons aged 80 to 84 (Number)","268":"Estimated Resident Population (at 30 June)- Persons aged 85 and over (Number)","269":"Estimated Resident Population (at 30 June)- Total Females (Number)","270":"Estimated Resident Population (at 30 June)- Total Males (Number)","271":"Estimated Resident Population (at 30 June)- Total Persons (Number)","272":"Families (Census 2006)- Couple families with children under 15 and/or dependent students (Number)","273":"Families (Census 2006)- Couple families with non-dependent children only (Number)","274":"Families (Census 2006)- Couple families without children (Number)","275":"Families (Census 2006)- One parent families with children under 15 and/or dependent students (Number)","276":"Families (Census 2006)- One parent families with non-dependent children only (Number)","277":"Families (Census 2006)- Other families (Number)","278":"Families (Census 2006)- Total families (Number)","279":"Home Internet Access (Census 2006)- Broadband connection (Percent)","280":"Home Internet Access (Census 2006)- Dial-up connection (Percent)","281":"Home Internet Access (Census 2006)- Other connection (Percent)","282":"Home Internet Access (Census 2006)- Total internet connections (Percent)","283":"Households (Census 2006)- Family households (Number)","284":"Households (Census 2006)- Group households (Number)","285":"Households (Census 2006)- Lone person households (Number)","286":"Households (Census 2006)- Total households (Number)","287":"Internal Migration (Census 2006)- Persons who lived at different address 1 year ago (Persons)","288":"Internal Migration (Census 2006)- Persons who lived at different address 5 years ago (Persons)","289":"Internal Migration (Census 2006)- Persons who lived at same address 1 year ago (Persons)","290":"Internal Migration (Census 2006)- Persons who lived at same address 5 years ago (Persons)","291":"Occupation (Census 2006)- Clerical and Administrative Workers (Percent)","292":"Occupation (Census 2006)- Community and Personal Service Workers (Percent)","293":"Occupation (Census 2006)- Inadequately Described and Not Stated (Percent)","294":"Occupation (Census 2006)- Labourers (Percent)","295":"Occupation (Census 2006)- Machinery Operators and Drivers (Percent)","296":"Occupation (Census 2006)- Managers (Percent)","297":"Occupation (Census 2006)- Professionals (Percent)","298":"Occupation (Census 2006)- Sales Workers (Percent)","299":"Occupation (Census 2006)- Technicians and Trades Workers (Percent)","300":"Population Density (at 30 June) (Number)","301":"Proportion of Population by Remoteness Area (Census 2006)- Inner Regional (Percent)","302":"Proportion of Population by Remoteness Area (Census 2006)- Major Cities (Percent)","303":"Proportion of Population by Remoteness Area (Census 2006)- Outer Regional (Percent)","304":"Proportion of Population by Remoteness Area (Census 2006)- Remote (Percent)","305":"Proportion of Population by Remoteness Area (Census 2006)- Very Remote (Percent)","306":"Proportion of Population by Section of State (Census 2006)- Bounded Locality (Percent)","307":"Proportion of Population by Section of State (Census 2006)- Major Urban (Percent)","308":"Proportion of Population by Section of State (Census 2006)- Other Urban (Percent)","309":"Proportion of Population by Section of State (Census 2006)- Rural Balance (Percent)","310":"Qualifications (Census 2006)- Advanced Diploma and Diploma (Percent)","311":"Qualifications (Census 2006)- Bachelor Degree (Percent)","312":"Qualifications (Census 2006)- Certificate (Percent)","313":"Qualifications (Census 2006)- Graduate Diploma and Graduate Certificate (Percent)","314":"Qualifications (Census 2006)- Inadequately Described and Not Stated (Percent)","315":"Qualifications (Census 2006)- Postgraduate Degree (Percent)","316":"Qualifications (Census 2006)- Total with qualifications (Percent)","317":"Speaks a Language Other than English at Home (Census 2006)- Percentage of population (Percent)","318":"Total Born Overseas (Census 2006)- Percentage of total population (Percent)","319":"Unpaid Work (Census 2006)- Persons caring for other children without pay (Percent)","320":"Unpaid Work (Census 2006)- Persons caring for own and other children without pay (Percent)","321":"Unpaid Work (Census 2006)- Persons caring for own children without pay (Percent)","322":"Unpaid Work (Census 2006)- Persons providing unpaid care, help or assistance to others (Percent)","323":"Unpaid Work (Census 2006)- Persons undertaking voluntary work for an organisation or group (Percent)","324":"Land area (Square Kilometres)","325":"Registered Motor Vehicles (at 31 March)- 10 years or older (Number)","326":"Registered Motor Vehicles (at 31 March)- 5 years to less than 10 years old (Number)","327":"Registered Motor Vehicles (at 31 March)- Articulated trucks (Number)","328":"Registered Motor Vehicles (at 31 March)- Buses (Number)","329":"Registered Motor Vehicles (at 31 March)- Campervans (Number)","330":"Registered Motor Vehicles (at 31 March)- Heavy rigid trucks (Number)","331":"Registered Motor Vehicles (at 31 March)- Less than 5 years old (Number)","332":"Registered Motor Vehicles (at 31 March)- Light commercial vehicles (Number)","333":"Registered Motor Vehicles (at 31 March)- Light rigid trucks (Number)","334":"Registered Motor Vehicles (at 31 March)- Motorcycles (Number)","335":"Registered Motor Vehicles (at 31 March)- Non-freight carrying trucks (Number)","336":"Registered Motor Vehicles (at 31 March)- Passenger vehicles (Number)","337":"Registered Motor Vehicles (at 31 March)- Total registered motor vehicles (Number)","338":"Registered Motor Vehicles by Type of Fuel (at 31 March)- Diesel (Number)","339":"Registered Motor Vehicles by Type of Fuel (at 31 March)- LPG/Dual/Other (Number)","340":"Registered Motor Vehicles by Type of Fuel (at 31 March)- Petrol unleaded (Number)","351":"Tourist Accommodation (at 30 June)- Caravan Parks (Number)","352":"Tourist Accommodation (at 30 June)- Holiday Flats & Units (Number)","353":"Tourist Accommodation (at 30 June)- Hotels- 15 or more rooms (Number)","354":"Tourist Accommodation (at 30 June)- Hotels, Motels, Serv. Aparts.- 15 or more rooms (Number)","355":"Tourist Accommodation (at 30 June)- Hotels, Motels, Serv. Aparts.- 5 to 14 rooms (Number)","356":"Tourist Accommodation (at 30 June)- Hotels, Motels, Serv. Aparts.- Total - 5 or more rooms (Number)","357":"Tourist Accommodation (at 30 June)- Motels- 15 or more rooms (Number)","358":"Tourist Accommodation (at 30 June)- Serviced Apartments- 15 or more rooms (Number)","359":"Tourist Accommodation (at 30 June)- Visitor Hotels (Number)","360":"Water Use on Australian Farms- Area irrigated (''000 ha)","361":"Water Use on Australian Farms- Area of agricultural land (''000 ha)","362":"Water Use on Australian Farms- Irrigation volume applied (Megalitres)","363":"Water Use on Australian Farms- Other agricultural uses (Megalitres)","364":"Water Use on Australian Farms- Total water use (Megalitres)","413":"Building Approvals (year ended 30 June)- Private sector houses (Number)","414":"Building Approvals (year ended 30 June)- Total dwelling units (Number)","441":"Registered Motor Vehicles per 1,000 Population (at 31 March)- Articulated trucks (Number)","442":"Registered Motor Vehicles per 1,000 Population (at 31 March)- Buses (Number)","443":"Registered Motor Vehicles per 1,000 Population (at 31 March)- Campervans (Number)","444":"Registered Motor Vehicles per 1,000 Population (at 31 March)- Heavy rigid trucks (Number)","445":"Registered Motor Vehicles per 1,000 Population (at 31 March)- Light commercial vehicles (Number)","446":"Registered Motor Vehicles per 1,000 Population (at 31 March)- Light rigid trucks (Number)","447":"Registered Motor Vehicles per 1,000 Population (at 31 March)- Motorcycles (Number)","448":"Registered Motor Vehicles per 1,000 Population (at 31 March)- Non-freight carrying trucks (Number)","449":"Registered Motor Vehicles per 1,000 Population (at 31 March)- Passenger vehicles (Number)","450":"Registered Motor Vehicles per 1,000 Population (at 31 March)- Total reg. motor vehicles (Number)","501":"Agricultural Commodities (year ended 30 June)- Area- All fruit (excluding grapes) (Hectares)","502":"Agricultural Commodities (year ended 30 June)- Area- Area of holding (Hectares)","503":"Agricultural Commodities (year ended 30 June)- Area- Cereals for grain (Hectares)","504":"Agricultural Commodities (year ended 30 June)- Area- Non-cereal broadacre crops (Hectares)","505":"Agricultural Commodities (year ended 30 June)- Area- Orchard trees (including nuts) (Hectares)","506":"Agricultural Commodities (year ended 30 June)- Area- Vegetables for human consumption (Hectares)","507":"Agricultural Commodities (year ended 30 June)- Number- Meat cattle (Number)","508":"Agricultural Commodities (year ended 30 June)- Number- Milk cattle (excluding house cows) (Number)","509":"Agricultural Commodities (year ended 30 June)- Number- Pigs (Number)","510":"Agricultural Commodities (year ended 30 June)- Number- Sheep and lambs (Number)","511":"Area irrigated as a proportion of agricultural land (Percent)","512":"Building Approvals (year ended 30 June)- Average value of private sector houses (''000)","515":"Building Approvals (year ended 30 June)- Value of new residential building ($ Millions)","516":"Building Approvals (year ended 30 June)- Value of private sector houses ($ Millions)","517":"Building Approvals (year ended 30 June)- Value of total building ($ Millions)","518":"Building Approvals (year ended 30 June)- Value of total non-residential buildings ($ Millions)","519":"Building Approvals (year ended 30 June)- Value of total residential building ($ Millions)","520":"Gross Value of Agricultural Production (year ended 30 June)- Gross value of agricultural production ($ Millions)","521":"Gross Value of Agricultural Production (year ended 30 June)- Gross value of crops ($ Millions)","522":"Gross Value of Agricultural Production (year ended 30 June)- Gross value of livestock products ($ Millions)","523":"Gross Value of Agricultural Production (year ended 30 June)- Gross value of livestock slaughterings ($ Millions)"};


var requestData = function(location_code) {
  var query_message = '<message:QueryMessage xmlns="http://www.SDMX.org/resources/SDMXML/schemas/v2_0/query" xmlns:message="http://www.SDMX.org/resources/SDMXML/schemas/v2_0/message" xsi:schemaLocation="http://www.SDMX.org/resources/SDMXML/schemas/v2_0/query http://www.sdmx.org/docs/2_0/SDMXQuery.xsd http://www.SDMX.org/resources/SDMXML/schemas/v2_0/message http://www.sdmx.org/docs/2_0/SDMXMessage.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><Header xmlns="http://www.SDMX.org/resources/SDMXML/schemas/v2_0/message"><ID>none</ID><Test>false</Test><Truncated>false</Truncated><Prepared>2013-06-01T23:17:47</Prepared><Sender id="YourID"><Name xml:lang="en">Your English Name</Name></Sender><Receiver id="ABS"><Name xml:lang="en">Australian Bureau of Statistics</Name><Name xml:lang="fr">Australian Bureau of Statistics</Name></Receiver></Header><Query xmlns="http://www.SDMX.org/resources/SDMXML/schemas/v2_0/message"><DataWhere xmlns="http://www.SDMX.org/resources/SDMXML/schemas/v2_0/query"><And><DataSet>NRP7</DataSet><Dimension id="FREQUENCY">A</Dimension><Attribute id="TIME_FORMAT">P1Y</Attribute><Time><StartTime>2004</StartTime><EndTime>2010</EndTime></Time><Or><Dimension id="DATAITEM">20</Dimension><Dimension id="DATAITEM">37</Dimension><Dimension id="DATAITEM">43</Dimension><Dimension id="DATAITEM">40</Dimension><Dimension id="DATAITEM">5</Dimension><Dimension id="DATAITEM">337</Dimension><Dimension id="DATAITEM">450</Dimension><Dimension id="DATAITEM">331</Dimension><Dimension id="DATAITEM">326</Dimension><Dimension id="DATAITEM">325</Dimension><Dimension id="DATAITEM">340</Dimension><Dimension id="DATAITEM">338</Dimension><Dimension id="DATAITEM">339</Dimension></Or><Or><Dimension id="ASGC_2008">' + location_code + '</Dimension></Or></And></DataWhere></Query></message:QueryMessage>';

  var post_body = '<?xml version="1.0" encoding="utf-8"?><soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope"><soap12:Body><GetGenericData xmlns="http://stats.oecd.org/OECDStatWS/SDMX/"><QueryMessage>' + query_message + '</QueryMessage></GetGenericData></soap12:Body></soap12:Envelope>';

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
        parseString(sdmx_text, function (err, parsed_xml) {
          if (err) { console.log(err); }

          // many levels before we get to the actual content ...
          var soap_message = parsed_xml['soap:Envelope']['soap:Body'][0]['GetGenericDataResponse'][0]['GetGenericDataResult'][0]['message:MessageGroup'][0];

          // soap_message contains a header and a dataset, but the header is useless
          // the DataSet tag also contains annotations, which are equally useless
          var data_series = soap_message['DataSet'][0].Series;

          data_series.forEach(function(unformatted_series) {
            var series_name = '';
            var series = {};

            unformatted_series.SeriesKey[0].Value.forEach(function(meta_value) {
              if (meta_value['$'].concept == 'DATAITEM') {
                series_name = data_items[meta_value['$'].value]
              }
            });

            unformatted_series.Obs.forEach(function(point) {
              series[point.Time] = point.ObsValue[0]['$'].value;
            });

            // if (!final_output[location_code]) { final_output[location_code] = {}; }
            if (!final_output[series_name]) { final_output[series_name] = {}; }
            final_output[series_name][location_code] = series;
          });
        });

        requestNextData();
      });
  });

  console.log("Requesting", location_code, all_location_codes[location_code][1]);
  post_request.write(post_body);
  post_request.end();
}

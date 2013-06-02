
var fs = require('fs');



var index_row = '';
var states = {};


var input_file = process.argv[2];


fs.readFile(input_file, function(err, input_file_data) {
  if (err) throw err;

  var lines = input_file_data.toString('utf-8').split("\n");

  lines.forEach(function(line) {
    if (line.trim() == '') { return; }

    var matches = line.match(/\"\d+\",\"([A-Za-z]{2,3})\"/);

    if (matches) {
      // content line
      if (!states[matches[1]]) { states[matches[1]] = []; }

      states[matches[1]].push(line);
    } else {
      index_row = line;
    }
  });

  for (var state in states) {
    var output_file = input_file.replace('.csv', '.' + state + '.csv');

    fs.writeFileSync(
      output_file,
      index_row + "\n" + states[state].join("\n")
    );
  }
});


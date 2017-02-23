const http = require('http');
const request = require('sync-request');
const sortBy = require('sort-by');

const hostname = '0.0.0.0';
const port = 3000;

const server = http.createServer((req, res) => {
  if(req.url != '/favicon.ico') {
    console.log(req.url);
    const url = 'https://api.tfl.gov.uk/StopPoint' + req.url + '/Arrivals';
    var resp = request('GET', url);
    var response = JSON.parse(resp.getBody());

    var output = ' ';
    response.sort(sortBy('timeToStation'));
    response.forEach(function(bus) {
      var time = bus.timeToStation;
      var minutes = Math.floor(time / 60);
      var seconds = time - minutes * 60;
      output += minutes + ',';
    });
    output = output.slice(0, -1);
    output = output.trim();

    if(output === '') {
      output = 'no buses';
    } else {
      output = response[0].lineName + ' in ' + output;
    }
    res.statusCode = resp.statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end('{"frames": [{"text": "' + output + '","icon": "i996"}]}');
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

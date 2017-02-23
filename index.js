'use strict';

const http = require('http');
const request = require('request');
const sortBy = require('sort-by');

const hostname = '0.0.0.0';
const port = 3000;

const server = http.createServer((req, res) => {
  if(req.url != '/favicon.ico') {
    console.log(req.url);
    const url = 'https://api.tfl.gov.uk/StopPoint' + req.url + '/Arrivals';
    request(url, (err, response, body) => {
      const json = JSON.parse(body);
      let output = ' ';
      json.sort(sortBy('timeToStation'));
      json.forEach(function(bus) {
        const time = bus.timeToStation;
        const minutes = Math.floor(time / 60);
        const seconds = time - minutes * 60;
        output += minutes + ',';
      });
      output = output.slice(0, -1);
      output = output.trim();

      if(output === '') {
        output = 'no buses';
      } else {
        output = json[0].lineName + ' in ' + output;
      }
      res.statusCode = response.statusCode;
      res.setHeader('Content-Type', 'application/json');
      res.end('{"frames": [{"text": "' + output + '","icon": "i996"}]}');
    });
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

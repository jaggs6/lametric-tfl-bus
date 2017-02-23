'use strict';

const http = require('http');
const request = require('request');
const _ = require('underscore');

const hostname = '0.0.0.0';
const port = 3000;

const server = http.createServer((req, res) => {
  if(req.url != '/favicon.ico') {
    console.log(req.url);
    const url = 'https://api.tfl.gov.uk/StopPoint' + req.url + '/Arrivals';
    request(url, (err, response, body) => {
      let json = JSON.parse(body);
      let output = ' ';
      json = _.sortBy(json, 'timeToStation');
      const max = _.max(json, function(bus){ return bus.timeToStation; });
      let goalFrames = '';
      json.forEach(function(bus) {
        const time = bus.timeToStation;
        const minutes = Math.floor(time / 60);
        const goalFrame = ',{"goalData":{"start":0,"current":'+minutes+',"end":'+Math.floor(max.timeToStation / 60)+',"unit":"mins"},"icon":null}';
        goalFrames = goalFrames + goalFrame;
      });

      if(goalFrames === '') {
        output = 'no buses';
      } else {
        output = json[0].lineName + ' towards ' + json[0].towards;
      }
      const firstFrame = '{"text":"'+output+'","icon":"i996"}';

      const finalFrame = '{"frames":[' + firstFrame + goalFrames + ']}';

      res.statusCode = response.statusCode;
      res.setHeader('Content-Type', 'application/json');
      res.end(finalFrame);
    });
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

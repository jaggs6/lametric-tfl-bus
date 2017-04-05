'use strict';

const express = require('express');
const request = require('request');
const _ = require('underscore');

var app = express();
app.get('/', function(req, res) {
  console.log(req.headers);
  const url = 'https://api.tfl.gov.uk/StopPoint/' + req.query.stop_id + '/Arrivals';
  request(url, (err, response, body) => {
    let json = JSON.parse(body);
    let output = ' ';
    json = _.sortBy(json, 'timeToStation');
    const max = _.max(json, function(bus){ return bus.timeToStation; });
    let goalFrames = '';
    json.forEach(function(bus) {
      const time = bus.timeToStation;
      const minutes = Math.floor(time / 60);
      const goalFrame = ',{"goalData":{"start":0,"current":' + minutes + ',"end":' + Math.floor(max.timeToStation / 60) + ',"unit":" mins"},"icon":null}';
      goalFrames = goalFrames + goalFrame;
    });

    if(goalFrames === '') {
      output = 'no bus';
    } else {
      output = json[0].lineName + ' -> ' + json[0].towards + ' - ' + json.length + ' buses';
    }
    const firstFrame = '{"text":"' + output + '","icon":"i996"}';

    const finalFrame = '{"frames":[' + firstFrame + goalFrames + ']}';

    res.send(finalFrame);
  });
});
app.listen(process.env.PORT || 8080);
console.log(`Listening on port ${process.env.PORT || 8080}...`);

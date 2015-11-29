var request = require('request');
var moment = require('moment');
var APP_ID = '';
var SUBDOMAIN = '';

exports.handler = function(event, context) {
  
	record = {
		'DeviceID': { value: event.device },
		'SensorType': { value: event.sensor },
		'Datetime': { value: event.timestamp },
		'Value': { value: event.value }
	};

	request({
		method: 'POST',
		url: "https://" + SUBDOMAIN + ".cybozu.com/k/v1/record.json",
		headers: {
			'X-Cybozu-Authorization': '',
			'Authorization': 'Basic ',
			'Content-Type': 'application/json'
		},
		json: {
			'app': APP_ID,
			'record': record
        }
	}, function(err, response, body) {
		if (err) {
			console.log("err : " + err);
			context.fail('Error');
		}else{
			context.succeed();
		}
	});
};

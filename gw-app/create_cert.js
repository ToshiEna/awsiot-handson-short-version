/*
  create_cert.js
  Create certificate file from CSR
*/

var AWS = require('aws-sdk');
var async = require('async');
var fs  = require('fs');
var csv = require('ya-csv');
var csr_buffer = fs.readFileSync('./certs/cert.csr');
var csr_str = csr_buffer.toString();

var user_list_reader = csv.createCsvFileReader('user-list.csv', {
    columnsFromHeader: false
});

user_list_reader.on('data', function(record) {
    if(record[1].match(/dev/)){
        async.waterfall([
			function create_cert(){
				AWS.config.region = "ap-northeast-1";
				AWS.config.update({
					accessKeyId: record[2], secretAccessKey: record[3], region: 'ap-northeast-1'
				});
				var iot = new AWS.Iot();
				//console.log("CSR String:" + csr_str);
				var params = {
					certificateSigningRequest: csr_str,
					setAsActive: true
				};
				iot.createCertificateFromCsr(params, function(err, data) {
					if (err) {
						console.log(err, err.stack);
					} else {
						console.log(data);
						fs.writeFile('./certs/' +record[1]+ '.pem', data.certificatePem);
					}
				});
			}
		], function (err) {
		});
	}
}).on('end', function() {
    console.log('End');
});

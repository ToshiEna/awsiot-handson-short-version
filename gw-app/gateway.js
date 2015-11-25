var noble = require('noble');
var awsIot = require('aws-iot-device-sdk');
var moment = require('moment');

var deviceName;
var myAddress;
var serviceUuid = 'c2ee00014db32c5da177548b04009ae2';
var characteristicUuid = 'c2ee00024db32c5da177548b04009ae2';

if (process.argv.length < 3) {
    console.log('missing argument.');
    process.exit();
} else {
	deviceName = process.argv[2];
	myAddress = process.argv[3];
}
var topic = deviceName + '/ginga';

var device = awsIot.device({
    keyPath: './certs/private.pem',
    certPath: './certs/' + deviceName + '.pem',
    caPath: './certs/root.pem',
    clientId: deviceName,
    region: 'ap-northeast-1'
});

function publish_data(sensorType, value) {
     var record = {
        "device": deviceName,
        "sensor": sensorType,
        "timestamp": moment().toISOString(),
        "value": value
      };
	  var message = JSON.stringify(record);
      console.log("Publish[" + topic + "]" + message);
      device.publish(topic, message);
}

function temp(data){
  var v1 = parseInt(data[0]);
  var v2 = parseInt(data[1]) / 100;
  publish_data('temp',v1 + v2);
}

function humid(data){
  var v1 = parseInt(data[2]);
  var v2 = parseInt(data[3]) / 100;
  publish_data('humid',v1 + v2);
}

noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    console.log('scanning...');
    noble.startScanning([serviceUuid], false);
  }
  else {
    noble.stopScanning();
  }
})

var gService = null;
var gCharacteristic = null;

noble.on('discover', function(peripheral) {
  noble.stopScanning();
  console.log('address : ' + peripheral.address);
  if(myAddress == peripheral.address) {
  console.log('found peripheral:', peripheral.advertisement);
  peripheral.connect(function(err) {
    peripheral.discoverServices([serviceUuid], function(err, services) {
      services.forEach(function(service) {
        console.log('found service:', service.uuid);
        service.discoverCharacteristics([], function(err, characteristics) {
          characteristics.forEach(function(characteristic) {
            console.log('found characteristic:', characteristic.uuid);
            if (characteristicUuid == characteristic.uuid) {
              gCharacteristic = characteristic;
            }
          })
          if (gCharacteristic) {
            exec();
          }
          else {
            console.log('missing characteristics');
          }
        })
      })
    })
  })
  }
})

function exec() {
  gCharacteristic.notify(true, function(err) {
	gCharacteristic.on('read', function(data, isNotification) {
	  //console.log('Read data: ');
	  //console.log(data);
	  humid(data);
	  temp(data);
	});
  });
}

device
  .on('connect', function() {
    console.log('Connected to Message Broker.');
  });

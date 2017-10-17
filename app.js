var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var fs = require('fs');
var jade = require('jade');


//read the JSON file
var data = fs.readFileSync('db.json');
var device = JSON.parse(data);
console.log(device);
var app = express();


//allows us to parse parameters in json
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


// use ejs as the view engine
//app.set('views', __dirname + 'views');
app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.static(path.resolve(__dirname, "../public")));


//using body parse
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());



//URL set to temp
app.get('/', function (req, res) {
    res.redirect('/temp');
});


//JSON is assigned an URL
app.get('/temp', function (req, res) {
    id_array = [];
    device_temperature = [];
    for (var i = 0; i < device.length; i++) {
        device_temperature.push(device[i].temperature);
        id_array.push(device[i].device_id);
    }
    //this is the. local print statement
    res.render("index", [{device_temperature: device_temperature}, {id_array: id_array}]);
});

//http://localhost:5000/temp
//This is where it will post to TEMP
app.post('/temp', function (req, res) {
    if (!req.body.device_id || !req.body.temperature) {
        res.status(400).send("This is the original settings");
        return;
    }
    // Retrieve the Post parameters to device data.
    device_data = {
        "device_id": req.body.device_id,
        "timestamp": Math.floor(Date.now() / 1000),
        "temperature": req.body.temperature
    };

    //device to the array
    device.push(device_data);
    // Stringify the data to rewrite the json file with the added data.
    str_add_dat = JSON.stringify(device);
    // Write data back to the JSON file
    fs.writeFile('db.json', str_add_data);
    //message for successful execution
    res.send(console.log("added"));
    // load the new data to temp
    res.redirect('/temp');
});

// Retrieves the most recent from device
//http://www.localhost.com:5000/temp/latest
app.get('/temp/latest', function (req, res) {
    highest = 0;
    for (var i = 0; i < device.length; i++) {
        if (device[i].timestamp > highest) {
            highest = device[i].timestamp;
            value = device[i];
        }
    }
    res.send(value);
});
//http://localhost.com:5000/highest
// Retrieves the most recent from device
app.get('/temp/highest', function (req, res) {
    highest = 0;
    for (var i = 0; i < device.length; i++) {
        if (device[i].temperature > highest) {
            highest = device[i].temperature;
            sensor = device[i];
        }
    }

    res.send(sensor);

});

//This will display the lowest temp
app.get('/temp/lowest', function (req, res) {
    highest = 1000;
    for (var i = 0; i < device.length; i++) {
        if (device[i].temperature < highest) {
            highest = device[i].temperature;
            sensor = device[i];
        }
    }

    res.send(sensor);

});

//This will average out the device temps
app.get('/temp/average', function (req, res) {
    total = 0;
    for (var i = 0; i < device.length; i++) {
        total += device[i].temperature;
    }
    average_temperature = total / device.length;
    res.send({average_temperature});

});
//device_id
app.get('/temp/:device_id', function (req, res, next) {
    sensor = [];
    for (var i = 0; i < device.length; i++) {
        if (device[i].device_id === req.params.device_id) {

            sensor.push({temperature: device[i].temperature, timestamp: device[i].timestamp});

        }

    }

    if (sensor.length === 0) {
        next();
        return;
    }

    res.send(sensor);
});


//latest from {device_id}
app.get('/temp/:device_id/latest', function (req, res, next) {
    sensor = [];
    for (var i = device.length - 1; i > 0; i--) {

        if (device[i].device_id === req.params.device_id) {
            sensor.push({temperature: device[i].temperature, timestamp: device[i].timestamp});
            break;

        }

    }
    if (sensor.length === 0) {
        next();
        return;
    }

    res.send(sensor);
});
//Highest from {device_id}
app.get('/temp/:device_id/highest', function (req, res, next) {
    sensor = [];
    for (var i = 0; i < device.length; i++) {
        if (device[i].device_id === req.params.device_id) {
            sensor.push({temperature: device[i].temperature, timestamp: device[i].timestamp})

        }

    }

    if (sensor.length === 0) {
        next();
        return;
    }
    device_max_temp = Math.max.apply(Math, sensor.map(function (x) {
        return x.temperature;
    }));
    for (var i = 0; i < sensor.length; i++) {
        if (sensor[i].temperature === device_max_temp) {
            res.send(sensor[i]);
        }
    }

    res.end("Error");
});

app.get('/temp/:device_id/lowest', function (req, res, next) {
    sensor = [];
    for (var i = 0; i < device.length; i++) {
        if (device[i].device_id === req.params.device_id) {
            sensor.push({temperature: device[i].temperature, timestamp: device[i].timestamp})

        }

    }

    if (sensor.length === 0) {
        next();
        return;
    }
    device_min_temp = Math.min.apply(Math, sensor.map(function (x) {
        return x.temperature;
    }));
    for (var i = 0; i < sensor.length; i++) {
        if (sensor[i].temperature === device_min_temp) {
            res.send(sensor[i]);
        }
    }

    res.end("Error");
});

app.get('/temp/:device_id/average', function (req, res, next) {
    sensor = [];
    total= 0;
    count = 0;
    for (var i = 0; i < device.length; i++) {
        if (device[i].device_id === req.params.device_id) {
            sensor.push({temperature: device[i].temperature});

        }

    }

    if (sensor.length === 0) {
        next();
        return;
    }
    if (sensor.length !== 0) {
    for (var i = 0; i < sensor.length; i++) {
        total = total + sensor[i].temperature;
        count = count + 1;
    }

}


    avgerage_temperature = total / count;
    res.send({avgerage_temperature});
});



//404 route
app.get('*', function (req, res) {
    res.status(404).send('ERROR 404 PAGE NOT FOUND' );
});
//Sever is started
module.exports = app;
app.listen(5000, 'localhost');
console.log("The app is running on Port: 5000....");

























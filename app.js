let express = require('express');
let bodyParser = require('body-parser');
let path = require('path');
let fs = require('fs');
let jade = require('jade');




//read the JSON file
let data = fs.readFileSync('server.json');
let device = JSON.parse(data);
console.log(device);
let app = express();

console.log('Hello Mr. Ben Barbour  this Program is written by Chris Sowden, Chris Snyder, Cameron');
console.log("Server running at http://localhost:3000/");


//allows us to parse parameters in json
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


// use jade as the view engine
//app.set('views', __dirname + 'views');
app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.static(path.resolve(__dirname, "../public")));


//using body parse
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());



//URL set to temp
app.get('/', function (request, response) {
    response.redirect('/temp');
});


//JSON is assigned an URL
app.get('/temp', function (req, res) {
    id_array = [];
    device_temperature = [];
    for (let i = 0; i < device.length; i++) {
        device_temperature.push(device[i].temperature);
        id_array.push(device[i].device_id);
    }
    device_data = {
        "device_id": (Math.floor(Math.random() * 20) + 1).toString(),
        "timestamp": Math.floor(Date.now() / 1000),
        "temperature": Math.floor(Math.random()*100)+32
    };
    device.push(device_data);

    let str_add_data = JSON.stringify(device,null,2);
    fs.writeFile('server.json', str_add_data);

    res.send(device);
});


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


    res.redirect('/temp');
});

// Retrieves the most recent from device
app.get('/temp/latest', function (request, response) {
    highest = 0;
    for (let i = 0; i < device.length; i++) {
        if (device[i].timestamp > highest) {
            highest = device[i].timestamp;
            value = device[i];
        }
    }
    response.send(value);
});

// Retrieves the most recent from device
app.get('/temp/highest', function (request, response) {
    highest = 0;
    for (let i = 0; i < device.length; i++) {
        if (device[i].temperature > highest) {
            highest = device[i].temperature;
            sensor = device[i];
        }
    }

    response.send(sensor);

});

//This will display the lowest temp
app.get('/temp/lowest', function (request, response) {
    highest = 1000;
    for (let i = 0; i < device.length; i++) {
        if (device[i].temperature < highest) {
            highest = device[i].temperature;
            sensor = device[i];
        }
    }

    response.send(sensor);

});

//This will display average temperature
app.get('/temp/average', function (request, response) {
    total = 0;
    for (let i = 0; i < device.length; i++) {
        total += device[i].temperature;
    }
    average_temperature = total / device.length;
    response.send({average_temperature});

});
//will display temperature of any given {device_id}
app.get('/temp/:device_id', function (request, response, next) {
    sensor = [];
    for (let i = 0; i < device.length; i++) {
        if (device[i].device_id === request.params.device_id) {

            sensor.push({temperature: device[i].temperature, timestamp: device[i].timestamp});

        }

    }

    if (sensor.length === 0) {
        next();
        return;
    }

    response.send(sensor);
});


//latest temperature from {device_id}
app.get('/temp/:device_id/latest', function (request, response, next) {
    sensor = [];
    for (let i = device.length - 1; i > 0; i--) {

        if (device[i].device_id === request.params.device_id) {
            sensor.push({temperature: device[i].temperature, timestamp: device[i].timestamp});
            break;

        }

    }
    if (sensor.length === 0) {
        next();
        return;
    }

    response.send(sensor);
});
//Highest temperature from {device_id}
app.get('/temp/:device_id/highest', function (request, response, next) {
    sensor = [];
    for (let i = 0; i < device.length; i++) {
        if (device[i].device_id === request.params.device_id) {
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
    for (let i = 0; i < sensor.length; i++) {
        if (sensor[i].temperature === device_max_temp) {
            response.send(sensor[i]);
        }
    }

    response.end("Error");
});
//lowest temperature from {device_id}
app.get('/temp/:device_id/lowest', function (request, response, next) {
    sensor = [];
    for (let i = 0; i < device.length; i++) {
        if (device[i].device_id === request.params.device_id) {
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
    for (let i = 0; i < sensor.length; i++) {
        if (sensor[i].temperature === device_min_temp) {
            response.send(sensor[i]);
        }
    }

    response.end("Error");
});
//Average temperature from {device_id}
app.get('/temp/:device_id/average', function (request, response, next) {
    sensor = [];
    total= 0;
    count = 0;
    for (let i = 0; i < device.length; i++) {
        if (device[i].device_id === request.params.device_id) {
            sensor.push({temperature: device[i].temperature});

        }

    }

    if (sensor.length === 0) {
        next();
        return;
    }
    if (sensor.length !== 0) {
        for (let i = 0; i < sensor.length; i++) {
            total = total + sensor[i].temperature;
            count = count + 1;
        }

    }


    avgerage_temperature = total / count;
    response.send({avgerage_temperature});
});



//404 route
app.get('*', function (request, response) {
    response.status(404).send('ERROR 404 PAGE NOT FOUND' );
});
//Sever is started
module.exports = app;
app.listen(3000, 'localhost');






















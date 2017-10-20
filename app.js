let express = require('express');
let bodyParser = require('body-parser');
let path = require('path');
let fs = require('fs');
let jade = require('jade');
let app = express();



//read the JSON file
let data = fs.readFileSync('server.json');
let device = JSON.parse(data);

//Console logs
console.log(device);
console.log('Hello Mr. Ben Barbour  this Program is written by Chris Sowden, Chris Snyder, Cameron');
console.log("Server running at http://localhost:3000/");


//allows us to parse parameters in json
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


// use jade as the view engine
app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'jade');



//using body parse
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(path.resolve(__dirname, "../public")));

//Sever is started
module.exports = app;
app.listen(3000, 'localhost');


//Routes to function calls
app.get('/', setup);
app.get('/temp', sendData);
app.post('/temp', postToJson);
app.get('/temp/latest',latest);
app.get('/temp/highest', high);
app.get('/temp/lowest', low);
app.get('/temp/average', avg);
app.get('/temp/:device_id', deviceID);
app.get('/temp/:device_id/latest', id_latest);
app.get('/temp/:device_id/highest', id_highest);
app.get('/temp/:device_id/lowest', id_lowest);
app.get('/temp/:device_id/average', id_average);
app.get('*', error_message);


setTimeout(Timer,2000);


//function URL set to temp
function setup (request, response) {
    response.redirect('/temp');
}


// function to send data to local server
function sendData (req, res) {
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

}

// Auto timer function

function Timer(){
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

    let new_data = JSON.stringify(device_data,null,2);
    console.log("Success: "+new_data);
    setTimeout(Timer,4000);
}

//This is where it will post to TEMP
 function postToJson (req, res) {
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

}



// Retrieves the most recent from device
 function latest (request, response) {
    highest = 0;
    for (let i = 0; i < device.length; i++) {
        if (device[i].timestamp > highest) {
            highest = device[i].timestamp;
            value = device[i];
        }
    }
    response.send(value);
}

// Retrieves the most recent from device
 function high(request, response) {
    highest = 0;
    for (let i = 0; i < device.length; i++) {
        if (device[i].temperature > highest) {
            highest = device[i].temperature;
            sensor = device[i];
        }
    }

    response.send(sensor);

}

//This will display the lowest temp
function low (request, response) {
    highest = 1000;
    for (let i = 0; i < device.length; i++) {
        if (device[i].temperature < highest) {
            highest = device[i].temperature;
            sensor = device[i];
        }
    }

    response.send(sensor);

}

//This will display average temperature
function avg(request, response) {
    total = 0;
    for (let i = 0; i < device.length; i++) {
        total += device[i].temperature;
    }
    average_temperature = total / device.length;
    response.send({average_temperature});
}

//will display temperature of any given {device_id}
 function deviceID (request, response, next) {
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
}


//latest temperature from {device_id}
function id_latest (request, response, next) {
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
}


//Highest temperature from {device_id}
function id_highest (request, response, next) {
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
}
//lowest temperature from {device_id}
 function id_lowest (request, response, next) {
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
}
//Average temperature from {device_id}
function id_average (request, response, next) {
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
}



//404 route
function error_message (request, response) {
    response.status(404).send('ERROR 404 PAGE NOT FOUND' );
}























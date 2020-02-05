

var createError = require('http-errors');
var express = require('express');
var bodyParser = require('body-parser')
var path = require('path');
var fs = require('fs')
var cors = require('cors')
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var rfs = require('rotating-file-stream')
var logger = require('./logger.js')
var helmet = require('helmet')  //for security HTTP headers
const rateLimit = require("express-rate-limit"); //to  restrict number of call

const swaggerJsdoc = require('swagger-jsdoc');

const { exec } = require("child_process");
const storage = require('node-persist');

//const util = require('util');
//const exec = util.promisify(require('child_process').exec);





// wss.on('connection', ws => {
//     ws.on('message', message => {
//         console.log('Received message',message)
//         //setTimeout(function () {
//         //    console.log('sending.....')
//         //    ws.send(message)
//         //}, 6000) 

//     })

// })






/**
 * Routing start here
 */
//var indexRouter = require('./routes/start');
var usersRouter = require('./routes/users');
var apiDocsRouter = require('./routes/apidocs');

/**
 * Routing ends here
 */

var app = express();
var logDirectory = path.join(__dirname, 'logs')
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');




/**
 * Morgan Logging Start Here 
 */

// log only 4xx and 5xx responses to console
app.use(morgan('dev', {
    skip: function (req, res) { return res.statusCode < 400 }
}))
// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)
// create a rotating write stream
var accessLogStream = rfs.createStream('access.log', {
    interval: '1d', // rotate daily
    path: logDirectory
})
// setup the logger
app.use(morgan('combined', { stream: accessLogStream }))

/**
 * Morgan Logging Ends Here 
 */


//For securing http headers
app.use(helmet())

// parse application/json
app.use(bodyParser.json())
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

app.use(cors())


app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


app.post('/start', async (request, response) => {
    await storage.init();
    //console.log(request.body);
    //let URL =  'rtsp://' + request.body.username + ":" + request.body.password + '@172.20.0.173:554/1/stream1/Profile1';

    let URL = "rtsp://ADMIN:1234@172.20.1.55:554/Profile/a41c25c5-351f-4a9a-8936-b70f31e160c8";

    let value = await storage.getItem('cameraInfo6' + URL);


    if (value === value) {
        await storage.setItem('cameraInfo6' + URL, JSON.stringify(request.body.url));



        let command = `${path.resolve('cpp/VLC_Wrapper.exe')} -c ${URL} ${path.resolve('../html/dist/stream/mystream.m3u8')}  ${path.resolve('../html/dist/stream/mystream-########.ts')}  http://localhost/stream/mystream-########.ts`;

        console.log('coman', command);

        const child = exec(command, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr.statusCode}`);

                return;
            }
            console.log(`stdout: ${stdout}`);
            ///response.write("ok");
            /// response.end();
        });


        child.stdout.on('data', function (data) {
            console.log('data', data)

        });
        child.stdout.write("MSG stdout Start");

        child.on('close', function (code) {
            console.log('code', code)
        });

        response.write(''); //'{"process":' + request.body.ip + ', "status":"initiated"}'
        response.end();

    } else {
        response.send('{"process":' + request.body.url + ', "status":"started"}');

    }

    ///console.log(child);

})





//To restrict API number of calls
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutes
    max: 50000, // limit each IP to 500 requests per windowMs
    message:
        "Too many request. Please try after one minutes"
});
app.use(limiter);



app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



//app.use('/start', indexRouter);
app.use('/users', usersRouter);
app.use('/apidocs', apiDocsRouter);

//app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});




app.get('/', function (req, res, next) {
    res.sendFile(__dirname + '/index.html');
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;

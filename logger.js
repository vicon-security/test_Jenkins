const { createLogger, format, transports } = require('winston');
const { label, combine, colorize, timestamp, prettyPrint } = format;

const logger = createLogger({
    format: combine(
        colorize(),
        timestamp(),
        prettyPrint(),

    ),

    transports: [
        new transports.Console(),
        new transports.File({ filename: './logs/error.log', level: 'error' }),
        new transports.File({ filename: './logs/info.log', level: 'info' }),
        new transports.File({ filename: './logs/debug.log', level: 'debug' }),
    ],
    exitOnError: false,
});


module.exports = logger;
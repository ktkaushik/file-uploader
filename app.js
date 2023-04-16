const isProduction = (process.env.NODE_ENV === 'production')
// const isProduction = true
const isStaging    = (process.env.NODE_ENV === 'staging')

const express      = require('express')
const path         = require('path')
const cookieParser = require('cookie-parser')
const logger       = require('morgan')
const mongoose     = require('mongoose')
const hbs          = require('express-hbs')
const handlebars   = require('handlebars')
const config       = require('./config')()
const secret       = require('./config/secret')
const flash        = require('connect-flash')
const session      = require('express-session')
const MongoStore   = require('connect-mongo')(session)
const app          = express()
const cors         = require("cors")
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')

const Honeybadger = require('honeybadger').configure({
    apiKey: secret.honeybadger.token
})

app.use(Honeybadger.requestHandler); // Use *before* all other app middleware.

app.disable('x-powered-by');

// view engine setup
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', hbs.express4({  
    handlebars: allowInsecurePrototypeAccess(handlebars),
    defaultLayout: __dirname + '/views/layouts/__layout.hbs',
    layoutsDir   : __dirname + '/views/layouts',
    partialsDir  : __dirname + '/views/partials'
}));

app.use(cors())

app.use(logger('dev'));

app.use(express.json());
app.use(express.urlencoded({limit: '20mb', extended: true }));
app.use(cookieParser());

mongoose.connect(config.mongodb.uri, config.mongodb.options);

app.use(session({
        secret: '1236876781346812736jkodghfjklahsdf',
        name: 'orangatun-and-a-chimpanzee',
        maxAge: new Date(Date.now() + (3600000 * 24 * 30 * 12)), // one year
        proxy: true,
        resave: true,
        saveUninitialized: true,
        store: new MongoStore({
            mongooseConnection: mongoose.connection
        }, function(err) {
            console.log(err || 'connect-mongodb setup ok');
        })
    })
);
app.use(express.static(path.join(__dirname, 'public')));

app.use(flash())

app.use(Honeybadger.errorHandler);  // Use *after* all other app middleware.

require('./middlewares/models')()
require('./middlewares/routes')(app)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    return res.status(404).json({page_found: false})
})

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    // render the error page
    res.status(err.status || 500)
    res.json({message: err.message, internal_server_error: true})
});

module.exports = app;
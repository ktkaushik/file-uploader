
const express      = require('express')
const path         = require('path')
const cookieParser = require('cookie-parser')
const logger       = require('morgan')
const hbs          = require('express-hbs')
const handlebars   = require('handlebars')
const secret       = require('./config/secret')
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

app.use(express.static(path.join(__dirname, 'public')));

app.use(Honeybadger.errorHandler);  // Use *after* all other app middleware.

require('./middlewares/models')()
require('./middlewares/routes')(app)
require('./middlewares/jobs')

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    return res.status(404).json({page_found: false})
})

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    console.error(err)
    // render the error page
    res.status(err.status || 500)
    res.json({message: err.message, internal_server_error: true})
});

module.exports = app;
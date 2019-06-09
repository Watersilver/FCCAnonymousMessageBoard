'use strict';

var express     = require('express');
var bodyParser  = require('body-parser');
var expect      = require('chai').expect;
var cors        = require('cors');
const mongodb = require("mongodb").MongoClient;
const helmet = require("helmet");

var apiRoutes         = require('./routes/api.js');
var fccTestingRoutes  = require('./routes/fcctesting.js');
var runner            = require('./test-runner');

var app = express();

// Security features
app.use(helmet.dnsPrefetchControl());
app.use(helmet.referrerPolicy({ policy: 'same-origin' }));
// app.use(helmet.frameguard({ action: 'sameorigin' }));

mongodb.connect(process.env.DB, { useNewUrlParser: true })
  .then(client => {
    const db = client.db();
    // db.dropDatabase();
    db.dropCollection("testboard").catch(err => console.error("Collection doesn't exist."))

    app.use('/public', express.static(process.cwd() + '/public'));

    app.use(cors({origin: '*'})); //For FCC testing purposes only

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    //Sample front-end
    app.route('/b/:board/')
      .get(function (req, res) {
        res.sendFile(process.cwd() + '/views/board.html');
      });
    app.route('/b/:board/:threadid')
      .get(function (req, res) {
        res.sendFile(process.cwd() + '/views/thread.html');
      });

    //Index page (static HTML)
    app.route('/')
      .get(function (req, res) {
        res.sendFile(process.cwd() + '/views/index.html');
      });

    //For FCC testing purposes
    fccTestingRoutes(app);

    //Routing for API 
    apiRoutes(app, db);

    //Sample Front-end


    //404 Not Found Middleware
    app.use(function(req, res, next) {
      res.status(404)
        .type('text')
        .send('Not Found');
    });

    //Start our server and tests!
    app.listen(process.env.PORT || 3000, function () {
      console.log("Listening on port " + process.env.PORT);
      if(process.env.NODE_ENV==='test') {
        console.log('Running Tests...');
        setTimeout(function () {
          try {
            runner.run();
          } catch(e) {
            var error = e;
              console.log('Tests are not valid:');
              console.log(error);
          }
        }, 1500);
      }
    });


  })
  .catch(error => {
    console.error(error);
  })

module.exports = app; //for testing

var config = require('./config').release;
var app = require('./app');
var mongoose = require('mongoose');

mongoose.connect(config.db, function() {
   console.log('Connected to '+config.db)
});

app.listen(config.port, config.host, function() {
   console.log("REST API server listening on port " + config.port);
});

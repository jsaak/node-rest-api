var express = require('express');
var app = express();

app.get('/', function(req, res) {
   res.type('text/plain'); // set content-type
   res.send('i am a beautiful butterfly'); // send text response
});

module.exports = app

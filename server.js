var app = require('./app');
var port = 3000;
var host = 'localhost';

app.listen(port, host, function() {
   console.log("REST API server listening on port " + port);
});

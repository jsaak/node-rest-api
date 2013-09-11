var express = require('express');
var mongoose = require('mongoose');
var Book = require('./book');
var app = express();

app.configure(function () {
     app.use(express.bodyParser())
     app.use(app.router)
});

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
   //select all
   app.get('/book', function(req, res) {
      var q = Book.find().sort('isbn').limit(req.query.limit).skip(req.query.skip);
      q.execFind(function(err, doc) {
         res.json(doc);
      });
   });

   //select one
   app.get('/book/:isbn', function(req, res) {
      Book.findOne({ isbn: req.params.isbn}, function (err, doc){
         if (err) {
            res.json({error: 'book not found'});
         } else {
            res.json(doc);
         }
      });
   });

   //insert
   app.post('/book', function(req, res) {
      var newbook = new Book(req.body);
      newbook.save(function(err) {
         if (err) {
            res.send(422,'insert failed');
         } else {
            res.json(newbook);
         }
      })
   });

   //update
   app.put('/book/:isbn', function(req, res) {
      Book.findOne({isbn: req.params.isbn}, function (err, book){
         if (err) {
            res.send(422,'update failed');
         } else {
            if (req.body.isbn !== undefined) {
               //isbn change is not allowed
               res.send(422,'update failed');
            } else {
               //TODO find something so i do not have to enum all fields
               if (req.body.title !== undefined) {book.title = req.body.title;}
               if (req.body.author !== undefined) {book.author = req.body.author;}
               if (req.body.cover !== undefined) {book.cover = req.body.cover;}

               book.save(function(err){
                  if (err) {
                     res.send(422,'update failed');
                  } else {
                     res.json(book);
                  }
               });
            }
         }
      });
   });

   //delete
   app.del('/book/:isbn', function(req, res) {
      Book.findOne({isbn: req.params.isbn}, function (err, book){
         if ((err) || (!book)) {
            res.send(422,'delete failed');
         } else {
            book.remove(function(err){
               if (err) {
                  res.send(422,'delete failed');
               } else {
                  res.send(200,'OK');
               }
            })
         }
      });
   });
});

module.exports = app

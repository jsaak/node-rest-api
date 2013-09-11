var request = require('supertest');
var assert = require('better-assert');
var mongoose = require('mongoose');
var async = require('async');

var config = require('./config').test;
var app = require('./app');
var Book = require('./book');

var db;

var insert_30_books = function(done,callback) {
   //remove all books
   Book.remove({}, function(err) { 
      if (err) return done(err);

      //insert 30 books and wait for save()
      var calls = [];

      for (var i = 1; i < 31; i++) {
         (function(i) {
            calls.push(function(callback) {
               var b = new Book({isbn: ''+i, title: 't'+i, author: 'a'+i});
               b.save(function(err){
                  if (err) {return callback(err)}
                  callback(null,i);
               });
            })
         })(i);
      }

      async.parallel(calls, function(err, result) {
         if (err) {
            done(err);
         } else {
            callback();
         }
      })
   })
};

describe('Sample REST API', function() {
   var book1 = {isbn: '978-0-19-923276-5',
                title: 'War and Piece',
               author: 'Leo Tolstoy',
                cover: 'http://blog.oup.com/wp-content/uploads/2010/09/War-and-Peace.jpg'};

   var book2 = {isbn: '123-123-123',
                title: 'Crime and Punishment',
               author: 'Fyodor Dostoyevsky'};

   var book3 = {isbn: '456-456-456',
                title: 'The Master and Margarita',
               author: 'Mikhail Bulgakov'};

   before(function (done) {
      mongoose.connect(config.db, function() {
         console.log('Connected to '+config.db)
         done();
      })
   });

   beforeEach(function(done){
      var db = mongoose.connection;

      Book.remove({}, function(err) { 
         if (err) return done(err);

         var b1 = new Book(book1);
         var b2 = new Book(book2);
         b1.save(function(err){
            b2.save(function(err) {
               done();
            })
         })
      })
   })
             
   it('should return 404 when invalid path given', function(done){
      request(app)
      .get("/invalid")
      .send({})
      .expect(404, {}, done)
   })

   it('should return all books', function(done){
      request(app)
      .get("/book")
      .send({})
      .expect(200)
      .end(function(err,res) {
         if (err) {
            done(err);
         } else {
            assert(res.body[1].title == book1.title);
            assert(res.body[1].isbn == book1.isbn);
            assert(res.body[1].author == book1.author);
            assert(res.body[0].isbn == book2.isbn);
            assert(res.body[0].title == book2.title);
            done();
         }
      })
   })

   it('should return one book by ISBN', function(done){
      request(app)
      .get("/book/123-123-123")
      .send({})
      .expect(200)
      .end(function(err,res) {
         if (err) {
            done(err);
         } else {
            assert(res.body.title == book2.title);
            assert(res.body.isbn == book2.isbn);
            assert(res.body.author == book2.author);
            done();
         }
      })
   })

   it('should add new book', function(done) {
      request(app)
      .post("/book")
      .send(book3)
      .expect(200)
      .end(function(err,res) {
         if (err) {
            done(err);
         } else {
            assert(res.body.title == book3.title);
            assert(res.body.isbn == book3.isbn);
            assert(res.body.author == book3.author);
            Book.count(function(err,c) {
               if (err) {
                  done(err);
               } else {
                  assert(c == 3);
               }
            })
            done();
         }
      })
   })

   it('should fail to add new book without mandatory params', function(done) {
      request(app)
      .post("/book")
      .send({isbn: '456-456-456'})
      .expect(422,'insert failed',done)
   })

   it('should fail to add new book when ISBN is used before', function(done) {
      request(app)
      .post("/book")
      .send(book2)
      .expect(422,'insert failed',done)
   })

   it('should fail to add new book when ISBN is not valid (1)', function(done) {
      request(app)
      .post("/book")
      .send({isbn: '-456-456-456',author:'a',title:'t'})
      .expect(422,'insert failed',done)
   })

   it('should fail to add new book when ISBN is not valid (2)', function(done) {
      request(app)
      .post("/book")
      .send({isbn: 'XXX',author:'a',title:'t'})
      .expect(422,'insert failed',done)
   })

   it('should fail to add new book when ISBN is not valid (3)', function(done) {
      request(app)
      .post("/book")
      .send({isbn: '000-000-000',author:'a',title:'t'})
      .expect(422,'insert failed',done)
   })

   it('should fail to add new book when cover url is not valid', function(done) {
      request(app)
      .post("/book")
      .send({isbn: '100-000-000',author:'a',title:'t',cover:'invalid'})
      .expect(422,'insert failed',done)
   })

   it('should update one book', function(done) {
      request(app)
      .put("/book/123-123-123")
      .send({author:'a',title:'t'})
      .expect(200)
      .end(function(err,res) {
         if (err) {
            done(err);
         } else {
            assert(res.body.title == 't');
            assert(res.body.isbn == '123-123-123');
            assert(res.body.author == 'a');
            Book.count(function(err,c) {
               if (err) {
                  done(err);
               } else {
                  assert(c == 2);
               }
            })
            done();
         }
      })
   })

   it('should fail to remove mandatory fields', function(done) {
      request(app)
      .put("/book/123-123-123")
      .send({author:''})
      .expect(422,'update failed',done)
   })

   it('should delete one book', function(done) {
      request(app)
      .del("/book/123-123-123")
      .send()
      .expect(200,'OK')
      .end(function(err,res) {
         if (err) {
            done(err);
         } else {
            Book.count(function(err,c) {
               if (err) {
                  done(err);
               } else {
                  assert(c == 1);
               }
            })
            done();
         }
      })
   })

   it('should fail to remove invalid book', function(done) {
      request(app)
      .del("/book/6548")
      .send()
      .expect(422,'delete failed')
      .end(function(err,res) {
         if (err) {
            done(err);
         } else {
            Book.count(function(err,c) {
               if (err) {
                  done(err);
               } else {
                  assert(c == 2);
               }
            })
            done();
         }
      })
   })

   it('should return first ten books only', function(done) {
      insert_30_books(done,function(){
         request(app)
         .get("/book?limit=10")
         .send()
         .expect(200)
         .end(function(err,res) {
            if (err) {
               done(err);
            } else {
               assert(res.body.length == 10);
               done();
            }
         })
      })
   })

   it('should return last five books only', function(done) {
      insert_30_books(done,function(){
         request(app)
         .get("/book?limit=10&skip=25")
         .send()
         .expect(200)
         .end(function(err,res) {
            if (err) {
               done(err);
            } else {
               assert(res.body.length == 5);
               done();
            }
         })
      })
   })
})

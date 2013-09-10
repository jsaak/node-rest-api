var request = require('supertest');
var assert = require('better-assert');
var app = require('./app');

describe('Sample REST API', function() {
   /*
   var db = new Connection
   , tobi = new User('tobi')
   , loki = new User('loki')
   , jane = new User('jane');
   */

   beforeEach(function (done) {
      //clear and populate database
      /*
      db.clear(function(err){
         if (err) return done(err);
         db.save([tobi, loki, jane], done);
      });
      */
      done();
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
      .expect(200, {book1: 'title1', book2: 'title2'}, done)
   })

   it('should return first ten books only')

   it('should return one book by ISBN')

   it('should add new book')

   it('should fail to add new book without mandatory params')

   it('should update one book')

   it('should delete one book')
})

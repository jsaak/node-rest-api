var mongoose = require('mongoose');

var bookSchema = new mongoose.Schema({
       isbn:   {type: String, trim: true, index: true, required: true, unique: true, match: /^[1-9][0-9-]*$/ },
       author: {type: String, trim: true, required: true},
       title:  {type: String, trim: true, required: true},
       cover:  {type: String, trim: true}
}, {safe: true});

var Book = mongoose.model('book', bookSchema);

module.exports = Book;

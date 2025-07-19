const mongoose = require('mongoose');

// const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String }, // URL to the uploaded image
  createdAt: { type: Date, default: Date.now }
});

// module.exports = mongoose.model('Post', postSchema);

module.exports = mongoose.model('Post', postSchema);
const mongoose = require("mongoose");

const bookSchema = mongoose.Schema({
  userId: { type: String, required: true },
  title: String,
  author: String,
  year: Number,
  genre: String,
  imageUrl: String,
  averageRating: { type: Number, required: true },
  ratings: [
    {
      userId: String,
      grade: Number,
    },
  ],
});

module.exports = mongoose.model("Book", bookSchema);

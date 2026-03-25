const mongoose = require("mongoose");

const bookSchema = mongoose.Schema({
  userId: { type: String, required: true }, // ✅ AJOUT IMPORTANT
  title: String,
  author: String,
  year: Number,
  genre: String,
  imageUrl: String,
  ratings: [
    {
      userId: String,
      grade: Number,
    },
  ],
});

module.exports = mongoose.model("Book", bookSchema);

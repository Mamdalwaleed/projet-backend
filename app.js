const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path"); // ✅ AJOUT

const userRoutes = require("./routes/user");
const bookRoutes = require("./routes/book");

// CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization",
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  );
  next();
});

// Connexion MongoDB
mongoose
  .connect(
    "mongodb+srv://waleed:abcd123@cluster3.4bk297d.mongodb.net/test?retryWrites=true&w=majority",
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch((error) => console.log("Connexion à MongoDB échouée !", error));

// Middlewares
app.use(express.json());

// ✅ AJOUT IMPORTANT (servir les images)
app.use("/images", express.static(path.join(__dirname, "images")));

// Routes
app.use("/api/auth", userRoutes);
app.use("/api/books", bookRoutes);

module.exports = app;

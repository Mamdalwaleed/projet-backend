const express = require("express");
const app = express();
const mongoose = require("mongoose");

const userRoutes = require("./routes/user");

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

mongoose
  .connect(
    "mongodb+srv://waleed:abcd123@cluster3.4bk297d.mongodb.net/test?retryWrites=true&w=majority",
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch((error) => console.log("Connexion à MongoDB échouée !", error));

app.use(express.json());

app.use("/api/auth", userRoutes);
// 🔹 Route correcte

module.exports = app;

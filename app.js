const express = require("express"); //J'importe le framework Express pour créer l'application web.
const app = express(); //  J'initialise une instance d'Express qui servira de base pour mon application.
const mongoose = require("mongoose"); //J'importe Mongoose, une bibliothèque qui facilite la connexion et les interactions avec une base de données MongoDB.
const path = require("path"); //J'importe le module 'path' de Node.js pour gérer les chemins de fichiers et de répertoires.

const userRoutes = require("./routes/user"); //J'importe les routes liées à l'authentification des utilisateurs depuis le fichier 'user.js' situé dans le dossier 'routes'.
const bookRoutes = require("./routes/book"); //J'importe les routes liées à la gestion des livres depuis le fichier 'book.js' situé dans le dossier 'routes'.

// CORS Le CORS permet au frontend de communiquer avec le backend même s'ils sont sur des domaines différents (par exemple, le frontend sur localhost:3000 et le backend sur localhost:5000). En configurant les en-têtes CORS, je permets au frontend d'accéder aux ressources du backend sans rencontrer de problèmes de sécurité liés à la politique de même origine (Same-Origin Policy) des navigateurs.
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

// 🔥 MongoDB
const mongoURI =
  "mongodb+srv://waleed:abcd123@cluster3.4bk297d.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster3";

mongoose
  .connect(mongoURI)
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch((error) => console.log("Connexion à MongoDB échouée !", error));

// Middlewares
app.use(express.json());

// Routes
app.use("/api/auth", userRoutes); // J'utilise les routes d'authentification pour toutes les requêtes commençant par '/api/auth'.
app.use("/api/books", bookRoutes); // J'utilise les routes de gestion des livres pour toutes les requêtes commençant par '/api/books'.
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // J'expose le dossier 'uploads' pour servir les fichiers statiques (images) via l'URL '/uploads'.

module.exports = app; // J'exporte l'application Express pour pouvoir l'utiliser dans d'autres fichiers, notamment dans 'server.js' où le serveur sera démarré.

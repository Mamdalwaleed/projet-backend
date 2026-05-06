const mongoose = require("mongoose"); // J'importe le module 'mongoose' qui est une bibliothèque pour interagir avec une base de données MongoDB. Elle permet de définir des schémas pour les données et de créer des modèles pour manipuler ces données dans la base de données.

const userSchema = mongoose.Schema({
  // Je définis un schéma pour les utilisateurs en utilisant la fonction 'Schema' de Mongoose. Ce schéma décrit la structure des documents dans la collection des utilisateurs de la base de données.
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

module.exports = mongoose.model("User", userSchema); // J'exporte le modèle 'User' créé à partir du schéma 'userSchema' en utilisant la fonction 'model' de Mongoose. Ce modèle représente la collection des utilisateurs dans la base de données MongoDB et permet de créer, lire, mettre à jour et supprimer des utilisateurs dans la base de données.

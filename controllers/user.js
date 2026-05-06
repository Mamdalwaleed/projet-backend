const jwt = require("jsonwebtoken"); // sert à créer un token sécurisé (JWT) et vérifier les tokens d'authentification JWT (JSON Web Tokens). Ces tokens sont utilisés pour sécuriser les routes de l'application en vérifiant l'identité des utilisateurs.
const bcrypt = require("bcrypt"); //sert à chiffrer le mot de passe de l'utilisateur avant de le stocker dans la base de données, et à comparer les mots de passe lors de la connexion.
const User = require("../models/User"); // J'importe le modèle 'User' qui représente la collection des utilisateurs dans la base de données MongoDB. Ce modèle est utilisé pour créer, lire, mettre à jour et supprimer des utilisateurs dans la base de données.

exports.signup = (req, res, next) => {
  // J'exporte une fonction 'signup' qui est utilisée pour gérer l'inscription des utilisateurs. Cette fonction reçoit la requête (req), la réponse (res) et la fonction suivante (next) en tant que paramètres.
  bcrypt
    .hash(req.body.password, 10) // J'utilise la fonction 'hash' de bcrypt pour chiffrer le mot de passe de l'utilisateur. Le deuxième argument (10) représente le nombre de salages (salt rounds) pour renforcer la sécurité du mot de passe.
    .then((hash) => {
      const user = new User({
        email: req.body.email, // J'utilise l'email fourni dans la requête pour créer un nouvel utilisateur.
        password: hash, // J'utilise le mot de passe chiffré (hash) pour créer un nouvel utilisateur.
      });
      user
        .save() // J'enregistre le nouvel utilisateur dans la base de données en utilisant la méthode 'save' du modèle 'User'.
        .then(() => res.status(201).json({ message: "Utilisateur créé !" })) // Si l'utilisateur est créé avec succès, j'envoie une réponse avec le statut 201 (Created) et un message de confirmation.
        .catch((error) => res.status(400).json({ error })); // Si une erreur se produit lors de la création de l'utilisateur, j'envoie une réponse avec le statut 400 (Bad Request) et l'erreur.
    })
    .catch((error) => res.status(500).json({ error })); // Si une erreur se produit lors du chiffrement du mot de passe, j'envoie une réponse avec le statut 500 (Internal Server Error) et l'erreur.
};

exports.login = (req, res, next) => {
  // J'exporte une fonction 'login' qui est utilisée pour gérer la connexion des utilisateurs. Cette fonction reçoit la requête (req), la réponse (res) et la fonction suivante (next) en tant que paramètres.
  console.log("BODY:", req.body); // J'affiche le contenu de la requête dans la console pour vérifier les données envoyées par le client lors de la connexion.
  User.findOne({ email: req.body.email }) // J'utilise la méthode 'findOne' du modèle 'User' pour rechercher un utilisateur dans la base de données qui correspond à l'email fourni dans la requête.
    .then((user) => {
      // Si un utilisateur est trouvé, j'exécute la fonction suivante avec l'utilisateur trouvé en tant que paramètre.
      console.log("USER:", user); // J'affiche l'utilisateur trouvé dans la console pour vérifier que la recherche a réussi et que les données de l'utilisateur sont correctes.
      if (!user) {
        // Si aucun utilisateur n'est trouvé avec l'email fourni, j'envoie une réponse avec le statut 401 (Unauthorized) et un message d'erreur indiquant que la paire login/mot de passe est incorrecte.
        return res
          .status(401)
          .json({ message: "Paire login/mot de passe incorrecte" });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res
              .status(401)
              .json({ message: "Paire login/mot de passe incorrecte" });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", {
              // J'utilise la fonction 'sign' de jsonwebtoken pour créer un token JWT. Le premier argument est le payload (les données que je veux inclure dans le token, ici l'ID de l'utilisateur), le deuxième argument est une clé secrète utilisée pour signer le token (ici "RANDOM_TOKEN_SECRET"), et le troisième argument est un objet d'options où je spécifie la durée de validité du token (ici 24 heures).
              expiresIn: "24h",
            }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

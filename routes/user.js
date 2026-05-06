const express = require("express"); // J'importe le module 'express' qui est un framework pour construire des applications web en Node.js. Il facilite la gestion des routes, des requêtes et des réponses HTTP.
const router = express.Router(); // J'importe le module 'express' et j'utilise la fonction 'Router' pour créer un routeur qui va gérer les routes liées aux utilisateurs (inscription et connexion).
const userCtrl = require("../controllers/user"); // . J'importe également le contrôleur 'userCtrl' qui contient les fonctions de gestion des utilisateurs (inscription et connexion).

router.post("/signup", userCtrl.signup); // Route pour l'inscription des utilisateurs, qui appelle la fonction 'signup' du contrôleur 'userCtrl'.
router.post("/login", userCtrl.login); // Route pour la connexion des utilisateurs, qui appelle la fonction 'login' du contrôleur 'userCtrl'.

module.exports = router; // J'exporte le routeur pour pouvoir l'utiliser dans d'autres parties de l'application, notamment dans 'app.js'.

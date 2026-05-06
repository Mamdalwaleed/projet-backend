const express = require("express"); // J'importe le module 'express' qui est un framework pour construire des applications web en Node.js. Il facilite la gestion des routes, des requêtes et des réponses HTTP.
const router = express.Router(); // Je crée un mini routeur en utilisant la fonction 'Router' d'Express, qui me permettra de définir les routes liées à la gestion des livres.

const auth = require("../middleware/auth"); // J'importe le middleware 'auth' qui est utilisé pour protéger certaines routes en vérifiant que l'utilisateur est authentifié avant de lui permettre d'accéder à ces routes.
const multer = require("../middleware/multer-config"); // J'importe le middleware 'multer' qui est utilisé pour gérer les fichiers téléchargés (images) lors de la création ou de la modification d'un livre. Ce middleware configure Multer pour stocker les fichiers dans un dossier spécifique et pour gérer les noms de fichiers.
const bookCtrl = require("../controllers/book"); // J'importe le contrôleur 'bookCtrl' qui contient les fonctions de gestion des livres (création, lecture, mise à jour, suppression, etc.) que je vais utiliser pour définir les actions associées à chaque route.

// Livres
router.get("/bestrating", bookCtrl.getBestRatedBooks); // Route pour récupérer les livres les mieux notés, qui appelle la fonction 'getBestRatedBooks' du contrôleur 'bookCtrl'.

router.get("/", bookCtrl.getAllBooks); // Route pour récupérer tous les livres, qui appelle la fonction 'getAllBooks' du contrôleur 'bookCtrl'.
router.get("/:id", bookCtrl.getBook); // Route pour récupérer un livre spécifique en fonction de son ID, qui appelle la fonction 'getBook' du contrôleur 'bookCtrl'.
router.post("/", auth, multer, bookCtrl.createBook); // Route pour créer un nouveau livre, qui est protégée par le middleware 'auth' pour vérifier que l'utilisateur est authentifié, utilise le middleware 'multer' pour gérer le téléchargement de l'image du livre, et appelle la fonction 'createBook' du contrôleur 'bookCtrl' pour créer le livre dans la base de données.
router.put("/:id", auth, multer, bookCtrl.modifyBook); // Route pour modifier un livre existant en fonction de son ID, qui est protégée par le middleware 'auth' pour vérifier que l'utilisateur est authentifié, utilise le middleware 'multer' pour gérer le téléchargement de la nouvelle image du livre (si nécessaire), et appelle la fonction 'modifyBook' du contrôleur 'bookCtrl' pour mettre à jour le livre dans la base de données.
router.delete("/:id", auth, bookCtrl.deleteBook); // Route pour supprimer un livre en fonction de son ID, qui est protégée par le middleware 'auth' pour vérifier que l'utilisateur est authentifié, et appelle la fonction 'deleteBook' du contrôleur 'bookCtrl' pour supprimer le livre de la base de données.

router.post("/:id/rating", auth, bookCtrl.rateBook); // Route pour ajouter une note à un livre en fonction de son ID, qui est protégée par le middleware 'auth' pour vérifier que l'utilisateur est authentifié, et appelle la fonction 'rateBook' du contrôleur 'bookCtrl' pour ajouter la note à la base de données.
router.get("/:id/average-rating", bookCtrl.getAverageRating); // Route pour récupérer la note moyenne d'un livre en fonction de son ID, qui appelle la fonction 'getAverageRating' du contrôleur 'bookCtrl' pour calculer et retourner la note moyenne du livre.

module.exports = router; // J'exporte le routeur pour pouvoir l'utiliser dans d'autres parties de l'application, notamment dans 'app.js' où les routes seront intégrées à l'application Express.

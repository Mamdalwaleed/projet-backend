const Book = require("../models/Book");
const fs = require("fs");

// 🔹 Créer un livre
exports.createBook = (req, res, next) => {
  // Je crée une fonction 'createBook' qui sera utilisée pour gérer la création d'un nouveau livre. Cette fonction prend en paramètre les objets 'req' (requête), 'res' (réponse) et 'next' (fonction pour passer au middleware suivant).
  const bookObject = JSON.parse(req.body.book); // Je parse le corps de la requête pour obtenir les données du livre, qui sont envoyées sous forme de chaîne JSON dans 'req.body.book'. Cela me permet d'obtenir un objet JavaScript que je peux manipuler.
  delete bookObject._id; // Je supprime l'ID du livre s'il est présent dans les données, car MongoDB générera automatiquement un nouvel ID pour le livre que je vais créer. Cela évite les conflits d'ID lors de la création du livre dans la base de données.
  delete bookObject._userId; // Je supprime également l'ID de l'utilisateur s'il est présent dans les données, car je vais associer le livre à l'utilisateur authentifié en utilisant 'req.auth.userId' plutôt que de permettre au client de spécifier un ID d'utilisateur.

  const book = new Book({
    // Je crée une nouvelle instance du modèle 'Book' en utilisant les données du livre que j'ai obtenues après le parsing. J'utilise l'opérateur de décomposition '...' pour inclure toutes les propriétés de 'bookObject' dans le nouvel objet 'book'.
    ...bookObject, // J'inclus toutes les propriétés de 'bookObject' dans le nouvel objet 'book'.
    userId: req.auth.userId, // obligatoire pour les boutons
    imageUrl: `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`, // J'ajoute la propriété 'imageUrl' au livre, qui est construite à partir du protocole de la requête (http ou https), de l'hôte (adresse du serveur) et du nom du fichier de l'image téléchargée. Cela permet de stocker l'URL complète de l'image associée au livre dans la base de données.
  });

  book
    .save()
    .then(() => res.status(201).json({ message: "Livre enregistré !" }))
    .catch((error) => res.status(400).json({ error }));
};

// 🔹 Modifier un livre
exports.modifyBook = (req, res, next) => {
  const bookObject = req.file //est-ce que l’utilisateur a envoyé une image
    ? {
        ...JSON.parse(req.body.book), //on transforme les données texte en objet si une image est envoyée
        imageUrl: `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`, //on crée une nouvelle URL d’image
      }
    : { ...req.body }; //On garde juste les données du livre si aucune image n’est envoyée

  delete bookObject._userId; //empêche l’utilisateur de changer le propriétaire,car on va vérifier que le userId du livre correspond à celui de l’utilisateur authentifié avant d’autoriser la modification

  Book.findOne({ _id: req.params.id }) //on récupère le livre grâce à son ID pour vérifier qu’il existe et que l’utilisateur est bien le propriétaire du livre avant de le modifier
    .then((book) => {
      if (book.userId != req.auth.userId) {
        //si le userId du livre ne correspond pas à celui de l’utilisateur authentifié, on refuse la modification en renvoyant une réponse 401 (Unauthorized) avec un message d’erreur
        return res.status(401).json({ message: "Not authorized" });
      }

      // Supprimer l'ancienne image si une nouvelle est uploadée
      if (req.file) {
        //si nouvelle image → on supprime l’ancienne pour éviter d’avoir des fichiers inutiles qui prennent de la place sur le serveur
        const oldFilename = book.imageUrl.split("/uploads/")[1]; //on extrait le nom du fichier de l’ancienne image à partir de son URL
        fs.unlink(`uploads/${oldFilename}`, (err) => {
          //on utilise la fonction 'unlink' du module 'fs' pour supprimer le fichier de l’ancienne image du dossier 'uploads'. Si une erreur se produit lors de la suppression, on la logue dans la console.
          if (err) console.log("Erreur suppression ancienne image:", err);
        });
      }

      Book.updateOne(
        { _id: req.params.id }, //on met à jour le livre dans la base de données en utilisant la méthode 'updateOne' du modèle 'Book'. On spécifie l’ID du livre à mettre à jour et les nouvelles données du livre, qui sont obtenues en combinant les propriétés de 'bookObject' avec l’ID du livre pour s’assurer que l’ID reste le même.
        { ...bookObject, _id: req.params.id }, //on remplace les données du livre par les nouvelles données contenues dans 'bookObject', tout en conservant le même ID pour que le livre soit mis à jour correctement dans la base de données.
      )
        .then(() => res.status(200).json({ message: "Livre modifié !" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(400).json({ error }));
};

// 🔹 Supprimer un livre
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId !== req.auth.userId) {
        return res.status(401).json({ message: "Not authorized" });
      }

      if (book.imageUrl) {
        const filename = book.imageUrl.split("/uploads/")[1];
        fs.unlink(`uploads/${filename}`, (err) => {
          if (err) console.log("Erreur suppression image:", err);
        });
      }

      Book.deleteOne({ _id: req.params.id })
        .then(() => res.status(200).json({ message: "Livre supprimé !" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

// 🔹 Récupérer un livre
exports.getBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

// 🔹 Récupérer tous les livres
exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

// 🔹 Ajouter une note (ne touche pas à l’image ni aux autres champs)
exports.rateBook = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const grade = Number(req.body.rating);

    // Vérification note
    if (!grade || grade < 1 || grade > 5) {
      return res.status(400).json({ message: "Note invalide (1 à 5)" });
    }

    // Cherche le livre
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Livre non trouvé" });

    // Sécurité ratings
    if (!book.ratings) book.ratings = [];

    // Vérifie si l'utilisateur a déjà noté
    const existingRating = book.ratings.find((r) => r.userId === userId);
    if (existingRating) {
      return res.status(400).json({ message: "Vous avez déjà noté ce livre" });
    }

    // Ajoute la note
    book.ratings.push({ userId, grade });
    book.averageRating = Math.round(
      book.ratings.reduce((sum, r) => sum + r.grade, 0) / book.ratings.length,
    );

    // Sauvegarde
    await book.save();

    res
      .status(200)
      .json({ message: "Note enregistrée !", ratings: book.ratings });
  } catch (error) {
    console.log("ERREUR rateBook :", error);
    res.status(500).json({ error: "Erreur serveur, réessaie plus tard" });
  }
};

// 🔹 Obtenir la note moyenne d’un livre
exports.getAverageRating = (req, res, next) => {
  Book.findById(req.params.id)
    .then((book) => {
      if (!book) return res.status(404).json({ message: "Livre non trouvé" });

      const ratings = book.ratings;
      const average = ratings.length
        ? ratings.reduce((sum, r) => sum + r.grade, 0) / ratings.length
        : 0;

      res.status(200).json({
        averageRating: average.toFixed(2),
        totalRatings: ratings.length,
      });
    })
    .catch((error) => res.status(500).json({ error }));
};
// 🔹 Obtenir les 3 livres les mieux notés
exports.getBestRatedBooks = (req, res, next) => {
  Book.find()
    .then((books) => {
      const booksWithAverage = books.map((book) => {
        const ratings = book.ratings;

        const average = ratings.length
          ? ratings.reduce((sum, r) => sum + r.grade, 0) / ratings.length
          : 0;

        return {
          ...book._doc,
          averageRating: average,
        };
      });

      // Trier du meilleur au pire
      booksWithAverage.sort((a, b) => b.averageRating - a.averageRating);

      // Retourner les 3 meilleurs
      res.status(200).json(booksWithAverage.slice(0, 3));
    })
    .catch((error) => res.status(400).json({ error }));
};

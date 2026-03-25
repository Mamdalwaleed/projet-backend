const Book = require("../models/Book");
const fs = require("fs");

// 🔹 Créer un livre
exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;

  const book = new Book({
    ...bookObject,
    userId: req.auth.userId, // obligatoire pour les boutons
    imageUrl: `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`,
  });

  book
    .save()
    .then(() => res.status(201).json({ message: "Livre enregistré !" }))
    .catch((error) => res.status(400).json({ error }));
};

// 🔹 Modifier un livre
exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`,
      }
    : { ...req.body };

  delete bookObject._userId;

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        return res.status(401).json({ message: "Not authorized" });
      }

      // Supprimer l'ancienne image si une nouvelle est uploadée
      if (req.file) {
        const oldFilename = book.imageUrl.split("/uploads/")[1];
        fs.unlink(`uploads/${oldFilename}`, (err) => {
          if (err) console.log("Erreur suppression ancienne image:", err);
        });
      }

      Book.updateOne(
        { _id: req.params.id },
        { ...bookObject, _id: req.params.id },
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

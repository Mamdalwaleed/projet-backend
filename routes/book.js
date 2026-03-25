const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");
const bookCtrl = require("../controllers/book");

// Livres
router.get("/bestrating", bookCtrl.getBestRatedBooks);

router.get("/", bookCtrl.getAllBooks);
router.get("/:id", bookCtrl.getBook);
router.post("/", auth, multer, bookCtrl.createBook);
router.put("/:id", auth, multer, bookCtrl.modifyBook);
router.delete("/:id", auth, bookCtrl.deleteBook);

router.post("/:id/rating", auth, bookCtrl.rateBook);
router.get("/:id/average-rating", bookCtrl.getAverageRating);

module.exports = router;

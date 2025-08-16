const express = require("express");

const {
  subscriptionOrder,
  getTransactionsByUserId,
  uptadeVerification,
} = require("../controllers/transactionController");
const {
  requireSignIn,
  isDoctor,
  isAdmin,
} = require("../middlewares/authMiddleware");

const router = express.Router();

//post a new transaction by order
router.post("/subscription-order", requireSignIn, isDoctor, subscriptionOrder);
//get 5 transactions
router.get("/transactions/:id", requireSignIn, getTransactionsByUserId);
//get 5 transactions
router.put(
  "/verify-transaction/:transactionId",
  requireSignIn,
  isAdmin,
  uptadeVerification
);

module.exports = router;

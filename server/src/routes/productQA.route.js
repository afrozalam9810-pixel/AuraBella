/**
 * productQA.route.js
 * Customer Q&A endpoints.
 */
const express = require("express");
const { askQuestion, getProductQA, adminListQA, answerQA, deleteQA } = require("../controllers/productQAController");
const { protect } = require("../middleware/auth");
const { adminOnly } = require("../middleware/adminOnly");

const productRouter = express.Router({ mergeParams: true });
productRouter.get("/",  getProductQA);
productRouter.post("/", protect, askQuestion);

const adminRouter = express.Router();
adminRouter.use(protect, adminOnly);
adminRouter.get("/",       adminListQA);
adminRouter.put("/:id",    answerQA);
adminRouter.delete("/:id", deleteQA);

module.exports = { productRouter, adminRouter };

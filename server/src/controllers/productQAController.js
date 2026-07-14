/**
 * productQAController.js
 * Customer Q&A board for products.
 */
const ProductQA = require("../models/ProductQA.model");
const mongoose  = require("mongoose");

const askQuestion = async (req, res, next) => {
  try {
    const { question } = req.body;
    if (!question?.trim()) { res.status(400); throw new Error("Question text is required"); }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) { res.status(400); throw new Error("Invalid product ID"); }
    const qa = await ProductQA.create({ product: req.params.id, askedBy: req.user._id, question: question.trim() });
    res.status(201).json({ success: true, data: qa });
  } catch (err) { next(err); }
};

const getProductQA = async (req, res, next) => {
  try {
    const qas = await ProductQA.find({ product: req.params.id, isApproved: true })
      .populate("askedBy", "name avatar")
      .populate("answeredBy", "name")
      .sort({ createdAt: -1 }).limit(50);
    res.status(200).json({ success: true, count: qas.length, data: qas });
  } catch (err) { next(err); }
};

const adminListQA = async (req, res, next) => {
  try {
    const { approved } = req.query;
    const filter = {};
    if (approved !== undefined) filter.isApproved = approved === "true";
    const qas = await ProductQA.find(filter)
      .populate("askedBy", "name email")
      .populate("product", "name")
      .sort({ createdAt: -1 }).limit(200);
    res.status(200).json({ success: true, count: qas.length, data: qas });
  } catch (err) { next(err); }
};

const answerQA = async (req, res, next) => {
  try {
    const { answer, isApproved } = req.body;
    const updates = {};
    if (answer !== undefined)     { updates.answer = answer; updates.answeredBy = req.user._id; updates.answeredAt = new Date(); }
    if (isApproved !== undefined) { updates.isApproved = isApproved; }
    const qa = await ProductQA.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!qa) { res.status(404); throw new Error("Q&A not found"); }
    res.status(200).json({ success: true, data: qa });
  } catch (err) { next(err); }
};

const deleteQA = async (req, res, next) => {
  try {
    const qa = await ProductQA.findByIdAndDelete(req.params.id);
    if (!qa) { res.status(404); throw new Error("Q&A not found"); }
    res.status(200).json({ success: true, message: "Q&A deleted" });
  } catch (err) { next(err); }
};

module.exports = { askQuestion, getProductQA, adminListQA, answerQA, deleteQA };

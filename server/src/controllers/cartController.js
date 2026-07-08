/**
 * cartController.js
 * Controller for user shopping cart.
 */

const Cart = require("../models/Cart.model");
const Product = require("../models/Product.model");

/**
 * Helper to retrieve or create cart and populate product details
 */
const getPopulatedCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  } else {
    // Populate product details in cart items
    await cart.populate({
      path: "items.product",
      select: "name price discountPrice brand images variants",
    });
  }

  return cart;
};

/**
 * @desc    Get current user's cart
 * @route   GET /api/cart
 * @access  Private
 */
const getCart = async (req, res, next) => {
  try {
    const cart = await getPopulatedCart(req.user._id);
    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add item to cart
 * @route   POST /api/cart
 * @access  Private
 */
const addToCart = async (req, res, next) => {
  try {
    const { productId, variant = { size: "", color: "" }, qty = 1 } = req.body;

    if (!productId) {
      res.status(400);
      throw new Error("Product ID is required");
    }

    const qtyNum = parseInt(qty, 10);
    if (isNaN(qtyNum) || qtyNum < 1) {
      res.status(400);
      throw new Error("Quantity must be at least 1");
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Check if item with same product ID and variant matches already in cart
    const itemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.variant.size === (variant.size || "") &&
        item.variant.color === (variant.color || "")
    );

    if (itemIndex > -1) {
      // Item already in cart, increment quantity
      cart.items[itemIndex].qty += qtyNum;
    } else {
      // New item, push to items array
      cart.items.push({
        product: productId,
        variant: {
          size: variant.size || "",
          color: variant.color || "",
        },
        qty: qtyNum,
      });
    }

    await cart.save();
    
    // Get fully populated cart to return
    const populatedCart = await getPopulatedCart(req.user._id);

    res.status(200).json({
      success: true,
      message: "Item added to cart",
      data: populatedCart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update quantity of an item in cart
 * @route   PUT /api/cart/:itemId
 * @access  Private
 */
const updateCartItemQuantity = async (req, res, next) => {
  try {
    const { qty } = req.body;
    const { itemId } = req.params;

    const qtyNum = parseInt(qty, 10);
    if (isNaN(qtyNum) || qtyNum < 1) {
      res.status(400);
      throw new Error("Quantity must be at least 1");
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      res.status(404);
      throw new Error("Cart not found");
    }

    // Locate the specific item by its _id
    const item = cart.items.id(itemId);
    if (!item) {
      res.status(404);
      throw new Error("Cart item not found");
    }

    // Update quantity
    item.qty = qtyNum;
    await cart.save();

    const populatedCart = await getPopulatedCart(req.user._id);

    res.status(200).json({
      success: true,
      message: "Cart quantity updated",
      data: populatedCart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove an item from cart
 * @route   DELETE /api/cart/:itemId
 * @access  Private
 */
const removeCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      res.status(404);
      throw new Error("Cart not found");
    }

    // Remove the item using subdocument pull
    cart.items.pull({ _id: itemId });
    await cart.save();

    const populatedCart = await getPopulatedCart(req.user._id);

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      data: populatedCart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clear all items in cart
 * @route   DELETE /api/cart
 * @access  Private
 */
const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      res.status(404);
      throw new Error("Cart not found");
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
};

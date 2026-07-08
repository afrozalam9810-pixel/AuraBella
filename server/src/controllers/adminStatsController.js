const Order = require("../models/Order.model");
const Product = require("../models/Product.model");
const User = require("../models/User.model");

module.exports = {
  getAdminStats: async (req, res, next) => {
    try {
      // 1. Total Orders
      const totalOrdersCount = await Order.countDocuments({});

      // 2. Total Revenue (sum of all orders)
      const orders = await Order.find({});
      const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

      // 3. Top 5 selling products
      // Aggregate quantities sold in order items
      const productSalesMap = {};
      orders.forEach((o) => {
        o.items.forEach((item) => {
          const prodId = item.product.toString();
          productSalesMap[prodId] = (productSalesMap[prodId] || 0) + item.qty;
        });
      });

      // Sort by quantities
      const sortedProductIds = Object.keys(productSalesMap)
        .sort((a, b) => productSalesMap[b] - productSalesMap[a])
        .slice(0, 5);

      // Fetch top product details
      const topProducts = await Promise.all(
        sortedProductIds.map(async (prodId) => {
          const product = await Product.findById(prodId).select("name brand images price");
          return {
            product,
            quantitySold: productSalesMap[prodId],
          };
        })
      );

      // 4. Sales Trends (last 7 orders or days for simple line chart)
      // Grouping recent orders by day
      const dailySalesMap = {};
      orders.slice(-10).forEach((o) => {
        const dateStr = new Date(o.createdAt).toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
        });
        dailySalesMap[dateStr] = (dailySalesMap[dateStr] || 0) + o.totalAmount;
      });

      const salesTrends = Object.keys(dailySalesMap).map((date) => ({
        date,
        amount: dailySalesMap[date],
      }));

      // 5. Total Users
      const totalUsersCount = await User.countDocuments({ role: "customer" });

      res.status(200).json({
        success: true,
        data: {
          totalOrders: totalOrdersCount,
          totalRevenue,
          topProducts: topProducts.filter((p) => p.product),
          salesTrends,
          totalUsers: totalUsersCount,
        },
      });
    } catch (err) {
      next(err);
    }
  },
};

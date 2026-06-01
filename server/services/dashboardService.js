const Organization = require('../models/Organization');
const Product = require('../models/Product');

async function getDashboardStats(orgId) {
  const org = await Organization.findById(orgId);
  const defaultThreshold = org?.default_low_stock_threshold ?? 5;

  const stats = await Product.getStats(orgId);
  const lowStockItems = await Product.findLowStock(orgId, defaultThreshold);

  return {
    totalProducts: stats.total_products,
    totalUnits: stats.total_units,
    lowStockCount: lowStockItems.length,
    lowStockItems,
    defaultThreshold,
  };
}

module.exports = { getDashboardStats };

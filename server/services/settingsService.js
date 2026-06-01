const Organization = require('../models/Organization');

async function getSettings(orgId) {
  const org = await Organization.findById(orgId);
  if (!org) return null;
  return { organizationName: org.name, defaultLowStockThreshold: org.default_low_stock_threshold };
}

async function updateSettings(orgId, defaultLowStockThreshold) {
  const org = await Organization.updateThreshold(orgId, defaultLowStockThreshold);
  return { organizationName: org.name, defaultLowStockThreshold: org.default_low_stock_threshold };
}

module.exports = { getSettings, updateSettings };

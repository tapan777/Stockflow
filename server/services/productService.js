const Product = require('../models/Product');

async function getAllProducts(orgId, search) {
  return Product.findAll(orgId, search);
}

async function getProductById(id, orgId) {
  return Product.findById(id, orgId);
}

async function skuExists(sku, orgId, excludeId) {
  return Product.findBySku(sku, orgId, excludeId);
}

async function createProduct(orgId, data) {
  return Product.create(orgId, data);
}

async function updateProduct(id, orgId, data) {
  return Product.update(id, orgId, data);
}

async function deleteProduct(id, orgId) {
  return Product.delete(id, orgId);
}

async function adjustStock(id, orgId, adjustment) {
  return Product.adjustStock(id, orgId, adjustment);
}

module.exports = { getAllProducts, getProductById, skuExists, createProduct, updateProduct, deleteProduct, adjustStock };

const productService = require('../services/productService');
const send = require('../utils/response');

async function getAll(req, res) {
  try {
    const products = await productService.getAllProducts(req.user.orgId, req.query.search);
    return send.ok(res, products);
  } catch (err) {
    console.error('[products.getAll]', err);
    return send.serverError(res);
  }
}

async function getOne(req, res) {
  try {
    const product = await productService.getProductById(req.params.id, req.user.orgId);
    if (!product) return send.notFound(res, 'Product not found');
    return send.ok(res, product);
  } catch (err) {
    console.error('[products.getOne]', err);
    return send.serverError(res);
  }
}

async function create(req, res) {
  const { name, sku } = req.body;

  if (!name || !sku) return send.badRequest(res, 'Name and SKU are required');

  try {
    const conflict = await productService.skuExists(sku.trim().toUpperCase(), req.user.orgId);
    if (conflict) return send.conflict(res, 'SKU already exists in your organization');

    const product = await productService.createProduct(req.user.orgId, req.body);
    return send.created(res, product);
  } catch (err) {
    console.error('[products.create]', err);
    return send.serverError(res);
  }
}

async function update(req, res) {
  const { name, sku } = req.body;

  if (!name || !sku) return send.badRequest(res, 'Name and SKU are required');

  try {
    const existing = await productService.getProductById(req.params.id, req.user.orgId);
    if (!existing) return send.notFound(res, 'Product not found');

    const conflict = await productService.skuExists(sku.trim().toUpperCase(), req.user.orgId, req.params.id);
    if (conflict) return send.conflict(res, 'SKU already exists in your organization');

    const product = await productService.updateProduct(req.params.id, req.user.orgId, req.body);
    return send.ok(res, product);
  } catch (err) {
    console.error('[products.update]', err);
    return send.serverError(res);
  }
}

async function remove(req, res) {
  try {
    const existing = await productService.getProductById(req.params.id, req.user.orgId);
    if (!existing) return send.notFound(res, 'Product not found');

    await productService.deleteProduct(req.params.id, req.user.orgId);
    return send.ok(res, { message: 'Product deleted' });
  } catch (err) {
    console.error('[products.remove]', err);
    return send.serverError(res);
  }
}

async function adjustStock(req, res) {
  const { adjustment } = req.body;

  if (!adjustment || isNaN(adjustment) || Number(adjustment) === 0) {
    return send.badRequest(res, 'A non-zero adjustment value is required');
  }

  try {
    const existing = await productService.getProductById(req.params.id, req.user.orgId);
    if (!existing) return send.notFound(res, 'Product not found');

    const product = await productService.adjustStock(req.params.id, req.user.orgId, adjustment);
    return send.ok(res, product);
  } catch (err) {
    console.error('[products.adjustStock]', err);
    return send.serverError(res);
  }
}

module.exports = { getAll, getOne, create, update, remove, adjustStock };

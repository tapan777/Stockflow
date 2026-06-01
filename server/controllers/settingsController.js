const settingsService = require('../services/settingsService');
const send = require('../utils/response');

async function getSettings(req, res) {
  try {
    const settings = await settingsService.getSettings(req.user.orgId);
    if (!settings) return send.notFound(res, 'Organization not found');
    return send.ok(res, settings);
  } catch (err) {
    console.error('[settings.get]', err);
    return send.serverError(res);
  }
}

async function updateSettings(req, res) {
  const threshold = parseInt(req.body.defaultLowStockThreshold, 10);

  if (isNaN(threshold) || threshold < 0) {
    return send.badRequest(res, 'Valid threshold (>= 0) is required');
  }

  try {
    const settings = await settingsService.updateSettings(req.user.orgId, threshold);
    return send.ok(res, settings);
  } catch (err) {
    console.error('[settings.update]', err);
    return send.serverError(res);
  }
}

module.exports = { getSettings, updateSettings };

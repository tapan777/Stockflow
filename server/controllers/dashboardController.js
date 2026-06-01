const dashboardService = require('../services/dashboardService');
const send = require('../utils/response');

async function getStats(req, res) {
  try {
    const stats = await dashboardService.getDashboardStats(req.user.orgId);
    return send.ok(res, stats);
  } catch (err) {
    console.error('[dashboard.getStats]', err);
    return send.serverError(res);
  }
}

module.exports = { getStats };

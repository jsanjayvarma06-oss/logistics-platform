// Extracts tenant from header or API key
// In production, this would verify Supabase JWT and extract tenant claim
function tenantAuth(req, res, next) {
  const tenantId = req.headers['x-tenant-id'];
  if (!tenantId) {
    return res.status(401).json({ error: 'Missing x-tenant-id header' });
  }
  req.tenantId = tenantId;
  next();
}

module.exports = tenantAuth;

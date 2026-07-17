function tenantAuth(req, res, next) {
  const tenantId = req.headers['x-tenant-id'];
  if (!tenantId) return res.status(401).json({ error: 'Missing x-tenant-id header' });
  req.tenantId = tenantId;
  next();
}

module.exports = tenantAuth;

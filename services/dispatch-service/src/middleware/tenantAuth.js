const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function tenantAuth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const tenantId = req.headers['x-tenant-id'];

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      req.tenantId = user.user_metadata?.tenant_id || tenantId;
      req.user = user;
      return next();
    }

    if (tenantId) {
      req.tenantId = tenantId;
      return next();
    }

    return res.status(401).json({ error: 'Authentication required' });
  } catch (err) {
    return res.status(401).json({ error: 'Auth failed' });
  }
}

module.exports = tenantAuth;

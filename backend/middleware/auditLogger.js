const AuditLog = require('../models/AuditLog');
const { debug } = require('../utils/debugger');

exports.auditLog = (action, entityType) => {
  return async (req, res, next) => {
    // Store original send function
    const originalSend = res.send;
    
    // Override send function
    res.send = function(data) {
      // Only log successful actions (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const user = req.user;
          let entityId = null;
          
          // Try to extract entity ID
          if (req.params.id) {
            entityId = parseInt(req.params.id);
          } else if (req.body.id) {
            entityId = parseInt(req.body.id);
          } else if (typeof data === 'string') {
            try {
              const parsedData = JSON.parse(data);
              if (parsedData.data && parsedData.data.id) {
                entityId = parsedData.data.id;
              }
            } catch (e) {
              // Not JSON or doesn't have id
            }
          }
          
          // Create audit log entry
          AuditLog.create({
            userId: user.id,
            username: user.username,
            action,
            entityType,
            entityId,
            details: {
              method: req.method,
              url: req.originalUrl,
              body: action.includes('create') || action.includes('update') ? req.body : undefined
            },
            ipAddress: req.ip || req.headers['x-forwarded-for']
          }).catch(err => {
            debug('Failed to create audit log:', err);
          });
        } catch (error) {
          debug('Error in audit logging middleware:', error);
        }
      }
      
      // Call original send
      return originalSend.call(this, data);
    };
    
    next();
  };
};

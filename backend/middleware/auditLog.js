const AuditLog = require('../models/AuditLog');

// Helper to get client IP
const getClientIp = (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0] ||
        req.connection?.remoteAddress ||
        req.ip ||
        'unknown';
};

// Log an audit event
const logEvent = async (action, req, options = {}) => {
    try {
        await AuditLog.create({
            action,
            userId: options.userId ?? req.user?.id ?? null,
            userName: options.userName ?? req.user?.name ?? null,
            userRole: options.userRole ?? req.user?.role ?? null,
            resourceType: options.resourceType ?? null,
            resourceId: options.resourceId ?? null,
            ipAddress: getClientIp(req),
            userAgent: req.headers['user-agent'] || 'unknown',
            details: options.details ?? {},
            success: options.success ?? true
        });
    } catch (err) {
        // Don't fail the request if audit logging fails, but log the error
        console.error('Audit log error:', err.message);
    }
};

// Middleware for logging case access
const logCaseAccess = (action) => {
    return async (req, res, next) => {
        // Store original json method
        const originalJson = res.json.bind(res);

        res.json = (data) => {
            // Log the action after successful response
            if (res.statusCode < 400) {
                logEvent(action, req, {
                    resourceType: 'case',
                    resourceId: req.params.id || data?.id || 'multiple',
                    success: true
                });
            }
            return originalJson(data);
        };

        next();
    };
};

// Middleware for logging user management
const logUserAction = (action) => {
    return async (req, res, next) => {
        const originalJson = res.json.bind(res);

        res.json = (data) => {
            if (res.statusCode < 400) {
                logEvent(action, req, {
                    resourceType: 'user',
                    resourceId: req.params.id || data?.id,
                    details: {
                        targetUser: data?.name || data?.username,
                        targetRole: data?.role
                    },
                    success: true
                });
            }
            return originalJson(data);
        };

        next();
    };
};

// Log login attempts
const logLogin = async (req, success, userId = null, userName = null, details = {}) => {
    await logEvent(success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED', req, {
        userId,
        userName,
        success,
        details: {
            username: req.body?.username,
            ...details
        }
    });
};

// Log unauthorized access attempts
const logUnauthorized = async (req, reason) => {
    await logEvent('UNAUTHORIZED_ACCESS', req, {
        success: false,
        details: { reason, path: req.path, method: req.method }
    });
};

module.exports = {
    logEvent,
    logLogin,
    logUnauthorized,
    logCaseAccess,
    logUserAction,
    getClientIp
};

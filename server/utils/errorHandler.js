/**
 * Standardized error response helper.
 * Prevents leaking internal error messages to clients.
 * 
 * Usage:
 *   catch (err) {
 *     return handleError(err, res, 'Failed to fetch data');
 *   }
 */
const handleError = (err, res, defaultMessage = 'Internal server error') => {
    console.error(defaultMessage + ':', err.message);
    
    // Don't leak internal error details to the client
    if (err.code === '23505') {
        return res.status(409).json({ error: 'Resource already exists.' });
    }
    if (err.code === '23503') {
        return res.status(400).json({ error: 'Referenced resource not found.' });
    }
    if (err.code === '23502') {
        return res.status(400).json({ error: 'Missing required field.' });
    }
    
    return res.status(500).json({ error: defaultMessage });
};

module.exports = { handleError };

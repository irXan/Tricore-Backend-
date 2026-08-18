/**
 * blockBrowser — Rejects requests that come from a browser address bar.
 *
 * Browsers send `Accept: text/html` when navigating to a URL.
 * API clients send `Accept: application/json` (or omit it).
 * This prevents casual visitors from viewing raw JSON as a rendered page.
 */
function blockBrowser(req, res, next) {
  const accept = req.get('Accept') || '';
  if (accept.includes('text/html')) {
    return res.status(406).json({
      message: 'This endpoint is for API clients only. Use Accept: application/json.',
    });
  }
  return next();
}

module.exports = blockBrowser;

function notFound(req, res) {
  return res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(error, req, res, next) { // eslint-disable-line no-unused-vars
  if (error.name === 'MulterError') {
    const message = error.code === 'LIMIT_FILE_SIZE' ? 'Each image must be 5MB or smaller.' : error.message;
    return res.status(400).json({ message });
  }

  if (error.message === 'Only image uploads are allowed.') {
    return res.status(400).json({ message: error.message });
  }

  if (error.code === 11000) {
    return res.status(409).json({ message: 'A record with that value already exists.' });
  }

  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(422).json({ message: 'The submitted data is invalid.' });
  }

  console.error('Unhandled API error:', { message: error.message, path: req.originalUrl });
  return res.status(500).json({ message: 'An unexpected server error occurred.' });
}

module.exports = { notFound, errorHandler };


class HttpError extends Error {
  constructor(status, message, details = undefined) {
    super(message);
    this.status = status;
    this.details = details;
    this.name = 'HttpError';
    // Correctly set the prototype chain for Error subclassing
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

module.exports = HttpError;

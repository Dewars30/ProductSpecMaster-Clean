/**
 * Custom API Error class for handling HTTP errors
 */
export class APIError extends Error {
  status: number;
  
  constructor(message: string, status: number = 500) {
    super(message);
    this.name = 'APIError';
    this.status = status;
  }
}

/**
 * Creates a 400 Bad Request error
 */
export function badRequest(message: string = 'Bad Request'): APIError {
  return new APIError(message, 400);
}

/**
 * Creates a 401 Unauthorized error
 */
export function unauthorized(message: string = 'Unauthorized'): APIError {
  return new APIError(message, 401);
}

/**
 * Creates a 403 Forbidden error
 */
export function forbidden(message: string = 'Forbidden'): APIError {
  return new APIError(message, 403);
}

/**
 * Creates a 404 Not Found error
 */
export function notFound(message: string = 'Not Found'): APIError {
  return new APIError(message, 404);
}

/**
 * Creates a 500 Internal Server Error
 */
export function serverError(message: string = 'Internal Server Error'): APIError {
  return new APIError(message, 500);
}

/**
 * Creates a 503 Service Unavailable error
 */
export function serviceUnavailable(message: string = 'Service Unavailable'): APIError {
  return new APIError(message, 503);
}

// ============================================================
// Privacy & Error Sanitizer
// Strictly redacts emails, credentials, connection strings,
// secret tokens, and local filesystem paths from logs & responses.
// ============================================================

const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
const MONGO_URI_REGEX = /(mongodb(?:\+srv)?:\/\/)(?:[^:@\s]+)(?::(?:[^@\s]+))?@([^/\s?]+)(?:\/([^\s?]*))?/gi;
const SECRET_PARAM_REGEX = /(password|passwd|pwd|secret|token|key|apiKey)=([^&\s]+)/gi;
const USER_PATH_REGEX = /(?:\/Users\/|C:\\Users\\)[a-zA-Z0-9_\-\.]+/gi;

/**
 * Strips all private information from any string (emails, passwords, URIs, local paths)
 */
export function sanitizeText(input: unknown): string {
  if (!input) return '';
  let text = typeof input === 'string' ? input : String(input);

  // Redact MongoDB connection strings & credentials
  text = text.replace(MONGO_URI_REGEX, '$1[REDACTED_USER]:[REDACTED_PWD]@$2/$3');

  // Redact email addresses
  text = text.replace(EMAIL_REGEX, '[REDACTED_EMAIL]');

  // Redact secret query params or keys
  text = text.replace(SECRET_PARAM_REGEX, '$1=[REDACTED]');

  // Redact local user folder paths (e.g. /Users/username/...)
  text = text.replace(USER_PATH_REGEX, '/[REDACTED_DIR]');

  return text;
}

/**
 * Returns a completely safe error message for client responses.
 * In production, it ALWAYS returns a friendly generic message to prevent any data leakage.
 */
export function getSafeErrorMessage(
  err: unknown,
  fallback = 'An unexpected error occurred. Please try again later.'
): string {
  // In production, always return safe generic message
  if (process.env.NODE_ENV === 'production') {
    return fallback;
  }

  // In development, return sanitized message without credentials
  if (err instanceof Error) {
    return sanitizeText(err.message) || fallback;
  }

  return fallback;
}

import { AuthError } from '@netlify/identity'

// Converts Netlify Identity errors into messages that are safe to show the visitor.
export function authErrorMessage(err: unknown): string {
  if (err instanceof AuthError) {
    switch (err.status) {
      case 401: return 'Invalid email or password.'
      case 403: return 'Sign-ups are currently disabled for this site.'
      case 404: return 'No account was found for that email.'
      case 422: return 'Please check the details you entered. Passwords must be at least 6 characters.'
      default: return err.message || 'Authentication failed. Please try again.'
    }
  }
  return err instanceof Error ? err.message : 'Something went wrong. Please try again.'
}

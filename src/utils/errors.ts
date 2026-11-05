import { ApiError } from '../services/api'
import { authErrorMessage } from '../services/auth'

// Message to show a visitor for any thrown error (API, Identity or network).
export function errorText(err: unknown): string {
  if (err instanceof ApiError) return err.message
  if (err instanceof TypeError) return 'Network error. Check your connection and try again.'
  return authErrorMessage(err)
}

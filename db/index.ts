import { drizzle } from 'drizzle-orm/netlify-db'
import * as schema from './schema.js'

// Connection is provided by the Netlify platform; no connection string is stored in code.
export const db = drizzle({ schema })

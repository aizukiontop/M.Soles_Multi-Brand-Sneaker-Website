import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { loadCatalog } from './services/catalog'
import './index.css'

// Products come from Netlify Database. Load them before the first render so every page has data.
loadCatalog()
  .catch((err) => console.error('Could not load the sneaker catalog', err))
  .finally(() => {
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  })

import { RouterProvider } from 'react-router'
import { router } from './routes'
import { StoreProvider } from './store'
import { AuthProvider } from './context/AuthContext'

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <RouterProvider router={router} />
      </StoreProvider>
    </AuthProvider>
  )
}

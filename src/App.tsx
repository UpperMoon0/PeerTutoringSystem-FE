import Header from '@/components/layout/Header';
import { Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-svh"> {}
        <Header />
        <main className="flex-grow"> {}
          <Outlet />
        </main>
      </div>
    </AuthProvider>
  )
}

export default App

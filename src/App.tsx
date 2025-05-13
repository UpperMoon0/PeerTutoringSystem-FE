import Header from '@/components/layout/Header';
import { Outlet } from 'react-router-dom';

function App() {
  return (
    <div className="flex flex-col min-h-svh"> {}
      <Header />
      <main className="flex-grow p-4"> {}
        <Outlet />
      </main>
    </div>
  )
}

export default App

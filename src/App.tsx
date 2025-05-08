import Header from '@/components/layout/Header';
import { Outlet } from 'react-router-dom';

function App() {
  return (
    <div className="flex flex-col min-h-svh"> {/* Ensure App takes full height */}
      <Header />
      <main className="flex-grow p-4"> {/* Outlet will render the matched route's component */}
        <Outlet />
      </main>
    </div>
  )
}

export default App

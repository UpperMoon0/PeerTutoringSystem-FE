import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import App from '../App'; 

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, 
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;

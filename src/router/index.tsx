import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import StudentRegisterPage from '../pages/StudentRegisterPage';
import App from '../App'; 
import HomePage from '../pages/HomePage'; 

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: '/',
        element: <HomePage />, 
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register/student', 
        element: <StudentRegisterPage />,
      },
    ],
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import StudentRegisterPage from '../pages/StudentRegisterPage';
import TutorRegisterPage from '../pages/TutorRegisterPage'; 
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
      {
        path: 'register-tutor', 
        element: <TutorRegisterPage />,
      },
    ],
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;

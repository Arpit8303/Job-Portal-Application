import { Navigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const ProtectedRoute = ({ children }) => {
  const { auth } = useAppContext();
  if (!auth.token) {
    return <Navigate to='/login' replace />;
  }
  return children;
};

export default ProtectedRoute;

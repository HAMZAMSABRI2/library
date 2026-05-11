import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LivresList from './pages/livres/LivresList';
import LivresForm from './pages/livres/LivresForm';
import UsersList from './pages/users/UsersList';
import UsersForm from './pages/users/UsersForm';
import EmpruntsList from './pages/emprunts/EmpruntsList';
import EmpruntsForm from './pages/emprunts/EmpruntsForm';

const Private = ({ children }) => <PrivateRoute>{children}</PrivateRoute>;

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected */}
          <Route path="/dashboard"       element={<Private><Dashboard /></Private>} />
          <Route path="/livres"          element={<Private><LivresList /></Private>} />
          <Route path="/livres/new"      element={<Private><LivresForm /></Private>} />
          <Route path="/livres/:id/edit" element={<Private><LivresForm /></Private>} />
          <Route path="/users"           element={<Private><UsersList /></Private>} />
          <Route path="/users/:id/edit"  element={<Private><UsersForm /></Private>} />
          <Route path="/emprunts"        element={<Private><EmpruntsList /></Private>} />
          <Route path="/emprunts/new"    element={<Private><EmpruntsForm /></Private>} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

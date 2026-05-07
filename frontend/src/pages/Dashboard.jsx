import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Segoe UI, sans-serif' }}>
      <h1>Bienvenue, {user?.prenom} {user?.nom} 👋</h1>
      <p style={{ color: '#64748b' }}>Tableau de bord — à venir dans les prochaines étapes.</p>
      <button
        onClick={handleLogout}
        style={{
          marginTop: '1rem',
          padding: '0.6rem 1.4rem',
          background: '#0f3460',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '0.9rem',
        }}
      >
        Se déconnecter
      </button>
    </div>
  );
}

import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Layout.module.css';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={styles.wrapper}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>📚</span>
          <span className={styles.brandName}>BiblioApp</span>
        </div>

        <nav className={styles.nav}>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
          >
            🏠 Tableau de bord
          </NavLink>
          <NavLink
            to="/livres"
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
          >
            📖 Livres
          </NavLink>
          <NavLink
            to="/users"
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
          >
            👥 Utilisateurs
          </NavLink>
          <NavLink
            to="/emprunts"
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
          >
            🔄 Emprunts
          </NavLink>
        </nav>

        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            <span className={styles.userAvatar}>
              {user?.prenom?.[0]}{user?.nom?.[0]}
            </span>
            <div>
              <p className={styles.userName}>{user?.prenom} {user?.nom}</p>
              <p className={styles.userRole}>{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Se déconnecter
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}

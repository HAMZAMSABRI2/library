import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Layout from '../components/Layout';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ livres: 0, users: 0, empruntsEnCours: 0, empruntsRendus: 0 });

  useEffect(() => {
    Promise.all([
      api.get('/api/livres', { params: { limit: 1 } }),
      api.get('/api/users', { params: { limit: 1 } }),
      api.get('/api/emprunts', { params: { limit: 1, statut: 'en_cours' } }),
      api.get('/api/emprunts', { params: { limit: 1, statut: 'rendu' } }),
    ])
      .then(([l, u, ec, er]) => {
        setStats({
          livres: l.data.total,
          users: u.data.total,
          empruntsEnCours: ec.data.total,
          empruntsRendus: er.data.total,
        });
      })
      .catch(() => {});
  }, []);

  const cards = [
    { label: 'Livres', value: stats.livres, icon: '📖', route: '/livres', color: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' },
    { label: 'Utilisateurs', value: stats.users, icon: '👥', route: '/users', color: '#f0fdf4', border: '#bbf7d0', text: '#16a34a' },
    { label: 'Emprunts en cours', value: stats.empruntsEnCours, icon: '🔄', route: '/emprunts', color: '#fefce8', border: '#fde68a', text: '#b45309' },
    { label: 'Retours effectués', value: stats.empruntsRendus, icon: '✅', route: '/emprunts', color: '#f5f3ff', border: '#ddd6fe', text: '#7c3aed' },
  ];

  return (
    <Layout>
      <div>
        <h1 className={styles.title}>Bonjour, {user?.prenom} 👋</h1>
        <p className={styles.subtitle}>Voici un aperçu de votre bibliothèque.</p>

        <div className={styles.cards}>
          {cards.map(c => (
            <button
              key={c.label}
              className={styles.card}
              style={{ background: c.color, borderColor: c.border }}
              onClick={() => navigate(c.route)}
            >
              <span className={styles.cardIcon}>{c.icon}</span>
              <span className={styles.cardValue} style={{ color: c.text }}>{c.value}</span>
              <span className={styles.cardLabel}>{c.label}</span>
            </button>
          ))}
        </div>
      </div>
    </Layout>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.left}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>📚</span>
          <h1>BiblioApp</h1>
          <p>Votre bibliothèque numérique</p>
        </div>
        <ul className={styles.features}>
          <li>✓ Gérez vos livres facilement</li>
          <li>✓ Suivez vos emprunts</li>
          <li>✓ Accès sécurisé par JWT</li>
        </ul>
      </div>

      <div className={styles.right}>
        <div className={styles.card}>
          <h2 className={styles.title}>Connexion</h2>
          <p className={styles.subtitle}>Bienvenue ! Connectez-vous à votre compte.</p>

          {error && <div className={styles.alert}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="votre@email.com"
                required
                autoFocus
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password">Mot de passe</label>
              <input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className={styles.btn} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : 'Se connecter'}
            </button>
          </form>

          <p className={styles.switch}>
            Pas encore de compte ?{' '}
            <Link to="/register">Créer un compte</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

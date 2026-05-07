import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm]     = useState({ email: '', password: '', nom: '', prenom: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue');
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
          <li>✓ Inscription gratuite</li>
          <li>✓ Accès instantané au catalogue</li>
          <li>✓ Gérez vos emprunts en ligne</li>
        </ul>
      </div>

      <div className={styles.right}>
        <div className={styles.card}>
          <h2 className={styles.title}>Créer un compte</h2>
          <p className={styles.subtitle}>Rejoignez BiblioApp dès maintenant.</p>

          {error && <div className={styles.alert}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="prenom">Prénom</label>
                <input
                  id="prenom"
                  type="text"
                  name="prenom"
                  value={form.prenom}
                  onChange={handleChange}
                  placeholder="Jean"
                  required
                  autoFocus
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="nom">Nom</label>
                <input
                  id="nom"
                  type="text"
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                  placeholder="Dupont"
                  required
                />
              </div>
            </div>

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
                placeholder="Min. 6 caractères"
                required
              />
            </div>

            <button type="submit" className={styles.btn} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : "S'inscrire"}
            </button>
          </form>

          <p className={styles.switch}>
            Déjà un compte ?{' '}
            <Link to="/login">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

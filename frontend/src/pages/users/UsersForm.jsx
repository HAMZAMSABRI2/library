import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import Layout from '../../components/Layout';
import styles from '../crud.module.css';

export default function UsersForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', nom: '', prenom: '', role: 'ROLE_USER' });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/api/users/${id}`)
      .then(res => {
        const d = res.data;
        setForm({ email: d.email, password: '', nom: d.nom, prenom: d.prenom, role: d.role });
      })
      .catch(() => setError('Impossible de charger l\'utilisateur.'))
      .finally(() => setFetching(false));
  }, [id]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      await api.put(`/api/users/${id}`, payload);
      navigate('/users');
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div>
        <Link to="/users" className={styles.backLink}>← Retour aux utilisateurs</Link>

        <div className={styles.formCard}>
          <h1 className={styles.title}>Modifier l'utilisateur</h1>
          <p className={styles.subtitle}>Laissez le mot de passe vide pour ne pas le modifier.</p>

          {error && <div className={styles.alert} style={{ marginTop: '1rem' }}>{error}</div>}

          {fetching ? (
            <div className={styles.loadingRow}>Chargement...</div>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Prénom *</label>
                  <input
                    name="prenom"
                    value={form.prenom}
                    onChange={handleChange}
                    placeholder="Hamza"
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label>Nom *</label>
                  <input
                    name="nom"
                    value={form.nom}
                    onChange={handleChange}
                    placeholder="Msabri"
                    required
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label>Email *</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="hamza@example.com"
                  required
                />
              </div>

              <div className={styles.field}>
                <label>Nouveau mot de passe</label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Laisser vide pour ne pas modifier"
                />
              </div>

              <div className={styles.field}>
                <label>Rôle</label>
                <select name="role" value={form.role} onChange={handleChange}>
                  <option value="ROLE_USER">Membre</option>
                  <option value="ROLE_ADMIN">Admin</option>
                </select>
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.btnCancel} onClick={() => navigate('/users')}>
                  Annuler
                </button>
                <button type="submit" className={styles.btnSubmit} disabled={loading}>
                  {loading ? <span className={styles.spinner} /> : 'Enregistrer'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import Layout from '../../components/Layout';
import styles from '../crud.module.css';

export default function EmpruntsForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ user_id: '', livre_id: '' });
  const [users, setUsers] = useState([]);
  const [livres, setLivres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/api/users', { params: { limit: 100 } }),
      api.get('/api/livres', { params: { limit: 100 } }),
    ])
      .then(([usersRes, livresRes]) => {
        setUsers(usersRes.data.data);
        setLivres(livresRes.data.data.filter(l => l.stock > 0));
      })
      .catch(() => setError('Erreur lors du chargement des données.'))
      .finally(() => setFetching(false));
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/api/emprunts', {
        user_id: parseInt(form.user_id),
        livre_id: parseInt(form.livre_id),
      });
      navigate('/emprunts');
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div>
        <Link to="/emprunts" className={styles.backLink}>← Retour aux emprunts</Link>

        <div className={styles.formCard}>
          <h1 className={styles.title}>Nouvel emprunt</h1>
          <p className={styles.subtitle}>Associez un utilisateur à un livre disponible.</p>

          {error && <div className={styles.alert} style={{ marginTop: '1rem' }}>{error}</div>}

          {fetching ? (
            <div className={styles.loadingRow}>Chargement...</div>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label>Utilisateur *</label>
                <select name="user_id" value={form.user_id} onChange={handleChange} required>
                  <option value="">Sélectionner un utilisateur...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.prenom} {u.nom} — {u.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label>Livre *</label>
                <select name="livre_id" value={form.livre_id} onChange={handleChange} required>
                  <option value="">Sélectionner un livre disponible...</option>
                  {livres.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.titre} — {l.auteur} (stock : {l.stock})
                    </option>
                  ))}
                </select>
              </div>

              {livres.length === 0 && !fetching && (
                <div className={styles.alert}>
                  Aucun livre disponible en stock pour le moment.
                </div>
              )}

              <div className={styles.formActions}>
                <button type="button" className={styles.btnCancel} onClick={() => navigate('/emprunts')}>
                  Annuler
                </button>
                <button
                  type="submit"
                  className={styles.btnSubmit}
                  disabled={loading || livres.length === 0}
                >
                  {loading ? <span className={styles.spinner} /> : 'Créer l\'emprunt'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Layout from '../../components/Layout';
import styles from '../crud.module.css';

export default function EmpruntsList() {
  const [emprunts, setEmprunts] = useState([]);
  const [total, setTotal] = useState(0);
  const [statut, setStatut] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const limit = 10;

  const fetchEmprunts = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit };
      if (statut) params.statut = statut;
      const res = await api.get('/api/emprunts', { params });
      setEmprunts(res.data.data);
      setTotal(res.data.total);
    } catch {
      setError('Erreur lors du chargement des emprunts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmprunts(); }, [page, statut]);

  const handleRetour = async (id) => {
    if (!window.confirm('Marquer ce livre comme rendu ?')) return;
    try {
      await api.patch(`/api/emprunts/${id}/retour`);
      fetchEmprunts();
    } catch {
      setError('Erreur lors du retour.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet emprunt ?')) return;
    try {
      await api.delete(`/api/emprunts/${id}`);
      fetchEmprunts();
    } catch {
      setError('Erreur lors de la suppression.');
    }
  };

  const formatDate = d => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

  const totalPages = Math.ceil(total / limit);

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Emprunts</h1>
            <p className={styles.subtitle}>{total} emprunt{total !== 1 ? 's' : ''} au total</p>
          </div>
          <button className={styles.btnPrimary} onClick={() => navigate('/emprunts/new')}>
            + Nouvel emprunt
          </button>
        </div>

        <div className={styles.toolbar}>
          <select
            className={styles.select}
            value={statut}
            onChange={e => { setStatut(e.target.value); setPage(1); }}
          >
            <option value="">Tous les statuts</option>
            <option value="en_cours">En cours</option>
            <option value="rendu">Rendu</option>
          </select>
        </div>

        {error && <div className={styles.alert}>{error}</div>}

        <div className={styles.tableWrapper}>
          {loading ? (
            <div className={styles.loadingRow}>Chargement...</div>
          ) : emprunts.length === 0 ? (
            <div className={styles.emptyRow}>Aucun emprunt trouvé.</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Emprunteur</th>
                  <th>Livre</th>
                  <th>Date emprunt</th>
                  <th>Date retour</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {emprunts.map(e => (
                  <tr key={e.id}>
                    <td>{e.id}</td>
                    <td className={styles.bold}>{e.user_prenom} {e.user_nom}</td>
                    <td>{e.livre_titre}</td>
                    <td>{formatDate(e.date_emprunt)}</td>
                    <td>{formatDate(e.date_retour)}</td>
                    <td>
                      <span className={`${styles.badge} ${e.statut === 'en_cours' ? styles.badgeBlue : styles.badgeGreen}`}>
                        {e.statut === 'en_cours' ? 'En cours' : 'Rendu'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        {e.statut === 'en_cours' && (
                          <button className={styles.btnReturn} onClick={() => handleRetour(e.id)}>
                            Retour
                          </button>
                        )}
                        <button className={styles.btnDelete} onClick={() => handleDelete(e.id)}>
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Précédent</button>
            <span>Page {page} / {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Suivant →</button>
          </div>
        )}
      </div>
    </Layout>
  );
}

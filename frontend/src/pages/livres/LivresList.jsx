import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Layout from '../../components/Layout';
import styles from '../crud.module.css';

export default function LivresList() {
  const [livres, setLivres] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const limit = 10;

  const fetchLivres = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit };
      if (search) params.q = search;
      const res = await api.get('/api/livres', { params });
      setLivres(res.data.data);
      setTotal(res.data.total);
    } catch {
      setError('Erreur lors du chargement des livres.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLivres(); }, [page, search]);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce livre ?')) return;
    try {
      await api.delete(`/api/livres/${id}`);
      fetchLivres();
    } catch {
      setError('Erreur lors de la suppression.');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Livres</h1>
            <p className={styles.subtitle}>{total} livre{total !== 1 ? 's' : ''} au total</p>
          </div>
          <button className={styles.btnPrimary} onClick={() => navigate('/livres/new')}>
            + Ajouter un livre
          </button>
        </div>

        <div className={styles.toolbar}>
          <input
            className={styles.search}
            type="text"
            placeholder="Rechercher par titre, auteur, ISBN..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        {error && <div className={styles.alert}>{error}</div>}

        <div className={styles.tableWrapper}>
          {loading ? (
            <div className={styles.loadingRow}>Chargement...</div>
          ) : livres.length === 0 ? (
            <div className={styles.emptyRow}>Aucun livre trouvé.</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ISBN</th>
                  <th>Titre</th>
                  <th>Auteur</th>
                  <th>Éditeur</th>
                  <th>Année</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {livres.map(l => (
                  <tr key={l.id}>
                    <td>{l.isbn}</td>
                    <td className={styles.bold}>{l.titre}</td>
                    <td>{l.auteur}</td>
                    <td>{l.editeur || '—'}</td>
                    <td>{l.annee || '—'}</td>
                    <td>
                      <span className={`${styles.badge} ${l.stock > 0 ? styles.badgeGreen : styles.badgeRed}`}>
                        {l.stock}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.btnEdit} onClick={() => navigate(`/livres/${l.id}/edit`)}>
                          Modifier
                        </button>
                        <button className={styles.btnDelete} onClick={() => handleDelete(l.id)}>
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

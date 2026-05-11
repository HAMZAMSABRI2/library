import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Layout from '../../components/Layout';
import styles from '../crud.module.css';

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const limit = 10;

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit };
      if (search) params.q = search;
      const res = await api.get('/api/users', { params });
      setUsers(res.data.data);
      setTotal(res.data.total);
    } catch {
      setError('Erreur lors du chargement des utilisateurs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [page, search]);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    try {
      await api.delete(`/api/users/${id}`);
      fetchUsers();
    } catch {
      setError('Erreur lors de la suppression.');
    }
  };

  const totalPages = Math.ceil(total / limit);

  const roleLabel = role => {
    if (role === 'ROLE_ADMIN') return { label: 'Admin', cls: styles.badgeBlue };
    return { label: 'Membre', cls: styles.badgeGray };
  };

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Utilisateurs</h1>
            <p className={styles.subtitle}>{total} utilisateur{total !== 1 ? 's' : ''} au total</p>
          </div>
        </div>

        <div className={styles.toolbar}>
          <input
            className={styles.search}
            type="text"
            placeholder="Rechercher par nom, prénom, email..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        {error && <div className={styles.alert}>{error}</div>}

        <div className={styles.tableWrapper}>
          {loading ? (
            <div className={styles.loadingRow}>Chargement...</div>
          ) : users.length === 0 ? (
            <div className={styles.emptyRow}>Aucun utilisateur trouvé.</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const { label, cls } = roleLabel(u.role);
                  return (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td className={styles.bold}>{u.nom}</td>
                      <td>{u.prenom}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`${styles.badge} ${cls}`}>{label}</span>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button className={styles.btnEdit} onClick={() => navigate(`/users/${u.id}/edit`)}>
                            Modifier
                          </button>
                          <button className={styles.btnDelete} onClick={() => handleDelete(u.id)}>
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

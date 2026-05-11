import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import Layout from '../../components/Layout';
import styles from '../crud.module.css';

const emptyForm = { isbn: '', titre: '', auteur: '', editeur: '', annee: '', stock: '3', image_url: '' };

export default function LivresForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/api/livres/${id}`)
      .then(res => {
        const d = res.data;
        setForm({
          isbn: d.isbn ?? '',
          titre: d.titre ?? '',
          auteur: d.auteur ?? '',
          editeur: d.editeur ?? '',
          annee: d.annee ?? '',
          stock: d.stock ?? '3',
          image_url: d.image_url ?? '',
        });
      })
      .catch(() => setError('Impossible de charger le livre.'))
      .finally(() => setFetching(false));
  }, [id]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        annee: form.annee ? parseInt(form.annee) : null,
        stock: form.stock !== '' ? parseInt(form.stock) : 0,
      };
      if (isEdit) {
        await api.put(`/api/livres/${id}`, payload);
      } else {
        await api.post('/api/livres', payload);
      }
      navigate('/livres');
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div>
        <Link to="/livres" className={styles.backLink}>← Retour aux livres</Link>

        <div className={styles.formCard}>
          <h1 className={styles.title}>{isEdit ? 'Modifier le livre' : 'Ajouter un livre'}</h1>
          <p className={styles.subtitle}>
            {isEdit ? 'Mettez à jour les informations du livre.' : 'Remplissez les informations du nouveau livre.'}
          </p>

          {error && <div className={styles.alert} style={{ marginTop: '1rem' }}>{error}</div>}

          {fetching ? (
            <div className={styles.loadingRow}>Chargement...</div>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>ISBN *</label>
                  <input
                    name="isbn"
                    value={form.isbn}
                    onChange={handleChange}
                    placeholder="978-2-07-036024-5"
                    required
                    disabled={isEdit}
                  />
                </div>
                <div className={styles.field}>
                  <label>Stock</label>
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={handleChange}
                    placeholder="3"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label>Titre *</label>
                <input
                  name="titre"
                  value={form.titre}
                  onChange={handleChange}
                  placeholder="Le Petit Prince"
                  required
                />
              </div>

              <div className={styles.field}>
                <label>Auteur *</label>
                <input
                  name="auteur"
                  value={form.auteur}
                  onChange={handleChange}
                  placeholder="Antoine de Saint-Exupéry"
                  required
                />
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Éditeur</label>
                  <input
                    name="editeur"
                    value={form.editeur}
                    onChange={handleChange}
                    placeholder="Gallimard"
                  />
                </div>
                <div className={styles.field}>
                  <label>Année</label>
                  <input
                    name="annee"
                    type="number"
                    min="1000"
                    max="2099"
                    value={form.annee}
                    onChange={handleChange}
                    placeholder="1943"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label>URL de l'image</label>
                <input
                  name="image_url"
                  value={form.image_url}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.btnCancel} onClick={() => navigate('/livres')}>
                  Annuler
                </button>
                <button type="submit" className={styles.btnSubmit} disabled={loading}>
                  {loading ? <span className={styles.spinner} /> : (isEdit ? 'Enregistrer' : 'Ajouter')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}

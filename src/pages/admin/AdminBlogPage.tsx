import { toast } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  fetchAdminBlogPosts,
  createAdminBlogPost,
  updateAdminBlogPost,
  deleteAdminBlogPost
} from '../../services/admin';
import type { BlogPost } from '../../types';
import { Plus, Edit2, Trash2, X, Save, FileText, Calendar, Eye, Loader2, Power } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { PageHeader } from '../../components/admin/PageHeader';
import { AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useEscape } from '../../hooks/useKeyPress';

export function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  useEscape(() => setShowForm(false), showForm);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    image_url: '',
    is_published: false
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await fetchAdminBlogPosts();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      image_url: '',
      is_published: false
    });
    setEditingPost(null);
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || '',
      image_url: post.image_url || '',
      is_published: post.is_published
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) return;

    setSaving(true);
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    try {
      const postData = {
        ...formData,
        slug: editingPost ? editingPost.slug : `${slug}-${Date.now().toString(36)}`,
        published_at: formData.is_published && (!editingPost || !editingPost.is_published)
          ? new Date().toISOString()
          : (editingPost?.published_at || null)
      };

      if (editingPost) {
        await updateAdminBlogPost(editingPost.id, postData);
      } else {
        await createAdminBlogPost(postData);
      }

      await fetchPosts();
      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error('Error saving blog post:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cet article ?')) return;

    try {
      await deleteAdminBlogPost(id);
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting blog post:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleTogglePublished = async (post: BlogPost) => {
    const nextPublished = !post.is_published;
    // Set published_at the first time an article is published; keep existing otherwise.
    const nextPublishedAt = nextPublished
      ? (post.published_at || new Date().toISOString())
      : post.published_at;

    setTogglingId(post.id);
    setPosts(prev => prev.map(p => (p.id === post.id ? { ...p, is_published: nextPublished, published_at: nextPublishedAt } : p)));
    try {
      await updateAdminBlogPost(post.id, { is_published: nextPublished, published_at: nextPublishedAt });
    } catch (error) {
      console.error('Error toggling blog post status:', error);
      setPosts(prev => prev.map(p => (p.id === post.id ? { ...p, is_published: post.is_published, published_at: post.published_at } : p)));
      toast.error('Erreur lors du changement de statut');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        <PageHeader
          title="Blog"
          subtitle={`${posts.length} article${posts.length > 1 ? 's' : ''}`}
        >
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouvel article
          </button>
        </PageHeader>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b dark:border-gray-700">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Article</th>
                <th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Statut</th>
                <th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Date</th>
                <th className="text-right px-6 py-4 text-sm font-medium dark:text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.map((post, index) => (
                <motion.tr
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="dark:hover:bg-gray-700 hover:bg-gray-100"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {post.image_url ? (
                        <img
                          src={post.image_url}
                          alt={post.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <FileText className="w-5 h-5 dark:text-gray-500" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium dark:text-white">{post.title}</p>
                        <p className="text-sm dark:text-gray-500 truncate max-w-xs">
                          {post.excerpt || post.content.slice(0, 60)}...
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      post.is_published
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      <Eye className="w-3 h-3" />
                      {post.is_published ? 'Publie' : 'Brouillon'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm dark:text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(post.created_at), 'dd MMM yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleTogglePublished(post)}
                        disabled={togglingId === post.id}
                        className={`p-3 rounded-lg border transition-colors disabled:opacity-50 ${post.is_published ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700 dark:hover:bg-green-900/60' : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'}`}
                        title={post.is_published ? 'Repasser en brouillon' : 'Publier'}
                      >
                        {togglingId === post.id ? (
                          <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                          <Power className="w-6 h-6" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(post)}
                        className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded-lg transition-colors dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                      >
                        <Edit2 className="w-6 h-6" />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-3 bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 rounded-lg transition-colors dark:bg-red-900/40 dark:text-red-300 dark:border-red-700 dark:hover:bg-red-900/60"
                      >
                        <Trash2 className="w-6 h-6" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {posts.length === 0 && !loading && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="dark:text-gray-500">Aucun article</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white dark:bg-gray-800 z-50 overflow-y-auto"
            >
              <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800">
                <h2 className="text-xl font-bold dark:text-white">
                  {editingPost ? 'Modifier l\'article' : 'Nouvel article'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 hover:bg-gray-100 hover:dark:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 mb-2">
                    Titre *
                  </label>
                  <input
                    type="text"
                    id="blog-title"
                    name="title"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 mb-2">
                    Extrait
                  </label>
                  <textarea
                    id="blog-excerpt"
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 mb-2">
                    Contenu *
                  </label>
                  <textarea
                    id="blog-content"
                    name="content"
                    value={formData.content}
                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                    rows={10}
                    className="w-full px-4 py-3 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 mb-2">
                    URL de l'image
                  </label>
                  <input
                    type="text"
                    id="blog-image_url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-4 py-3 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    id="blog-is_published"
                    name="is_published"
                    checked={formData.is_published}
                    onChange={e => setFormData({ ...formData, is_published: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                  />
                  <span className="text-sm dark:text-gray-300">Publier immediatement</span>
                </label>

                <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
                  <button
                    onClick={handleSave}
                    disabled={saving || !formData.title || !formData.content}
                    className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-primary-700 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-6 py-2.5 border dark:border-gray-700 rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
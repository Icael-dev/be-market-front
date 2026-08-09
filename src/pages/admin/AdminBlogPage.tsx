import { toast } from "react-hot-toast";
import { logger } from "../../lib/logger";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  fetchAdminBlogPosts,
  createAdminBlogPost,
  updateAdminBlogPost,
  deleteAdminBlogPost,
} from "../../services/admin";
import { fetchProducts } from "../../services/products";
import type { BlogPost, Product } from "../../types";
import { Plus, Edit2, Trash2, Save, FileText, Calendar, Loader2, Power } from "lucide-react";
import { PageHeader } from "../../components/admin/PageHeader";
import { MobileNotOptimizedBanner } from "../../components/admin/MobileNotOptimizedBanner";
import { StatusBadge } from "../../components/admin/StatusBadge";
import { AdminDrawer } from "../../components/admin/AdminDrawer";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { AdminTable, type Column } from "../../components/admin/AdminTable";
import { format } from "date-fns";
import { useEscape } from "../../hooks/useKeyPress";
import { ImageUpload } from "../../components/admin/ImageUpload";
import { getImageUrl } from "../../lib/imageUrl";
import { cn } from "../../lib/utils";

export function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  useEscape(() => setShowForm(false), showForm);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTargetId, setConfirmTargetId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    image_url: "",
    is_published: false,
    related_product_ids: [] as string[],
  });

  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    fetchPosts();
    fetchProducts({})
      .then(setProducts)
      .catch((error) => logger.error("Error fetching products:", error));
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await fetchAdminBlogPosts();
      setPosts(data);
      setCurrentPage(1);
    } catch (error) {
      logger.error("Error fetching blog posts:", error);
    }
  };

  const totalPages = Math.max(1, Math.ceil(posts.length / perPage));
  const paginatedPosts = posts.slice((currentPage - 1) * perPage, currentPage * perPage);

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      excerpt: "",
      image_url: "",
      is_published: false,
      related_product_ids: [],
    });
    setImageUrls([]);
    setEditingPost(null);
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || "",
      image_url: post.image_url || "",
      is_published: post.is_published,
      related_product_ids: post.related_product_ids || [],
    });
    setImageUrls(post.image_url ? [post.image_url] : []);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) return;

    setSaving(true);
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    try {
      const postData = {
        ...formData,
        image_url: imageUrls[0] || null,
        slug: editingPost ? editingPost.slug : `${slug}-${Date.now().toString(36)}`,
        published_at:
          formData.is_published && (!editingPost || !editingPost.is_published)
            ? new Date().toISOString()
            : editingPost?.published_at || null,
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
      logger.error("Error saving blog post:", error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmTargetId) return;
    try {
      await deleteAdminBlogPost(confirmTargetId);
      setPosts((prev) => prev.filter((p) => p.id !== confirmTargetId));
    } catch (error) {
      logger.error("Error deleting blog post:", error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setConfirmOpen(false);
      setConfirmTargetId(null);
    }
  };

  const handleTogglePublished = async (post: BlogPost) => {
    const nextPublished = !post.is_published;
    const nextPublishedAt = nextPublished
      ? post.published_at || new Date().toISOString()
      : post.published_at;

    setTogglingId(post.id);
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id ? { ...p, is_published: nextPublished, published_at: nextPublishedAt } : p
      )
    );
    try {
      await updateAdminBlogPost(post.id, {
        is_published: nextPublished,
        published_at: nextPublishedAt,
      });
    } catch (error) {
      logger.error("Error toggling blog post status:", error);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? { ...p, is_published: post.is_published, published_at: post.published_at }
            : p
        )
      );
      toast.error("Erreur lors du changement de statut");
    } finally {
      setTogglingId(null);
    }
  };

  const columns: Column<BlogPost>[] = [
    {
      key: "title",
      label: "Article",
      render: (post) => (
        <div className="flex items-center gap-3">
          {post.image_url ? (
            <img
              src={getImageUrl(post.image_url, "blog")}
              alt={post.title}
              className="h-12 w-12 rounded-lg object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
              <FileText className="h-5 w-5 dark:text-gray-500" />
            </div>
          )}
          <div>
            <p className="font-medium dark:text-white">{post.title}</p>
            <p className="max-w-xs truncate text-sm dark:text-gray-500">
              {post.excerpt || post.content.slice(0, 60)}...
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "is_published",
      label: "Statut",
      render: (post) => (
        <StatusBadge
          label={post.is_published ? "Publie" : "Brouillon"}
          variant={post.is_published ? "success" : "warning"}
        />
      ),
    },
    {
      key: "created_at",
      label: "Date",
      render: (post) => (
        <div className="flex items-center gap-1 text-sm dark:text-gray-500">
          <Calendar className="h-4 w-4" />
          {format(new Date(post.created_at), "dd MMM yyyy")}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (post) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handleTogglePublished(post)}
            disabled={togglingId === post.id}
            className={cn(
              "rounded-lg border p-3 transition-colors disabled:opacity-50",
              post.is_published
                ? "border-green-300 bg-green-100 text-green-700 hover:bg-green-200 dark:border-green-700 dark:bg-green-900/40 dark:text-green-300 dark:hover:bg-green-900/60"
                : "border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            )}
            title={post.is_published ? "Repasser en brouillon" : "Publier"}
          >
            {togglingId === post.id ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Power className="h-6 w-6" />
            )}
          </button>
          <button
            onClick={() => handleEdit(post)}
            className="rounded-lg border border-gray-200 bg-gray-100 p-3 text-gray-700 transition-colors hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            <Edit2 className="h-6 w-6" />
          </button>
          <button
            onClick={() => {
              setConfirmTargetId(post.id);
              setConfirmOpen(true);
            }}
            className="rounded-lg border border-red-300 bg-red-100 p-3 text-red-700 transition-colors hover:bg-red-200 dark:border-red-700 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/60"
          >
            <Trash2 className="h-6 w-6" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <MobileNotOptimizedBanner />
      <div>
        <PageHeader title="Blog" subtitle={`${posts.length} article${posts.length > 1 ? "s" : ""}`}>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-primary-700"
          >
            <Plus className="h-5 w-5" />
            Nouvel article
          </button>
        </PageHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <AdminTable
            data={paginatedPosts}
            columns={columns}
            keyExtractor={(post) => post.id}

            emptyIcon={FileText}
            emptyMessage="Aucun article"
            total={posts.length}
            perPage={perPage}
            currentPage={currentPage}
            lastPage={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            onRowClick={(post) => {
              setEditingPost(post);
              setFormData({
                title: post.title,
                content: post.content || "",
                excerpt: post.excerpt || "",
                image_url: post.image_url || "",
                is_published: post.is_published,
                related_product_ids: post.related_product_ids || [],
              });
              setImageUrls(post.image_url ? [post.image_url] : []);
              setShowForm(true);
            }}
          />
        </motion.div>
      </div>

      <AdminDrawer
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingPost ? "Modifier l'article" : "Nouvel article"}
      >
        <div className="space-y-6 p-6">
          <div>
            <label className="mb-2 block text-sm font-medium dark:text-gray-300">Titre *</label>
            <input
              type="text"
              id="blog-title"
              name="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-lg border bg-white px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium dark:text-gray-300">Extrait</label>
            <textarea
              id="blog-excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={2}
              className="w-full rounded-lg border bg-white px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium dark:text-gray-300">Contenu *</label>
            <textarea
              id="blog-content"
              name="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={10}
              className="w-full rounded-lg border bg-white px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
            />
          </div>

          <ImageUpload
            value={imageUrls}
            onChange={setImageUrls}
            folder="blog"
            single
            maxFiles={1}
          />

          <div>
            <label className="mb-2 block text-sm font-medium dark:text-gray-300">
              Produits lies
            </label>
            <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border p-3 dark:border-gray-700">
              {products.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">Aucun produit disponible</p>
              ) : (
                products.map((product) => (
                  <label key={product.id} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.related_product_ids.includes(product.id)}
                      onChange={(e) => {
                        const ids = e.target.checked
                          ? [...formData.related_product_ids, product.id]
                          : formData.related_product_ids.filter((id) => id !== product.id);
                        setFormData({ ...formData, related_product_ids: ids });
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 dark:border-gray-600"
                    />
                    <span className="text-sm dark:text-gray-300">{product.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              id="blog-is_published"
              name="is_published"
              checked={formData.is_published}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-primary-600"
            />
            <span className="text-sm dark:text-gray-300">Publier immediatement</span>
          </label>

          <div className="flex gap-3 border-t pt-4 dark:border-gray-700">
            <button
              onClick={handleSave}
              disabled={saving || !formData.title || !formData.content}
              className="flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-lg border px-6 py-2.5 font-medium transition-colors hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              Annuler
            </button>
          </div>
        </div>
      </AdminDrawer>
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setConfirmTargetId(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Supprimer cet article ?"
        message="Cette action est irreversible."
        variant="danger"
      />
    </>
  );
}

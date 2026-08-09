import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { Plus, Edit2, Trash2, Star, Loader2 } from "lucide-react";
import { PageHeader } from "../../components/admin/PageHeader";
import { MobileNotOptimizedBanner } from "../../components/admin/MobileNotOptimizedBanner";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import {
  fetchAdminTestimonials,
  createAdminTestimonial,
  updateAdminTestimonial,
  deleteAdminTestimonial,
} from "../../services/admin";
import { format } from "date-fns";
import type { Testimonial } from "../../types";
import { Pagination } from "../../components/Pagination";

export function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    full_name: "",
    role: "",
    comment: "",
    rating: 5,
    is_active: true,
    sort_order: 0,
  });

  const fetchTestimonials = async () => {
    try {
      const data = await fetchAdminTestimonials();
      setTestimonials(data);
      setCurrentPage(1);
      setTotal(data.length);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(testimonials.length / perPage));
  const paginatedTestimonials = testimonials.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const resetForm = () => {
    setForm({ full_name: "", role: "", comment: "", rating: 5, is_active: true, sort_order: 0 });
    setEditing(null);
    setShowForm(false);
  };

  const openEdit = (t: Testimonial) => {
    setForm({
      full_name: t.full_name,
      role: t.role || "",
      comment: t.comment,
      rating: t.rating,
      is_active: t.is_active,
      sort_order: t.sort_order,
    });
    setEditing(t);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.full_name || !form.comment) {
      toast.error("Le nom et le commentaire sont requis");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateAdminTestimonial(editing.id, form);
        toast.success("Temoignage modifie");
      } else {
        await createAdminTestimonial(form);
        toast.success("Temoignage ajoute");
      }
      resetForm();
      await fetchTestimonials();
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteAdminTestimonial(deleteId);
      toast.success("Temoignage supprime");
      setDeleteId(null);
      await fetchTestimonials();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <>
      <MobileNotOptimizedBanner />
      <div>
        <PageHeader title="Temoignages" subtitle="Gerer les temoignages clients">
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" /> Ajouter
          </button>
        </PageHeader>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
          >
            <h3 className="mb-4 text-lg font-bold dark:text-white">
              {editing ? "Modifier" : "Ajouter"} un temoignage
            </h3>
            <div className="mb-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-gray-300">
                  Nom complet *
                </label>
                <input
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="w-full rounded-lg border px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-gray-300">
                  Role (optionnel)
                </label>
                <input
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full rounded-lg border px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium dark:text-gray-300">
                  Commentaire *
                </label>
                <textarea
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-gray-300">Note</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => setForm({ ...form, rating: n })} type="button">
                      <Star
                        className={`h-6 w-6 ${n <= form.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-gray-300">
                  Ordre d'affichage
                </label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-lg border px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="testimonial-active"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="h-4 w-4 rounded"
                />
                <label htmlFor="testimonial-active" className="text-sm dark:text-gray-300">
                  Actif
                </label>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sauvegarder"}
              </button>
              <button
                onClick={resetForm}
                className="rounded-lg border px-4 py-2 dark:border-gray-700 dark:text-gray-300"
              >
                Annuler
              </button>
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : testimonials.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-gray-500">Aucun temoignage</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedTestimonials.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex cursor-pointer items-start justify-between rounded-lg border bg-white p-6 transition-colors hover:border-primary-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-primary-700"
                onClick={() => openEdit(t)}
              >
                <div>
                  <div className="mb-2 flex items-center gap-3">
                    <h3 className="font-bold dark:text-white">{t.full_name}</h3>
                    {t.role && <span className="text-sm text-gray-500">{t.role}</span>}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${t.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      {t.is_active ? "Actif" : "Inactif"}
                    </span>
                  </div>
                  <div className="mb-2 flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={`h-4 w-4 ${n <= t.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t.comment}</p>
                  <p className="mt-2 text-xs text-gray-400">
                    {format(new Date(t.created_at), "dd MMM yyyy")}
                  </p>
                </div>
                <div className="flex flex-shrink-0 gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => openEdit(t)}
                    className="p-2 text-gray-500 hover:text-primary-600"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(t.id)}
                    className="p-2 text-gray-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <ConfirmDialog
          open={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          title="Supprimer"
          message="Ce temoignage sera definitivement supprime."
        />
        <>
          <Pagination
            currentPage={currentPage}
            lastPage={totalPages}
            perPage={perPage}
            total={total}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </>
      </div>
    </>
  );
}

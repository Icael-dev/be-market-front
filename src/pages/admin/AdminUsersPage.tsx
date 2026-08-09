import { useEffect, useState } from "react";
import { logger } from "../../lib/logger";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  restoreAdminUser,
  type StaffUserInput,
} from "../../services/admin";
import type { StaffUser, UserRole } from "../../types";
import { PageHeader } from "../../components/admin/PageHeader";
import { MobileNotOptimizedBanner } from "../../components/admin/MobileNotOptimizedBanner";
import { useAuth } from "../../context/AuthContext";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Loader2,
  UserCog,
  Mail,
  Phone,
  ShieldCheck,
  User as UserIcon,
  RotateCcw,
} from "lucide-react";
import { AdminTable, type Column } from "../../components/admin/AdminTable";
import { useEscape } from "../../hooks/useKeyPress";

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrateur",
  staff: "Staff / Secretaire",
  client: "Client",
};

const emptyForm = {
  full_name: "",
  email: "",
  password: "",
  phone: "",
  role: "staff" as UserRole,
};

export function AdminUsersPage() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  useEscape(() => setShowForm(false), showForm);
  const [editing, setEditing] = useState<StaffUser | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [form, setForm] = useState({ ...emptyForm });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<StaffUser | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await fetchAdminUsers();
      setUsers(data);
      setCurrentPage(1);
      setTotal(data.length);
    } catch (error) {
      logger.error("Error fetching users:", error);
      toast.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(users.length / perPage));
  const paginatedUsers = users.slice((currentPage - 1) * perPage, currentPage * perPage);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setErrors({});
    setShowForm(true);
  };

  const columns: Column<StaffUser>[] = [
    {
      key: "name",
      label: "Utilisateur",
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-cyan-500 font-medium text-white">
            {user.full_name?.[0] || user.email[0]}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {user.full_name || "Sans nom"}
            </p>
            {user.deleted_at ? (
              <span className="mt-0.5 inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                Supprime
              </span>
            ) : (
              isSelf(user) && (
                <span className="text-xs text-primary-600 dark:text-primary-400">Vous</span>
              )
            )}
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      label: "Contact",
      render: (user) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Mail className="h-4 w-4" />
            {user.email}
          </div>
          {user.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Phone className="h-4 w-4" />
              {user.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (user) => (
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
            user.role === "admin"
              ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
              : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
          }`}
        >
          {user.role === "admin" ? (
            <ShieldCheck className="h-3.5 w-3.5" />
          ) : (
            <UserIcon className="h-3.5 w-3.5" />
          )}
          {ROLE_LABELS[user.role]}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (user) => (
        <div className="flex items-center justify-end gap-2">
          {user.deleted_at ? (
            <button
              onClick={() => handleRestoreUser(user.id)}
              disabled={restoringId === user.id}
              className="flex items-center gap-1 rounded-lg border border-blue-300 bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-200 disabled:opacity-50 dark:border-blue-700 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60"
            >
              {restoringId === user.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
              Restaurer
            </button>
          ) : (
            <>
              <button
                onClick={() => openEdit(user)}
                className="rounded-lg border border-gray-200 bg-gray-100 p-2 text-gray-700 transition-colors hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                title="Modifier"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setConfirmTarget(user);
                  setConfirmOpen(true);
                }}
                disabled={deletingId === user.id || isSelf(user)}
                className="rounded-lg border border-red-300 bg-red-100 p-2 text-red-700 transition-colors hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-40 dark:border-red-700 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/60"
                title={isSelf(user) ? "Vous ne pouvez pas supprimer votre compte" : "Supprimer"}
              >
                {deletingId === user.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const fieldError = (field: string) => errors[field]?.[0];

  const openEdit = (user: StaffUser) => {
    setEditing(user);
    setForm({
      full_name: user.full_name || "",
      email: user.email,
      password: "",
      phone: user.phone || "",
      // On preserve le role reel du compte. On ne force jamais un client
      // vers staff : sinon un simple enregistrement promouvrait le compte.
      role: user.role,
    });
    setErrors({});
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.full_name || !form.email) return;
    if (!editing && !form.password) {
      setErrors({ password: ["Le mot de passe est requis"] });
      return;
    }
    setSaving(true);
    setErrors({});

    try {
      if (editing) {
        const payload: Partial<StaffUserInput> = {
          full_name: form.full_name,
          email: form.email,
          phone: form.phone || null,
          role: form.role,
        };
        if (form.password) payload.password = form.password;
        await updateAdminUser(editing.id, payload);
        toast.success("Utilisateur mis a jour");
      } else {
        await createAdminUser({
          full_name: form.full_name,
          email: form.email,
          password: form.password,
          phone: form.phone || null,
          role: form.role,
        });
        toast.success("Utilisateur cree");
      }
      await loadUsers();
      setShowForm(false);
    } catch (err: unknown) {
      const e = err as { errors?: Record<string, string[]>; message?: string };
      if (e?.errors) {
        setErrors(e.errors);
      } else {
        toast.error(e?.message || "Erreur lors de l'enregistrement");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmTarget) return;
    setDeletingId(confirmTarget.id);
    try {
      await deleteAdminUser(confirmTarget.id);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === confirmTarget.id ? { ...u, deleted_at: new Date().toISOString() } : u
        )
      );
      toast.success("Utilisateur supprime (masque)");
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast.error(e?.message || "Erreur lors de la suppression");
    } finally {
      setConfirmOpen(false);
      setConfirmTarget(null);
      setDeletingId(null);
    }
  };

  const handleRestoreUser = async (userId: string) => {
    setRestoringId(userId);
    try {
      const restored = await restoreAdminUser(userId);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, ...restored, deleted_at: null } : u))
      );
      toast.success("Utilisateur restaure");
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast.error(e?.message || "Erreur lors de la restauration");
    } finally {
      setRestoringId(null);
    }
  };

  // Detecte le compte de l'utilisateur connecte. On compare a la fois par id
  // (selon la semantique backend, StaffUser.id peut valoir user_id ou un id
  // de profil) et par email, identifiant naturel unique et stable, pour que
  // le garde anti-auto-suppression fonctionne quel que soit le schema d'id.
  const isSelf = (user: StaffUser) =>
    (!!profile?.user_id && profile.user_id === user.id) ||
    (!!profile?.email && profile.email.toLowerCase() === user.email.toLowerCase());

  return (
    <>
      <MobileNotOptimizedBanner />
      <div>
        <PageHeader
          title="Utilisateurs"
          subtitle={`${users.length} membre${users.length > 1 ? "s" : ""} de l'equipe`}
        >
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-primary-700"
          >
            <Plus className="h-5 w-5" />
            Ajouter un utilisateur
          </button>
        </PageHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <AdminTable
            data={paginatedUsers}
            columns={columns}
            keyExtractor={(user) => user.id}

            emptyIcon={UserCog}
            emptyMessage="Aucun utilisateur"
            loading={loading}
            total={total}
            perPage={perPage}
            currentPage={currentPage}
            lastPage={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </motion.div>
      </div>

      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="fixed inset-0 z-50 bg-black/50"
            />
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              className="fixed bottom-0 right-0 top-0 z-50 w-full max-w-lg overflow-y-auto bg-white dark:bg-gray-800"
            >
              <div className="sticky top-0 flex items-center justify-between border-b bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <h2 className="text-xl font-bold dark:text-white">
                  {editing ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="rounded-lg p-3 transition-colors hover:bg-gray-100 hover:dark:bg-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-5 p-6">
                <div>
                  <label className="mb-2 block text-sm font-medium dark:text-gray-300">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    id="user-full_name"
                    name="full_name"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="w-full rounded-lg border px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
                    placeholder="Ex: Awa Diop"
                  />
                  {fieldError("full_name") && (
                    <p className="mt-1 text-xs text-red-500">{fieldError("full_name")}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium dark:text-gray-300">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="user-email"
                    name="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-lg border px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
                    placeholder="secretaire@example.com"
                  />
                  {fieldError("email") && (
                    <p className="mt-1 text-xs text-red-500">{fieldError("email")}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium dark:text-gray-300">
                    Telephone
                  </label>
                  <input
                    type="text"
                    id="user-phone"
                    name="phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full rounded-lg border px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
                    placeholder="+221 ..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium dark:text-gray-300">
                    {editing
                      ? "Nouveau mot de passe (laisser vide pour ne pas changer)"
                      : "Mot de passe *"}
                  </label>
                  <input
                    type="password"
                    id="user-password"
                    name="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full rounded-lg border px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
                    placeholder="Minimum 8 caracteres"
                    autoComplete="new-password"
                  />
                  {fieldError("password") && (
                    <p className="mt-1 text-xs text-red-500">{fieldError("password")}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium dark:text-gray-300">
                    Role *
                  </label>
                  <select
                    id="user-role"
                    name="role"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                    className="w-full rounded-lg border px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
                  >
                    {editing?.role === "client" && (
                      <option value="client">Client (compte boutique)</option>
                    )}
                    <option value="staff">Staff / Secretaire (acces restreint)</option>
                    <option value="admin">Administrateur (acces complet)</option>
                  </select>
                  <p className="mt-1 text-xs dark:text-gray-500">
                    Le staff n'a pas acces aux parametres ni a la gestion des utilisateurs.
                  </p>
                  {fieldError("role") && (
                    <p className="mt-1 text-xs text-red-500">{fieldError("role")}</p>
                  )}
                </div>

                <div className="flex gap-3 border-t pt-4 dark:border-gray-700">
                  <button
                    onClick={handleSave}
                    disabled={saving || !form.full_name || !form.email}
                    className="flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 font-medium text-white hover:bg-primary-700 disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
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
            </motion.div>
          </>
        )}
        <ConfirmDialog
          open={confirmOpen}
          onClose={() => {
            setConfirmOpen(false);
            setConfirmTarget(null);
          }}
          onConfirm={handleConfirmDelete}
          title={
            confirmTarget
              ? `Supprimer le compte de ${confirmTarget.full_name || confirmTarget.email} ?`
              : "Supprimer cet utilisateur ?"
          }
          message="Cette action est irreversible."
          variant="danger"
        />
      </AnimatePresence>
    </>
  );
}

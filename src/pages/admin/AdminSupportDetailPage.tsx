import { useEffect, useState, useRef, useCallback } from "react";
import { logger } from "../../lib/logger";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  fetchAdminSupportTicket,
  updateAdminSupportTicket,
  sendAdminSupportMessage,
} from "../../services/admin";
import { PageHeader } from "../../components/admin/PageHeader";
import { MobileNotOptimizedBanner } from "../../components/admin/MobileNotOptimizedBanner";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import type { SupportTicket } from "../../types";
import { format } from "date-fns";
import { cn, getPriorityColor, getPriorityLabel } from "../../lib/utils";

const STATUS_OPTIONS = [
  { value: "open", label: "Ouvert" },
  { value: "in_progress", label: "En cours" },
  { value: "resolved", label: "Resolu" },
  { value: "closed", label: "Ferme" },
];

export function AdminSupportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await fetchAdminSupportTicket(id);
      setTicket(data);
    } catch (error) {
      logger.error("Failed to load support ticket:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages?.length]);

  const handleStatusChange = async (status: string) => {
    if (!id || !ticket) return;
    setSaving(true);
    try {
      const updated = await updateAdminSupportTicket(id, { status });
      setTicket(updated);
    } catch (error) {
      logger.error("Failed to update ticket:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSendMessage = async () => {
    if (!id || !message.trim()) return;
    setSending(true);
    try {
      await sendAdminSupportMessage(id, message.trim());
      await load();
      setMessage("");
    } catch (error) {
      logger.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <>
        <MobileNotOptimizedBanner />
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </>
    );
  }

  if (!ticket) {
    return (
      <>
        <MobileNotOptimizedBanner />
        <div>
          <p className="text-gray-500 dark:text-gray-400">Ticket introuvable</p>
        </div>
      </>
    );
  }

  return (
    <>
      <MobileNotOptimizedBanner />
      <div>
        <PageHeader title={ticket.subject} subtitle={ticket.user?.email || ""}>
          <Link
            to="/admin/support"
            className="flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
        </PageHeader>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="card p-6">
              <h2 className="mb-4 font-bold dark:text-white">Conversation</h2>
              <div className="max-h-[500px] space-y-4 overflow-y-auto pr-2">
                {(ticket.messages || []).map((msg, index) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "flex flex-col gap-1 rounded-lg p-4",
                      msg.is_from_admin
                        ? "ml-8 bg-primary-50 dark:bg-primary-900/20"
                        : "mr-8 bg-gray-100 dark:bg-gray-800"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {msg.is_from_admin
                          ? "Vous"
                          : msg.user?.profile?.full_name || msg.user?.email || "Client"}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {format(new Date(msg.created_at), "dd/MM/yyyy HH:mm")}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm dark:text-gray-200">{msg.message}</p>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="mt-4 flex gap-3 border-t pt-4 dark:border-gray-700">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Repondre au client..."
                  rows={3}
                  className="flex-1 resize-none rounded-lg border px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !message.trim()}
                  className="flex items-center gap-2 self-end rounded-lg bg-primary-600 px-4 py-3 text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Envoyer
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="card p-6">
              <h3 className="mb-4 font-bold dark:text-white">Informations</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Client</p>
                  <p className="font-medium dark:text-white">{ticket.user?.email || "—"}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Sujet</p>
                  <p className="font-medium dark:text-white">{ticket.subject}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Priorite</p>
                  <p className="font-medium capitalize dark:text-white">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${getPriorityColor(ticket.priority)}`}
                    >
                      {getPriorityLabel(ticket.priority)}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Cree le</p>
                  <p className="font-medium dark:text-white">
                    {format(new Date(ticket.created_at), "dd/MM/yyyy HH:mm")}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="mb-4 font-bold dark:text-white">Statut</h3>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleStatusChange(option.value)}
                    disabled={saving || ticket.status === option.value}
                    className={cn(
                      "rounded-lg px-3 py-2 text-xs font-medium transition-colors disabled:opacity-50",
                      ticket.status === option.value
                        ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

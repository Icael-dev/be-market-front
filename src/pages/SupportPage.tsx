import { useEffect, useState, useCallback } from "react";
import { logger } from "../lib/logger";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  fetchSupportTickets,
  createSupportTicket,
  fetchSupportTicket,
  createSupportMessage,
} from "../services/support";
import type { SupportTicket, SupportMessage } from "../types";
import { getStatusLabel, getStatusColor, getPriorityColor, getPriorityLabel } from "../lib/utils";
import { MessageSquare, Send, Clock, Loader2, Plus, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { Link, useParams } from "react-router-dom";
import { InputField, TextareaField } from "../components/ui/FormField";
import { useEscape } from "../hooks/useKeyPress";

export function SupportPage() {
  const { user: authUser } = useAuth();

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [showForm, setShowForm] = useState(false);
  useEscape(() => setShowForm(false), showForm);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<"low" | "normal" | "high" | "urgent">("normal");
  const [errors, setErrors] = useState<{ subject?: string; message?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authUser) fetchTickets();
  }, [authUser]);

  const fetchTickets = async () => {
    try {
      const data = await fetchSupportTickets();
      setTickets(data);
    } catch (error) {
      logger.error("Error fetching support tickets:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: { subject?: string; message?: string } = {};
    if (!subject.trim()) nextErrors.subject = "Le sujet est requis";
    if (!message.trim()) nextErrors.message = "Le message est requis";
    else if (message.trim().length < 10)
      nextErrors.message = "Le message doit faire au moins 10 caracteres";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);

    try {
      await createSupportTicket({ subject, message, priority });
      await fetchTickets();
      setShowForm(false);
      setSubject("");
      setMessage("");
      setErrors({});
    } catch (error) {
      logger.error("Error creating support ticket:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!authUser) {
    return (
      <div className="page-bg min-h-screen py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <MessageSquare className="mx-auto mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Support client</h1>
          <p className="mb-6 text-gray-500 dark:text-gray-400">
            Connectez-vous pour acceder au support
          </p>
          <Link to="/login" className="font-medium text-primary-600 hover:underline">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-bg min-h-screen py-8">
      <div className="mx-auto max-w-4xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mes demandes</h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              {tickets.length} ticket{tickets.length > 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary-sm flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Nouvelle demande
          </button>
        </motion.div>

        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="card mb-6 p-6"
          >
            <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
              Nouvelle demande
            </h2>
            <InputField
              name="subject"
              label="Sujet"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              error={errors.subject}
              placeholder="Ex: Probleme avec ma commande"
            />
            <div className="mt-4">
              <TextareaField
                name="message"
                label="Message"
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                error={errors.message}
                placeholder="Decrivez votre probleme..."
              />
            </div>
            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Priorite
              </label>
              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as "low" | "normal" | "high" | "urgent")
                }
                className="w-full rounded-lg border bg-white px-4 py-2.5 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="low">Basse</option>
                <option value="normal">Normale</option>
                <option value="high">Haute</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
            <div className="mt-2 flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Envoyer
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-ghost-sm px-6 py-2.5"
              >
                Annuler
              </button>
            </div>
          </motion.form>
        )}

        <div className="space-y-4">
          {tickets.map((ticket, index) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card p-4"
            >
              <Link to={`/support/${ticket.id}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {ticket.subject}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${getPriorityColor(ticket.priority)}`}
                      >
                        {getPriorityLabel(ticket.priority)}
                      </span>
                    </div>
                    <p className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      {format(new Date(ticket.created_at), "dd MMM yyyy HH:mm")}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(ticket.status)}`}
                  >
                    {getStatusLabel(ticket.status)}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TicketDetailPage() {
  // auth not required for ticket detail (messages are loaded server-side)

  const { id } = useParams();
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  const fetchTicket = useCallback(async () => {
    try {
      if (!id) return;
      const ticketData = await fetchSupportTicket(id);
      setTicket(ticketData);
      setMessages(ticketData.messages ?? []);
    } catch (error) {
      logger.error("Error fetching ticket details:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchTicket();
  }, [id, fetchTicket]);

  const handleSend = async () => {
    if (!newMessage.trim() || !ticket) return;
    setReplyError(null);
    setSending(true);
    try {
      await createSupportMessage(ticket.id, newMessage);
      await fetchTicket();
      setNewMessage("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de l'envoi";
      setReplyError(message);
    } finally {
      setSending(false);
    }
  };

  if (loading)
    return (
      <div className="page-bg flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );

  if (!ticket) {
    return (
      <div className="page-bg min-h-screen py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="mb-4 text-gray-500 dark:text-gray-400">Ticket non trouve</p>
          <Link to="/support" className="font-medium text-primary-600 hover:underline">
            Retour
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-bg min-h-screen py-8">
      <div className="mx-auto max-w-4xl px-4">
        <Link
          to="/support"
          className="mb-6 inline-block flex items-center gap-1 font-medium text-primary-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>
        <div className="card overflow-hidden">
          <div className="border-b border-gray-200 p-6 dark:border-gray-800">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{ticket.subject}</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Ticket #{ticket.id.slice(0, 8)} - {format(new Date(ticket.created_at), "dd MMM yyyy")}
            </p>
          </div>
          <div className="max-h-96 space-y-4 overflow-y-auto p-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.is_from_admin ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${msg.is_from_admin ? "bg-gray-100 dark:bg-gray-800" : "bg-primary-600 text-white"}`}
                >
                  <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
                  <p
                    className={`mt-2 text-xs ${msg.is_from_admin ? "text-gray-500 dark:text-gray-400" : "text-primary-200"}`}
                  >
                    {format(new Date(msg.created_at), "HH:mm")}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 p-4 dark:border-gray-800">
            <div className="flex gap-3">
              <input
                type="text"
                id="ticket-reply"
                name="reply"
                aria-label="Repondre au ticket"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Repondre..."
                className="flex-1 rounded-lg border-2 border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                onClick={handleSend}
                disabled={sending || !newMessage}
                className="btn-primary p-3 disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
            {replyError && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{replyError}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

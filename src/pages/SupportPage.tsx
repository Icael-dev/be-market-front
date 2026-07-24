import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { fetchSupportTickets, createSupportTicket, fetchSupportTicket, createSupportMessage } from '../services/support';
import type { SupportTicket, SupportMessage } from '../types';
import { MessageSquare, Send, Clock, Loader2, Plus, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Link, useParams } from 'react-router-dom';
import { InputField, TextareaField } from '../components/ui/FormField';
import { useEscape } from '../hooks/useKeyPress';

export function SupportPage() {
  const { user: authUser } = useAuth();

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [showForm, setShowForm] = useState(false);
  useEscape(() => setShowForm(false), showForm);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
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
      console.error('Error fetching support tickets:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: { subject?: string; message?: string } = {};
    if (!subject.trim()) nextErrors.subject = 'Le sujet est requis';
    if (!message.trim()) nextErrors.message = 'Le message est requis';
    else if (message.trim().length < 10) nextErrors.message = 'Le message doit faire au moins 10 caracteres';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);

    try {
      await createSupportTicket({ subject, message });
      await fetchTickets();
      setShowForm(false);
      setSubject('');
      setMessage('');
      setErrors({});
    } catch (error) {
      console.error('Error creating support ticket:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const statusColors: Record<string, string> = {
    open: 'bg-yellow-100 text-yellow-700',
    in_progress: 'bg-primary-100 text-primary-700',
    resolved: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-700'
  };

  const statusLabels: Record<string, string> = {
    open: 'Ouvert',
    in_progress: 'En cours',
    resolved: 'Resolu',
    closed: 'Ferme'
  };

  if (!authUser) {

    return (
      <div className="min-h-screen page-bg py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Support client</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Connectez-vous pour acceder au support</p>
          <Link to="/login" className="text-primary-600 font-medium hover:underline">Se connecter</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-bg py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mes demandes</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{tickets.length} ticket{tickets.length > 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 btn-primary-sm">
            <Plus className="w-5 h-5" />
            Nouvelle demande
          </button>
        </motion.div>

        {showForm && (
          <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="card p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Nouvelle demande</h2>
            <InputField
              name="subject"
              label="Sujet"
              required
              value={subject}
              onChange={e => setSubject(e.target.value)}
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
                onChange={e => setMessage(e.target.value)}
                error={errors.message}
                placeholder="Decrivez votre probleme..."
              />
            </div>
            <div className="flex gap-3 mt-2">
              <button type="submit" disabled={submitting} className="flex items-center gap-2 btn-primary disabled:opacity-50">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Envoyer
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 btn-ghost-sm">Annuler</button>
            </div>
          </motion.form>
        )}

<div className="space-y-4">
           {tickets.map((ticket, index) => (
             <motion.div key={ticket.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="card p-4">
               <Link to={`/support/${ticket.id}`}>
                 <div className="flex items-start justify-between gap-4">
                   <div className="flex-1">
                     <h3 className="font-medium text-gray-900 dark:text-white">{ticket.subject}</h3>
                     <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {format(new Date(ticket.created_at), 'dd MMM yyyy a HH:mm')}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[ticket.status]}`}>{statusLabels[ticket.status]}</span>
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
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  const fetchTicket = useCallback(async () => {
    try {
      if (!id) return;
      const ticketData = await fetchSupportTicket(id);
      setTicket(ticketData);
      setMessages(ticketData.messages ?? []);
    } catch (error) {
      console.error('Error fetching ticket details:', error);
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
      setNewMessage('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'envoi';
      setReplyError(message);
    } finally {
      setSending(false);
    }
  };

if (loading) return <div className="min-h-screen page-bg flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;

  if (!ticket) {
    return (
      <div className="min-h-screen page-bg py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Ticket non trouve</p>
          <Link to="/support" className="text-primary-600 font-medium hover:underline">Retour</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-bg py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link to="/support" className="text-primary-600 font-medium hover:underline mb-6 inline-block flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Retour</Link>
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{ticket.subject}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ticket #{ticket.id.slice(0, 8)} - {format(new Date(ticket.created_at), 'dd MMM yyyy')}</p>
          </div>
          <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.is_from_admin ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] p-4 rounded-xl ${msg.is_from_admin ? 'bg-gray-100 dark:bg-gray-800' : 'bg-primary-600 text-white'}`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  <p className={`text-xs mt-2 ${msg.is_from_admin ? 'text-gray-500 dark:text-gray-400' : 'text-primary-200'}`}>{format(new Date(msg.created_at), 'HH:mm')}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex gap-3">
              <input type="text" id="ticket-reply" name="reply" aria-label="Repondre au ticket" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Repondre..."               className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-500" onKeyPress={e => e.key === 'Enter' && handleSend()} />
              <button onClick={handleSend} disabled={sending || !newMessage} className="p-3 btn-primary disabled:opacity-50"><Send className="w-5 h-5" /></button>
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
import { useEffect, useState, useRef, useCallback } from 'react';
import { logger } from '../../lib/logger';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  fetchAdminSupportTicket,
  updateAdminSupportTicket,
  sendAdminSupportMessage
} from '../../services/admin';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { PageHeader } from '../../components/admin/PageHeader';
import { MobileNotOptimizedBanner } from '../../components/admin/MobileNotOptimizedBanner';
import { ArrowLeft, Loader2, Send } from 'lucide-react';
import type { SupportTicket } from '../../types';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';

const STATUS_OPTIONS = [
  { value: 'open', label: 'Ouvert' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'resolved', label: 'Resolu' },
  { value: 'closed', label: 'Ferme' },
];

export function AdminSupportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await fetchAdminSupportTicket(id);
      setTicket(data);
    } catch (error) {
      logger.error('Failed to load support ticket:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages?.length]);

  const handleStatusChange = async (status: string) => {
    if (!id || !ticket) return;
    setSaving(true);
    try {
      const updated = await updateAdminSupportTicket(id, { status });
      setTicket(updated);
    } catch (error) {
      logger.error('Failed to update ticket:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSendMessage = async () => {
    if (!id || !message.trim()) return;
    setSending(true);
    try {
      const newMessage = await sendAdminSupportMessage(id, message.trim());
      setTicket(prev => prev ? { ...prev, messages: [...(prev.messages || []), newMessage] } : prev);
      setMessage('');
    } catch (error) {
      logger.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <MobileNotOptimizedBanner />
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>
      </AdminLayout>
    );
  }

  if (!ticket) {
    return (
      <AdminLayout>
        <MobileNotOptimizedBanner />
        <div className="p-6 lg:p-8">
          <p className="text-gray-500 dark:text-gray-400">Ticket introuvable</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <MobileNotOptimizedBanner />
      <div className="p-6 lg:p-8">
        <PageHeader
          title={ticket.subject}
          subtitle={ticket.user?.email || ''}
        >
          <Link to="/admin/support" className="flex items-center gap-2 px-4 py-2.5 border dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Link>
        </PageHeader>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="card p-6">
              <h2 className="font-bold dark:text-white mb-4">Conversation</h2>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {(ticket.messages || []).map((msg, index) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      'flex flex-col gap-1 p-4 rounded-2xl',
                      msg.is_from_admin
                        ? 'bg-primary-50 dark:bg-primary-900/20 ml-8'
                        : 'bg-gray-100 dark:bg-gray-800 mr-8'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {msg.is_from_admin ? 'Vous' : msg.user?.profile?.full_name || msg.user?.email || 'Client'}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {format(new Date(msg.created_at), 'dd/MM/yyyy HH:mm')}
                      </span>
                    </div>
                    <p className="text-sm dark:text-gray-200 whitespace-pre-wrap">{msg.message}</p>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="mt-4 pt-4 border-t dark:border-gray-700 flex gap-3">
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Repondre au client..."
                  rows={3}
                  className="flex-1 px-4 py-3 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:bg-gray-800 dark:text-white resize-none"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !message.trim()}
                  className="self-end px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Envoyer
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="card p-6">
              <h3 className="font-bold dark:text-white mb-4">Informations</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Client</p>
                  <p className="font-medium dark:text-white">{ticket.user?.email || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Sujet</p>
                  <p className="font-medium dark:text-white">{ticket.subject}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Priorite</p>
                  <p className="font-medium dark:text-white capitalize">{ticket.priority}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Cree le</p>
                  <p className="font-medium dark:text-white">{format(new Date(ticket.created_at), 'dd/MM/yyyy HH:mm')}</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-bold dark:text-white mb-4">Statut</h3>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleStatusChange(option.value)}
                    disabled={saving || ticket.status === option.value}
                    className={cn(
                      'px-3 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50',
                      ticket.status === option.value
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
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
    </AdminLayout>
  );
}

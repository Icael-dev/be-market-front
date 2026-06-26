import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { formatPrice } from '../../lib/utils';
import { DollarSign, ShoppingCart, Users, Package, ArrowUpRight, ArrowDownRight, Download } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export function AdminStatisticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState<'7' | '30' | '90'>('30');

  useEffect(() => { fetchStats(); }, [days]);

  const fetchStats = async () => {
    const numDays = parseInt(days);
    const start = subDays(new Date(), numDays);
    const prevStart = subDays(start, numDays);

    const [curr, prev, prods, custs] = await Promise.all([
      supabase.from('orders').select('*').gte('created_at', start.toISOString()),
      supabase.from('orders').select('*').gte('created_at', prevStart.toISOString()).lt('created_at', start.toISOString()),
      supabase.from('products').select('id', { count: 'exact' }),
      supabase.from('profiles').select('id').gte('created_at', start.toISOString())
    ]);

    const currData = curr.data || [];
    const prevData = prev.data || [];

    const totalRevenue = currData.reduce((s, o) => s + (o.payment_status === 'paid' ? o.total : 0), 0);
    const prevRevenue = prevData.reduce((s, o) => s + (o.payment_status === 'paid' ? o.total : 0), 0);

    const daysArr = eachDayOfInterval({ start, end: new Date() });
    const daily = daysArr.map(d => ({
      date: format(d, 'dd MMM'),
      revenue: currData.filter(o => new Date(o.created_at).toDateString() === d.toDateString()).reduce((s, o) => s + (o.payment_status === 'paid' ? o.total : 0), 0),
      orders: currData.filter(o => new Date(o.created_at).toDateString() === d.toDateString()).length
    }));

    const statusDist: Record<string, number> = {};
    currData.forEach(o => { statusDist[o.status] = (statusDist[o.status] || 0) + 1; });
    const statusData = Object.entries(statusDist).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));

    const paymentDist: Record<string, number> = {};
    currData.forEach(o => { if (o.payment_method) paymentDist[o.payment_method] = (paymentDist[o.payment_method] || 0) + 1; });
    const paymentData = Object.entries(paymentDist).map(([name, value]) => ({ name: name === 'tmoney' ? 'Tmoney' : name === 'flooz' ? 'Flooz' : 'Livraison', value }));

    setStats({
      totalRevenue,
      totalOrders: currData.length,
      totalProducts: prods.count || 0,
      newCustomers: custs.data?.length || 0,
      revenueChange: prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0,
      ordersChange: prevData.length > 0 ? ((currData.length - prevData.length) / prevData.length) * 100 : 0,
      avgOrder: currData.length > 0 ? totalRevenue / currData.length : 0,
      dailyRevenue: daily,
      statusData,
      paymentData
    });
    setLoading(false);
  };

  const exportData = () => {
    if (!stats) return;
    const csv = [['Date', 'Revenus', 'Commandes'], ...stats.dailyRevenue.map((d: any) => [d.date, d.revenue, d.orders])].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `stats-${format(new Date(), 'yyyy-MM-dd')}.csv`; a.click();
  };

  const cards = stats ? [
    { title: 'Revenus', value: formatPrice(stats.totalRevenue), change: stats.revenueChange, icon: DollarSign, gradient: 'from-green-500 to-emerald-500' },
    { title: 'Commandes', value: stats.totalOrders.toString(), change: stats.ordersChange, icon: ShoppingCart, gradient: 'from-blue-500 to-cyan-500' },
    { title: 'Nouveaux clients', value: stats.newCustomers.toString(), change: 0, icon: Users, gradient: 'from-purple-500 to-pink-500' },
    { title: 'Panier moyen', value: formatPrice(stats.avgOrder), change: 0, icon: Package, gradient: 'from-orange-500 to-amber-500' }
  ] : [];

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div><h1 className="text-2xl font-bold text-gray-900">Statistiques</h1><p className="text-gray-500">Performances de la boutique</p></div>
          <div className="flex gap-3">
            <select value={days} onChange={e => setDays(e.target.value as any)} className="px-4 py-2 border border-gray-200 rounded-xl"><option value="7">7 jours</option><option value="30">30 jours</option><option value="90">90 jours</option></select>
            <button onClick={exportData} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800"><Download className="w-4 h-4" /> Exporter</button>
          </div>
        </motion.div>

        {loading ? <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full" /></div> : stats && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {cards.map((c, i) => (
                <motion.div key={c.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4"><div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center`}><c.icon className="w-6 h-6 text-white" /></div>{c.change !== 0 && (<div className={`flex items-center gap-1 text-sm ${c.change >= 0 ? 'text-green-600' : 'text-red-500'}`}>{c.change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}{Math.abs(c.change).toFixed(1)}%</div>)}</div>
                  <p className="text-2xl font-bold text-gray-900">{c.value}</p><p className="text-sm text-gray-500 mt-1">{c.title}</p>
                </motion.div>
              ))}
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6"><h3 className="text-lg font-bold text-gray-900 mb-4">Revenus quotidiens</h3><div className="h-64"><ResponsiveContainer width="100%" height="100%"><AreaChart data={stats.dailyRevenue}><CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" /><XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9CA3AF" /><YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" tickFormatter={v => `${(v/1000).toFixed(0)}k`} /><Tooltip formatter={(value: any) => formatPrice(Number(value) || 0)} contentStyle={{ background: '#1F2937', border: 'none', borderRadius: '12px', color: 'white' }} /><Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="#3B82F620" /></AreaChart></ResponsiveContainer></div></div>
              <div className="bg-white rounded-2xl border border-gray-200 p-6"><h3 className="text-lg font-bold text-gray-900 mb-4">Commandes par jour</h3><div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={stats.dailyRevenue}><CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" /><XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9CA3AF" /><YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" /><Tooltip contentStyle={{ background: '#1F2937', border: 'none', borderRadius: '12px', color: 'white' }} /><Bar dataKey="orders" fill="#3B82F6" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></div>
              <div className="bg-white rounded-2xl border border-gray-200 p-6"><h3 className="text-lg font-bold text-gray-900 mb-4">Statuts commandes</h3><div className="h-48"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={stats.statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>{stats.statusData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div></div>
              <div className="bg-white rounded-2xl border border-gray-200 p-6"><h3 className="text-lg font-bold text-gray-900 mb-4">Methodes paiement</h3><div className="h-48"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={stats.paymentData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>{stats.paymentData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div></div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
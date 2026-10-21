import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, RefreshCw, Users, BookOpen, Flag, Star, Check, X } from 'lucide-react';

const ADMIN_EMAIL = 'suryakalagollapalli268@gmail.com';
type Report = { id: string; resourceTitle: string; reporterEmail?: string; reason: string; details?: string; createdAt: string };
type Overview = { stats: { users: number; resources: number; pendingReports: number; reviews: number }; reports: Report[] };

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const load = async () => {
    setLoading(true); setError('');
    try { setData(await api<Overview>('/api/admin/overview')); }
    catch (e: any) { setError(e.message || 'Could not load admin dashboard.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { if (user?.email?.toLowerCase() === ADMIN_EMAIL) void load(); else setLoading(false); }, [user?.email]);
  const updateReport = async (id: string, status: 'reviewed' | 'dismissed') => {
    setBusy(id);
    try { await api('/api/admin/reports/' + encodeURIComponent(id), { method: 'PATCH', body: JSON.stringify({ status }) }); await load(); }
    catch (e: any) { setError(e.message || 'Could not update report.'); }
    finally { setBusy(''); }
  };
  if (!user || user.email.toLowerCase() !== ADMIN_EMAIL) return <div className="max-w-3xl mx-auto p-10 text-center"><ShieldCheck className="mx-auto w-10 h-10 text-rose-500 mb-3"/><h1 className="text-xl font-bold">Admin access only</h1><p className="text-sm text-slate-500 mt-2">This account is not authorized to view the administration dashboard.</p></div>;
  const cards = [{ label: 'Students', value: data?.stats.users ?? 0, icon: Users }, { label: 'Resources', value: data?.stats.resources ?? 0, icon: BookOpen }, { label: 'Pending reports', value: data?.stats.pendingReports ?? 0, icon: Flag }, { label: 'Reviews', value: data?.stats.reviews ?? 0, icon: Star }];
  return <div className="max-w-6xl mx-auto px-4 py-10 space-y-7">
    <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Administration</p><h1 className="text-3xl font-black text-slate-900 flex items-center gap-2"><ShieldCheck/> Admin Dashboard</h1><p className="text-sm text-slate-500 mt-1">Monitor platform activity and review student-submitted reports.</p></div><button onClick={() => void load()} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-semibold"><RefreshCw className="w-4 h-4"/> Refresh</button></div>
    {error && <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-sm">{error}</div>}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{cards.map(c => <div key={c.label} className="bg-white rounded-2xl p-5 border border-slate-200"><c.icon className="w-5 h-5 text-indigo-600 mb-3"/><p className="text-2xl font-black">{loading ? '—' : c.value}</p><p className="text-xs text-slate-500 font-semibold">{c.label}</p></div>)}</div>
    <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden"><div className="p-5 border-b border-slate-100"><h2 className="font-bold text-lg">Pending resource reports</h2><p className="text-xs text-slate-500 mt-1">Review reported content and record a moderation decision.</p></div>
      {loading ? <p className="p-8 text-center text-sm text-slate-500">Loading dashboard…</p> : !data?.reports.length ? <p className="p-8 text-center text-sm text-slate-500">No pending reports. All clear!</p> : <div className="divide-y divide-slate-100">{data.reports.map(r => <article key={r.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"><div className="min-w-0"><h3 className="font-bold text-slate-900">{r.resourceTitle || 'Untitled resource'}</h3><p className="text-xs text-slate-500 mt-1">Reason: {r.reason.replaceAll('_',' ')} · {r.reporterEmail || 'Student report'} · {new Date(r.createdAt).toLocaleString()}</p>{r.details && <p className="text-sm text-slate-700 mt-2">{r.details}</p>}</div><div className="flex gap-2 shrink-0"><button disabled={busy===r.id} onClick={() => void updateReport(r.id,'reviewed')} className="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold disabled:opacity-50"><Check className="w-3 h-3 inline mr-1"/> Mark reviewed</button><button disabled={busy===r.id} onClick={() => void updateReport(r.id,'dismissed')} className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold disabled:opacity-50"><X className="w-3 h-3 inline mr-1"/> Dismiss</button></div></article>)}</div>}
    </section>
  </div>;
};

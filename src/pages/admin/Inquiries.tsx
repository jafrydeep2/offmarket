import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabaseClient';
import { Switch } from '@/components/ui/switch';

const AdminInquiriesPage: React.FC = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  const load = async () => {
    const { data } = await supabase
      .from('inquiries')
      .select('id, property_id, name, email, phone, message, created_at, handled')
      .order('created_at', { ascending: false });
    setRows(data || []);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!search) return rows;
    const s = search.toLowerCase();
    return rows.filter(r => Object.values(r).some(v => String(v ?? '').toLowerCase().includes(s)));
  }, [rows, search]);

  const exportCSV = () => {
    const header = ['id','property_id','name','email','phone','message','created_at','handled'];
    const csv = [header, ...filtered.map(r => header.map(h => String(r[h] ?? '')))]
      .map(r => r.map(v => `"${v.replace(/"/g,'""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'inquiries.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const toggleHandled = async (id: string, value: boolean) => {
    await supabase.from('inquiries').update({ handled: value }).eq('id', id);
    await load();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Inquiries</h1>
          <div className="flex gap-2">
            <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <Button variant="outline" onClick={exportCSV}>Export</Button>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>All inquiries ({filtered.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">Created</th>
                    <th className="p-2 text-left">Property</th>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Email</th>
                    <th className="p-2 text-left">Phone</th>
                    <th className="p-2 text-left">Message</th>
                    <th className="p-2 text-left">Handled</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                      <td className="p-2">{r.property_id}</td>
                      <td className="p-2">{r.name}</td>
                      <td className="p-2">{r.email}</td>
                      <td className="p-2">{r.phone}</td>
                      <td className="p-2 max-w-xl truncate" title={r.message}>{r.message}</td>
                      <td className="p-2"><Switch checked={!!r.handled} onCheckedChange={(v) => toggleHandled(r.id, !!v)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminInquiriesPage;

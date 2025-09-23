import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabaseClient';
import { Switch } from '@/components/ui/switch';
import { Link } from 'react-router-dom';

const AdminInquiriesPage: React.FC = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // First try with property join
      const { data, error } = await supabase
        .from('inquiries')
        .select(`
          id, 
          property_id, 
          name, 
          email, 
          phone, 
          message, 
          created_at, 
          handled,
          properties(title)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error loading inquiries with properties:', error);
        // Fallback to simple query without join
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('inquiries')
          .select(`
            id, 
            property_id, 
            name, 
            email, 
            phone, 
            message, 
            created_at, 
            handled
          `)
          .order('created_at', { ascending: false });
        
        if (fallbackError) {
          console.error('Error loading inquiries fallback:', fallbackError);
          setError(fallbackError.message);
          return;
        }
        
        // Add empty properties object for consistency
        const dataWithEmptyProperties = fallbackData?.map(row => ({
          ...row,
          properties: null
        })) || [];
        
        setRows(dataWithEmptyProperties);
        return;
      }
      
      setRows(data || []);
    } catch (err) {
      console.error('Error in load function:', err);
      setError('Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!search) return rows;
    const s = search.toLowerCase();
    return rows.filter(r => Object.values(r).some(v => String(v ?? '').toLowerCase().includes(s)));
  }, [rows, search]);

  const exportCSV = () => {
    const header = ['id','property_id','property_title','name','email','phone','message','created_at','handled'];
    const csv = [header, ...filtered.map(r => [
      r.id,
      r.property_id,
      r.properties?.title || '',
      r.name,
      r.email,
      r.phone,
      r.message,
      r.created_at,
      r.handled
    ])]
      .map(r => r.map(v => `"${String(v ?? '').replace(/"/g,'""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'inquiries.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const toggleHandled = async (id: string, value: boolean) => {
    setUpdating(id);
    try {
      const { error } = await supabase
        .from('inquiries')
        .update({ handled: value })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating inquiry:', error);
        return;
      }
      
      await load();
    } catch (err) {
      console.error('Error in toggleHandled:', err);
    } finally {
      setUpdating(null);
    }
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
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading inquiries...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <p className="text-red-500 mb-4">{error}</p>
                  <Button onClick={load} variant="outline">Retry</Button>
                </div>
              </div>
            ) : (
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
                      <td className="p-2">
                        {r.properties?.title ? (
                          <Link 
                            to={`/admin/properties/${r.property_id}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline max-w-xs block truncate"
                            title={r.properties.title}
                          >
                            {r.properties.title.length > 30 ? 
                              `${r.properties.title.substring(0, 30)}...` : 
                              r.properties.title
                            }
                          </Link>
                        ) : (
                          <span className="text-gray-500 max-w-xs block truncate" title={`Property ID: ${r.property_id}`}>
                            Property ID: {r.property_id}
                          </span>
                        )}
                      </td>
                      <td className="p-2">{r.name}</td>
                      <td className="p-2">{r.email}</td>
                      <td className="p-2">{r.phone}</td>
                      <td className="p-2 max-w-xl truncate" title={r.message}>{r.message}</td>
                      <td className="p-2">
                        <Switch 
                          checked={!!r.handled} 
                          onCheckedChange={(v) => toggleHandled(r.id, v)}
                          disabled={updating === r.id}
                        />
                        {updating === r.id && (
                          <span className="ml-2 text-xs text-gray-500">Updating...</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminInquiriesPage;

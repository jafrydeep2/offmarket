import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabaseClient';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, Download, Search, Filter, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ContactSubmission {
  id: string;
  form_type: string;
  full_name?: string;
  email: string;
  message?: string;
  status: string;
  handled_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

const ContactsPage: React.FC = () => {
  const [rows, setRows] = useState<ContactSubmission[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [savingNotes, setSavingNotes] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('form_submissions')
        .select('*')
        .eq('form_type', 'contact')
        .order('created_at', { ascending: false });
      
      if (error) {
        if (error.message.includes('relation "form_submissions" does not exist')) {
          toast.error('Form submissions table not found. Please run database migrations.');
          console.error('Table does not exist. Run: npx supabase db push');
        } else {
          toast.error(`Failed to load contact messages: ${error.message}`);
        }
        console.error('Error loading contact messages:', error);
        setRows([]);
        return;
      }
      
      setRows(data || []);
    } catch (error) {
      toast.error('Failed to load contact messages');
      console.error('Error loading contact messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let filtered = rows;
    
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(r => 
        Object.values(r).some(v => String(v ?? '').toLowerCase().includes(s))
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }
    
    return filtered;
  }, [rows, search, statusFilter]);

  const exportCSV = async () => {
    try {
      setExporting(true);
      const header = [
        'id', 'full_name', 'email', 'message', 'status', 'notes', 'created_at'
      ];
      const csv = [header, ...filtered.map(r => header.map(h => String(r[h as keyof ContactSubmission] ?? '')))]
        .map(r => r.map(v => `"${v.replace(/"/g,'""')}"`).join(','))
        .join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'contact_messages.csv'; a.click(); URL.revokeObjectURL(url);
      toast.success('CSV exported successfully');
    } catch (error) {
      toast.error('Failed to export CSV');
      console.error('Error exporting CSV:', error);
    } finally {
      setExporting(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      setUpdatingStatus(id);
      const { error } = await supabase
        .from('form_submissions')
        .update({ status })
        .eq('id', id);
      
      if (error) {
        toast.error('Failed to update status');
        console.error('Error updating status:', error);
        return;
      }
      
      toast.success('Status updated successfully');
      await load();
    } catch (error) {
      toast.error('Failed to update status');
      console.error('Error updating status:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const updateNotes = async (id: string, notes: string) => {
    try {
      setSavingNotes(id);
      const { error } = await supabase
        .from('form_submissions')
        .update({ notes })
        .eq('id', id);
      
      if (error) {
        toast.error('Failed to save notes');
        console.error('Error saving notes:', error);
        return;
      }
      
      toast.success('Notes saved successfully');
      await load();
    } catch (error) {
      toast.error('Failed to save notes');
      console.error('Error saving notes:', error);
    } finally {
      setSavingNotes(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      in_progress: { color: 'bg-blue-100 text-blue-800', text: 'In Progress' },
      completed: { color: 'bg-green-100 text-green-800', text: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'Cancelled' }
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    return <Badge className={statusInfo.color}>{statusInfo.text}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Contact Messages</h1>
          <Button 
            onClick={exportCSV} 
            disabled={exporting}
            className="flex items-center gap-2"
          >
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export CSV
              </>
            )}
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search contact messages..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Messages Table */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Messages ({filtered.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading contact messages...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((submission) => (
                  <div key={submission.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {submission.full_name || 'Anonymous'}
                          </h3>
                          {getStatusBadge(submission.status)}
                        </div>
                        <p className="text-sm text-gray-600">{submission.email}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Select
                          value={submission.status}
                          onValueChange={(value) => updateStatus(submission.id, value)}
                          disabled={updatingStatus === submission.id}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        {updatingStatus === submission.id && (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        )}
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedSubmission(submission);
                                setNotes(submission.notes || '');
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Contact Message Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Name</label>
                                  <p className="text-sm">
                                    {submission.full_name || 'Anonymous'}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Email</label>
                                  <p className="text-sm">{submission.email}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Status</label>
                                  <p className="text-sm">{getStatusBadge(submission.status)}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Submitted</label>
                                  <p className="text-sm">{formatDate(submission.created_at)}</p>
                                </div>
                              </div>
                              
                              {submission.message && (
                                <div>
                                  <label className="text-sm font-medium">Message</label>
                                  <p className="text-sm bg-gray-50 p-3 rounded">{submission.message}</p>
                                </div>
                              )}
                              
                              <div>
                                <label className="text-sm font-medium">Admin Notes</label>
                                <Textarea
                                  value={notes}
                                  onChange={(e) => setNotes(e.target.value)}
                                  placeholder="Add notes about this contact message..."
                                  className="mt-1"
                                />
                                <Button
                                  size="sm"
                                  className="mt-2"
                                  disabled={savingNotes === submission.id}
                                  onClick={() => {
                                    updateNotes(submission.id, notes);
                                    setSelectedSubmission(null);
                                  }}
                                >
                                  {savingNotes === submission.id ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                      Saving...
                                    </>
                                  ) : (
                                    'Save Notes'
                                  )}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                    
                    {submission.message && (
                      <p className="text-sm text-gray-600 line-clamp-2">{submission.message}</p>
                    )}
                    
                    <div className="text-xs text-gray-500">
                      {formatDate(submission.created_at)}
                    </div>
                  </div>
                ))}
                
                {filtered.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No contact messages found matching your criteria.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ContactsPage;
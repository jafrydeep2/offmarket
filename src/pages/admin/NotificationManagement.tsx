import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Send,
  Users,
  Settings,
  Plus,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabaseClient';
import { NotificationService } from '@/lib/notificationService';
import { toast } from 'sonner';

interface Notification {
  id: string;
  user_id?: string;
  admin_id?: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

interface BulkNotification {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  targetUsers: 'all' | 'admins' | 'users' | 'custom';
  customUserIds: string[];
}

export const NotificationManagement: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [bulkNotification, setBulkNotification] = useState<BulkNotification>({
    title: '',
    message: '',
    type: 'info',
    targetUsers: 'all',
    customUserIds: []
  });
  const [users, setUsers] = useState<any[]>([]);

  // Load notifications
  const loadNotifications = async () => {
    try {
      setLoading(true);
      console.log('Loading notifications for user:', user?.id);
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error loading notifications:', error);
        return;
      }

      console.log('Raw notifications data:', data);
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load users for bulk notifications
  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, email, is_admin')
        .eq('is_active', true);

      if (error) {
        console.error('Error loading users:', error);
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  useEffect(() => {
    loadNotifications();
    loadUsers();
  }, []);

  // Check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user?.id) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();
        
        console.log('Admin status check:', { profile, error, userId: user.id });
      }
    };
    
    checkAdminStatus();
  }, [user?.id]);

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = searchQuery === '' || 
                         notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'read' && notification.is_read) ||
                         (statusFilter === 'unread' && !notification.is_read);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Debug logging
  console.log('Notifications loaded:', notifications.length);
  console.log('Filtered notifications:', filteredNotifications.length);
  console.log('Search query:', searchQuery);
  console.log('Type filter:', typeFilter);
  console.log('Status filter:', statusFilter);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark notification as unread
  const markAsUnread = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: false })
        .eq('id', notificationId);

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: false } : n)
      );
    } catch (error) {
      console.error('Error marking notification as unread:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  // Bulk delete notifications
  const bulkDeleteNotifications = async () => {
    try {
      await supabase
        .from('notifications')
        .delete()
        .in('id', selectedNotifications);

      setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n.id)));
      setSelectedNotifications([]);
      toast.success(`${selectedNotifications.length} notifications deleted`);
    } catch (error) {
      console.error('Error bulk deleting notifications:', error);
      toast.error('Failed to delete notifications');
    }
  };

  // Send bulk notification
  const sendBulkNotification = async () => {
    try {
      if (!user?.id) return;

      let targetUserIds: string[] = [];

      switch (bulkNotification.targetUsers) {
        case 'all':
          targetUserIds = users.map(u => u.id);
          break;
        case 'admins':
          targetUserIds = users.filter(u => u.is_admin).map(u => u.id);
          break;
        case 'users':
          targetUserIds = users.filter(u => !u.is_admin).map(u => u.id);
          break;
        case 'custom':
          targetUserIds = bulkNotification.customUserIds;
          break;
      }

      console.log('Target user IDs for bulk notification:', targetUserIds);
      console.log('Available users:', users);
      
      const notifications = [];
      for (const userId of targetUserIds) {
        console.log('Creating notification for user:', userId);
        const notification = await NotificationService.createNotification({
          userId,
          title: bulkNotification.title,
          message: bulkNotification.message,
          type: bulkNotification.type
        });
        if (notification) {
          notifications.push(notification);
          console.log('Notification created successfully for user:', userId);
        } else {
          console.error('Failed to create notification for user:', userId);
        }
      }

      // Create admin notification for the bulk send
      await NotificationService.createNotification({
        adminId: user.id,
        title: 'Bulk Notification Sent',
        message: `Bulk notification "${bulkNotification.title}" sent to ${notifications.length} users`,
        type: 'info'
      });

      toast.success(`Notification sent to ${notifications.length} users`);
      setShowBulkDialog(false);
      setBulkNotification({
        title: '',
        message: '',
        type: 'info',
        targetUsers: 'all',
        customUserIds: []
      });
      loadNotifications();
    } catch (error) {
      console.error('Error sending bulk notification:', error);
      toast.error('Failed to send notification');
    }
  };

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  // Format notification time
  const formatNotificationTime = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Notification Management</h1>
            <p className="text-muted-foreground">
              Manage and send notifications to users and admins
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              onClick={async () => {
                if (user?.id) {
                  // Create admin notification
                  await NotificationService.createNotification({
                    adminId: user.id,
                    title: 'Test Admin Notification',
                    message: 'This is a test admin notification to verify the system is working',
                    type: 'info'
                  });
                  
                  // Create user notification for testing
                  if (users.length > 0) {
                    await NotificationService.createNotification({
                      userId: users[0].id,
                      title: 'Test User Notification',
                      message: 'This is a test user notification to verify the system is working',
                      type: 'info'
                    });
                  }
                  
                  toast.success('Test notifications created');
                  loadNotifications();
                }
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Test Notifications
            </Button>
            <Button onClick={() => setShowBulkDialog(true)}>
              <Send className="h-4 w-4 mr-2" />
              Send Notification
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Notifications</p>
                  <p className="text-2xl font-bold">{notifications.length}</p>
                </div>
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Unread</p>
                  <p className="text-2xl font-bold text-red-500">
                    {notifications.filter(n => !n.is_read).length}
                  </p>
                </div>
                <EyeOff className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Read</p>
                  <p className="text-2xl font-bold text-green-500">
                    {notifications.filter(n => n.is_read).length}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today</p>
                  <p className="text-2xl font-bold">
                    {notifications.filter(n => {
                      const today = new Date();
                      const created = new Date(n.created_at);
                      return created.toDateString() === today.toDateString();
                    }).length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Notifications ({filteredNotifications.length})</CardTitle>
              {selectedNotifications.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {selectedNotifications.length} selected
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={bulkDeleteNotifications}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No notifications found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
                      !notification.is_read ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <Checkbox
                          checked={selectedNotifications.includes(notification.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedNotifications(prev => [...prev, notification.id]);
                            } else {
                              setSelectedNotifications(prev => prev.filter(id => id !== notification.id));
                            }
                          }}
                        />
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className={`font-medium ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {notification.title}
                            </h3>
                            <span className="text-xs text-muted-foreground">
                              {formatNotificationTime(notification.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {notification.type}
                            </Badge>
                            {notification.user_id && (
                              <Badge variant="secondary" className="text-xs">
                                User
                              </Badge>
                            )}
                            {notification.admin_id && (
                              <Badge variant="secondary" className="text-xs">
                                Admin
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => notification.is_read ? markAsUnread(notification.id) : markAsRead(notification.id)}
                          >
                            {notification.is_read ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Mark as Unread
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Mark as Read
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => deleteNotification(notification.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bulk Notification Dialog */}
        <AlertDialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
          <AlertDialogContent className="max-w-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Send Bulk Notification</AlertDialogTitle>
              <AlertDialogDescription>
                Send a notification to multiple users at once.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={bulkNotification.title}
                  onChange={(e) => setBulkNotification(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Notification title"
                />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={bulkNotification.message}
                  onChange={(e) => setBulkNotification(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Notification message"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={bulkNotification.type}
                    onValueChange={(value: any) => setBulkNotification(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="target">Target Users</Label>
                  <Select
                    value={bulkNotification.targetUsers}
                    onValueChange={(value: any) => setBulkNotification(prev => ({ ...prev, targetUsers: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="admins">Admins Only</SelectItem>
                      <SelectItem value="users">Users Only</SelectItem>
                      <SelectItem value="custom">Custom Selection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={sendBulkNotification}>
                Send Notification
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

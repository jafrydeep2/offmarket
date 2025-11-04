import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Mail,
  Phone,
  Calendar,
  CheckSquare,
  Square,
  UserPlus,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ActivitySquareIcon,
  ToggleLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationService } from '@/lib/notificationService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  username: string | null;
  email: string | null;
  subscription_type: 'basic' | 'premium';
  subscription_expiry: string;
  is_active: boolean;
  is_admin: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  properties_viewed?: number;
  inquiries_count?: number;
}

export const AccountManagement: React.FC = () => {
  const { t } = useTranslation();
  const { sendSubscriptionExpiryNotification, sendSubscriptionExpiredNotification } = useNotifications();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [sortKey, setSortKey] = useState<'username' | 'email' | 'subscription_type' | 'is_active' | 'subscription_expiry' | 'created_at'>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Load users from Supabase
  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          email,
          subscription_type,
          subscription_expiry,
          is_active,
          is_admin,
          avatar_url,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading users:', error);
        toast({
          title: t('language') === 'fr' ? 'Erreur' : 'Error',
          description: t('language') === 'fr' ? 'Impossible de charger les utilisateurs' : 'Failed to load users',
          variant: 'destructive'
        });
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: t('language') === 'fr' ? 'Erreur' : 'Error',
        description: t('language') === 'fr' ? 'Erreur lors du chargement des utilisateurs' : 'Error loading users',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const searchTerm = searchQuery.toLowerCase();
    const matchesSearch = 
      (user.username?.toLowerCase().includes(searchTerm) || false) ||
      (user.email?.toLowerCase().includes(searchTerm) || false);
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active);
    
    const matchesSubscription = subscriptionFilter === 'all' || user.subscription_type === subscriptionFilter;
    
    return matchesSearch && matchesStatus && matchesSubscription;
  });

  // Debounce search input
  React.useEffect(() => {
    const id = setTimeout(() => setSearchQuery(searchInput), 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const sortedUsers = React.useMemo(() => {
    const arr = [...filteredUsers];
    arr.sort((a: User, b: User) => {
      const aVal = (a as any)[sortKey] ?? '';
      const bVal = (b as any)[sortKey] ?? '';
      if (sortKey === 'created_at' || sortKey === 'subscription_expiry') {
        const aDate = new Date(aVal).getTime();
        const bDate = new Date(bVal).getTime();
        return sortDir === 'asc' ? aDate - bDate : bDate - aDate;
      }
      return sortDir === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
    });
    return arr;
  }, [filteredUsers, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / pageSize));
  const paginatedUsers = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedUsers.slice(start, start + pageSize);
  }, [sortedUsers, currentPage, pageSize]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, subscriptionFilter, pageSize]);

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} on users:`, selectedUsers);
    // Implement bulk actions
  };

  const getStatusBadge = (isActive: boolean, subscriptionExpiry: string) => {
    const isExpired = new Date(subscriptionExpiry) < new Date();
    
    if (!isActive) {
      return <Badge className="bg-orange-100 text-orange-800 flex items-center"><AlertTriangle className="h-3 w-3 mr-1" />Suspended</Badge>;
    }
    
    if (isExpired) {
      return <Badge className="bg-red-100 text-red-800 flex items-center"><XCircle className="h-3 w-3 mr-1" />Expired</Badge>;
    }
    
    return <Badge className="bg-green-100 text-green-800 flex items-center"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
  };

  const getSubscriptionBadge = (type: string) => {
    switch (type) {
      case 'premium':
        return <Badge className="bg-purple-100 text-purple-800">Premium</Badge>;
      case 'basic':
        return <Badge className="bg-blue-100 text-blue-800">Basic</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  // User management functions
  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: isActive })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user status:', error);
        toast({
          title: t('language') === 'fr' ? 'Erreur' : 'Error',
          description: t('language') === 'fr' ? 'Impossible de modifier le statut' : 'Failed to update status',
          variant: 'destructive'
        });
        return;
      }

      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, is_active: isActive } : user
      ));

      toast({
        title: t('language') === 'fr' ? 'Succès' : 'Success',
        description: t('language') === 'fr' ? 'Statut utilisateur mis à jour' : 'User status updated'
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: t('language') === 'fr' ? 'Erreur' : 'Error',
        description: t('language') === 'fr' ? 'Erreur lors de la mise à jour' : 'Error updating status',
        variant: 'destructive'
      });
    }
  };

  const extendSubscription = async (userId: string, days: number) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      const currentExpiry = new Date(user.subscription_expiry);
      const newExpiry = new Date(currentExpiry.getTime() + days * 24 * 60 * 60 * 1000);
      const newExpiryString = newExpiry.toISOString().split('T')[0];

      const { error } = await supabase
        .from('profiles')
        .update({ subscription_expiry: newExpiryString })
        .eq('id', userId);

      if (error) {
        console.error('Error extending subscription:', error);
        toast({
          title: t('language') === 'fr' ? 'Erreur' : 'Error',
          description: t('language') === 'fr' ? 'Impossible de prolonger l\'abonnement' : 'Failed to extend subscription',
          variant: 'destructive'
        });
        return;
      }

      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, subscription_expiry: newExpiryString } : u
      ));

      toast({
        title: t('language') === 'fr' ? 'Succès' : 'Success',
        description: t('language') === 'fr' ? `Abonnement prolongé de ${days} jours` : `Subscription extended by ${days} days`
      });
    } catch (error) {
      console.error('Error extending subscription:', error);
      toast({
        title: t('language') === 'fr' ? 'Erreur' : 'Error',
        description: t('language') === 'fr' ? 'Erreur lors de la prolongation' : 'Error extending subscription',
        variant: 'destructive'
      });
    }
  };

  const isSubscriptionExpiring = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const checkAndSendExpiryNotifications = async () => {
    let expired = 0;
    let expiring = 0;
    
    for (const user of users) {
      const expiry = new Date(user.subscription_expiry);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry <= 0) {
        // Subscription expired
        expired += 1;
        if (user.email) {
          sendSubscriptionExpiredNotification(user.email, { quiet: true });
          // Create database notification
          await NotificationService.createSubscriptionExpiredNotification(user.id);
        }
      } else if (daysUntilExpiry <= 7) {
        // Expiring in 7 days or less
        expiring += 1;
        if (user.email) {
          sendSubscriptionExpiryNotification(user.email, daysUntilExpiry, { quiet: true });
          // Create database notification
          await NotificationService.createSubscriptionExpiryNotification(user.id, daysUntilExpiry);
        }
      }
    }
    
    // Show a single summary toast
    const message = t('language') === 'fr' 
      ? `Notifications envoyées: ${expired} expirées, ${expiring} expirant bientôt`
      : `Notifications sent: ${expired} expired, ${expiring} expiring soon`;
    toast({ title: t('language') === 'fr' ? 'Vérification terminée' : 'Check complete', description: message });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t('admin.accounts.title')}
            </h1>
            <p className="text-gray-600">
              {t('language') === 'fr' 
                ? 'Gérez les comptes utilisateurs et leurs abonnements'
                : 'Manage user accounts and their subscriptions'
              }
            </p>
          </div>
          <div className="flex space-x-3">
            {/* <Button 
              variant="outline"
              onClick={checkAndSendExpiryNotifications}
            >
              <Mail className="h-4 w-4 mr-2" />
              {t('language') === 'fr' ? 'Vérifier les abonnements' : 'Check Subscriptions'}
            </Button>
            <Button variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              {t('language') === 'fr' ? 'Envoyer un email' : 'Send Email'}
            </Button> */}
            <Link to="/admin/accounts/new">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <UserPlus className="h-4 w-4 mr-2" />
                {t('admin.accounts.add')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-green-600">
                    {users.filter(u => u.is_active).length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Premium Users</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {users.filter(u => u.subscription_type === 'premium').length}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {users.filter(u => isSubscriptionExpiring(u.subscription_expiry)).length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={t('language') === 'fr' ? 'Rechercher des utilisateurs...' : 'Search users...'}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Subscription" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {t('language') === 'fr' ? 'Filtres' : 'Filters'}
                </Button>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-blue-900">
                      {selectedUsers.length} {t('language') === 'fr' ? 'utilisateurs sélectionnés' : 'users selected'}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction('extend')}
                    >
                      {t('language') === 'fr' ? 'Prolonger l\'abonnement' : 'Extend Subscription'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction('suspend')}
                    >
                      {t('language') === 'fr' ? 'Suspendre' : 'Suspend'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction('delete')}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      {t('language') === 'fr' ? 'Supprimer' : 'Delete'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t('language') === 'fr' ? 'Liste des utilisateurs' : 'Users List'}
            </CardTitle>
            <CardDescription>
              {filteredUsers.length} {t('language') === 'fr' ? 'utilisateurs trouvés' : 'users found'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">
                      <Checkbox
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="text-left p-4 font-medium cursor-pointer" onClick={() => { setSortKey('username'); setSortDir(prev => sortKey === 'username' ? (prev === 'asc' ? 'desc' : 'asc') : 'asc'); }}>User</th>
                    <th className="text-left p-4 font-medium cursor-pointer" onClick={() => { setSortKey('is_active'); setSortDir(prev => sortKey === 'is_active' ? (prev === 'asc' ? 'desc' : 'asc') : 'asc'); }}>Status</th>
                    <th className="text-left p-4 font-medium cursor-pointer" onClick={() => { setSortKey('subscription_type'); setSortDir(prev => sortKey === 'subscription_type' ? (prev === 'asc' ? 'desc' : 'asc') : 'asc'); }}>Subscription</th>
                    <th className="text-left p-4 font-medium cursor-pointer" onClick={() => { setSortKey('created_at'); setSortDir(prev => sortKey === 'created_at' ? (prev === 'asc' ? 'desc' : 'asc') : 'asc'); }}>Joined</th>
                    <th className="text-left p-4 font-medium cursor-pointer" onClick={() => { setSortKey('subscription_expiry'); setSortDir(prev => sortKey === 'subscription_expiry' ? (prev === 'asc' ? 'desc' : 'asc') : 'asc'); }}>Expiry</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-500">
                        {t('language') === 'fr' ? 'Chargement des utilisateurs...' : 'Loading users...'}
                      </td>
                    </tr>
                  ) : paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-500">
                        {t('language') === 'fr' ? 'Aucun utilisateur trouvé' : 'No users found'}
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((user) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="p-4">
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={() => handleSelectUser(user.id)}
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback>
                              {user.username ? user.username.charAt(0).toUpperCase() : 
                               user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {user.username || 'No username'}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {user.email}
                            </p>
                            <div className="flex items-center text-xs text-gray-500">
                              <Shield className="h-3 w-3 mr-1" />
                              {user.is_admin ? 'Admin' : 'User'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(user.is_active, user.subscription_expiry)}
                      </td>
                      <td className="p-4">
                        {getSubscriptionBadge(user.subscription_type)}
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-900">
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(user.created_at).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-900">
                            {new Date(user.subscription_expiry).toLocaleDateString()}
                          </div>
                          {isSubscriptionExpiring(user.subscription_expiry) && (
                            <Badge className="bg-orange-100 text-orange-800 text-xs">
                              {t('language') === 'fr' ? 'Expire bientôt' : 'Expires soon'}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/accounts/${user.id}`} className="flex items-center">
                                <Eye className="h-4 w-4 mr-2" />
                                {t('language') === 'fr' ? 'Voir le profil' : 'View Profile'}
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/accounts/${user.id}/edit`} className="flex items-center">
                                <Edit className="h-4 w-4 mr-2" />
                                {t('language') === 'fr' ? 'Modifier le compte' : 'Edit Account'}
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleUserStatus(user.id, !user.is_active)}>
                            <ToggleLeft className="h-4 w-4 mr-2" />
                            {user.is_active 
                                ? (t('language') === 'fr' ? 'Suspendre' : 'Suspend')
                                : (t('language') === 'fr' ? 'Activer' : 'Activate')
                              }
                            </DropdownMenuItem>
                            {/* <DropdownMenuItem>
                              <Mail className="h-4 w-4 mr-2" />
                              {t('language') === 'fr' ? 'Envoyer un email' : 'Send Email'}
                            </DropdownMenuItem> */}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-orange-600"
                              onClick={() => extendSubscription(user.id, 30)}
                            >
                              <Clock className="h-4 w-4 mr-2" />
                              {t('language') === 'fr' ? 'Prolonger 30 jours' : 'Extend 30 days'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-orange-600"
                              onClick={() => extendSubscription(user.id, 90)}
                            >
                              <Clock className="h-4 w-4 mr-2" />
                              {t('language') === 'fr' ? 'Prolonger 90 jours' : 'Extend 90 days'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                {t('language') === 'fr' 
                  ? `Affichage de ${(currentPage - 1) * pageSize + 1} à ${Math.min(currentPage * pageSize, sortedUsers.length)} sur ${sortedUsers.length} résultats`
                  : `Showing ${(currentPage - 1) * pageSize + 1} to ${Math.min(currentPage * pageSize, sortedUsers.length)} of ${sortedUsers.length} results`
                }
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">{t('language') === 'fr' ? `Page ${currentPage} sur ${totalPages}` : `Page ${currentPage} of ${totalPages}`}</span>
                <Select value={String(pageSize)} onValueChange={(v) => setPageSize(parseInt(v))}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 / page</SelectItem>
                    <SelectItem value="20">20 / page</SelectItem>
                    <SelectItem value="50">50 / page</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
                    {t('language') === 'fr' ? 'Précédent' : 'Previous'}
                  </Button>
                  <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>
                    {t('language') === 'fr' ? 'Suivant' : 'Next'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Bulk Delete Confirmation */}
        <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('language') === 'fr' ? 'Supprimer les utilisateurs sélectionnés ?' : 'Delete selected users?'}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('language') === 'fr' ? 'Cette action est irréversible.' : 'This action cannot be undone.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('language') === 'fr' ? 'Annuler' : 'Cancel'}</AlertDialogCancel>
              <AlertDialogAction onClick={() => setShowBulkDeleteDialog(false)}>{t('language') === 'fr' ? 'Supprimer' : 'Delete'}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </AdminLayout>
  );
};

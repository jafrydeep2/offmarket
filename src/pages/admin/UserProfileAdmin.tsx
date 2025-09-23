import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Mail, Phone, Shield, Calendar, Eye, Clock, Settings } from 'lucide-react';

// Local mock (aligned with AccountManagement)
const users = [
  { id: '1', name: 'Marie Dubois', email: 'marie.dubois@example.ch', phone: '+41 79 123 45 67', status: 'active', subscriptionType: 'premium', joinDate: '2024-01-10', lastActive: '2024-01-20', propertiesViewed: 12, inquiries: 3, subscriptionExpiry: '2024-07-10', avatar: '/user-avatar-1.jpg' },
  { id: '2', name: 'Pierre Martin', email: 'pierre.martin@example.ch', phone: '+41 78 987 65 43', status: 'active', subscriptionType: 'basic', joinDate: '2024-01-08', lastActive: '2024-01-19', propertiesViewed: 8, inquiries: 1, subscriptionExpiry: '2024-04-08', avatar: '/user-avatar-2.jpg' },
  { id: '3', name: 'Sophie Laurent', email: 'sophie.laurent@example.ch', phone: '+41 76 555 44 33', status: 'expired', subscriptionType: 'premium', joinDate: '2023-12-15', lastActive: '2024-01-05', propertiesViewed: 25, inquiries: 7, subscriptionExpiry: '2024-01-15', avatar: '/user-avatar-3.jpg' },
  { id: '4', name: 'Jean-Claude Favre', email: 'jc.favre@example.ch', phone: '+41 79 444 33 22', status: 'suspended', subscriptionType: 'premium', joinDate: '2023-11-20', lastActive: '2024-01-10', propertiesViewed: 45, inquiries: 12, subscriptionExpiry: '2024-05-20', avatar: '/user-avatar-4.jpg' },
];

export const AdminUserProfilePage: React.FC = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = users.find(u => u.id === id);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/admin/accounts')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> {t('language') === 'fr' ? 'Retour' : 'Back'}
          </Button>
          <div />
        </div>

        {!user ? (
          <Card>
            <CardContent className="p-6 text-gray-600">{t('language') === 'fr' ? 'Utilisateur introuvable.' : 'User not found.'}</CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center"><Shield className="h-5 w-5 mr-2 text-purple-600" />{t('language') === 'fr' ? 'Profil' : 'Profile'}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">{t('language') === 'fr' ? 'Détails du compte' : 'Account details'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16"><AvatarImage src={user.avatar} /><AvatarFallback>{user.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback></Avatar>
                    <div>
                      <div className="text-xl font-semibold text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-600">{user.subscriptionType.toUpperCase()}</div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center"><Mail className="h-4 w-4 mr-2" />{user.email}</div>
                    <div className="flex items-center"><Phone className="h-4 w-4 mr-2" />{user.phone}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center pt-2">
                    <div>
                      <div className="text-2xl font-bold">{user.propertiesViewed}</div>
                      <div className="text-xs text-muted-foreground">{t('language') === 'fr' ? 'Vues' : 'Views'}</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{user.inquiries}</div>
                      <div className="text-xs text-muted-foreground">{t('language') === 'fr' ? 'Demandes' : 'Inquiries'}</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{new Date(user.joinDate).getFullYear()}</div>
                      <div className="text-xs text-muted-foreground">{t('language') === 'fr' ? 'Membre depuis' : 'Member since'}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center"><Clock className="h-5 w-5 mr-2 text-blue-600" />{t('language') === 'fr' ? 'Activité' : 'Activity'}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center"><Calendar className="h-4 w-4 mr-2" /><span className="text-gray-500 mr-1">{t('language') === 'fr' ? 'Rejoint' : 'Joined'}:</span> {user.joinDate}</div>
                  <div className="flex items-center"><Eye className="h-4 w-4 mr-2" /><span className="text-gray-500 mr-1">{t('language') === 'fr' ? 'Dernière activité' : 'Last active'}:</span> {user.lastActive}</div>
                  <div className="flex items-center"><Eye className="h-4 w-4 mr-2" /><span className="text-gray-500 mr-1">{t('language') === 'fr' ? 'Vues' : 'Views'}:</span> {user.propertiesViewed}</div>
                  <div className="flex items-center"><Mail className="h-4 w-4 mr-2" /><span className="text-gray-500 mr-1">{t('language') === 'fr' ? 'Demandes' : 'Inquiries'}:</span> {user.inquiries}</div>
                  <div className="flex items-center"><Calendar className="h-4 w-4 mr-2" /><span className="text-gray-500 mr-1">{t('language') === 'fr' ? 'Expiration' : 'Expiry'}:</span> {user.subscriptionExpiry}</div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUserProfilePage;



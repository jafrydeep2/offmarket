import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Save, 
  ArrowLeft,
  Camera,
  Eye,
  EyeOff,
  Check,
  X,
  Bell,
  Settings,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUser, type UserProfile } from '@/store/authSlice';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

export const UserProfilePage: React.FC = () => {
  const { t, language } = useTranslation();
  const isFrench = language === 'fr';
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user: reduxUser } = useAppSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // Only redirect to login if we're definitely not authenticated
    // Don't redirect during state updates or if we have user data from either source
    if (!isAuthenticated && !reduxUser && !user) {
      navigate('/login');
      return;
    }

    // Use Redux user data if available, otherwise fall back to AuthContext user
    const currentUser = (reduxUser || user) as UserProfile;
    
    // Only update form data if we have a valid user
    if (currentUser) {
      setFormData({
        username: currentUser.username || '',
        email: currentUser.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Load profile picture from database if available
      if (currentUser.avatar_url && !profilePicture) {
        setProfilePicture(currentUser.avatar_url);
      }
    }
  }, [isAuthenticated, user, reduxUser, navigate, profilePicture]);

  const passwordFields = new Set(['currentPassword', 'newPassword', 'confirmPassword']);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (passwordFields.has(field)) {
      setPasswordMessage(null);
    } else {
      setProfileMessage(null);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const currentUser = (reduxUser || user) as UserProfile;
    if (!file || !currentUser) return;

    // Prevent navigation during upload
    if (isUploading) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setProfileMessage({ 
        type: 'error', 
        text: isFrench ? 'Veuillez sélectionner un fichier image valide' : 'Please select a valid image file' 
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setProfileMessage({ 
        type: 'error', 
        text: isFrench ? 'La taille du fichier ne doit pas dépasser 5MB' : 'File size must not exceed 5MB' 
      });
      return;
    }

    setIsUploading(true);
    setProfileMessage(null);

    try {
      // Delete old profile picture if it exists
      if (currentUser.avatar_url) {
        try {
          const oldPath = currentUser.avatar_url.split('/').slice(-2).join('/'); // Extract user_id/filename
          await supabase.storage
            .from('avatars')
            .remove([oldPath]);
        } catch (deleteError) {
          console.log('Could not delete old profile picture:', deleteError);
          // Continue with upload even if deletion fails
        }
      }

      // Create a unique filename with user ID as folder
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${currentUser.id}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);

      if (updateError) throw updateError;

      // Update Redux state - only update the avatar_url field to prevent logout
      const updatedUser = {
        ...currentUser,
        avatar_url: publicUrl
      };
      dispatch(setUser(updatedUser));

      setProfilePicture(publicUrl);
      setProfileMessage({ 
        type: 'success', 
        text: isFrench ? 'Photo de profil mise à jour avec succès' : 'Profile picture updated successfully' 
      });
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      setProfileMessage({ 
        type: 'error', 
        text: isFrench ? 'Erreur lors de la mise à jour de la photo de profil' : 'Error updating profile picture' 
      });
    } finally {
      setIsUploading(false);
      // Clear the file input to allow re-uploading the same file
      event.target.value = '';
    }
  };

  const handleSaveProfile = async () => {
    console.log('handleSaveProfile called');
    setIsSavingProfile(true);
    setProfileMessage(null);

    try {
      // Validate form
      if (!formData.username.trim()) {
        setProfileMessage({ type: 'error', text: isFrench ? 'Le nom d\'utilisateur est requis' : 'Username is required' });
        return;
      }

      if (!formData.email.trim()) {
        setProfileMessage({ type: 'error', text: isFrench ? 'L\'email est requis' : 'Email is required' });
        return;
      }

      // Get current user data
      const currentUser = (reduxUser || user) as UserProfile;

      // Update profile in Supabase
      const { data, error } = await supabase
        .from('profiles')
        .update({
          username: formData.username.trim(),
          email: formData.email.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser?.id)
        .select()
        .single();

      if (error) {
        console.error('Profile update error:', error);
        setProfileMessage({ 
          type: 'error', 
          text: isFrench ? 'Erreur lors de la mise à jour du profil: ' + error.message : 'Error updating profile: ' + error.message
        });
        return;
      }

      // Update Redux state with new profile data
      const updatedUser = {
        ...currentUser,
        username: data.username,
        email: data.email
      };
      dispatch(setUser(updatedUser));
      
      setProfileMessage({ 
        type: 'success', 
        text: isFrench ? 'Profil mis à jour avec succès' : 'Profile updated successfully' 
      });
    } catch (error: any) {
      console.error('Profile update error:', error);
      setProfileMessage({ 
        type: 'error', 
        text: isFrench ? 'Erreur lors de la mise à jour du profil' : 'Error updating profile'
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    console.log('handleChangePassword called');
    setIsChangingPassword(true);
    setPasswordMessage(null);

    try {
      // Validate passwords
      if (!formData.currentPassword) {
        setPasswordMessage({ type: 'error', text: isFrench ? 'Le mot de passe actuel est requis' : 'Current password is required' });
        return;
      }

      if (!formData.newPassword) {
        setPasswordMessage({ type: 'error', text: isFrench ? 'Le nouveau mot de passe est requis' : 'New password is required' });
        return;
      }

      if (formData.newPassword.length < 6) {
        setPasswordMessage({ type: 'error', text: isFrench ? 'Le nouveau mot de passe doit contenir au moins 6 caractères' : 'New password must be at least 6 characters' });
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setPasswordMessage({ type: 'error', text: isFrench ? 'Les mots de passe ne correspondent pas' : 'Passwords do not match' });
        return;
      }

      // Update password using Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      });

      if (error) {
        console.error('Password change error:', error);
        setPasswordMessage({ 
          type: 'error', 
          text: isFrench ? 'Erreur lors du changement de mot de passe: ' + error.message : 'Error changing password: ' + error.message
        });
        return;
      }
      
      setPasswordMessage({ 
        type: 'success', 
        text: isFrench ? 'Mot de passe modifié avec succès' : 'Password changed successfully' 
      });

      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error: any) {
      console.error('Password change error:', error);
      setPasswordMessage({ 
        type: 'error', 
        text: isFrench ? 'Erreur lors du changement de mot de passe' : 'Error changing password' 
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Use Redux user data if available, otherwise fall back to AuthContext user
  const currentUser = (reduxUser || user) as UserProfile;

  // Only show loading or redirect if we truly have no user data
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const getSubscriptionStatus = () => {
    const expiryDate = new Date(currentUser.subscriptionExpiry);
    const today = new Date();
    const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return { status: 'expired', color: 'destructive', text: isFrench ? 'Expiré' : 'Expired' };
    if (daysLeft < 30) return { status: 'expiring', color: 'warning', text: isFrench ? 'Expire bientôt' : 'Expiring Soon' };
    return { status: 'active', color: 'success', text: isFrench ? 'Actif' : 'Active' };
  };

  const subscriptionStatus = getSubscriptionStatus();

  return (
    <div className="min-h-screen bg-background">
      <div className="container-custom py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-6">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t('userPanel.common.back')}</span>
            </Button>
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground">
                {t('userPanel.profile.title')}
              </h1>
              <p className="text-muted-foreground">
                {t('userPanel.profile.subtitle')}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card>
              <CardHeader className="text-center">
                <div className="relative mx-auto w-24 h-24 mb-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                    {profilePicture || currentUser.avatar_url ? (
                      <img 
                        src={profilePicture || currentUser.avatar_url} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-gray-600" />
                    )}
                  </div>
                  <label 
                    htmlFor="profile-picture-upload"
                    className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors"
                    title={isFrench ? 'Changer la photo' : 'Change photo'}
                  >
                    {isUploading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4 text-white" />
                    )}
                  </label>
                  <input
                    id="profile-picture-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </div>
                <CardTitle className="text-xl">
                  {currentUser.username || currentUser.email?.split('@')[0] || (isFrench ? 'Utilisateur' : 'User')}
                </CardTitle>
                <CardDescription>{currentUser.email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm mb-2">
                    {t('userPanel.profile.accountActions')}
                  </h4>
                  <Link to="/settings">
                    <Button type="button" variant="outline" size="sm" className="w-full justify-start mb-1">
                      <Settings className="h-4 w-4 mr-2" />
                      {t('userPanel.menu.settings')}
                    </Button>
                  </Link>
                  <Link to="/alerts">
                    <Button type="button" variant="outline" size="sm" className="w-full justify-start">
                      <Bell className="h-4 w-4 mr-2" />
                      {t('userPanel.menu.myAlerts')}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Profile Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  {t('userPanel.profile.personalInformation')}
                </CardTitle>
                <CardDescription>
                  {t('userPanel.profile.updateInfo')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">
                      {t('userPanel.profile.username')}
                    </Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      placeholder={t('userPanel.profile.usernamePlaceholder')}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      {t('userPanel.profile.email')}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder={t('userPanel.profile.emailPlaceholder')}
                    />
                  </div>
                </div>

                {profileMessage && (
                  <Alert variant={profileMessage.type === 'success' ? 'default' : 'destructive'}>
                    <div className="flex items-center">
                      {profileMessage.type === 'success' ? (
                        <Check className="h-4 w-4 mr-2" />
                      ) : (
                        <X className="h-4 w-4 mr-2" />
                      )}
                      <AlertDescription>{profileMessage.text}</AlertDescription>
                    </div>
                  </Alert>
                )}

                <Button 
                  type="button"
                  onClick={handleSaveProfile} 
                  disabled={isSavingProfile}
                  className="w-full md:w-auto"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSavingProfile ? t('userPanel.profile.saving') : t('userPanel.profile.saveChanges')}
                </Button>
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  {t('userPanel.profile.changePassword')}
                </CardTitle>
                <CardDescription>
                  {t('userPanel.profile.changePasswordDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {passwordMessage && (
                  <Alert variant={passwordMessage.type === 'success' ? 'default' : 'destructive'}>
                    <div className="flex items-center">
                      {passwordMessage.type === 'success' ? (
                        <Check className="h-4 w-4 mr-2" />
                      ) : (
                        <X className="h-4 w-4 mr-2" />
                      )}
                      <AlertDescription>{passwordMessage.text}</AlertDescription>
                    </div>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">
                    {t('userPanel.profile.currentPassword')}
                  </Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPasswords.current ? 'text' : 'password'}
                      value={formData.currentPassword}
                      onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                      placeholder={t('userPanel.profile.currentPasswordPlaceholder')}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => togglePasswordVisibility('current')}
                    >
                      {showPasswords.current ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">
                      {t('userPanel.profile.newPassword')}
                    </Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPasswords.new ? 'text' : 'password'}
                        value={formData.newPassword}
                        onChange={(e) => handleInputChange('newPassword', e.target.value)}
                        placeholder={t('userPanel.profile.newPasswordPlaceholder')}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility('new')}
                      >
                        {showPasswords.new ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      {t('userPanel.profile.confirmPassword')}
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder={t('userPanel.profile.confirmPasswordPlaceholder')}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility('confirm')}
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <Button 
                  type="button"
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                  className="w-full md:w-auto"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  {isChangingPassword ? t('userPanel.profile.changing') : t('userPanel.profile.changePasswordButton')}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

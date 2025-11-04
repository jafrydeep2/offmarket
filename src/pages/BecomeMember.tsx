import React, { useState } from 'react';
import { ArrowLeft, Send, CheckCircle, AlertCircle, Users, Shield, Star, Home, Video, Key, Search, Lock, Camera, Play, Award, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';

export const BecomeMemberPage: React.FC = () => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    profile: '',
    project: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        form_type: 'membership',
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        profile: formData.profile,
        project: formData.project,
      };
      const { error } = await supabase.from('form_submissions').insert(payload);
      if (error) throw error;

      toast.success(t('becomeMember.form.success'));
      setFormData({ fullName: '', email: '', phone: '', profile: '', project: '' });
    } catch (error) {
      toast.error(t('becomeMember.form.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/become-a-member.png"
            alt="Exclusive luxury real estate membership"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/50"></div>
        </div>

        {/* Back Button */}
        <div className="absolute top-8 left-8 z-20">
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-white hover:text-white hover:bg-white/10 transition-all backdrop-blur-sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('language') === 'fr' ? 'Retour' : 'Back'}
            </Button>
          </Link>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white max-w-6xl mx-auto px-4 sm:px-6">
          {/* <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-4"
          >
            <h2 className="text-lg sm:text-xl md:text-2xl font-medium text-white/90 mb-2">
              {t('language') === 'fr' ? 'Devenir Membre' : 'Become a Member'}
            </h2>
          </motion.div> */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-heading font-bold leading-tight mb-4 sm:mb-6"
          >
              {t('language') === 'fr' ? 'Devenir Membre' : 'Become a Member'}
            {/* {t('becomeMember.title')} */}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 leading-relaxed max-w-4xl mx-auto px-2"
          >
            {t('becomeMember.subtitle')}
          </motion.p>
          
          {/* <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-sm sm:text-base text-white/80 mb-6 sm:mb-8 leading-relaxed max-w-3xl mx-auto px-2"
          >
            {t('language') === 'fr' 
              ? 'Rejoignez notre cercle exclusif et accédez aux propriétés les plus prestigieuses du marché'
              : 'Join our exclusive circle and access the most prestigious properties on the market'
            }
          </motion.p> */}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4"
          >
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary-hover text-primary-foreground group px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto"
              onClick={() => {
                document.getElementById('membership-form')?.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start'
                });
              }}
            >
              {t('becomeMember.cta')}
              <Users className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-3 bg-white rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Process Steps Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-background">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center space-y-3 sm:space-y-4 mb-12 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-foreground px-4">
              {t('language') === 'fr' ? 'Comment Devenir Membre' : 'How to Become a Member'}
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              {t('language') === 'fr' ? 'Rejoignez notre réseau exclusif en quelques étapes simples' : 'Join our exclusive network in just a few simple steps'}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center group"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                {t('language') === 'fr' ? '1. Demande d\'Adhésion' : '1. Membership Application'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('language') === 'fr' ? 'Remplissez notre formulaire d\'adhésion exclusif' : 'Fill out our exclusive membership application form'}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-center group"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                {t('language') === 'fr' ? '2. Vérification' : '2. Verification'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('language') === 'fr' ? 'Vérification rapide de vos références et critères' : 'Quick verification of your credentials and criteria'}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
              className="text-center group"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <Phone className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                {t('language') === 'fr' ? '3. Appel' : '3. Call'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('language') === 'fr' ? 'Un de nos agents vous contactera en fonction de votre profil' : 'One of our agents will contact you based on your profile'}
              </p>
            </motion.div>
          </div>
        </div>
      </section>



      {/* Membership Form Section */}
      <section id="membership-form" className="py-8 sm:py-12 lg:py-16 bg-muted/20 relative overflow-hidden">
        <div className="hidden md:absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <Card className="shadow-xl border border-border/50 bg-card/95 backdrop-blur-md overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary/80 to-primary" />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50" />
              
              <CardHeader className="text-center py-4 sm:py-6 px-4 sm:px-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <CardTitle className="text-lg sm:text-xl md:text-2xl font-heading font-bold text-foreground mb-2">
                    {t('becomeMember.form.title')}
                  </CardTitle>
                  <p className="text-muted-foreground text-xs sm:text-sm px-2">
                    {t('language') === 'fr' 
                      ? 'Rejoignez notre cercle exclusif en quelques étapes simples'
                      : 'Join our exclusive circle in just a few simple steps'
                    }
                  </p>
                </motion.div>
              </CardHeader>

              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <motion.form
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  viewport={{ once: true }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {/* Full Name */}
                    <div className="space-y-1">
                      <Label htmlFor="fullName" className="text-xs font-semibold text-foreground flex items-center">
                        {t('becomeMember.form.fullName')}
                        <span className="text-destructive ml-1">*</span>
                      </Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        required
                        className="h-10 text-sm border-2 transition-all duration-300 focus:border-primary focus:shadow-lg focus:shadow-primary/20"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <Label htmlFor="email" className="text-xs font-semibold text-foreground flex items-center">
                        {t('becomeMember.form.email')}
                        <span className="text-destructive ml-1">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        className="h-10 text-sm border-2 transition-all duration-300 focus:border-primary focus:shadow-lg focus:shadow-primary/20"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <Label htmlFor="phone" className="text-xs font-semibold text-foreground flex items-center">
                      {t('becomeMember.form.phone')}
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      required
                      className="h-10 text-sm border-2 transition-all duration-300 focus:border-primary focus:shadow-lg focus:shadow-primary/20"
                    />
                  </div>

                  {/* Profile */}
                  <div className="space-y-1">
                    <Label htmlFor="profile" className="text-xs font-semibold text-foreground flex items-center">
                      {t('becomeMember.form.profile')}
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Select value={formData.profile} onValueChange={(value) => handleInputChange('profile', value)} required>
                      <SelectTrigger className="h-10 text-sm border-2 transition-all duration-300 focus:border-primary focus:shadow-lg focus:shadow-primary/20">
                        <SelectValue placeholder={t('becomeMember.form.profile')} />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-2 shadow-xl">
                        <SelectItem value="looking" className="text-sm py-2">
                          {t('becomeMember.form.profileOptions.looking')}
                        </SelectItem>
                        <SelectItem value="owner" className="text-sm py-2">
                          {t('becomeMember.form.profileOptions.owner')}
                        </SelectItem>
                        <SelectItem value="other" className="text-sm py-2">
                          {t('becomeMember.form.profileOptions.other')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Project */}
                  <div className="space-y-1">
                    <Label htmlFor="project" className="text-xs font-semibold text-foreground flex items-center">
                      {t('becomeMember.form.project')}
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Input
                      id="project"
                      type="text"
                      value={formData.project}
                      onChange={(e) => handleInputChange('project', e.target.value)}
                      placeholder={t('becomeMember.form.projectPlaceholder')}
                      required
                      className="h-10 text-sm border-2 transition-all duration-300 focus:border-primary focus:shadow-lg focus:shadow-primary/20"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-1">
                    <Button 
                      type="submit" 
                      size="lg"
                      className="w-full h-12 text-base font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/25 disabled:hover:scale-100 bg-primary hover:bg-primary/90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center space-x-2"
                        >
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>{t('common.loading')}</span>
                        </motion.div>
                      ) : (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="flex items-center space-x-2"
                        >
                          <Send className="h-4 w-4" />
                          <span>{t('becomeMember.form.submit')}</span>
                        </motion.div>
                      )}
                    </Button>
                  </div>
                </motion.form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Footer */}
      <section className="py-6 sm:py-8 bg-background border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-xl mx-auto"
          >
            <h3 className="text-base sm:text-lg font-heading font-bold text-foreground mb-2 px-4">
              {t('contact.title')}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4 px-4">
              {t('language') === 'fr' 
                ? 'Notre équipe est disponible pour répondre à vos questions et vous accompagner dans votre démarche'
                : 'Our team is available to answer your questions and guide you through the process'
              }
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-md mx-auto px-4">
              <div className="p-3 rounded-lg bg-card border border-border/50 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300 group">
                <div className="text-sm font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {t('language') === 'fr' ? 'Email' : 'Email'}
                </div>
                <p className="text-primary font-medium text-xs group-hover:text-primary/80 transition-colors">{t('contact.emailAddress')}</p>
              </div>
              <div className="p-3 rounded-lg bg-card border border-border/50 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300 group">
                <div className="text-sm font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {t('language') === 'fr' ? 'Téléphone' : 'Phone'}
                </div>
                <p className="text-primary font-medium text-xs group-hover:text-primary/80 transition-colors">{t('contact.phoneNumber')}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

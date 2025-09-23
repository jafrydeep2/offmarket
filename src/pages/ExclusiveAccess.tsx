import React, { useState } from 'react';
import { ArrowLeft, Send, Key, Users, Award, CheckCircle, Star, Shield, Home, MapPin, DollarSign, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';

export const ExclusiveAccessPage: React.FC = () => {
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        interest: '',
        location: '',
        message: ''
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                form_type: 'exclusive_access',
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                interest: formData.interest,
                location: formData.location,
                message: formData.message,
            };
            const { error } = await supabase.from('form_submissions').insert(payload);
            if (error) throw error;

            toast.success(t('exclusiveAccess.form.success'));
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                interest: '',
                location: '',
                message: ''
            });
        } catch (error) {
            toast.error(t('exclusiveAccess.form.error'));
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
                        src="/property-hero.jpg"
                        alt="Exclusive access to luxury properties"
                        className="w-full h-full object-cover"
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
                <div className="relative z-10 text-center text-white max-w-6xl mx-auto px-6">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl md:text-7xl font-heading font-bold leading-tight mb-6"
                    >
                        {t('exclusiveAccess.title')}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-xl md:text-2xl mb-8 leading-relaxed max-w-4xl mx-auto"
                    >
                        {t('exclusiveAccess.subtitle')}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    >
                        <Button
                            size="lg"
                            className="bg-primary hover:bg-primary-hover text-primary-foreground group px-8 py-4 text-lg"
                            onClick={() => {
                                document.getElementById('contact-form')?.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'start'
                                });
                            }}
                        >
                            {t('exclusiveAccess.cta')}
                            <Key className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
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
            <section className="py-20 bg-background">
                <div className="container-custom">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center space-y-4 mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
                            {t('exclusiveAccess.process.title')}
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            {t('exclusiveAccess.process.subtitle')}
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                                {t('exclusiveAccess.process.membership.title')}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {t('exclusiveAccess.process.membership.description')}
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
                                {t('exclusiveAccess.process.verification.title')}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {t('exclusiveAccess.process.verification.description')}
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
                                <Award className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="font-semibold text-foreground mb-2">
                                {t('exclusiveAccess.process.access.title')}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {t('exclusiveAccess.process.access.description')}
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Description Section */}
            <section className="py-20 bg-muted/20">
                <div className="container-custom">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-8">
                            {t('exclusiveAccess.description.title')}
                        </h2>
                        <p className="text-lg md:text-xl leading-relaxed text-muted-foreground mb-12">
                            {t('exclusiveAccess.description.content')}
                        </p>

                        {/* Benefits Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { icon: Key, text: t('exclusiveAccess.benefits.exclusive') },
                                { icon: Shield, text: t('exclusiveAccess.benefits.verified') },
                                { icon: Users, text: t('exclusiveAccess.benefits.network') },
                                { icon: Home, text: t('exclusiveAccess.benefits.opportunities') }
                            ].map((benefit, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="text-center p-6 rounded-2xl bg-card border hover:shadow-lg transition-all duration-300"
                                >
                                    <benefit.icon className="h-8 w-8 text-primary mx-auto mb-4" />
                                    <p className="text-sm font-medium text-foreground">{benefit.text}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>


            {/* Contact Form Section */}
            <section id="contact-form" className="py-20 bg-muted/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-50" />
                <div className="container-custom relative">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto"
                    >
                        <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-sm overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-purple-500/80 to-purple-500" />

                            <CardHeader className="text-center py-12 px-8">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                    viewport={{ once: true }}
                                >
                                    <CardTitle className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
                                        {t('exclusiveAccess.form.title')}
                                    </CardTitle>
                                    <p className="text-muted-foreground text-lg">
                                        {t('exclusiveAccess.form.subtitle')}
                                    </p>
                                </motion.div>
                            </CardHeader>

                            <CardContent className="px-8 pb-12">
                                <motion.form
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    transition={{ duration: 0.8, delay: 0.3 }}
                                    viewport={{ once: true }}
                                    onSubmit={handleSubmit}
                                    className="space-y-8"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* First Name */}
                                        <div className="space-y-3">
                                            <Label htmlFor="firstName" className="text-sm font-semibold text-foreground flex items-center">
                                                {t('exclusiveAccess.form.firstName')}
                                                <span className="text-destructive ml-1">*</span>
                                            </Label>
                                            <Input
                                                id="firstName"
                                                type="text"
                                                value={formData.firstName}
                                                onChange={(e) => handleInputChange('firstName', e.target.value)}
                                                required
                                                className="h-14 text-lg border-2 transition-all duration-300 focus:border-purple-500 focus:shadow-lg focus:shadow-purple-500/20"
                                            />
                                        </div>

                                        {/* Last Name */}
                                        <div className="space-y-3">
                                            <Label htmlFor="lastName" className="text-sm font-semibold text-foreground flex items-center">
                                                {t('exclusiveAccess.form.lastName')}
                                                <span className="text-destructive ml-1">*</span>
                                            </Label>
                                            <Input
                                                id="lastName"
                                                type="text"
                                                value={formData.lastName}
                                                onChange={(e) => handleInputChange('lastName', e.target.value)}
                                                required
                                                className="h-14 text-lg border-2 transition-all duration-300 focus:border-purple-500 focus:shadow-lg focus:shadow-purple-500/20"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Email */}
                                        <div className="space-y-3">
                                            <Label htmlFor="email" className="text-sm font-semibold text-foreground flex items-center">
                                                {t('exclusiveAccess.form.email')}
                                                <span className="text-destructive ml-1">*</span>
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                required
                                                className="h-14 text-lg border-2 transition-all duration-300 focus:border-purple-500 focus:shadow-lg focus:shadow-purple-500/20"
                                            />
                                        </div>

                                        {/* Phone */}
                                        <div className="space-y-3">
                                            <Label htmlFor="phone" className="text-sm font-semibold text-foreground flex items-center">
                                                {t('exclusiveAccess.form.phone')}
                                                <span className="text-destructive ml-1">*</span>
                                            </Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                                required
                                                className="h-14 text-lg border-2 transition-all duration-300 focus:border-purple-500 focus:shadow-lg focus:shadow-purple-500/20"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Interest */}
                                        <div className="space-y-3">
                                            <Label htmlFor="interest" className="text-sm font-semibold text-foreground flex items-center">
                                                {t('exclusiveAccess.form.interest')}
                                                <span className="text-destructive ml-1">*</span>
                                            </Label>
                                            <Select value={formData.interest} onValueChange={(value) => handleInputChange('interest', value)} required>
                                                <SelectTrigger className="h-14 text-lg border-2 transition-all duration-300 focus:border-purple-500 focus:shadow-lg focus:shadow-purple-500/20">
                                                    <SelectValue placeholder={t('exclusiveAccess.form.interest')} />
                                                </SelectTrigger>
                                                <SelectContent className="bg-background border-2 shadow-xl">
                                                    <SelectItem value="rent" className="text-lg py-3">
                                                        {t('exclusiveAccess.form.interests.rent')}
                                                    </SelectItem>
                                                    <SelectItem value="purchase" className="text-lg py-3">
                                                        {t('exclusiveAccess.form.interests.purchase')}
                                                    </SelectItem>
                                                    <SelectItem value="both" className="text-lg py-3">
                                                        {t('exclusiveAccess.form.interests.both')}
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Location */}
                                        <div className="space-y-3">
                                            <Label htmlFor="location" className="text-sm font-semibold text-foreground flex items-center">
                                                {t('exclusiveAccess.form.location')}
                                                <span className="text-destructive ml-1">*</span>
                                            </Label>
                                            <Input
                                                id="location"
                                                type="text"
                                                value={formData.location}
                                                onChange={(e) => handleInputChange('location', e.target.value)}
                                                placeholder={t('exclusiveAccess.form.locationPlaceholder')}
                                                required
                                                className="h-14 text-lg border-2 transition-all duration-300 focus:border-purple-500 focus:shadow-lg focus:shadow-purple-500/20"
                                            />
                                        </div>
                                    </div>

                                    {/* Message */}
                                    <div className="space-y-3">
                                        <Label htmlFor="message" className="text-sm font-semibold text-foreground flex items-center">
                                            {t('exclusiveAccess.form.message')}
                                        </Label>
                                        <Textarea
                                            id="message"
                                            value={formData.message}
                                            onChange={(e) => handleInputChange('message', e.target.value)}
                                            placeholder={t('exclusiveAccess.form.messagePlaceholder')}
                                            className="min-h-[120px] text-lg border-2 transition-all duration-300 focus:border-purple-500 focus:shadow-lg focus:shadow-purple-500/20"
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <div className="pt-4">
                                        <Button
                                            type="submit"
                                            size="lg"
                                            className="w-full h-16 text-xl font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/25 disabled:hover:scale-100 bg-primary hover:bg-primary-hover"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="flex items-center space-x-3"
                                                >
                                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                                    <span>{t('common.loading')}</span>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    whileHover={{ scale: 1.05 }}
                                                    className="flex items-center space-x-3"
                                                >
                                                    <Send className="h-6 w-6" />
                                                    <span>{t('exclusiveAccess.form.submit')}</span>
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

        </div>
    );
};

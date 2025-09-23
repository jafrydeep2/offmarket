import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

export const ContactPage: React.FC = () => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const payload = { 
      form_type: 'contact',
      full_name: formData.name, 
      email: formData.email, 
      message: formData.message 
    };
    const { error } = await supabase.from('form_submissions').insert(payload);
    if (error) {
      setError(t('language') === 'fr' ? "Échec de l'envoi. Réessayez." : 'Failed to send. Please try again.');
      toast.error(error.message);
      setIsSubmitting(false);
      return;
    }
    setFormData({ name: '', email: '', message: '' });
    toast.success(t('language') === 'fr' ? 'Message envoyé' : 'Message sent');
    setIsSubmitting(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container-custom section-padding">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
              {t('contact.title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('language') === 'fr' 
                ? 'Contactez notre équipe pour toute question concernant nos propriétés exclusives'
                : 'Contact our team for any questions about our exclusive properties'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>{t('language') === 'fr' ? 'Envoyez-nous un message' : 'Send us a message'}</CardTitle>
                <CardDescription>
                  {t('language') === 'fr' 
                    ? 'Nous vous répondrons dans les plus brefs délais'
                    : 'We will respond to you as soon as possible'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="form-label">
                      {t('contact.name')}
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder={t('language') === 'fr' ? 'Votre nom complet' : 'Your full name'}
                      className="form-input"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="form-label">
                      {t('contact.email')}
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={t('language') === 'fr' ? 'votre@email.com' : 'your@email.com'}
                      className="form-input"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="form-label">
                      {t('contact.message')}
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder={t('language') === 'fr' 
                        ? 'Décrivez votre demande ou question...'
                        : 'Describe your request or question...'
                      }
                      className="form-input min-h-[120px] resize-none"
                      required
                    />
                  </div>

                  {error && <p className="text-sm text-red-600">{error}</p>}

                  <Button 
                    type="submit" 
                    className="w-full btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      t('common.loading')
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        {t('contact.send')}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t('language') === 'fr' ? 'Informations de contact' : 'Contact Information'}
                  </CardTitle>
                  <CardDescription>
                    {t('language') === 'fr' 
                      ? 'Plusieurs façons de nous joindre'
                      : 'Multiple ways to reach us'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Email</p>
                      <p className="text-muted-foreground">contact@offmarket.ch</p>
                      <p className="text-muted-foreground">info@offmarket.ch</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Téléphone</p>
                      <p className="text-muted-foreground">+41 22 123 45 67</p>
                      <p className="text-muted-foreground">+41 79 987 65 43</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Adresse</p>
                      <p className="text-muted-foreground">
                        Rue de la Paix 15<br />
                        1201 Genève, Suisse
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Business Hours */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t('language') === 'fr' ? "Horaires d'ouverture" : 'Business Hours'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t('language') === 'fr' ? 'Lundi - Vendredi' : 'Monday - Friday'}
                    </span>
                    <span className="font-medium">09:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t('language') === 'fr' ? 'Samedi' : 'Saturday'}
                    </span>
                    <span className="font-medium">10:00 - 16:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t('language') === 'fr' ? 'Dimanche' : 'Sunday'}
                    </span>
                    <span className="font-medium">
                      {t('language') === 'fr' ? 'Fermé' : 'Closed'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
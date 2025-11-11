import React, { useEffect, useState } from 'react';
import { 
  Mail, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Save,
  Send,
  Copy,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body_html: string;
  body_text: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const EmailTemplates: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body_html: '',
    body_text: '',
    variables: [] as string[],
    is_active: true
  });

  const [newVariable, setNewVariable] = useState('');

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading templates:', error);
        toast({
          title: t('language') === 'fr' ? 'Erreur' : 'Error',
          description: t('language') === 'fr' ? 'Impossible de charger les modèles' : 'Failed to load templates',
          variant: 'destructive'
        });
        return;
      }

      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: t('language') === 'fr' ? 'Erreur' : 'Error',
        description: t('language') === 'fr' ? 'Erreur lors du chargement' : 'Error loading templates',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async () => {
    try {
      setSaving(true);
      
      if (selectedTemplate) {
        // Update existing template
        const { error } = await supabase
          .from('email_templates')
          .update({
            name: formData.name,
            subject: formData.subject,
            body_html: formData.body_html,
            body_text: formData.body_text,
            variables: formData.variables,
            is_active: formData.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedTemplate.id);

        if (error) {
          console.error('Error updating template:', error);
          toast({
            title: t('language') === 'fr' ? 'Erreur' : 'Error',
            description: t('language') === 'fr' ? 'Impossible de mettre à jour le modèle' : 'Failed to update template',
            variant: 'destructive'
          });
          return;
        }

        toast({
          title: t('language') === 'fr' ? 'Succès' : 'Success',
          description: t('language') === 'fr' ? 'Modèle mis à jour' : 'Template updated'
        });
      } else {
        // Create new template
        const { error } = await supabase
          .from('email_templates')
          .insert({
            name: formData.name,
            subject: formData.subject,
            body_html: formData.body_html,
            body_text: formData.body_text,
            variables: formData.variables,
            is_active: formData.is_active
          });

        if (error) {
          console.error('Error creating template:', error);
          toast({
            title: t('language') === 'fr' ? 'Erreur' : 'Error',
            description: t('language') === 'fr' ? 'Impossible de créer le modèle' : 'Failed to create template',
            variant: 'destructive'
          });
          return;
        }

        toast({
          title: t('language') === 'fr' ? 'Succès' : 'Success',
          description: t('language') === 'fr' ? 'Modèle créé' : 'Template created'
        });
      }

      await loadTemplates();
      setIsEditing(false);
      setSelectedTemplate(null);
      resetForm();
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: t('language') === 'fr' ? 'Erreur' : 'Error',
        description: t('language') === 'fr' ? 'Erreur lors de la sauvegarde' : 'Error saving template',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting template:', error);
        toast({
          title: t('language') === 'fr' ? 'Erreur' : 'Error',
          description: t('language') === 'fr' ? 'Impossible de supprimer le modèle' : 'Failed to delete template',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: t('language') === 'fr' ? 'Succès' : 'Success',
        description: t('language') === 'fr' ? 'Modèle supprimé' : 'Template deleted'
      });

      await loadTemplates();
      if (selectedTemplate?.id === id) {
        setSelectedTemplate(null);
        setIsEditing(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const duplicateTemplate = async (template: EmailTemplate) => {
    try {
      const { error } = await supabase
        .from('email_templates')
        .insert({
          name: `${template.name} (Copy)`,
          subject: template.subject,
          body_html: template.body_html,
          body_text: template.body_text,
          variables: template.variables,
          is_active: false
        });

      if (error) {
        console.error('Error duplicating template:', error);
        toast({
          title: t('language') === 'fr' ? 'Erreur' : 'Error',
          description: t('language') === 'fr' ? 'Impossible de dupliquer le modèle' : 'Failed to duplicate template',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: t('language') === 'fr' ? 'Succès' : 'Success',
        description: t('language') === 'fr' ? 'Modèle dupliqué' : 'Template duplicated'
      });

      await loadTemplates();
    } catch (error) {
      console.error('Error duplicating template:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      body_html: '',
      body_text: '',
      variables: [],
      is_active: true
    });
  };

  const loadTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      body_html: template.body_html,
      body_text: template.body_text,
      variables: template.variables,
      is_active: template.is_active
    });
    setIsEditing(true);
  };

  const addVariable = () => {
    if (newVariable.trim() && !formData.variables.includes(newVariable.trim())) {
      setFormData(prev => ({
        ...prev,
        variables: [...prev.variables, newVariable.trim()]
      }));
      setNewVariable('');
    }
  };

  const removeVariable = (variable: string) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter(v => v !== variable)
    }));
  };

  const generatePreview = () => {
    let preview = formData.body_html;
    formData.variables.forEach(variable => {
      const regex = new RegExp(`{{${variable}}}`, 'g');
      preview = preview.replace(regex, `[${variable}]`);
    });
    return preview;
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t('language') === 'fr' ? 'Modèles d\'email' : 'Email Templates'}
            </h1>
            <p className="text-gray-600">
              {t('language') === 'fr' 
                ? 'Gérez les modèles d\'email personnalisés'
                : 'Manage custom email templates'
              }
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => loadTemplates()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('language') === 'fr' ? 'Actualiser' : 'Refresh'}
            </Button>
            <Button onClick={() => {
              setSelectedTemplate(null);
              setIsEditing(true);
              resetForm();
            }}>
              <Plus className="h-4 w-4 mr-2" />
              {t('language') === 'fr' ? 'Nouveau modèle' : 'New Template'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Templates List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-blue-600" />
                  {t('language') === 'fr' ? 'Modèles' : 'Templates'}
                </CardTitle>
                <CardDescription>
                  {templates.length} {t('language') === 'fr' ? 'modèles' : 'templates'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {loading ? (
                    <div className="text-center text-gray-500 py-4">
                      {t('language') === 'fr' ? 'Chargement...' : 'Loading...'}
                    </div>
                  ) : templates.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">
                      {t('language') === 'fr' ? 'Aucun modèle' : 'No templates'}
                    </div>
                  ) : (
                    templates.map((template) => (
                      <div
                        key={template.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedTemplate?.id === template.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => loadTemplate(template)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {template.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {template.subject}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1">
                            {template.is_active && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                Active
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Template Editor */}
          <div className="lg:col-span-2">
            {isEditing ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Edit className="h-5 w-5 mr-2 text-purple-600" />
                      {selectedTemplate ? 'Edit Template' : 'New Template'}
                    </span>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPreview(!showPreview)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {showPreview ? 'Edit' : 'Preview'}
                      </Button>
                      <Button
                        size="sm"
                        onClick={saveTemplate}
                        disabled={saving}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {showPreview ? (
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <h3 className="font-semibold text-lg mb-2">{formData.subject}</h3>
                        <div 
                          className="prose max-w-none"
                          dangerouslySetInnerHTML={{ __html: generatePreview() }}
                        />
                      </div>
                    </div>
                  ) : (
                    <Tabs defaultValue="basic" className="w-full">
                      <TabsList>
                        <TabsTrigger value="basic">Basic</TabsTrigger>
                        <TabsTrigger value="html">HTML</TabsTrigger>
                        <TabsTrigger value="text">Text</TabsTrigger>
                        <TabsTrigger value="variables">Variables</TabsTrigger>
                      </TabsList>

                      <TabsContent value="basic" className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Template Name</label>
                          <Input
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Welcome Email"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Subject</label>
                          <Input
                            value={formData.subject}
                            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                            placeholder="e.g., Welcome to Exclusimmo!"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Active</label>
                          <Switch
                            checked={formData.is_active}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="html" className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">HTML Body</label>
                          <Textarea
                            value={formData.body_html}
                            onChange={(e) => setFormData(prev => ({ ...prev, body_html: e.target.value }))}
                            placeholder="<h1>Hello {{name}}!</h1><p>Welcome to our platform.</p>"
                            rows={12}
                            className="font-mono text-sm"
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="text" className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Text Body</label>
                          <Textarea
                            value={formData.body_text}
                            onChange={(e) => setFormData(prev => ({ ...prev, body_text: e.target.value }))}
                            placeholder="Hello {{name}}! Welcome to our platform."
                            rows={12}
                            className="font-mono text-sm"
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="variables" className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Available Variables</label>
                          <div className="flex space-x-2 mb-4">
                            <Input
                              value={newVariable}
                              onChange={(e) => setNewVariable(e.target.value)}
                              placeholder="e.g., name, email"
                              onKeyPress={(e) => e.key === 'Enter' && addVariable()}
                            />
                            <Button onClick={addVariable}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {formData.variables.map((variable) => (
                              <Badge key={variable} variant="secondary" className="flex items-center space-x-1">
                                <span>{`{{${variable}}}`}</span>
                                <button
                                  onClick={() => removeVariable(variable)}
                                  className="ml-1 hover:text-red-500"
                                >
                                  ×
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  )}
                </CardContent>
              </Card>
            ) : selectedTemplate ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Eye className="h-5 w-5 mr-2 text-green-600" />
                      {selectedTemplate.name}
                    </span>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => duplicateTemplate(selectedTemplate)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteTemplate(selectedTemplate.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Subject</label>
                    <p className="text-sm font-medium">{selectedTemplate.subject}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">
                      <Badge className={selectedTemplate.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {selectedTemplate.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Variables</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedTemplate.variables.map((variable) => (
                        <Badge key={variable} variant="secondary">
                          {`{{${variable}}}`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">HTML Preview</label>
                    <div className="mt-2 border rounded-lg p-4 bg-gray-50">
                      <div dangerouslySetInnerHTML={{ __html: selectedTemplate.body_html }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t('language') === 'fr' ? 'Sélectionnez un modèle' : 'Select a template'}
                  </h3>
                  <p className="text-gray-500">
                    {t('language') === 'fr' 
                      ? 'Choisissez un modèle à modifier ou créez-en un nouveau'
                      : 'Choose a template to edit or create a new one'
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

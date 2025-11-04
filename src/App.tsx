import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/store';
import { TranslationProvider } from "@/components/TranslationProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { PropertyProvider } from "@/contexts/PropertyContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { HomePage } from "@/pages/Home";
import { PropertiesPage } from "@/pages/Properties";
import { PropertyDetailPage } from "@/pages/PropertyDetail";
import { ServicesPage } from "@/pages/Services";
import { LoginPage } from "@/pages/Login";
import { ContactPage } from "@/pages/Contact";
import { BecomeMemberPage } from "@/pages/BecomeMember";
import { PropertyFinderPage } from "@/pages/PropertyFinder";
import { PrivateSalesPage } from "@/pages/PrivateSales";
import { PropertyVideosPage } from "@/pages/PropertyVideos";
import { ExclusiveAccessPage } from "@/pages/ExclusiveAccess";
import { AccessExpiredPage } from "@/pages/AccessExpired";
import { UserDashboard } from "@/pages/UserDashboard";
import { UserProfilePage } from "@/pages/UserProfile";
import { UserSettings } from "@/pages/UserSettings";
import PropertyAlertsPage from "@/pages/PropertyAlerts";
import { TermsPage } from "@/pages/legal/Terms";
import { PrivacyPage } from "@/pages/legal/Privacy";
import { NoticesPage } from "@/pages/legal/Notices";
import { SafetyPage } from "@/pages/legal/Safety";
import { AdminLoginPage } from "@/pages/admin/AdminLogin";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { PropertyManagement } from "@/pages/admin/PropertyManagement";
import { PropertyForm } from "@/pages/admin/PropertyForm";
import { AccountManagement } from "@/pages/admin/AccountManagement";
import { AccountForm } from "@/pages/admin/AccountForm";
import AdminSettingsPage from "@/pages/admin/Settings";
import AdminPropertyDetailPage from "@/pages/admin/PropertyDetailAdmin";
import AdminUserProfilePage from "@/pages/admin/UserProfileAdmin";
import NotFound from "./pages/NotFound";
import RequireAdmin from "@/components/admin/RequireAdmin";
import { RegisterPage } from "./pages/Register";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import AdminInquiriesPage from "@/pages/admin/Inquiries";
import ContactsPage from "@/pages/admin/Contacts";
import MembershipsPage from "@/pages/admin/Memberships";
import { Analytics } from "@/pages/admin/Analytics";
import { SystemManagement } from "@/pages/admin/SystemManagement";
import { EmailTemplates } from "@/pages/admin/EmailTemplates";
import { MediaLibrary } from "@/pages/admin/MediaLibrary";
import { NotificationManagement } from "@/pages/admin/NotificationManagement";
import FavoritesPage from "@/pages/Favorites";
import ForgotPasswordPage from "@/pages/ForgotPassword";
import ResetPasswordPage from "@/pages/ResetPassword";
import { EmailConfirmationHandler } from "@/components/EmailConfirmationHandler";
import FormSubmissionsPage from "@/pages/admin/FormSubmissions";

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <PersistGate loading={<div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Restoring your session...</p>
      </div>
    </div>} persistor={persistor}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <TranslationProvider>
            <AuthProvider>
              <PropertyProvider>
                <FavoritesProvider>
                  <NotificationProvider>
                    <BrowserRouter>
              <ScrollToTop />
              <Routes>
                {/* Admin Routes - No main layout wrapper */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin/dashboard" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
                <Route path="/admin/properties" element={<RequireAdmin><PropertyManagement /></RequireAdmin>} />
                <Route path="/admin/properties/new" element={<RequireAdmin><PropertyForm /></RequireAdmin>} />
                <Route path="/admin/properties/:id/edit" element={<RequireAdmin><PropertyForm /></RequireAdmin>} />
                <Route path="/admin/properties/:id" element={<RequireAdmin><AdminPropertyDetailPage /></RequireAdmin>} />
                <Route path="/admin/accounts" element={<RequireAdmin><AccountManagement /></RequireAdmin>} />
                <Route path="/admin/accounts/new" element={<RequireAdmin><AccountForm /></RequireAdmin>} />
                <Route path="/admin/accounts/:id/edit" element={<RequireAdmin><AccountForm /></RequireAdmin>} />
                <Route path="/admin/accounts/:id" element={<RequireAdmin><AdminUserProfilePage /></RequireAdmin>} />
                <Route path="/admin/analytics" element={<RequireAdmin><Analytics /></RequireAdmin>} />
                <Route path="/admin/form-submissions" element={<RequireAdmin><FormSubmissionsPage /></RequireAdmin>} />
                <Route path="/admin/inquiries" element={<RequireAdmin><AdminInquiriesPage /></RequireAdmin>} />
                <Route path="/admin/contacts" element={<RequireAdmin><ContactsPage /></RequireAdmin>} />
                <Route path="/admin/memberships" element={<RequireAdmin><MembershipsPage /></RequireAdmin>} />
                <Route path="/admin/system" element={<RequireAdmin><SystemManagement /></RequireAdmin>} />
                <Route path="/admin/email-templates" element={<RequireAdmin><EmailTemplates /></RequireAdmin>} />
                <Route path="/admin/media" element={<RequireAdmin><MediaLibrary /></RequireAdmin>} />
                <Route path="/admin/notifications" element={<RequireAdmin><NotificationManagement /></RequireAdmin>} />
                <Route path="/admin/settings" element={<RequireAdmin><AdminSettingsPage /></RequireAdmin>} />
                
                {/* Public Routes - With main layout wrapper */}
                <Route path="*" element={
                  <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-1">
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/properties" element={<PropertiesPage />} />
                        <Route path="/property/:id" element={<PropertyDetailPage />} />
                        <Route path="/services" element={<ServicesPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/favorites" element={<FavoritesPage />} />
                        <Route path="/become-member" element={<BecomeMemberPage />} />
                        <Route path="/property-finder" element={<PropertyFinderPage />} />
                        <Route path="/private-sales" element={<PrivateSalesPage />} />
                        <Route path="/property-videos" element={<PropertyVideosPage />} />
                        <Route path="/exclusive-access" element={<ExclusiveAccessPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/reset-password" element={<ResetPasswordPage />} />
                        <Route path="/confirm-email" element={<EmailConfirmationHandler />} />
                        <Route path="/access-expired" element={<AccessExpiredPage />} />
                        
                        {/* User Panel Routes */}
                        {/* <Route path="/dashboard" element={<UserDashboard />} /> */}
                        <Route path="/profile" element={<UserProfilePage />} />
                        <Route path="/settings" element={<UserSettings />} />
                        <Route path="/alerts" element={<PropertyAlertsPage />} />
                        <Route path="/legal/terms" element={<TermsPage />} />
                        <Route path="/legal/privacy" element={<PrivacyPage />} />
                        <Route path="/legal/notices" element={<NoticesPage />} />
                        <Route path="/legal/safety" element={<SafetyPage />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                    <Footer />
                  </div>
                } />
              </Routes>
              <Toaster />
              <Sonner />
                    </BrowserRouter>
                  </NotificationProvider>
                </FavoritesProvider>
              </PropertyProvider>
            </AuthProvider>
          </TranslationProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </PersistGate>
  </Provider>
);

export default App;

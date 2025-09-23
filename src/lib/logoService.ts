import { supabase } from './supabaseClient';

export class LogoService {
  private static logoUrl: string | null = null;
  private static listeners: ((logoUrl: string | null) => void)[] = [];
  private static readonly DEFAULT_LOGO_URL = 'https://fgqwnynlilmjasimrikq.supabase.co/storage/v1/object/public/logos/logos/logo_1758465145084.png';

  /**
   * Get the current logo URL from memory
   */
  static getLogoUrl(): string | null {
    return this.logoUrl || this.DEFAULT_LOGO_URL;
  }

  /**
   * Get the default logo URL
   */
  static getDefaultLogoUrl(): string {
    return this.DEFAULT_LOGO_URL;
  }

  /**
   * Subscribe to logo changes
   */
  static subscribe(callback: (logoUrl: string | null) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  /**
   * Notify all listeners of logo changes
   */
  private static notifyListeners(): void {
    this.listeners.forEach(callback => callback(this.logoUrl));
  }

  /**
   * Load logo from database and update localStorage
   */
  static async loadLogo(): Promise<string> {
    try {
      // First check localStorage
      const storedLogo = localStorage.getItem('site_logo');
      if (storedLogo) {
        this.logoUrl = storedLogo;
        this.notifyListeners();
        return storedLogo;
      }

      // If not in localStorage, fetch from database
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'logo_url')
        .single();

      if (error) {
        console.error('Error fetching logo from database:', error);
        // Return default logo if database fetch fails
        this.logoUrl = this.DEFAULT_LOGO_URL;
        this.notifyListeners();
        return this.DEFAULT_LOGO_URL;
      }

      const logoUrl = data?.value || this.DEFAULT_LOGO_URL;
      
      // Store in localStorage for future use
      localStorage.setItem('site_logo', logoUrl);
      this.logoUrl = logoUrl;
      this.notifyListeners();

      return logoUrl;
    } catch (error) {
      console.error('Error in loadLogo:', error);
      // Return default logo if any error occurs
      this.logoUrl = this.DEFAULT_LOGO_URL;
      this.notifyListeners();
      return this.DEFAULT_LOGO_URL;
    }
  }

  /**
   * Update logo URL (used by admin settings)
   */
  static updateLogo(logoUrl: string | null): void {
    this.logoUrl = logoUrl;
    
    if (logoUrl) {
      localStorage.setItem('site_logo', logoUrl);
    } else {
      localStorage.removeItem('site_logo');
    }
    
    this.notifyListeners();
  }

  /**
   * Clear logo
   */
  static clearLogo(): void {
    this.logoUrl = null;
    localStorage.removeItem('site_logo');
    this.notifyListeners();
  }

  /**
   * Test if a logo URL is accessible
   */
  static async testLogoUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.log('Logo URL test failed:', error);
      return false;
    }
  }

  /**
   * Get logo with fallback - tries custom logo first, then default
   */
  static async getLogoWithFallback(): Promise<string> {
    const customLogo = this.logoUrl;
    
    if (customLogo && customLogo !== this.DEFAULT_LOGO_URL) {
      const isAccessible = await this.testLogoUrl(customLogo);
      if (isAccessible) {
        return customLogo;
      }
      console.log('Custom logo not accessible, falling back to default');
    }
    
    return this.DEFAULT_LOGO_URL;
  }
}

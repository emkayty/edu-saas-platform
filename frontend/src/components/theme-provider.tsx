'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface TenantColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

interface TenantBranding {
  logo?: string;
  logoDark?: string;
  favicon?: string;
  banner?: string;
  colors: TenantColors;
  typography: {
    fontFamily?: string;
    fontFamilyHeadings?: string;
  };
}

interface TenantConfig {
  id: string;
  slug: string;
  name: string;
  shortName?: string;
  type: 'university' | 'polytechnic';
  category: 'federal' | 'state' | 'private';
  branding: TenantBranding;
  features: {
    aiEnabled: boolean;
    mobileAppEnabled: boolean;
    customDomainEnabled: boolean;
  };
  academic: {
    gradingSystem: string;
    sessionType: string;
    maxLevels: number;
    carryOverEnabled: boolean;
    industrialTrainingEnabled: boolean;
  };
}

interface ThemeContextType {
  tenant: TenantConfig | null;
  isLoading: boolean;
  error: string | null;
  refreshTenant: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  tenant: null,
  isLoading: true,
  error: null,
  refreshTenant: async () => {},
});

// Default theme (fallback)
const DEFAULT_THEME: TenantConfig = {
  id: 'default',
  slug: 'default',
  name: 'EduSaaS',
  type: 'university',
  category: 'private',
  branding: {
    colors: {
      primary: '#1E3A8A',
      secondary: '#3B82F6',
      accent: '#F59E0B',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      text: '#1E293B',
      textSecondary: '#64748B',
      border: '#E2E8F0',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
    },
  },
  features: {
    aiEnabled: true,
    mobileAppEnabled: true,
    customDomainEnabled: true,
  },
  academic: {
    gradingSystem: '5_point',
    sessionType: 'semester',
    maxLevels: 4,
    carryOverEnabled: true,
    industrialTrainingEnabled: false,
  },
};

export function ThemeProvider({ 
  children, 
  tenantSlug 
}: { 
  children: React.ReactNode;
  tenantSlug?: string;
}) {
  const [tenant, setTenant] = useState<TenantConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTenantConfig = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // If no tenant slug provided, use default theme
      if (!tenantSlug) {
        setTenant(DEFAULT_THEME);
        return;
      }

      // Fetch tenant configuration from API
      const response = await fetch(`/api/tenants/${tenantSlug}/config`);
      
      if (!response.ok) {
        throw new Error('Failed to load tenant configuration');
      }

      const data = await response.json();
      setTenant(data);
    } catch (err) {
      console.error('Failed to fetch tenant config:', err);
      setError(err instanceof Error ? err.message : 'Failed to load theme');
      // Fall back to default theme
      setTenant(DEFAULT_THEME);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply theme CSS variables
  useEffect(() => {
    if (!tenant) return;

    const root = document.documentElement;
    const colors = tenant.branding.colors;
    const typography = tenant.branding.typography;

    // Apply color variables
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--primary-light', adjustColor(colors.primary, 20));
    root.style.setProperty('--primary-dark', adjustColor(colors.primary, -20));
    root.style.setProperty('--secondary', colors.secondary);
    root.style.setProperty('--secondary-light', adjustColor(colors.secondary, 20));
    root.style.setProperty('--secondary-dark', adjustColor(colors.secondary, -20));
    root.style.setProperty('--accent', colors.accent);
    root.style.setProperty('--accent-light', adjustColor(colors.accent, 30));
    root.style.setProperty('--accent-dark', adjustColor(colors.accent, -20));

    // Apply background and surface
    root.style.setProperty('--background', colors.background);
    root.style.setProperty('--surface', colors.surface);
    root.style.setProperty('--text', colors.text);
    root.style.setProperty('--text-secondary', colors.textSecondary);
    root.style.setProperty('--border', colors.border);

    // Apply status colors
    root.style.setProperty('--success', colors.success);
    root.style.setProperty('--warning', colors.warning);
    root.style.setProperty('--error', colors.error);
    root.style.setProperty('--info', colors.info);

    // Apply typography
    root.style.setProperty('--font-family', typography.fontFamily || 'Inter, system-ui, sans-serif');
    root.style.setProperty('--font-family-headings', typography.fontFamilyHeadings || typography.fontFamily || 'Inter, system-ui, sans-serif');

    // Apply default values for other CSS variables
    root.style.setProperty('--radius', '0.5rem');
    root.style.setProperty('--shadow', '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)');
    root.style.setProperty('--shadow-sm', '0 1px 2px 0 rgb(0 0 0 / 0.05)');
    root.style.setProperty('--shadow-md', '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)');
    root.style.setProperty('--shadow-lg', '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)');
    root.style.setProperty('--shadow-xl', '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)');
    root.style.setProperty('--animation-duration', '0.3s');

    // Update favicon if provided
    if (tenant.branding.favicon) {
      const link = document.querySelector('link[rel="icon"]') as HTMLLinkElement || document.createElement('link');
      link.rel = 'icon';
      link.href = tenant.branding.favicon;
      document.head.appendChild(link);
    }

    // Update document title
    document.title = `${tenant.name} Portal`;
  }, [tenant]);

  useEffect(() => {
    fetchTenantConfig();
  }, [tenantSlug]);

  return (
    <ThemeContext.Provider value={{ tenant, isLoading, error, refreshTenant: fetchTenantConfig }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

// Helper function to adjust color brightness
function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  
  return '#' + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1);
}

// Hook to get tenant-specific class names
export function useTenantClass() {
  const { tenant } = useTheme();
  
  return {
    primary: 'bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)]',
    secondary: 'bg-[var(--secondary)] text-white hover:bg-[var(--secondary-dark)]',
    accent: 'bg-[var(--accent)] text-[var(--text)]',
    background: 'bg-[var(--background)]',
    surface: 'bg-[var(--surface)] border-[var(--border)]',
    text: 'text-[var(--text)]',
    textSecondary: 'text-[var(--text-secondary)]',
    border: 'border-[var(--border)]',
    success: 'text-[var(--success)] bg-[var(--success)]/10',
    warning: 'text-[var(--warning)] bg-[var(--warning)]/10',
    error: 'text-[var(--error)] bg-[var(--error)]/10',
    info: 'text-[var(--info)] bg-[var(--info)]/10',
  };
}
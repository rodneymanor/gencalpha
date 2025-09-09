// Configuration constants for different environments
export const CONFIG = {
  production: {
    baseUrl: 'https://www.gencapp.pro',
    allowUrlChange: false,
  },
  development: {
    baseUrl: 'http://localhost:3000',
    allowUrlChange: true,
  }
};

// Get current config based on build mode
export const getConfig = () => {
  // This will be replaced during build time
  const mode = process.env.NODE_ENV || 'development';
  return mode === 'production' ? CONFIG.production : CONFIG.development;
};

// Export for use in extension
export const EXTENSION_CONFIG = getConfig();
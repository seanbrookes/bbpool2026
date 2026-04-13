module.exports = {
  // 1. ADD THIS: Ensures /about becomes /about/index.html
  // Fixes routing 500s/404s on static hosts
  trailingSlash: true,

  // 2. ADD THIS: Disables server-side image processing
  images: {
    unoptimized: true,
  },

  webpack: (config, { isServer }) => {
    // Keep your existing fallback logic
    if (!isServer) {
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        fs: false,
        net: false,
        tls: false,
        dns: false,
      };
    } else {
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        net: false,
        tls: false,
        dns: false,
      };
    }

    return config;
  },
};
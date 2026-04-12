module.exports = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Fixes npm packages that depend on `fs`, `net`, `tls`, and `dns` modules.

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

    // Important: return the modified config
    return config;
  },
};

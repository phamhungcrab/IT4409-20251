/**
 * PostCSS configuration for Tailwind CSS.
 *
 * Vite and other bundlers will automatically detect this file
 * and apply the configured plugins.  Tailwind scans the files
 * specified in `tailwind.config.js` for class names and
 * generates the corresponding styles at build time.  The
 * autoprefixer plugin adds vendor prefixes for broader
 * browser compatibility.
 */
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
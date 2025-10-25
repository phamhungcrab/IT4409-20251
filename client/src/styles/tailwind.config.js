/**
 * Tailwind CSS configuration file.
 *
 * Defines the content sources, theme extensions and plugins used in
 * this project.  Tailwind will scan the specified files for class
 * names and generate the corresponding styles.  Customize the `theme`
 * section to define your own colours, fonts and spacing scale.  You
 * can also add plugins like `@tailwindcss/forms` to style form
 * elements consistently.  See https://tailwindcss.com/docs/configuration
 * for more information.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './public/index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Define a primary colour palette for consistent branding
        primary: {
          light: '#60a5fa',
          DEFAULT: '#3b82f6',
          dark: '#2563eb',
        },
        secondary: {
          light: '#fbbf24',
          DEFAULT: '#f59e0b',
          dark: '#d97706',
        },
      },
      fontFamily: {
        // Custom font families can be declared here
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
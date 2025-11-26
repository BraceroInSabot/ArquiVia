/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'arquivia-teal': '#008C99',
        'arquivia-charcoal': '#34495E',
        'arquivia-white': '#F4F6F7',
        'arquivia-black': '#1C2833',
      }
    },
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      {
        light: {
          "primary": "#008C99",          // Ciano/Teal
          "primary-content": "#ffffff",  // Texto branco
          "secondary": "#34495E",        // Cinza Carvão
          "secondary-content": "#ffffff",
          "accent": "#F39C12",
          "neutral": "#1C2833",
          "base-100": "#F4F6F7",
          
          "info": "#3498DB",
          "success": "#2ECC71",
          "warning": "#F39C12",
          "error": "#E74C3C",

          "--rounded-box": "0.5rem",
          "--rounded-btn": "0.3rem", 
        },
      },
    ],
    // Força o tema light modificado como padrão
    darkTheme: "light", 
    base: true,
    styled: true,
    utils: true,
    prefix: "",
    logs: false,
  },
}
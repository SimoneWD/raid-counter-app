/** @type {import('tailwindcss').Config} */
module.exports = {
  // Specifica i file da scansionare per le classi Tailwind
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Tutti i file JavaScript/TypeScript/JSX/TSX nella cartella src
    "./public/index.html",       // Il tuo file index.html
  ],
  theme: {
    extend: {
      // Puoi estendere il tema di Tailwind qui (es. colori, font, spaziature)
      fontFamily: {
        inter: ['Inter', 'sans-serif'], // Aggiungi il font Inter
      },
      colors: {
        // Esempi di colori personalizzati
        'gray-750': '#3f495a', // Un grigio leggermente più chiaro per l'hover
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-up': {
          '0%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'scale-up': 'scale-up 0.3s ease-out forwards',
      },
    },
  },
  plugins: [], // Aggiungi plugin di Tailwind qui se ne hai
}

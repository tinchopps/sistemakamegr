/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                kame: {
                    orange: '#E67E22', // Primary
                    dark: '#000000',   // Background
                    surface: '#121212', // Card/Surface
                    gray: '#1E1E1E',    // Secondary Surface
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'], // Premium font
            },
            borderRadius: {
                '2xl': '1rem',
                '3xl': '1.5rem',
            }
        },
    },
    plugins: [],
}

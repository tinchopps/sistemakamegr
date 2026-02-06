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
                    orange: '#E67E22', // Primary (Nuclear: #E67E22)
                    dark: '#121212',   // Background (Nuclear: #121212)
                    card: '#1E1E1E',   // Cards (Nuclear: #1E1E1E)
                    surface: '#1E1E1E', // Alias for surface
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

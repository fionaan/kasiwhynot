/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.{html,js}"],
  theme: {
    extend: { 
      colors: {
      "bgColor": "#E2E2F2",
      "overlay": "001F54",
      "overButton": "ABC8FF",
      "darkBlutton": "001F44",
      "popupColor": "BFD9FF"
      },

      borderRadius: {
      'login': '0.75rem',
      },

      height: {
        'login': '22rem'
      },

      fontSize: {
        'search': '1.025rem'
      },

      flexGrow: {
        '3': 3
      }
    },

  },
  plugins: [],
}


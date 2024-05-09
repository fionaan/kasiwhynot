/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.{html,js}"],
  theme: {
    extend: { 
      colors: {
      "bgColor": "EEEEFF",
      "bgColorWh": "FDFDFD",
      "overlay": "001F54",
      "overButton": "ABC8FF",
      "darkButton": "001F44",
      "hoverDarkBlue": "004496",
      "activeDarkBlue": "00144F",
      "popupColor": "BFD9FF"
      },

      borderRadius: {
      'login': '0.75rem',
      },

      height: {
        'login': '22rem',
        'computed-height': 'calc(96vh - (48px + 88px + 32px))',
        'medium-pic': '9px'
      }
    },

  },
  plugins: [],
}


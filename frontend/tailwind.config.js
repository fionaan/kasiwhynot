/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.{html,js}"],
  theme: {
    extend: { 
      colors: {
      "bgColor": "F2F7FF",
      "bgColorWh": "FDFDFD",
      "bgColorWh2": "F0F2F5",
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


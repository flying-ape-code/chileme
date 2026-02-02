/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B6B',     // 珊瑚色 - 吃了么主题色
        secondary: '#4ECDC4',   // 清新绿 - 健康感
        accent: '#FFE66D',      // 橙色 - 食欲
        neutral: '#F3F4F6',      // 浅灰 - 背景
        danger: '#EF4444',      // 红色 - 危险
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

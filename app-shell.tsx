@tailwind base;
@tailwind components;
@tailwind utilities;

:root { color-scheme: light; }
html.dark { color-scheme: dark; }
body { @apply min-h-screen bg-[#f5f5f7] text-[#1d1d1f] antialiased dark:bg-[#08080a] dark:text-white; }
* { box-sizing: border-box; }
input, button, select { font: inherit; }
.card { @apply rounded-[28px] border border-black/5 bg-white/90 shadow-[0_12px_40px_rgba(0,0,0,0.07)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06]; }
.field { @apply w-full rounded-2xl border border-black/10 bg-black/[0.025] px-4 py-3.5 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 dark:border-white/10 dark:bg-white/[0.06]; }
.btn-primary { @apply inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1d1d1f] px-5 py-3.5 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black; }
.btn-secondary { @apply inline-flex items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2.5 font-semibold transition hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10; }
.badge { @apply inline-flex items-center rounded-full px-3 py-1 text-xs font-bold; }

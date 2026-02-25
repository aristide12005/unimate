import os

css_content = """@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Alabaster/Warm Pearl Background */
    --background: 40 33% 98%;
    /* Slate Text Foreground */
    --foreground: 222 20% 15%;

    --card: 0 0% 100%;
    --card-foreground: 222 20% 15%;

    --popover: 0 0% 100%;
    --popover-foreground: 222 20% 15%;

    /* Primary: Vibrant Nordic Coral */
    --primary: 15 85% 55%;
    --primary-foreground: 0 0% 100%;

    /* Secondary: Deep Midnight Marine */
    --secondary: 222 47% 15%;
    --secondary-foreground: 0 0% 100%;

    /* Muted Slate/Gray */
    --muted: 210 20% 96%;
    --muted-foreground: 215 16% 47%;

    /* Accent & Destructive optically balanced with Primary */
    --accent: 15 85% 55%;
    --accent-foreground: 0 0% 100%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --border: 214 32% 91%;
    --input: 214 32% 91%;
    --ring: 15 85% 55%;

    --radius: 1rem;

    --sidebar-background: 40 33% 98%;
    --sidebar-foreground: 222 20% 15%;
    --sidebar-primary: 222 47% 15%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 210 20% 96%;
    --sidebar-accent-foreground: 222 20% 15%;
    --sidebar-border: 214 32% 91%;
    --sidebar-ring: 15 85% 55%;

    --gold: 45 90% 55%;
  }

  .dark {
    /* Dark Slate Background */
    --background: 222 47% 11%;
    /* Light Mode Alabaster for Text */
    --foreground: 40 33% 98%;

    --card: 222 47% 13%;
    --card-foreground: 40 33% 98%;

    --popover: 222 47% 13%;
    --popover-foreground: 40 33% 98%;

    --primary: 15 85% 55%;
    --primary-foreground: 0 0% 100%;

    --secondary: 217 33% 17%;
    --secondary-foreground: 0 0% 100%;

    --muted: 217 33% 17%;
    --muted-foreground: 215 20% 65%;

    --accent: 15 85% 55%;
    --accent-foreground: 0 0% 100%;

    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;

    --border: 217 33% 17%;
    --input: 217 33% 17%;
    --ring: 15 85% 55%;

    --sidebar-background: 222 47% 11%;
    --sidebar-foreground: 40 33% 98%;
    --sidebar-primary: 15 85% 55%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 217 33% 17%;
    --sidebar-accent-foreground: 40 33% 98%;
    --sidebar-border: 217 33% 17%;
    --sidebar-ring: 15 85% 55%;
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground font-sans;
    font-family: 'Nunito', sans-serif;
  }
}

@layer utilities {
  /* Dimensionality and Blur per user feedback */
  
  .glass-panel {
    @apply bg-background/60 backdrop-blur-xl border border-white/20 shadow-lg;
  }
  
  .glass-panel-dark {
    @apply bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl;
  }

  .glow-ring {
    box-shadow: 0 0 25px 8px hsl(15 85% 55% / 0.15);
  }

  .glow-ring-active {
    box-shadow: 0 0 35px 12px hsl(15 85% 55% / 0.25);
  }

  .shadow-soft {
    box-shadow: 0 8px 30px rgba(0,0,0,0.04);
  }
  
  .shadow-elevated {
    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.08);
  }

  .gradient-primary-btn {
    background: linear-gradient(135deg, hsl(15 85% 55%), hsl(10 80% 45%));
    box-shadow: 0 8px 25px hsl(15 85% 55% / 0.25);
  }

  .gradient-secondary-btn {
    background: linear-gradient(135deg, hsl(222 47% 15%), hsl(222 47% 10%));
    box-shadow: 0 8px 25px hsl(222 47% 15% / 0.25);
  }

  .radar-ring {
    border: 1.5px solid hsl(15 85% 55% / 0.35);
  }

  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  /* ── Capacitor / Native Safe Areas ─────────────────────────────── */
  .safe-top {
    padding-top: env(safe-area-inset-top);
  }

  .safe-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }

  .safe-left {
    padding-left: env(safe-area-inset-left);
  }

  .safe-right {
    padding-right: env(safe-area-inset-right);
  }

  .safe-area-all {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
  }
}
"""

with open('src/index.css', 'w', encoding='utf-8') as f:
    f.write(css_content)

print("index.css updated!")

import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#000000",
        carbon: "#0a0a0a",
        gunmetal: "#13151a",
        steel: "#1f2127",
        chrome: "#9aa0a6",
        bone: "#e6e6e6",
        neon: {
          DEFAULT: "#ff0000",
          50: "#fff5f5",
          100: "#ffe1e1",
          200: "#ffaaaa",
          300: "#ff6b6b",
          400: "#ff3030",
          500: "#ff0000",
          600: "#d40000",
          700: "#a00000",
          800: "#6e0000",
          900: "#3d0000"
        }
      },
      fontFamily: {
        display: ["var(--font-orbitron)", "system-ui", "sans-serif"],
        stencil: ["var(--font-bebas)", "Impact", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"]
      },
      boxShadow: {
        neon: "0 0 16px rgba(255,0,0,0.45), 0 0 48px rgba(255,0,0,0.25)",
        "neon-sm": "0 0 8px rgba(255,0,0,0.45)",
        "neon-lg": "0 0 32px rgba(255,0,0,0.55), 0 0 96px rgba(255,0,0,0.3)",
        edge: "inset 0 0 0 1px rgba(255,0,0,0.45)"
      },
      backgroundImage: {
        "neon-gradient": "linear-gradient(135deg,#ff0000 0%,#a00000 100%)",
        "carbon-grid":
          "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
        "radial-glow":
          "radial-gradient(circle at center, rgba(255,0,0,0.18) 0%, rgba(0,0,0,0) 70%)"
      },
      keyframes: {
        flicker: {
          "0%,19.999%,22%,62.999%,64%,64.999%,70%,100%": { opacity: "1" },
          "20%,21.999%,63%,63.999%,65%,69.999%": { opacity: "0.55" }
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" }
        },
        glitch: {
          "0%,100%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px,1px)" },
          "40%": { transform: "translate(2px,-1px)" },
          "60%": { transform: "translate(-1px,-2px)" },
          "80%": { transform: "translate(1px,2px)" }
        },
        pulseRed: {
          "0%,100%": { boxShadow: "0 0 0 0 rgba(255,0,0,0.5)" },
          "50%": { boxShadow: "0 0 24px 6px rgba(255,0,0,0.0)" }
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" }
        }
      },
      animation: {
        flicker: "flicker 4s infinite",
        scan: "scan 2.4s linear infinite",
        glitch: "glitch 0.4s steps(2) infinite",
        pulseRed: "pulseRed 2s cubic-bezier(0.4,0,0.6,1) infinite",
        marquee: "marquee 30s linear infinite"
      }
    }
  },
  plugins: []
};

export default config;

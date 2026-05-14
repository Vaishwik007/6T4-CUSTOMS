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
          // Brand "signal" red — replaces pure #ff0000 with a deliberate,
          // print-correct red (close to Akrapovic / Brabus territory).
          DEFAULT: "#E10500",
          50: "#fff5f5",
          100: "#ffe4e1",
          200: "#ffb0a8",
          300: "#ff7d70",
          400: "#f53527",
          500: "#E10500",
          600: "#b50400",
          700: "#820300",
          800: "#570200",
          900: "#2e0100"
        },
        // Secondary accent used sparingly for Stage 2 tier badges, warnings,
        // "in progress" states. Keeps red reserved for primary/marketing.
        ignition: {
          DEFAULT: "#FF6A00",
          500: "#FF6A00",
          600: "#cc5500",
          900: "#3d1900"
        },
        // Semantic tokens
        success: "#10b981",
        warn: "#f59e0b",
        danger: "#ef4444"
      },
      fontFamily: {
        display: ["var(--font-orbitron)", "system-ui", "sans-serif"],
        stencil: ["var(--font-bebas)", "Impact", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"]
      },
      boxShadow: {
        neon: "0 0 14px rgba(225,5,0,0.42), 0 0 42px rgba(225,5,0,0.22)",
        "neon-sm": "0 0 8px rgba(225,5,0,0.42)",
        "neon-lg": "0 0 28px rgba(225,5,0,0.5), 0 0 84px rgba(225,5,0,0.28)",
        edge: "inset 0 0 0 1px rgba(225,5,0,0.42)"
      },
      backgroundImage: {
        "neon-gradient": "linear-gradient(135deg,#E10500 0%,#820300 100%)",
        "carbon-grid":
          "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
        "radial-glow":
          "radial-gradient(circle at center, rgba(225,5,0,0.18) 0%, rgba(0,0,0,0) 70%)"
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
          "0%,100%": { boxShadow: "0 0 0 0 rgba(225,5,0,0.5)" },
          "50%": { boxShadow: "0 0 24px 6px rgba(225,5,0,0.0)" }
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

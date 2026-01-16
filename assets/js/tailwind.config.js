
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui"] },
          colors: {
            fb: {
              primary: "#009661",  // leaf / emerald
              deep:    "#227E58",  // deeper green
              accent:  "#BFF27B",  // lemon / lime
              red:     "#9C0322",  // Logo background red
              soft:    "#F4FBF8",  // mint-white
              ink:     "#1F2933"   // charcoal text
            }
          },
          boxShadow: {
            soft: "0 10px 28px rgba(0,150,97,0.15)",
            lift: "0 22px 55px rgba(0,150,97,0.25)"
          },
          keyframes: {
            floaty: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-3px)" } }
          },
          animation: {
            floaty: "floaty 2.5s ease-in-out infinite"
          }
        }
      }
    }
  
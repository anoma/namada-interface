export const colors = {
  bond: "#00ffff",
  balance: "#ffffff",
  unbond: "#DD1599",
  shielded: "#ffff00",
  empty: "#2F2F2F",
};

export const keyframes = {
  niceSpin: {
    "0%": { transform: "rotateZ(0)" },
    "25%, 90%": { transform: "rotateZ(180deg)" },
    "100%": { transform: "rotateZ(360deg)" },
  },
  loading: {
    from: {
      transform: "rotate(0turn)",
    },
    to: {
      transform: "rotate(1turn)",
    },
  },
};

export const animation = {
  niceSpin: "niceSpin 1s ease-out infinite 1s",
  loadingSpinner: "loading 1s ease infinite",
};

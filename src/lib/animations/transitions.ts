export const transitions = {
  layout: {
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
  },
  input: {
    empty: {
      y: 0,
      scale: 1,
      width: "100%",
      maxWidth: "42rem",
    },
    active: {
      y: 0,
      scale: 1,
      width: "100%",
      maxWidth: "100%",
    },
  },
  thread: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.15, duration: 0.3 },
  },
};

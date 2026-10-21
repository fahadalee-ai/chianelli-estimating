/**
 * Chianelli Estimating design tokens.
 * Components read these values directly or through the CSS variables in styles.css.
 * Keep styles.css :root in sync with this file.
 */
export const theme = {
  color: {
    primary: "#D62828",
    primaryDark: "#9D0208",
    black: "#0B0B0B",
    charcoal: "#1C1C1E",
    background: "#F5F5F7",
    white: "#FFFFFF",
    text: "#111111",
    textSecondary: "#6B7280",
    success: "#22C55E",
    warning: "#F59E0B",
    line: "#E6E6EA",
    danger: "#9D0208",
  },
  chart: {
    materials: "#D62828",
    labour: "#0B0B0B",
    permits: "#F59E0B",
    equipment: "#6B7280",
    overhead: "#9D0208",
    contingency: "#22C55E",
  },
  radius: {
    card: 16,
    input: 12,
    pill: 999,
  },
  space: 8,
  touch: 48,
  shadow: "0 10px 30px rgba(11, 11, 11, 0.08)",
  shadowSoft: "0 6px 18px rgba(11, 11, 11, 0.06)",
  font: {
    heading: '"Poppins", ui-sans-serif, system-ui, sans-serif',
    body: '"Inter", ui-sans-serif, system-ui, sans-serif',
  },
};

export const chartColor = (key) => theme.chart[key] || theme.color.primary;

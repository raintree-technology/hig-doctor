export const SEVERITY_ORDER = {
  error: 0,
  warning: 1
};

export const truncate = (value, maxLength) => {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, Math.max(0, maxLength - 1))}…`;
};

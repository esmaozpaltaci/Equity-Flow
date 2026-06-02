export const shortenAddress = (address) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatTokenAmount = (bigint, decimals = 18, displayDecimals = 4) => {
  if (!bigint && bigint !== 0n) return "0";
  try {
    const divisor = 10n ** BigInt(decimals);
    const whole = bigint / divisor;
    const fraction = bigint % divisor;
    const fractionStr = fraction.toString().padStart(decimals, "0").slice(0, displayDecimals);
    return `${whole.toLocaleString()}.${fractionStr}`;
  } catch {
    return "0";
  }
};

export const formatEther = (bigint, displayDecimals = 6) => {
  if (!bigint && bigint !== 0n) return "0";
  try {
    const divisor = 10n ** 18n;
    const whole = bigint / divisor;
    const fraction = bigint % divisor;
    const fractionStr = fraction.toString().padStart(18, "0").slice(0, displayDecimals);
    return `${whole}.${fractionStr}`;
  } catch {
    return "0";
  }
};

export const formatHours = (hours) => {
  const n = Number(hours);
  if (n === 0) return "0s";
  if (n < 1000) return `${n}s`;
  return `${n.toLocaleString()}s`;
};

export const formatTimestamp = (ts) => {
  if (!ts) return "-";
  const ms = typeof ts === "bigint" ? Number(ts) * 1000 : Number(ts) * 1000;
  return new Date(ms).toLocaleString("tr-TR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

export const formatDate = (ts) => {
  if (!ts) return "-";
  const ms = typeof ts === "bigint" ? Number(ts) * 1000 : Number(ts) * 1000;
  return new Date(ms).toLocaleDateString("tr-TR", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

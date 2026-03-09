export const calculateTickInterval = (min: number, max: number) => {
  const range = max - min;
  const desiredTicks = 5;
  const rawInterval = range / desiredTicks;

  const magnitude = Math.pow(10, Math.floor(Math.log10(rawInterval)));
  const niceInterval = Math.ceil(rawInterval / magnitude) * magnitude;

  return niceInterval;
};

export function formatCurrency(num: number): string {
  if (num === null || num === undefined) return "0";

  const absNum = Math.abs(num);

  if (absNum >= 1_000_000_000_000) {
    return (num / 1_000_000_000_000).toFixed(1).replace(/\.0$/, "") + "T";
  }
  if (absNum >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
  }
  if (absNum >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (absNum >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  }

  return num.toString();
}

export const base64ToFile = (base64: string, filename: string): File => {
  const arr = base64.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

export const getImageFileType = (base64: string) => {
  const match = base64.match(/^data:(image\/[a-zA-Z]+);base64,/);
  if (!match) throw new Error("Invalid image format");

  const mimeType = match[1]; // e.g., image/png
  const extension = mimeType.split("/")[1]; // e.g., png

  return extension;
};
export function formatInputWithCommas(number: string) {
  // Convert input to string and remove all non-digit and non-dot characters
  let sanitized = String(number).replace(/[^0-9.]/g, "");

  // Keep only the first dot — remove any additional ones
  const firstDotIndex = sanitized.indexOf(".");
  if (firstDotIndex !== -1) {
    sanitized =
      sanitized.slice(0, firstDotIndex + 1) +
      sanitized.slice(firstDotIndex + 1).replace(/\./g, "");
  }

  // Split integer and decimal parts
  const [integerPart, decimalPart] = sanitized.split(".");

  // Add commas to the integer part
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Combine with decimal if it exists
  return decimalPart !== undefined
    ? `${formattedInteger}.${decimalPart}`
    : formattedInteger;
}

export function convertToNumber(number: string) {
  if (!number) return 0;

  const numeric = String(number)?.replace(/[^0-9.]/g, "");
  const parsed = parseFloat(numeric);
  return isNaN(parsed) ? 0 : parsed;
}

export function validateHeaders(
  headers: string[],
  expectedHeaders: string[],
): {
  valid: boolean;
  missing: string[];
} {
  const missing = expectedHeaders.filter((h) => !headers.includes(h));
  return {
    valid: missing.length === 0,
    missing,
  };
}

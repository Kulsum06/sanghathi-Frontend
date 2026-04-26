export const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://www.sanghathi.com").replace(/\/$/, "");

export const buildCanonicalUrl = (pathname = "/") => {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${SITE_URL}${normalizedPath}`;
};

export const toAbsoluteUrl = (urlOrPath) => {
  if (!urlOrPath) {
    return `${SITE_URL}/apple-touch-icon.png`;
  }

  if (/^https?:\/\//i.test(urlOrPath)) {
    return urlOrPath;
  }

  return `${SITE_URL}${urlOrPath.startsWith("/") ? urlOrPath : `/${urlOrPath}`}`;
};

export const compactObject = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => compactObject(item))
      .filter((item) => item !== undefined && item !== null && item !== "");
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .map(([key, nestedValue]) => [key, compactObject(nestedValue)])
        .filter(([, nestedValue]) => {
          if (Array.isArray(nestedValue)) {
            return nestedValue.length > 0;
          }

          return nestedValue !== undefined && nestedValue !== null && nestedValue !== "";
        })
    );
  }

  return value;
};

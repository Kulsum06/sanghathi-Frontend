export const APPLE_LOGO_PATH = "/apple-touch-icon.png";

const getAbsoluteLogoUrl = () => {
  if (typeof window === "undefined") {
    return APPLE_LOGO_PATH;
  }

  return `${window.location.origin}${APPLE_LOGO_PATH}`;
};

export const buildBrandedMailto = (
  email,
  {
    subject = "Sanghathi Support",
    intro = "Hello Sanghathi Team,",
    details = "I need help with:",
    includePageContext = true,
  } = {}
) => {
  if (!email) {
    return "";
  }

  const currentPage =
    includePageContext && typeof window !== "undefined"
      ? `Page: ${window.location.pathname}`
      : "";

  const body = [
    intro,
    "",
    details,
    currentPage,
    "",
    `Logo: ${getAbsoluteLogoUrl()}`,
    "",
    "Regards,",
  ].join("\n");

  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

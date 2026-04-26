const safeParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const resolveDraftScopeId = () => {
  if (typeof window === "undefined") {
    return "default";
  }

  const params = new URLSearchParams(window.location.search || "");
  const scopedIdFromUrl =
    params.get("menteeId") || params.get("studentId") || params.get("userId");

  if (scopedIdFromUrl) {
    return scopedIdFromUrl;
  }

  const user = safeParse(localStorage.getItem("user") || "null");
  return user?._id || user?.id || "default";
};

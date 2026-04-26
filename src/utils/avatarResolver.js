export const getAvatarSrc = (entity) => {
  if (!entity || typeof entity !== "object") {
    return null;
  }

  return (
    entity.profile?.photo ||
    entity.photo ||
    entity.avatar ||
    entity.facultyProfile?.photo ||
    entity.studentProfile?.photo ||
    null
  );
};

export const getAvatarFallbackText = (name) => {
  if (typeof name !== "string") {
    return "?";
  }

  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
};

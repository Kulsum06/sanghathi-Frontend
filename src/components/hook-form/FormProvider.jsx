import { useMemo } from "react";
import PropTypes from 'prop-types';
// form
import { FormProvider as Form } from 'react-hook-form';
import useDraftPersistence from "../../hooks/useDraftPersistence";
import { resolveDraftScopeId } from "../../utils/draftScope";

const DRAFT_EXCLUDED_PATH_FRAGMENTS = [
  "/login",
  "/signup",
  "/auth",
  "/forgot-password",
  "/reset-password",
];

const toDraftSafeToken = (value) => {
  const normalized = (value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return normalized || "home";
};

const buildDefaultDraftFormType = () => {
  if (typeof window === "undefined") {
    return "auto_home";
  }

  const pathToken = toDraftSafeToken(window.location.pathname);
  return `auto_${pathToken}`;
};

const getCurrentPathname = () =>
  typeof window !== "undefined" ? window.location.pathname || "" : "";

// ----------------------------------------------------------------------

FormProvider.propTypes = {
  children: PropTypes.node.isRequired,
  methods: PropTypes.object.isRequired,
  onSubmit: PropTypes.func,
  disableAutoDraft: PropTypes.bool,
  draftFormType: PropTypes.string,
  draftScopeId: PropTypes.string,
  draftDebounceMs: PropTypes.number,
  enableDraftPersistence: PropTypes.bool,
  enableDraftServerSync: PropTypes.bool,
};

export default function FormProvider({
  children,
  onSubmit,
  methods,
  disableAutoDraft = false,
  draftFormType,
  draftScopeId,
  draftDebounceMs,
  enableDraftPersistence = true,
  enableDraftServerSync = true,
}) {
  const watchedValues = methods.watch();

  const currentPathname = getCurrentPathname().toLowerCase();
  const isDraftExcludedPath = DRAFT_EXCLUDED_PATH_FRAGMENTS.some((segment) =>
    currentPathname.includes(segment)
  );

  const canAutoPersist =
    !disableAutoDraft &&
    !isDraftExcludedPath &&
    enableDraftPersistence &&
    Boolean(methods?.reset);

  const resolvedFormType = useMemo(
    () => draftFormType || buildDefaultDraftFormType(),
    [draftFormType]
  );

  const resolvedScopeId = useMemo(
    () => draftScopeId || resolveDraftScopeId(),
    [draftScopeId]
  );

  useDraftPersistence({
    formType: resolvedFormType,
    scopeId: resolvedScopeId,
    values: watchedValues,
    reset: methods.reset,
    debounceMs: draftDebounceMs,
    enableServerSync: Boolean(enableDraftServerSync && canAutoPersist),
    enablePersistence: canAutoPersist,
  });

  return (
    <Form {...methods}>
      <form onSubmit={onSubmit}>{children}</form>
    </Form>
  );
}

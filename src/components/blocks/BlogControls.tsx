"use client";

import * as React from "react";

/**
 * BlogControls — tiny progressive-enhancement island for the BlogSidebar
 * search + sort form. The form is fully functional WITHOUT JS (Enter in the
 * search box submits; the visually-hidden submit button applies the sort). When
 * JS is present, this submits the form automatically on `select` change so the
 * sort applies without a click — matching the mockup's instant-filter feel.
 *
 * Presentational chrome only: the actual inputs/select live in the server
 * BlogSidebar; this just wires the auto-submit behavior to the surrounding
 * <form>. No editable fields.
 */
export function BlogControls({
  action,
  children,
}: {
  action: string;
  children: React.ReactNode;
}) {
  const formRef = React.useRef<HTMLFormElement>(null);

  const onSortChange = React.useCallback((e: React.ChangeEvent<HTMLFormElement>) => {
    if ((e.target as HTMLElement).tagName === "SELECT") formRef.current?.requestSubmit();
  }, []);

  return (
    <form
      ref={formRef}
      action={action}
      method="get"
      role="search"
      className="contents"
      onChange={onSortChange} data-nocms-component="blog-controls"
    >
      {children}
    </form>
  );
}

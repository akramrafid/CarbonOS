// Small accessible primitives for the ESG workspace. Every value shown comes from an API response;
// components render explicit loading, empty and error states instead of placeholder numbers.
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { esgFetch } from '../../../lib/esgApi';

export function useEsgData(path) {
  const [state, setState] = useState({ path, data: null, error: null, loading: Boolean(path) });
  const lifecycle = useRef({ path, active: false, controller: null });
  lifecycle.current.path = path;
  const reload = useCallback(async () => {
    const current = lifecycle.current;
    if (!current.active) return;
    const currentPath = current.path;
    current.controller?.abort();
    const controller = new AbortController();
    current.controller = controller;
    if (!currentPath) {
      setState({ path: currentPath, data: null, error: null, loading: false });
      return;
    }
    setState((previous) => ({ path: currentPath, data: previous.path === currentPath ? previous.data : null, loading: true, error: null }));
    try {
      const data = await esgFetch(currentPath, { signal: controller.signal });
      if (!controller.signal.aborted) setState({ path: currentPath, data, error: null, loading: false });
    } catch (e) {
      if (!controller.signal.aborted) setState({ path: currentPath, data: null, error: e.message, loading: false });
    }
  }, []);
  useEffect(() => {
    lifecycle.current.active = true;
    reload();
    return () => { lifecycle.current.active = false; lifecycle.current.controller?.abort(); };
  }, [path, reload]);
  const current = state.path === path ? state : { data: null, error: null, loading: Boolean(path) };
  return { data: current.data, error: current.error, loading: current.loading, reload };
}

// Runs an async action, exposing busy/error/message for the form that triggered it.
export function useAction() {
  const [state, setState] = useState({ busy: false, error: null, message: null });
  const run = async (fn, success) => {
    setState({ busy: true, error: null, message: null });
    try {
      const result = await fn();
      setState({ busy: false, error: null, message: typeof success === 'function' ? success(result) : success || null });
      return result;
    } catch (e) {
      setState({ busy: false, error: e.message, message: null });
      return undefined;
    }
  };
  return { ...state, run };
}

export function Panel({ title, description, children, actions }) {
  return (
    <section className="min-w-0 rounded-2xl border border-emerald/15 bg-forest/40 p-4 sm:p-6 space-y-4" aria-label={title}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 break-words">
          <h2 className="font-serif text-2xl text-registry">{title}</h2>
          {description && <p className="mt-1 max-w-2xl text-sm text-mist">{description}</p>}
        </div>
        {actions}
      </header>
      {children}
    </section>
  );
}

export function Notice({ error, message }) {
  if (error) return <p role="alert" className="esg-notice esg-tone-danger rounded-lg px-3 py-2 text-sm">{error}</p>;
  if (message) return <p role="status" className="esg-notice esg-tone-success rounded-lg px-3 py-2 text-sm">{message}</p>;
  return null;
}

export function Loading({ state, empty, children }) {
  if (state.loading && !state.data) return <p role="status" className="text-sm text-mist">Loading…</p>;
  if (state.error) return <Notice error={state.error} />;
  const items = Array.isArray(state.data) ? state.data : state.data?.items;
  if (items && items.length === 0) return <p className="rounded-lg border border-dashed border-mist/30 px-3 py-4 text-sm text-mist">{empty}</p>;
  return children;
}

export function Field({ label, hint, error, id: suppliedId, describedBy, children }) {
  const generatedId = useId();
  const id = suppliedId || generatedId;
  const description = [describedBy, hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label htmlFor={id} className="font-mono text-[11px] uppercase tracking-wider text-mist">{label}</label>
      {children({ id, 'aria-describedby': description, 'aria-invalid': error ? true : undefined })}
      {hint && <span id={`${id}-hint`} className="text-xs text-mist">{hint}</span>}
      {error && <span id={`${id}-error`} role="alert" className="esg-field-error text-sm">{error}</span>}
    </div>
  );
}

const inputCls = 'esg-control min-h-[44px] min-w-0 w-full rounded-lg px-3 py-2 text-base sm:text-sm';

export function Input({ label, hint, error, id, 'aria-describedby': describedBy, ...props }) {
  return <Field label={label} hint={hint} error={error} id={id} describedBy={describedBy}>
    {(control) => <input className={inputCls} {...props} {...control} />}
  </Field>;
}

export function Select({ label, hint, error, id, 'aria-describedby': describedBy, options, ...props }) {
  return (
    <Field label={label} hint={hint} error={error} id={id} describedBy={describedBy}>
      {(control) => (
        <select className={inputCls} {...props} {...control}>
          {options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
        </select>
      )}
    </Field>
  );
}

export function Button({ variant = 'primary', className = '', ...props }) {
  const styles = variant === 'primary'
    ? 'esg-button-primary'
    : 'esg-button-secondary';
  return (
    <button
      type="button"
      className={`esg-button min-h-[44px] rounded-lg px-4 py-2 font-mono text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`}
      {...props}
    />
  );
}

export function Table({ caption, columns, rows, rowKey = 'id', minWidth = 600 }) {
  return (
    <div role="region" aria-label={`${caption} table`} tabIndex={0} className="max-w-full overflow-x-auto overscroll-x-contain rounded-lg border border-mist/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald">
      <table className="w-full text-left text-sm" style={{ minWidth }}>
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-carbon/60 font-mono text-[11px] uppercase tracking-wider text-mist">
          <tr>{columns.map((c) => <th key={c.key} scope="col" className="px-3 py-2">{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[rowKey]} className="border-t border-mist/10 align-top">
              {columns.map((c) => <td key={c.key} className="px-3 py-2 text-registry">{c.render ? c.render(r) : r[c.key] ?? '—'}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StatusBadge({ status }) {
  const tone = {
    APPROVED: 'success', LOCKED: 'success', PUBLISHED: 'success',
    SUBMITTED: 'warning', IN_REVIEW: 'warning',
    REJECTED: 'danger', MISSING_DATA: 'danger',
  }[status] || 'neutral';
  return <span className={`esg-status esg-tone-${tone} whitespace-nowrap rounded px-2 py-0.5 font-mono text-[11px] ${status === 'SUPERSEDED' ? 'line-through' : ''}`}>{status}</span>;
}

// Read form fields into an object, dropping empty strings so optional API fields stay unset.
export function formValues(form) {
  return Object.fromEntries([...new FormData(form).entries()].filter(([, v]) => v !== ''));
}

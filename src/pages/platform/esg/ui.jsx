// Small accessible primitives for the ESG workspace. Every value shown comes from an API response;
// components render explicit loading, empty and error states instead of placeholder numbers.
import { useCallback, useEffect, useId, useState } from 'react';
import { esgGet } from '../../../lib/esgApi';

export function useEsgData(path) {
  const [state, setState] = useState({ data: null, error: null, loading: Boolean(path) });
  const reload = useCallback(async () => {
    if (!path) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      setState({ data: await esgGet(path), error: null, loading: false });
    } catch (e) {
      setState({ data: null, error: e.message, loading: false });
    }
  }, [path]);
  useEffect(() => { reload(); }, [reload]);
  return { ...state, reload };
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
    <section className="rounded-2xl border border-emerald/15 bg-forest/40 p-4 sm:p-6 space-y-4" aria-label={title}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
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
  if (error) return <p role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>;
  if (message) return <p role="status" className="rounded-lg border border-emerald/30 bg-emerald/10 px-3 py-2 text-sm text-emerald-300">{message}</p>;
  return null;
}

export function Loading({ state, empty, children }) {
  if (state.loading && !state.data) return <p role="status" className="text-sm text-mist">Loading…</p>;
  if (state.error) return <Notice error={state.error} />;
  const items = Array.isArray(state.data) ? state.data : state.data?.items;
  if (items && items.length === 0) return <p className="rounded-lg border border-dashed border-mist/30 px-3 py-4 text-sm text-mist">{empty}</p>;
  return children;
}

export function Field({ label, hint, children }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-mono text-[11px] uppercase tracking-wider text-mist">{label}</label>
      {children(id)}
      {hint && <span className="text-xs text-mist/80">{hint}</span>}
    </div>
  );
}

const inputCls = 'w-full rounded-lg border border-mist/30 bg-carbon px-3 py-2 text-sm text-registry focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald';

export function Input({ label, hint, ...props }) {
  return <Field label={label} hint={hint}>{(id) => <input id={id} className={inputCls} {...props} />}</Field>;
}

export function Select({ label, hint, options, ...props }) {
  return (
    <Field label={label} hint={hint}>
      {(id) => (
        <select id={id} className={inputCls} {...props}>
          {options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
        </select>
      )}
    </Field>
  );
}

export function Button({ variant = 'primary', className = '', ...props }) {
  const styles = variant === 'primary'
    ? 'bg-emerald text-carbon hover:bg-emerald-400'
    : 'border border-mist/40 text-registry hover:border-emerald';
  return (
    <button
      type="button"
      className={`min-h-[40px] rounded-lg px-4 py-2 font-mono text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald ${styles} ${className}`}
      {...props}
    />
  );
}

export function Table({ caption, columns, rows, rowKey = 'id' }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-mist/20">
      <table className="w-full min-w-[600px] text-left text-sm">
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
    APPROVED: 'bg-emerald/15 text-emerald-300', LOCKED: 'bg-emerald/15 text-emerald-300',
    SUBMITTED: 'bg-amber/15 text-amber-300', DRAFT: 'bg-mist/15 text-mist', OPEN: 'bg-mist/15 text-mist',
    REJECTED: 'bg-red-500/15 text-red-300', SUPERSEDED: 'bg-mist/10 text-mist line-through', RETIRED: 'bg-mist/10 text-mist',
    PUBLISHED: 'bg-emerald/15 text-emerald-300', IN_REVIEW: 'bg-amber/15 text-amber-300', MISSING_DATA: 'bg-red-500/15 text-red-300',
    NOT_STARTED: 'bg-mist/15 text-mist', NOT_APPLICABLE: 'bg-mist/10 text-mist',
  }[status] || 'bg-mist/15 text-mist';
  return <span className={`rounded px-2 py-0.5 font-mono text-[11px] ${tone}`}>{status}</span>;
}

// Read form fields into an object, dropping empty strings so optional API fields stay unset.
export function formValues(form) {
  return Object.fromEntries([...new FormData(form).entries()].filter(([, v]) => v !== ''));
}

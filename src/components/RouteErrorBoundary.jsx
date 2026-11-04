import { Component } from 'react';
import { Link } from 'react-router-dom';

export default class RouteErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="mx-auto max-w-3xl px-4 pb-20 pt-32 sm:px-6">
        <div role="alert" className="esg-notice esg-tone-danger rounded-2xl p-6">
          <h1 className="text-3xl font-serif">This page couldn’t open</h1>
          <p className="mt-3 text-sm">Reload to try again, or return to the homepage. Any unsaved edits may need to be entered again.</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" className="esg-button esg-button-primary min-h-[44px] rounded-lg px-4 py-2" onClick={() => window.location.reload()}>Reload page</button>
          <Link className="esg-button esg-button-secondary inline-flex min-h-[44px] items-center rounded-lg px-4 py-2" to="/">Back to home</Link>
        </div>
      </main>
    );
  }
}

import React from 'react';

interface State {
  hasError: boolean;
  error?: Error | null;
}

type Props = React.PropsWithChildren<{}>;

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    // log to console for now; could be sent to remote logging
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary] Caught error:', error, info);
  }

  handleReload = () => {
    // Try a hard reload which fetches fresh assets
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-5">
          <div className="text-center">
            <h3 className="mb-3">Something went wrong</h3>
            <p className="text-muted mb-4">An unexpected error occurred while loading this page.</p>
            <button className="btn btn-zambia-green" onClick={this.handleReload}>
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}

export default ErrorBoundary;

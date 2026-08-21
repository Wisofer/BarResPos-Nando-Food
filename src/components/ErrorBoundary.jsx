import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error in React component tree:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-900 px-4 text-white">
          <div className="flex max-w-md flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-rose-500/10 p-4 text-rose-400">
              <AlertTriangle className="h-10 w-10" />
            </div>
            <h1 className="mb-2 text-xl font-bold">Algo no salió como se esperaba</h1>
            <p className="mb-6 text-sm text-slate-400">
              Se ha producido un error inesperado en la interfaz. Puedes intentar recargar la aplicación.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-600 active:scale-95"
            >
              <RefreshCw className="h-4 w-4" />
              Recargar Aplicación
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function RouteErrorFallback() {
  return <ErrorBoundary />;
}

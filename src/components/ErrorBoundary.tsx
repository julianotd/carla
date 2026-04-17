import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                    <div className="p-8 max-w-3xl w-full bg-white border border-red-200 rounded-lg shadow-lg">
                        <h1 className="text-2xl font-bold text-red-700 mb-4">Algo deu errado (Crash)</h1>
                        <p className="text-gray-600 mb-6">
                            Ocorreu um erro que impediu o carregamento da aplicação. Por favor, envie o erro abaixo para o suporte.
                        </p>
                        <div className="bg-slate-100 p-4 rounded border border-slate-300 overflow-auto max-h-[500px]">
                            <p className="font-mono text-sm font-bold text-red-800 mb-2">{this.state.error?.toString()}</p>
                            <pre className="font-mono text-xs text-slate-700 whitespace-pre-wrap">
                                {this.state.error?.stack}
                            </pre>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-6 px-6 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors"
                        >
                            Recarregar Página
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

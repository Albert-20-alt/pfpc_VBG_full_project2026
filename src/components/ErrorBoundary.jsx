import React from 'react';
import { Button } from '@/components/ui/button';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
                    <div className="max-w-2xl w-full bg-slate-800 border border-red-500/50 rounded-lg p-6 shadow-xl">
                        <h1 className="text-2xl font-bold text-red-500 mb-4">Une erreur est survenue</h1>
                        <p className="text-slate-300 mb-6">
                            L'application a rencontré une erreur inattendue. Veuillez prendre une capture d'écran de cette page et l'envoyer au support technique.
                        </p>

                        <div className="bg-black/50 p-4 rounded-md overflow-auto mb-6 max-h-64 border border-white/10">
                            <p className="text-red-400 font-mono text-sm mb-2">{this.state.error && this.state.error.toString()}</p>
                            <pre className="text-slate-500 font-mono text-xs whitespace-pre-wrap">
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </pre>
                        </div>

                        <Button
                            onClick={() => window.location.reload()}
                            className="bg-blue-600 hover:bg-blue-500 text-white"
                        >
                            Recharger la page
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

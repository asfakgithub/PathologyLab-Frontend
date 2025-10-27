import React from 'react';
import './ErrorBoundary.css';

/**
 * Error Boundary Component for catching JavaScript errors anywhere in the component tree
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: null,
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return {
            hasError: true,
            errorId: Date.now().toString(), // Simple error ID for tracking
        };
    }

    componentDidCatch(error, errorInfo) {
        // Log error details
        console.error('🔴 Error Boundary Caught:', error, errorInfo);
        
        // Store error details in state
        this.setState({
            error,
            errorInfo,
        });

        // Log to external service in production (example)
        if (process.env.NODE_ENV === 'production') {
            // logErrorToService(error, errorInfo, this.state.errorId);
        }
    }

    handleRetry = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: null,
        });
    };

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            // Fallback UI
            return (
                <div className="error-boundary">
                    <div className="error-boundary-container">
                        <div className="error-icon">⚠️</div>
                        <h2 className="error-title">Oops! Something went wrong</h2>
                        <p className="error-message">
                            We're sorry, but an unexpected error occurred. Our team has been notified.
                        </p>
                        
                        {process.env.NODE_ENV === 'development' && (
                            <details className="error-details">
                                <summary>Error Details (Development Mode)</summary>
                                <div className="error-stack">
                                    <strong>Error:</strong> {this.state.error && this.state.error.toString()}
                                    <br />
                                    <strong>Error ID:</strong> {this.state.errorId}
                                    <br />
                                    <strong>Component Stack:</strong>
                                    <pre>{this.state.errorInfo.componentStack}</pre>
                                </div>
                            </details>
                        )}
                        
                        <div className="error-actions">
                            <button 
                                className="btn btn-primary"
                                onClick={this.handleRetry}
                            >
                                Try Again
                            </button>
                            <button 
                                className="btn btn-secondary"
                                onClick={this.handleReload}
                            >
                                Reload Page
                            </button>
                        </div>
                        
                        <p className="error-support">
                            If this problem persists, please contact support with Error ID: <code>{this.state.errorId}</code>
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

import { Component } from 'react';

class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught Error in UI:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#080B0F] text-white px-4 text-center relative">
          {/* Background glow effects */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="glass p-12 md:p-16 rounded-3xl border border-red-500/20 shadow-2xl shadow-red-900/10 max-w-lg w-full relative z-10 backdrop-blur-xl">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-8 shadow-inner shadow-red-500/20">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold mb-4 tracking-tight">Something went wrong</h1>
            <p className="text-slate-400 mb-10 leading-relaxed">
              BlueprintAI encountered an unexpected error while rendering this page.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="px-6 py-3 rounded-xl text-sm font-semibold transition-all bg-white/5 border border-white/10 hover:bg-white/10 text-white"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => window.location.reload()}
                className="dash-btn inline-flex items-center gap-2 px-6 py-3 font-semibold shadow-lg"
              >
                Reload Application
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;

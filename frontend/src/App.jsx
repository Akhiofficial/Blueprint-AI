import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './features/auth/auth.context';
import { ProjectsProvider } from './features/projects/projects.context';
import { ToastProvider } from './components/common/ToastContext';
import AppRouter from './routes/AppRouter';
import GlobalErrorBoundary from './components/common/GlobalErrorBoundary';

// App is purely a composition root — providers → router → routes
const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProjectsProvider>
          <ToastProvider>
            <GlobalErrorBoundary>
              <AppRouter />
            </GlobalErrorBoundary>
          </ToastProvider>
        </ProjectsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

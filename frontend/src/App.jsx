import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './features/auth/auth.context';
import { ProjectsProvider } from './features/projects/projects.context';
import AppRouter from './routes/AppRouter';

// App is purely a composition root — providers → router → routes
const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProjectsProvider>
          <AppRouter />
        </ProjectsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

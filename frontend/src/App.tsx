import { RouterProvider } from 'react-router-dom';
import { router } from '@/router';
import { initializeApiClient } from '@/lib/api';
import '@/styles/globals.css';

// Initialize API client on app load
initializeApiClient();

function App() {
  return <RouterProvider router={router} />;
}

export default App;
/**
 * Root React component.  It sets up routing using the route configuration
 * defined in `routes.tsx` and wraps asynchronous route components in
 * `<Suspense>` to enable lazy loading.  You can also place global
 * providers (e.g. authentication context, theme provider) here.
 */

import React, { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import { appRoutes } from './routes';

const App: React.FC = () => {
  // useRoutes converts the route configuration into React elements
  const element = useRoutes(appRoutes);

  return (
    // Suspense displays a fallback UI while lazy-loaded components are loading
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 animate-ping rounded-full bg-sky-400" />
            <span className="text-lg font-semibold tracking-wide">Loading experience...</span>
          </div>
        </div>
      }
    >
      {element}
    </Suspense>
  );
};

export default App;

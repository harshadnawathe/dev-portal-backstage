import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const jacocoReportsPlugin = createPlugin({
  id: 'jacoco-reports',
  routes: {
    root: rootRouteRef,
  },
});

export const JacocoReportsPage = jacocoReportsPlugin.provide(
  createRoutableExtension({
    name: 'JacocoReportsPage',
    component: () =>
      import('./components/ExampleComponent').then(m => m.ExampleComponent),
    mountPoint: rootRouteRef,
  }),
);

import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { jacocoReportsPlugin, JacocoReportsPage } from '../src/plugin';

createDevApp()
  .registerPlugin(jacocoReportsPlugin)
  .addPage({
    element: <JacocoReportsPage />,
    title: 'Root Page',
    path: '/jacoco-reports'
  })
  .render();

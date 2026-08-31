import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './Options'
import { initTheme } from '@/shared/ui/init-theme'

import '@fontsource-variable/rubik'
import './index.css'

initTheme()

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <App />,
)

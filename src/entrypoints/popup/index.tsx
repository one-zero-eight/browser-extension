import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './Popup'

import '@unocss/reset/tailwind-compat.css'
import 'virtual:uno.css'
import './index.css'

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <App />,
)

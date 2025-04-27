import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import MarketPlace from './MarketPlace.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <App /> */}
    <MarketPlace />
  </StrictMode>,
)

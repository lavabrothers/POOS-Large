import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// TODO: Delete

if (!localStorage.getItem('user_data')) {
  // const dummyUser = { firstName: 'Test', lastName: 'User', id: 1 }
  // I removed the testuser to test something
  localStorage.setItem('user_data', "");
}


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

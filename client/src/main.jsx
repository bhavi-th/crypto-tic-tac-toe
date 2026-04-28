import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastContainer
      position="top-right"
      autoClose={4000}
      theme="dark"
      toastStyle={{
        backgroundColor: '#2e2b32',
        color: '#e0e0e0',
        fontFamily: '"Quicksand", sans-serif',
      }}
    />
    <App />
  </React.StrictMode>
);

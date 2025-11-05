import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; 
import ArquiVia from './routes';
import { AuthProvider } from './contexts/AuthContext';
import 'prismjs'; 

import 'prismjs/themes/prism-tomorrow.css'; 

import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-python';
//@ts-ignore
import Prism from "prismjs";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ArquiVia/>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
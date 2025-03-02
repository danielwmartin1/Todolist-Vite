import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Import main styles
import './button.css'; // Import button styles
import App from './components/App'; // Import App component
import reportWebVitals from './reportWebVitals'; // Import reportWebVitals for performance measurement

const root = ReactDOM.createRoot(document.getElementById('root')); // Create root element
root.render(
    <React.StrictMode>
        <App /> {/* Render App component */}
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(); // Call reportWebVitals

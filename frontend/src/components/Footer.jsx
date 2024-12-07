import React from "react";
import "../index.css";

function Footer() {
  // Get the current year
  const year = new Date().getFullYear();
  //const month = new Date().toLocaleString('default', { month: 'long' });
  //const day = new Date().getDate();
  return (
    <React.StrictMode>
      <div className="footer">
        <footer>
          <p>Copyright ⓒ {year}</p>
        </footer>
      </div>
    </React.StrictMode>
  );
}

export default Footer;

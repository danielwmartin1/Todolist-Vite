import React from "react";
import "../index.css";
import logo from '../logo.svg';

function Header() {
  return (
    <React.StrictMode>
      <header>
          <h1 className="header">
            <img className="header-img" src={logo} alt='React Logo' style={{height: '100px', width: '100px', }}/>
            React To-Do-List
          </h1>
      </header>
    </React.StrictMode>
  );
}

export default Header;

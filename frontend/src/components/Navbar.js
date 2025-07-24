import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          💳 Expense Matcher
        </Link>
        
        <ul className="navbar-nav">
          <li>
            <Link to="/" className={`nav-link ${isActive('/')}`}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/transactions" className={`nav-link ${isActive('/transactions')}`}>
              Transactions
            </Link>
          </li>
          <li>
            <Link to="/receipts" className={`nav-link ${isActive('/receipts')}`}>
              Receipts
            </Link>
          </li>
          <li>
            <Link to="/matches" className={`nav-link ${isActive('/matches')}`}>
              Matches
            </Link>
          </li>
          <li>
            <Link to="/import" className={`nav-link ${isActive('/import')}`}>
              Import
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar; 
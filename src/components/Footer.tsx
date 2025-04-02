import React from 'react';
import './Footer.css';

interface FooterProps {
  companyName?: string;
}

/**
 * A simple footer component to display at the bottom of the page
 */
const Footer: React.FC<FooterProps> = ({ companyName = 'Trua Verify' }) => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p className="footer-text">{companyName}</p>
      </div>
    </footer>
  );
};

export default Footer;
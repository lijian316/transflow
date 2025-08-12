import React from 'react';
import './Logo.css';

const Logo = ({ 
  onClick, 
  className = '', 
  size = 'normal', // 'small', 'normal', 'large'
  variant = 'default', // 'default', 'minimal', 'outlined'
  animated = true,
  showSubtitle = true
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'small': return 'logo-small';
      case 'large': return 'logo-large';
      default: return 'logo-normal';
    }
  };

  const getVariantClass = () => {
    switch (variant) {
      case 'minimal': return 'logo-minimal';
      case 'outlined': return 'logo-outlined';
      default: return 'logo-default';
    }
  };

  const getAnimationClass = () => {
    return animated ? 'logo-animated' : '';
  };

  return (
    <div 
      className={`logo-container ${getSizeClass()} ${getVariantClass()} ${getAnimationClass()} ${className}`} 
      onClick={onClick}
    >
      <span className="logo-text">TF</span>
      {showSubtitle && <span className="logo-subtitle">TransFlow</span>}
    </div>
  );
};

export default Logo;

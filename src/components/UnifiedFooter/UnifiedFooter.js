import React, { useState } from 'react';
import { getMessage } from '../../locales';
import { useLanguage } from '../../contexts/LanguageContext';
import Logo from '../Logo/Logo';
import './UnifiedFooter.css';

const UnifiedFooter = ({ onLocaleChange }) => {
  const { locale } = useLanguage();
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const handleAboutClick = (e) => {
    e.preventDefault();
    setShowAboutModal(true);
  };

  const handlePrivacyClick = (e) => {
    e.preventDefault();
    setShowPrivacyModal(true);
  };

  const handleLogoClick = () => {
    // 滚动到页面顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* 页脚 */}
      <div id="footer" className="ui inverted vertical footer segment">
        <div className="ui container">
          <div className="ui stackable inverted divided equal height stackable grid">
            <div className="sixteen wide column">
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem 0', gap: '1.5rem'}}>
                                 <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                   <a href="#" className="item" style={{
                     color: 'rgba(255,255,255,0.8)', 
                     textDecoration: 'none',
                     transition: 'color 0.3s ease',
                     cursor: 'pointer'
                   }} 
                   onMouseEnter={(e) => e.target.style.color = '#8d6e63'}
                   onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.8)'}
                   onClick={handleAboutClick}>
                     {getMessage('aboutUs', locale)}
                   </a>
                   <span style={{color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem'}}>|</span>
                   <a href="#" className="item" style={{
                     color: 'rgba(255,255,255,0.8)', 
                     textDecoration: 'none',
                     transition: 'color 0.3s ease',
                     cursor: 'pointer'
                   }}
                   onMouseEnter={(e) => e.target.style.color = '#8d6e63'}
                   onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.8)'}
                   onClick={handlePrivacyClick}>
                     {getMessage('privacyPolicy', locale)}
                   </a>
                 </div>
                                 <div style={{color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', textAlign: 'center'}}>
                   {getMessage('copyright', locale)}
                 </div>
                <Logo 
                  onClick={handleLogoClick} 
                  variant="default"
                  size="normal"
                  animated={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Us Modal */}
      {showAboutModal && (
        <div className="ui modal active" style={{display: 'block'}}>
          <div className="header">
            {getMessage('aboutMeTitle', locale)}
          </div>
          <div className="content">
            <p>{getMessage('aboutMeContent', locale)}</p>
            
            <div style={{marginTop: '1.5rem'}}>
              <div style={{
                backgroundColor: '#f6f8fa',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #e1e4e8'
              }}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                  <span style={{fontWeight: 'bold'}}>{getMessage('developer', locale)}:</span>
                  <span>Zane Li</span>
                </div>
                
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                  <span style={{fontWeight: 'bold'}}>{getMessage('version', locale)}:</span>
                  <span>1.0.0</span>
                </div>
                
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <span style={{fontWeight: 'bold'}}>{getMessage('contact', locale)}:</span>
                  <span>zane19920316@gmail.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="ui modal active" style={{display: 'block'}}>
          <div className="header">
            {getMessage('privacyPolicyTitle', locale)}
          </div>
          <div className="content">
            <p>{getMessage('privacyPolicyContent', locale)}</p>
            
            <div style={{marginTop: '1.5rem'}}>
              <div style={{
                backgroundColor: '#f6f8fa',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #e1e4e8'
              }}>
                <h5 style={{marginBottom: '0.75rem', color: '#24292f', fontSize: '1rem', fontWeight: 'bold'}}>
                  {getMessage('dataSecurity', locale)}
                </h5>
                <ul style={{
                  margin: 0,
                  paddingLeft: '1.25rem',
                  fontSize: '0.875rem',
                  color: '#656d76',
                  lineHeight: '1.6'
                }}>
                  <li>{getMessage('dataSecurityDesc', locale)}</li>
                  <li>{getMessage('dataSecurityDesc2', locale)}</li>
                  <li>{getMessage('dataSecurityDesc3', locale)}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Backdrop */}
      {(showAboutModal || showPrivacyModal) && (
        <div className="ui dimmer active" style={{display: 'block'}} onClick={() => {
          setShowAboutModal(false);
          setShowPrivacyModal(false);
        }}></div>
      )}
    </>
  );
};

export default UnifiedFooter;

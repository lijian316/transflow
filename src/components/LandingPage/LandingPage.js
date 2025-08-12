import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMessage } from '../../locales';
import { useLanguage } from '../../contexts/LanguageContext';
import Logo from '../Logo/Logo';
import UnifiedFooter from '../UnifiedFooter/UnifiedFooter';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const { locale, toggleLanguage } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isContactModalVisible, setIsContactModalVisible] = useState(false);
  const [contactForm, setContactForm] = useState({
    languageName: '',
    languageCode: '',
    useCase: '',
    email: ''
  });


  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    navigate('/dashboard');
  };



  const handleLogoClick = () => {
    // 滚动到页面顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };



  const features = [
    {
      role: getMessage('productManager', locale),
      icon: '📋',
      title: getMessage('productFeatureTitle', locale),
      description: getMessage('productFeatureDesc', locale),
      image: '🎯'
    },
    {
      role: getMessage('operationsManager', locale),
      icon: '✏️',
      title: getMessage('operationsFeatureTitle', locale),
      description: getMessage('operationsFeatureDesc', locale),
      image: '📝'
    },
    {
      role: getMessage('developer', locale),
      icon: '⚡',
      title: getMessage('developerFeatureTitle', locale),
      description: getMessage('developerFeatureDesc', locale),
      image: '🚀'
    }
  ];

  const testimonials = [
    {
      name: `${getMessage('zhang', locale)}${getMessage('manager', locale)}`,
      company: getMessage('internationalCompany', locale),
      content: getMessage('testimonial1', locale)
    },
    {
      name: `${getMessage('li', locale)}${getMessage('director', locale)}`,
      company: getMessage('softwareCompany', locale),
      content: getMessage('testimonial2', locale)
    },
    {
      name: `${getMessage('wang', locale)}${getMessage('supervisor', locale)}`,
      company: getMessage('ecommercePlatform', locale),
      content: getMessage('testimonial3', locale)
    }
  ];

  const languages = [
    'English', '中文', 'ไทย', 'Čeština', 'Slovenčina', 'Italiano', 'Polski',
    'Latina', 'Nederlands', 'Português', 'Ελληνικά', 'Balkan', 'Български', 'Türkçe',
    'Français', 'Deutsch', 'Українська', 'Русский', 'South African', 'العربية',
    'Norsk', 'Suomi', 'Македонски', 'Eesti', 'Slovenščina', 'Bahasa Indonesia', 'Svenska',
    '日本語', '한국어'
  ];

  return (
    <div className="landing-page">
             {/* 主横幅 */}
       <div className="ui inverted vertical masthead center aligned segment">
         <div className="ui container">
                       <div className="ui large secondary inverted pointing menu">
              <div className="toc item">
                <Logo 
                  onClick={handleLogoClick} 
                  variant="minimal"
                  size="normal"
                  animated={true}
                />
              </div>
              <a href="#features" className="item">{getMessage('features', locale)}</a>
              <a href="#languages" className="item">{getMessage('languages', locale)}</a>
                             <a href="#footer" className="item">{getMessage('about', locale)}</a>
                             <div className="right item">
                 <button className="ui inverted button" onClick={toggleLanguage} title={locale === 'en' ? 'Switch to Chinese' : '切换到英文'}>
                   {locale === 'en' ? 'CN' : 'EN'}
                 </button>
               </div>
            </div>
         </div>

        <div className="ui center aligned text container">
          <h1 className={`ui inverted center aligned header ${isVisible ? 'fade-in' : ''}`}>
            {getMessage('heroTitle', locale)}
            <div className="sub header">{getMessage('heroSubtitle', locale)}</div>
          </h1>
          <div className={`hero-description ${isVisible ? 'fade-in' : ''}`}>
            <p>{getMessage('heroDescription', locale)}</p>
          </div>
                     <div className={`hero-buttons ${isVisible ? 'fade-in' : ''}`}>
             <button className="ui huge primary button" onClick={handleGetStarted}>
               <i className="play icon"></i>
               {getMessage('startNow', locale)}
             </button>
           </div>
        </div>
      </div>

      {/* 功能特性 */}
      <div id="features" className="ui vertical stripe segment">
        <div className="ui middle aligned stackable grid container">
          
          
          {/* 产品经理 */}
          <div className="row feature-row">
            <div className="eight wide column">
              <div className="feature-content">
                <div className="feature-label product-label">{getMessage('productManager', locale)}</div>
                <h3 className="ui header">{getMessage('productFeatureTitle', locale)}</h3>
                <p>{getMessage('productFeatureDesc', locale)}</p>
              </div>
            </div>
            <div className="eight wide column">
              <div className="feature-illustration">
                <img src="https://cdn-icons-png.flaticon.com/512/2721/2721282.png" alt="Product Manager" />
              </div>
            </div>
          </div>
          
          {/* 运营经理 */}
          <div className="row feature-row">
            <div className="eight wide column">
              <div className="feature-illustration">
                <img src="https://cdn-icons-png.flaticon.com/512/13382/13382916.png" alt="Operations Manager" />
              </div>
            </div>
            <div className="eight wide column">
              <div className="feature-content">
                <div className="feature-label operations-label">{getMessage('operationsManager', locale)}</div>
                <h3 className="ui header">{getMessage('operationsFeatureTitle', locale)}</h3>
                <p>{getMessage('operationsFeatureDesc', locale)}</p>
              </div>
            </div>
          </div>
          
          {/* 程序开发 */}
          <div className="row feature-row">
            <div className="eight wide column">
              <div className="feature-content">
                <div className="feature-label developer-label">{getMessage('developer', locale)}</div>
                <h3 className="ui header">{getMessage('developerFeatureTitle', locale)}</h3>
                <p>{getMessage('developerFeatureDesc', locale)}</p>
              </div>
            </div>
            <div className="eight wide column">
              <div className="feature-illustration">
                <img src="https://cdn-icons-png.flaticon.com/512/3242/3242257.png" alt="Developer" />
              </div>
            </div>
          </div>
        </div>
      </div>

            {/* 支持语言 */}
      <div id="languages" className="ui inverted vertical stripe segment">
        <div className="ui middle aligned stackable grid container">
          <div className="row">
            <div className="center aligned column">
              <h3>{getMessage('supportedLanguages', locale)}</h3>
            </div>
          </div>
          <div className="row">
            <div className="center aligned column">
              <div className="ui labels">
                {languages.map((lang, index) => (
                  <a key={index} className="ui label" style={{ pointerEvents: 'none' }}>
                    {lang}
                  </a>
                ))}
                <a 
                  className="ui label"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const subject = encodeURIComponent(getMessage('emailSubject', locale));
                    const body = encodeURIComponent(getMessage('emailBody', locale));
                    const mailtoLink = `mailto:contact@transflow.com?subject=${subject}&body=${body}`;
                    
                    // 使用setTimeout来避免页面闪烁
                    setTimeout(() => {
                      window.location.href = mailtoLink;
                    }, 100);
                  }}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    transition: 'all 0.3s ease',
                    userSelect: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  }}
                >
                  Need another?
                </a>
              </div>
            </div>
          </div>
          
          {/* 统计数据 */}
          <div className="row" style={{marginTop: '3rem', justifyContent: 'center'}}>
            <div className="four wide column center aligned">
              <div className="ui inverted statistic">
                <div className="value">29</div>
                <div className="label">{getMessage('supportedLanguagesCount', locale)}</div>
              </div>
            </div>
            <div className="four wide column center aligned">
              <div className="ui inverted statistic">
                <div className="value">∞</div>
                <div className="label">{getMessage('translationEntries', locale)}</div>
              </div>
            </div>
            <div className="four wide column center aligned">
              <div className="ui inverted statistic">
                <div className="value">100%</div>
                <div className="label">{getMessage('dataSecurity', locale)}</div>
              </div>
            </div>
          </div>
          

        </div>
      </div>

      

      

            <UnifiedFooter locale={locale} />
    </div>
  );
};

export default LandingPage;

import React, { createContext, useContext, useState, useEffect } from 'react';

// 创建语言上下文
const LanguageContext = createContext();

// 语言上下文提供者组件
export const LanguageProvider = ({ children }) => {
  // 从localStorage获取保存的语言设置，默认为英语
  const [locale, setLocale] = useState(() => {
    const savedLocale = localStorage.getItem('app_locale');
    return savedLocale || 'en';
  });

  // 当语言改变时保存到localStorage
  useEffect(() => {
    localStorage.setItem('app_locale', locale);
  }, [locale]);

  // 切换语言
  const toggleLanguage = () => {
    setLocale(prev => prev === 'en' ? 'zh' : 'en');
  };

  // 设置特定语言
  const changeLanguage = (newLocale) => {
    setLocale(newLocale);
  };

  const value = {
    locale,
    setLocale,
    toggleLanguage,
    changeLanguage
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// 自定义hook来使用语言上下文
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

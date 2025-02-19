import React from 'react';
import { useLocale } from '../contexts/LanguageContext';

const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLocale();

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="px-3 py-1 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
      title={language === 'zh' ? 'Switch to English' : '切换到中文'}
    >
      {language === 'zh' ? '英文' : 'zh'}
    </button>
  );
};

export default LanguageToggle; 
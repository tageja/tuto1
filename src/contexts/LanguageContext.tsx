import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, Language } from '../translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('vi'); // Default to Vietnamese
  const [isReady, setIsReady] = useState(false);

  console.log('🌐 LanguageProvider: Component mounted');

  useEffect(() => {
    console.log('🌐 LanguageProvider: useEffect triggered');
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      console.log('🌐 LanguageProvider: Loading language from storage');
      const savedLanguage = await AsyncStorage.getItem('language');
      console.log('🌐 LanguageProvider: Saved language:', savedLanguage);
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'vi')) {
        setLanguageState(savedLanguage as Language);
        console.log('🌐 LanguageProvider: Language set to:', savedLanguage);
      } else {
        console.log('🌐 LanguageProvider: Using default language (vi)');
      }
    } catch (error) {
      console.error('🌐 LanguageProvider: Error loading language:', error);
    } finally {
      // CRITICAL: Mark as ready even if load fails, don't block app
      setIsReady(true);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      console.log('🌐 LanguageProvider: Setting language to:', lang);
      await AsyncStorage.setItem('language', lang);
      setLanguageState(lang);
      console.log('🌐 LanguageProvider: Language saved successfully');
    } catch (error) {
      console.error('🌐 LanguageProvider: Error saving language:', error);
    }
  };

  const t = (key: string, params?: Record<string, string>): string => {
    try {
      const keys = key.split('.');
      let value: any = translations[language];
      
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          console.warn('🌐 LanguageProvider: Translation not found for key:', key);
          console.warn('🌐 LanguageProvider: Available keys at this level:', value ? Object.keys(value).slice(0, 10) : 'undefined');
          return key; // Return the key if translation not found
        }
      }
      
      let result = typeof value === 'string' ? value : key;
      
      // Handle interpolation: replace {{variableName}} with actual values
      if (params && typeof result === 'string') {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          result = result.replace(new RegExp(`\\{\\{${paramKey}\\}\\}`, 'g'), paramValue);
        });
      }
      
      return result;
    } catch (error) {
      console.error('🌐 LanguageProvider: Error in translation function:', error);
      return key;
    }
  };

  console.log('🌐 LanguageProvider: Rendering with language:', language, 'isReady:', isReady);

  // Render children immediately, don't wait for AsyncStorage
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}; 
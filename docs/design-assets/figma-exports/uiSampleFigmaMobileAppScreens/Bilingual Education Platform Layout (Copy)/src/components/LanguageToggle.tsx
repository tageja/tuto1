import { useLanguage } from './LanguageContext';
import { Button } from './ui/button';

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="gap-2"
    >
      <span className="opacity-60">{language === 'en' ? 'EN' : 'VI'}</span>
      <span className="opacity-30">|</span>
      <span>{language === 'en' ? 'VI' : 'EN'}</span>
    </Button>
  );
}

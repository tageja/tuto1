"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/I18nContext';
import { supabase } from '../../lib/supabase';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/Select';
import { useRouter } from 'next/navigation';

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex' as const,
  },
  leftSide: {
    display: 'none' as const,
    '@media (minWidth: 1024px)': {
      display: 'flex' as const,
      width: '50%',
    },
    background: 'linear-gradient(135deg, #D8DCFF 0%, #E0E3FF 50%, #E8EAFF 100%)',
    padding: '48px',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  leftSideVisible: {
    display: 'flex' as const,
    width: '50%',
    background: 'linear-gradient(135deg, #D8DCFF 0%, #E0E3FF 50%, #E8EAFF 100%)',
    padding: '48px',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  leftContent: {
    maxWidth: '576px',
    width: '100%',
    display: 'flex' as const,
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
  },
  imageContainer: {
    width: '100%',
    marginBottom: '32px',
  },
  image: {
    width: '100%',
    height: 'auto',
    borderRadius: '24px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    objectFit: 'cover' as const,
  },
  textCenter: {
    textAlign: 'center' as const,
    maxWidth: '448px',
  },
  heading2: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#1F2937',
    marginBottom: '12px',
  },
  subtext: {
    color: '#4B5563',
    fontSize: '16px',
  },
  rightSide: {
    flex: 1,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: '24px 48px',
    background: '#FFFFFF',
  },
  rightContent: {
    width: '100%',
    maxWidth: '448px',
  },
  header: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: '32px',
  },
  logo: {
    fontSize: '36px',
    fontWeight: 700,
    color: '#0B5FFF',
  },
  langToggle: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: '8px',
    fontSize: '14px',
    color: '#6B7280',
  },
  langButton: {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontWeight: 500,
  },
  langButtonActive: {
    color: '#111827',
  },
  card: {
    background: '#FFFFFF',
    borderRadius: '16px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    padding: '32px',
    border: '1px solid #F3F4F6',
  },
  tabContainer: {
    background: '#F3F4F6',
    borderRadius: '9999px',
    padding: '4px',
    marginBottom: '24px',
    display: 'flex' as const,
  },
  tab: {
    flex: 1,
    padding: '10px 16px',
    borderRadius: '9999px',
    fontSize: '14px',
    fontWeight: 500,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tabInactive: {
    background: 'transparent',
    color: '#6B7280',
  },
  tabActive: {
    background: '#FFFFFF',
    color: '#111827',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },
  form: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: '16px',
  },
  formField: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
  },
  label: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#374151',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '10px 16px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s',
  },
  inputFocus: {
    outline: '2px solid #0B5FFF',
    borderColor: 'transparent',
  },
  checkboxRow: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingTop: '4px',
  },
  checkboxLabel: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: '8px',
    cursor: 'pointer',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    borderRadius: '4px',
    border: '1px solid #D1D5DB',
    accentColor: '#0B5FFF',
  },
  checkboxText: {
    fontSize: '14px',
    color: '#6B7280',
  },
  forgotLink: {
    fontSize: '14px',
    color: '#0B5FFF',
    fontWeight: 500,
    textDecoration: 'none',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
  },
  error: {
    background: '#FEF2F2',
    color: '#991B1B',
    border: '1px solid #FCA5A5',
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '14px',
  },
  success: {
    background: '#F0FDF4',
    color: '#166534',
    border: '1px solid #86EFAC',
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '14px',
  },
  button: {
    width: '100%',
    background: '#0B5FFF',
    color: '#FFFFFF',
    fontWeight: 600,
    padding: '12px',
    borderRadius: '9999px',
    fontSize: '14px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.2s',
    marginTop: '8px',
  },
  buttonHover: {
    background: '#0A50DF',
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  divider: {
    position: 'relative' as const,
    margin: '24px 0',
  },
  dividerLine: {
    position: 'absolute' as const,
    top: '50%',
    left: 0,
    right: 0,
    height: '1px',
    background: '#E5E7EB',
  },
  dividerText: {
    position: 'relative' as const,
    textAlign: 'center' as const,
    fontSize: '14px',
    color: '#6B7280',
    background: '#FFFFFF',
    padding: '0 12px',
    display: 'inline-block',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  googleButton: {
    width: '100%',
    background: '#FFFFFF',
    border: '1px solid #D1D5DB',
    color: '#374151',
    fontWeight: 500,
    padding: '12px',
    borderRadius: '9999px',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: '12px',
    transition: 'background 0.2s',
  },
  googleButtonHover: {
    background: '#F9FAFB',
  },
  footer: {
    textAlign: 'center' as const,
    fontSize: '12px',
    color: '#6B7280',
    marginTop: '24px',
    padding: '0 16px',
  },
};

export default function LoginPage() {
  const { signIn, signUp, loading, error, clearError, signInWithGoogle, firebaseUser } = useAuth();
  const router = useRouter();
  const { t, lang, setLang } = useI18n();

  const [activeTab, setActiveTab] = useState<"signin" | "register">("signin");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'teacher' | 'parent' | 'student' | 'school_admin'>('parent');
  const [schoolCode, setSchoolCode] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check for valid authenticated session before redirecting
  useEffect(() => {
    const checkSession = async () => {
      if (firebaseUser) {
        try {
          // Verify the session is actually valid by checking with Supabase
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error || !session) {
            // Session is invalid, don't redirect
            console.log('⚠️ Invalid session detected on login page, clearing...');
            return;
          }
          
          // Session is valid, redirect to home
          console.log('✅ Valid session, redirecting to home...');
          router.push('/home');
        } catch (err) {
          console.error('❌ Error checking session:', err);
          // Don't redirect on error
        }
      }
    };
    
    checkSession();
  }, [firebaseUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccessMessage(null);
    
    try {
      if (activeTab === 'register') {
        // If school admin, validate code first
        if (role === 'school_admin' && schoolCode) {
           const response = await fetch('/api/school/validate-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: schoolCode }),
          });
          const result = await response.json();
          if (!result.success) {
            throw new Error(result.message || 'Invalid school code');
          }
        } else if (role === 'school_admin' && !schoolCode) {
           throw new Error(t('schoolCodeRequired') || 'School code is required for admins');
        }

        await signUp(email.trim(), password, name.trim() || 'Tuto User', role);
        // If signUp completes without error and we're still here, email confirmation is required
        if (!error) {
          setSuccessMessage(t('confirmEmailSent') || 'Please check your email to confirm your account. Click the link in the email to complete registration.');
        }
      } else {
        await signIn(email.trim(), password);
      }
    } catch (err) {
      // Error is already handled by AuthContext
      console.log('Auth error handled');
    }
  };

  const handleForgotPassword = () => {
    alert('Forgot password functionality coming soon!');
  };

  if (!isClient) {
    return null;
  }

  return (
    <div style={styles.container}>
      {/* Left side - Purple gradient with image */}
      <div style={styles.leftSideVisible}>
        <div style={styles.leftContent}>
          <div style={styles.imageContainer}>
            <Image
              src="/images/home-illustration.png"
              alt="Education"
              width={640}
              height={480}
              style={styles.image}
              priority
            />
          </div>
          <div style={styles.textCenter}>
            <h2 style={styles.heading2}>
              {t('connectingTeachers')}
            </h2>
            <p style={styles.subtext}>
              {t('platformDescription')}
            </p>
          </div>
        </div>
      </div>

      {/* Right side - White background with form */}
      <div style={styles.rightSide}>
        <div style={styles.rightContent}>
          {/* Header with logo and language toggle */}
          <div style={styles.header}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Image
                src="/images/tuto-logo.png"
                alt="tuto."
                width={120}
                height={40}
                style={{ height: 'auto' }}
                priority
              />
            </div>
            <div style={styles.langToggle}>
              <button
                type="button"
                onClick={() => setLang('en')}
                style={{
                  ...styles.langButton,
                  ...(lang === 'en' ? styles.langButtonActive : {})
                }}
              >
                EN
              </button>
              <span style={{ color: '#D1D5DB' }}>|</span>
              <button
                type="button"
                onClick={() => setLang('vi')}
                style={{
                  ...styles.langButton,
                  ...(lang === 'vi' ? styles.langButtonActive : {})
                }}
              >
                VI
              </button>
            </div>
          </div>

          {/* White card with shadow */}
          <div style={styles.card}>
            {/* Tab switcher */}
            <div style={styles.tabContainer}>
              <button
                type="button"
                onClick={() => { setActiveTab('signin'); clearError(); setSuccessMessage(null); }}
                style={{
                  ...styles.tab,
                  ...(activeTab === 'signin' ? styles.tabActive : styles.tabInactive)
                }}
              >
                {t('signIn')}
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('register'); clearError(); setSuccessMessage(null); }}
                style={{
                  ...styles.tab,
                  ...(activeTab === 'register' ? styles.tabActive : styles.tabInactive)
                }}
              >
                {t('createAccount')}
              </button>
            </div>

            {/* Sign In Form */}
            {activeTab === 'signin' && (
              <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formField}>
                  <label htmlFor="email" style={styles.label}>
                    {t('email')}
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.formField}>
                  <label htmlFor="password" style={styles.label}>
                    {t('password')}
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.checkboxRow}>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={styles.checkbox}
                    />
                    <span style={styles.checkboxText}>{t('rememberMe')}</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    style={styles.forgotLink}
                  >
                    {t('forgotPassword')}
                  </button>
                </div>

                {error && (
                  <div style={styles.error}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    ...styles.button,
                    ...(loading ? styles.buttonDisabled : {})
                  }}
                >
                  {loading ? t('pleaseWait') : t('signIn')}
                </button>

                <div style={styles.divider}>
                  <div style={styles.dividerLine} />
                  <span style={styles.dividerText}>{t('or')}</span>
                </div>

                <button
                  type="button"
                  onClick={() => signInWithGoogle()}
                  disabled={loading}
                  style={{
                    ...styles.googleButton,
                    ...(loading ? styles.buttonDisabled : {})
                  }}
                >
                  <svg style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  {t('continueWithGoogle')}
                </button>
              </form>
            )}

            {/* Create Account Form */}
            {activeTab === 'register' && (
              <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formField}>
                  <label htmlFor="name" style={styles.label}>
                    {t('fullName')}
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder={t('namePlaceholder')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.formField}>
                  <label htmlFor="register-email" style={styles.label}>
                    {t('email')}
                  </label>
                  <input
                    id="register-email"
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.formField}>
                  <label htmlFor="register-password" style={styles.label}>
                    {t('password')}
                  </label>
                  <input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.formField}>
                  <label htmlFor="role" style={styles.label}>
                    {t('iAmA')}
                  </label>
                  <Select 
                    value={role} 
                    onValueChange={(value) => setRole(value as typeof role)}
                    required
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder={t('selectRole')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">{t('parent')}</SelectItem>
                      <SelectItem value="student">{t('student')}</SelectItem>
                      <SelectItem value="teacher">{t('teacher')}</SelectItem>
                      <SelectItem value="school_admin">{t('schoolAdmin')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {role === 'school_admin' && (
                  <div style={styles.formField}>
                    <label htmlFor="school-code" style={styles.label}>
                      {t('enterSchoolCode') || 'School Code'}
                    </label>
                    <input
                      id="school-code"
                      type="text"
                      placeholder={t('enterSchoolCode') || 'Enter School Code'}
                      value={schoolCode || ''}
                      onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
                      style={styles.input}
                    />
                  </div>
                )}

                {successMessage && (
                  <div style={styles.success}>
                    ✓ {successMessage}
                  </div>
                )}

                {error && (
                  <div style={styles.error}>
                    {error}
                  </div>
                )}

                {!successMessage && (
                  <>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        ...styles.button,
                        ...(loading ? styles.buttonDisabled : {})
                      }}
                    >
                      {loading ? t('pleaseWait') : t('createAccount')}
                    </button>

                    <div style={styles.divider}>
                      <div style={styles.dividerLine} />
                      <span style={styles.dividerText}>{t('or')}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => signInWithGoogle()}
                      disabled={loading}
                      style={{
                        ...styles.googleButton,
                        ...(loading ? styles.buttonDisabled : {})
                      }}
                    >
                      <svg style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      {t('continueWithGoogle')}
                    </button>
                  </>
                )}

                {successMessage && (
                  <button
                    type="button"
                    onClick={() => { setActiveTab('signin'); setSuccessMessage(null); }}
                    style={styles.button}
                  >
                    {t('signIn') || 'Sign In'}
                  </button>
                )}
              </form>
            )}
          </div>

          {/* Footer text */}
          <p style={styles.footer}>
            {t('termsAgreement')}
          </p>
        </div>
      </div>
    </div>
  );
}

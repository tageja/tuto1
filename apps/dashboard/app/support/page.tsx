export default function SupportSimplePage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>Tuto Support</h1>
      <p style={{ color: '#666', marginBottom: '40px' }}>We're here to help you</p>

      <div style={{ backgroundColor: '#f0f9ff', border: '2px solid #0ea5e9', borderRadius: '8px', padding: '24px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>📧 Contact Us</h2>
        <p style={{ marginBottom: '8px' }}>Email: <a href="mailto:support@tutoglobal.com" style={{ color: '#0ea5e9', textDecoration: 'none', fontWeight: '600' }}>support@tutoglobal.com</a></p>
        <p style={{ marginBottom: '8px' }}>Phone: <a href="tel:+84349640253" style={{ color: '#0ea5e9', textDecoration: 'none' }}>+84 349 640 253</a></p>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '12px' }}>Response time: Within 48 hours</p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>Frequently Asked Questions</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>How do I create an account?</h3>
          <p style={{ color: '#666', lineHeight: '1.6' }}>Download the Tuto app from the App Store and tap "Sign Up". You can register as a parent, teacher, or school administrator.</p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>How do I reset my password?</h3>
          <p style={{ color: '#666', lineHeight: '1.6' }}>On the login screen, tap "Forgot Password" and follow the instructions sent to your email.</p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>How do schools get started?</h3>
          <p style={{ color: '#666', lineHeight: '1.6' }}>Contact us at <a href="mailto:tarun@tutoglobal.com" style={{ color: '#0ea5e9' }}>tarun@tutoglobal.com</a> for school onboarding and setup assistance.</p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Is my data secure?</h3>
          <p style={{ color: '#666', lineHeight: '1.6' }}>Yes. We use industry-standard encryption and comply with FERPA and COPPA regulations. See our <a href="/legal/privacy" style={{ color: '#0ea5e9' }}>Privacy Policy</a> for details.</p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>What platforms are supported?</h3>
          <p style={{ color: '#666', lineHeight: '1.6' }}>Tuto is available on iPhone and via web dashboard at <a href="https://www.tutoglobal.com" style={{ color: '#0ea5e9' }}>www.tutoglobal.com</a>.</p>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>Need More Help?</h2>
        <p style={{ color: '#666', lineHeight: '1.6' }}>
          If you can't find the answer you're looking for, please email us at{' '}
          <a href="mailto:support@tutoglobal.com" style={{ color: '#0ea5e9', fontWeight: '600' }}>support@tutoglobal.com</a>
          {' '}and we'll get back to you within 48 hours.
        </p>
      </div>

      <div style={{ marginTop: '40px', fontSize: '14px', color: '#999', textAlign: 'center' }}>
        <p>© 2026 Tuto Education Platform</p>
        <p><a href="/legal/privacy" style={{ color: '#0ea5e9', marginRight: '16px' }}>Privacy Policy</a>
        <a href="/legal/terms" style={{ color: '#0ea5e9' }}>Terms of Service</a></p>
      </div>
    </div>
  );
}

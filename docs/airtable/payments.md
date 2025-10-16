# Payment System Architecture

## 🏦 Gateway Selection

### Chosen Gateway: Stripe
**Rationale**: Stripe provides the best global coverage, developer experience, and compliance features for our international EdTech platform.

#### Why Stripe?
- **Global Reach**: Supports 135+ currencies and 40+ countries
- **Developer Experience**: Excellent APIs, documentation, and SDKs
- **Compliance**: Built-in PCI DSS compliance, 3D Secure, and fraud protection
- **Vietnam Support**: Full support for Vietnamese market with local payment methods
- **EdTech Friendly**: Experience with education platforms and subscription models

#### Alternative Considered: Local VN Gateway
- **Pros**: Lower fees, local support, familiar to Vietnamese users
- **Cons**: Limited international expansion, complex integration, compliance challenges
- **Decision**: Stripe chosen for scalability and global reach

## 💳 Supported Payment Methods

### Credit/Debit Cards
- **Visa**: All types (Classic, Gold, Platinum, Infinite)
- **Mastercard**: All types (Standard, Gold, Platinum, World)
- **American Express**: All types
- **JCB**: For Japanese users
- **UnionPay**: For Chinese users

### Digital Wallets
- **Apple Pay**: iOS users
- **Google Pay**: Android users
- **Samsung Pay**: Samsung device users

### Local Payment Methods (Vietnam)
- **VNPay**: Popular Vietnamese payment gateway
- **MoMo**: Mobile wallet
- **ZaloPay**: Digital wallet
- **Bank Transfer**: Direct bank transfers

### International Payment Methods
- **SEPA**: European bank transfers
- **ACH**: US bank transfers
- **iDEAL**: Netherlands
- **Bancontact**: Belgium
- **EPS**: Austria

## 🌍 Regional Configuration

### Primary Markets
1. **Vietnam** (Primary)
   - Currency: VND (Vietnamese Dong)
   - Local payment methods: VNPay, MoMo, ZaloPay
   - Compliance: Vietnamese banking regulations

2. **United States** (Secondary)
   - Currency: USD
   - Payment methods: Cards, ACH, Apple Pay, Google Pay
   - Compliance: PCI DSS, state regulations

3. **Europe** (Future)
   - Currency: EUR
   - Payment methods: Cards, SEPA, local methods
   - Compliance: PSD2, GDPR

### Currency Support
- **Primary**: VND (Vietnamese Dong)
- **Secondary**: USD (US Dollar)
- **Future**: EUR (Euro), GBP (British Pound), SGD (Singapore Dollar)

## 🔧 Technical Implementation

### Stripe Configuration
```typescript
// Stripe configuration
const stripeConfig = {
  publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  secretKey: process.env.STRIPE_SECRET_KEY, // Server-side only
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  apiVersion: '2023-10-16',
  locale: 'auto', // Auto-detect user locale
};
```

### Environment Variables
```bash
# Client-side (safe to expose)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Server-side (keep secret)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Regional settings
DEFAULT_CURRENCY=VND
SUPPORTED_CURRENCIES=VND,USD,EUR
```

### Payment Flow
1. **Client**: Create payment intent request
2. **Server**: Validate amount, create Stripe PaymentIntent
3. **Client**: Confirm payment with Stripe SDK
4. **Webhook**: Handle payment completion
5. **Database**: Update booking status and create receipt

## 🧪 Testing Strategy

### Sandbox Accounts
- **Stripe Test Mode**: Full test environment
- **Test Cards**: Various scenarios (success, decline, 3D Secure)
- **Webhook Testing**: Stripe CLI for local webhook testing

### Test Scenarios
1. **Successful Payment**
   - Test card: 4242 4242 4242 4242
   - Expected: Payment succeeds, booking confirmed

2. **Declined Payment**
   - Test card: 4000 0000 0000 0002
   - Expected: Payment declined, user notified

3. **3D Secure Authentication**
   - Test card: 4000 0025 0000 3155
   - Expected: 3D Secure challenge, then success

4. **Insufficient Funds**
   - Test card: 4000 0000 0000 9995
   - Expected: Insufficient funds error

5. **Expired Card**
   - Test card: 4000 0000 0000 0069
   - Expected: Expired card error

### Local Testing
```bash
# Install Stripe CLI
stripe login
stripe listen --forward-to localhost:5001/webhook

# Test webhook events
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
```

## 💰 Pricing & Fees

### Stripe Fees
- **Online Payments**: 2.9% + $0.30 per transaction
- **International Cards**: +1.5% for non-US cards
- **Currency Conversion**: 1% markup
- **Refunds**: No additional fee (original fee not refunded)

### Cost Optimization
- **Local Currency**: Use VND for Vietnamese users
- **Batch Processing**: Group small transactions
- **Subscription Model**: Consider Stripe Billing for recurring payments

## 🔒 Security & Compliance

### PCI DSS Compliance
- **Stripe**: Handles all card data (PCI DSS Level 1)
- **Our System**: Never stores card details
- **Tokenization**: Use Stripe tokens for repeat payments

### 3D Secure (3DS)
- **Required**: For high-risk transactions
- **Optional**: For low-risk transactions
- **Implementation**: Stripe handles 3DS flow automatically

### Fraud Protection
- **Stripe Radar**: Built-in fraud detection
- **Machine Learning**: Adaptive risk scoring
- **Custom Rules**: Configure based on business needs

## 📊 Analytics & Monitoring

### Key Metrics
- **Payment Success Rate**: Target >95%
- **3DS Challenge Rate**: Monitor for optimization
- **Chargeback Rate**: Target <0.5%
- **Average Processing Time**: Target <3 seconds

### Monitoring
- **Stripe Dashboard**: Real-time payment monitoring
- **Webhook Logs**: Track payment events
- **Error Tracking**: Sentry integration for payment failures

## 🚀 Deployment

### Environment Setup
1. **Development**: Stripe test mode
2. **Staging**: Stripe test mode with production-like data
3. **Production**: Stripe live mode

### Deployment Checklist
- [ ] Stripe keys configured
- [ ] Webhook endpoints set up
- [ ] Test payments working
- [ ] Error handling implemented
- [ ] Monitoring configured
- [ ] Documentation updated

## 📞 Support & Maintenance

### Stripe Support
- **Documentation**: https://stripe.com/docs
- **Support**: Available via Stripe Dashboard
- **Status Page**: https://status.stripe.com

### Internal Support
- **Payment Issues**: Check Stripe Dashboard first
- **Webhook Problems**: Verify endpoint configuration
- **Refund Requests**: Process via Stripe Dashboard or API

## 🔄 Future Enhancements

### Phase 2 Features
- **Subscription Billing**: Recurring payments for premium features
- **Multi-Currency**: Dynamic currency selection
- **Local Payment Methods**: VNPay, MoMo integration
- **Payment Plans**: Installment options

### Phase 3 Features
- **Cryptocurrency**: Bitcoin, Ethereum support
- **BNPL**: Buy now, pay later options
- **Loyalty Points**: Reward system integration
- **Corporate Billing**: B2B payment solutions

---

**Last Updated**: January 2024  
**Version**: 1.0  
**Next Review**: March 2024







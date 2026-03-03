/**
 * Payment Gateway Service
 * Handles sandbox/test payments for MTN, Airtel, Zamtel, and Bank Transfers
 * Supports ZMW (Kwacha) and USD (Dollar) currencies
 */

export interface PaymentRequest {
  paymentId: string;
  amount: number;
  currency: 'ZMW' | 'USD';
  method: 'mobile-money' | 'bank-transfer' | 'cash';
  provider?: 'mtn' | 'airtel' | 'zamtel'; // for mobile money
  phone?: string; // for mobile money
  reference?: string;
  accountHolderName?: string;
  accountNumber?: string; // for bank transfer
  bankName?: string; // for bank transfer
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  status: 'pending' | 'completed' | 'failed';
  message: string;
  timestamp: Date;
  testMode: boolean;
}

// Test/Sandbox credentials for demonstration
const MOBILE_MONEY_PROVIDERS = {
  mtn: {
    name: 'MTN Mobile Money',
    testNumber: '0771234567',
    testPin: '1234',
    currency: ['ZMW', 'USD'],
  },
  airtel: {
    name: 'Airtel Money',
    testNumber: '0961234567',
    testPin: '1234',
    currency: ['ZMW', 'USD'],
  },
  zamtel: {
    name: 'Zamtel Money',
    testNumber: '0951234567',
    testPin: '1234',
    currency: ['ZMW', 'USD'],
  },
};

const BANK_ACCOUNTS = {
  test_kwk: {
    bankName: 'Test Bank ZMW',
    currency: 'ZMW',
    accountNumber: '1234567890',
    accountHolder: 'Test Account ZMW',
  },
  test_usd: {
    bankName: 'Test Bank USD',
    currency: 'USD',
    accountNumber: '0987654321',
    accountHolder: 'Test Account USD',
  },
};

export class PaymentGateway {
  /**
   * Process mobile money payment (test mode)
   */
  static async processMobileMoneyPayment(req: PaymentRequest): Promise<PaymentResponse> {
    const { paymentId, amount, currency, provider, phone, reference } = req;

    // Validate provider
    const providerData = MOBILE_MONEY_PROVIDERS[provider as keyof typeof MOBILE_MONEY_PROVIDERS];
    if (!providerData) {
      return {
        success: false,
        transactionId: '',
        status: 'failed',
        message: `Invalid provider: ${provider}`,
        timestamp: new Date(),
        testMode: true,
      };
    }

    // Validate currency support
    if (!providerData.currency.includes(currency)) {
      return {
        success: false,
        transactionId: '',
        status: 'failed',
        message: `${providerData.name} does not support ${currency}`,
        timestamp: new Date(),
        testMode: true,
      };
    }

    // Validate phone number format
    if (!phone || phone.length < 10) {
      return {
        success: false,
        transactionId: '',
        status: 'failed',
        message: 'Invalid phone number',
        timestamp: new Date(),
        testMode: true,
      };
    }

    // Generate test transaction ID
    const providerStr = (provider || 'MOBILE').toString().toUpperCase();
    const transactionId = `TEST-${providerStr}-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    return {
      success: true,
      transactionId,
      status: 'completed',
      message: `Test payment of ${amount} ${currency} received via ${providerData.name}. Transaction ID: ${transactionId}`,
      timestamp: new Date(),
      testMode: true,
    };
  }

  /**
   * Process bank transfer payment (test mode)
   */
  static async processBankTransfer(req: PaymentRequest): Promise<PaymentResponse> {
    const { paymentId, amount, currency, accountNumber, bankName, accountHolderName, reference } = req;

    // Validate account holder name
    if (!accountHolderName || accountHolderName.length < 3) {
      return {
        success: false,
        transactionId: '',
        status: 'failed',
        message: 'Invalid account holder name',
        timestamp: new Date(),
        testMode: true,
      };
    }

    // Validate account number
    if (!accountNumber || accountNumber.length < 5) {
      return {
        success: false,
        transactionId: '',
        status: 'failed',
        message: 'Invalid account number',
        timestamp: new Date(),
        testMode: true,
      };
    }

    // Validate bank name
    if (!bankName || bankName.length < 2) {
      return {
        success: false,
        transactionId: '',
        status: 'failed',
        message: 'Invalid bank name',
        timestamp: new Date(),
        testMode: true,
      };
    }

    // Generate test transaction ID
    const transactionId = `TEST-BANK-${currency}-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    return {
      success: true,
      transactionId,
      status: 'completed',
      message: `Test bank transfer of ${amount} ${currency} to ${bankName} account ${accountNumber}. Transaction ID: ${transactionId}`,
      timestamp: new Date(),
      testMode: true,
    };
  }

  /**
   * Process cash payment (placeholder for offline verification)
   */
  static async processCashPayment(req: PaymentRequest): Promise<PaymentResponse> {
    const { paymentId, amount, currency, reference } = req;

    if (!reference) {
      return {
        success: false,
        transactionId: '',
        status: 'pending',
        message: 'Cash payments require a reference number',
        timestamp: new Date(),
        testMode: true,
      };
    }

    // Generate test transaction ID
    const transactionId = `TEST-CASH-${Date.now()}-${reference}`;

    return {
      success: true,
      transactionId,
      status: 'pending',
      message: `Cash payment of ${amount} ${currency} recorded. Reference: ${reference}. Awaiting owner verification.`,
      timestamp: new Date(),
      testMode: true,
    };
  }

  /**
   * Process any payment request (router)
   */
  static async processPayment(req: PaymentRequest): Promise<PaymentResponse> {
    switch (req.method) {
      case 'mobile-money':
        return this.processMobileMoneyPayment(req);
      case 'bank-transfer':
        return this.processBankTransfer(req);
      case 'cash':
        return this.processCashPayment(req);
      default:
        return {
          success: false,
          transactionId: '',
          status: 'failed',
          message: `Unknown payment method: ${req.method}`,
          timestamp: new Date(),
          testMode: true,
        };
    }
  }

  /**
   * Get test payment providers info
   */
  static getTestProviders() {
    return {
      mobileMoney: MOBILE_MONEY_PROVIDERS,
      bankAccounts: BANK_ACCOUNTS,
    };
  }

  /**
   * Validate payment amount
   */
  static validateAmount(amount: number): { valid: boolean; message?: string } {
    if (isNaN(amount) || amount <= 0) {
      return { valid: false, message: 'Amount must be greater than 0' };
    }
    if (amount > 1000000) {
      return { valid: false, message: 'Amount exceeds maximum limit' };
    }
    return { valid: true };
  }

  /**
   * Validate currency
   */
  static validateCurrency(currency: string): { valid: boolean; message?: string } {
    if (!['ZMW', 'USD'].includes(currency)) {
      return { valid: false, message: 'Currency must be ZMW or USD' };
    }
    return { valid: true };
  }
}

export default PaymentGateway;

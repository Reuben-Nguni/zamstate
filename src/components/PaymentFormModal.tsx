import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/payment-gateway.scss';

interface PaymentFormModalProps {
  show: boolean;
  onHide: () => void;
  propertyId: string;
  propertyTitle: string;
  propertyPrice: number;
  ownerPaymentDetails: any;
  onSuccess?: (payment: any) => void;
}

type PaymentStep = 'method-selection' | 'gateway' | 'confirmation' | 'success';

const PaymentFormModal: React.FC<PaymentFormModalProps> = ({
  show,
  onHide,
  propertyId,
  propertyTitle,
  propertyPrice,
  ownerPaymentDetails,
  onSuccess,
}) => {
  const [step, setStep] = useState<PaymentStep>('method-selection');
  const [amount, setAmount] = useState(propertyPrice.toString());
  const [currency] = useState('ZMW');
  const [method, setMethod] = useState<'mobile-money' | 'bank-transfer' | 'cash'>('mobile-money');
  const [selectedProvider, setSelectedProvider] = useState('mtn');
  const [phone, setPhone] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [testProviders, setTestProviders] = useState<any>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [reference, setReference] = useState('');
  const [proof, setProof] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [useSandbox, setUseSandbox] = useState(true);
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    if (show) {
      setAmount(propertyPrice.toString());
      setStep('method-selection');
      setSubmitting(false);
      setProcessing(false);
    }
  }, [show, propertyPrice]);

  const handleMethodSelect = (selectedMethod: 'mobile-money' | 'bank-transfer' | 'cash') => {
    setMethod(selectedMethod);
    setStep('gateway');
  };

  // Mobile Money Gateway
  const renderMobileMoneyGateway = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-4"
    >
      <h5 className="mb-4 text-center fw-bold">
        <i className="fas fa-mobile-alt me-2 text-primary"></i>
        Select Mobile Money Provider
      </h5>

      <div className="row g-3 mb-4">
        {[
          {
            id: 'mtn',
            name: 'MTN Momo',
            icon: '📱',
            description: 'Quick & Secure',
            testAccounts: ['+260 96* *** ***'],
          },
          {
            id: 'airtel',
            name: 'Airtel Money',
            icon: '🔴',
            description: 'Fast Transfer',
            testAccounts: ['+260 76* *** ***'],
          },
          {
            id: 'zamtel',
            name: 'ZamTel Kwacha',
            icon: '📲',
            description: 'Easy Payment',
            testAccounts: ['+260 95* *** ***'],
          },
        ].map((provider) => (
          <div key={provider.id} className="col-md-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedProvider(provider.id)}
              className={`payment-provider-card ${
                selectedProvider === provider.id ? 'selected' : ''
              }`}
            >
              <div className="payment-icon-lg">
                {provider.icon}
              </div>
              <h6 className="fw-bold mb-1">{provider.name}</h6>
              <small className="text-muted d-block mb-2">{provider.description}</small>
              {selectedProvider === provider.id && (
                <div className="badge bg-success">✓ Selected</div>
              )}
            </motion.div>
          </div>
        ))}
      </div>

      {/* Phone Number Input */}
      <div className="mb-4">
        <label className="form-label fw-bold">
          <i className="fas fa-phone me-2 text-primary"></i>
          {selectedProvider.toUpperCase()} Phone Number
        </label>
        <div className="input-group input-group-lg">
          <span className="input-group-text">🇿🇲 +260</span>
          <input
            type="tel"
            className="form-control"
            placeholder="96 123 4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            maxLength={9}
          />
        </div>
        <small className="text-muted d-block mt-2">
          <i className="fas fa-info-circle me-1"></i>
          Test: +260 96* *** *** (any 9 digits)
        </small>
      </div>

      {/* Reference */}
      <div className="mb-4">
        <label className="form-label fw-bold">
          <i className="fas fa-hashtag me-2 text-primary"></i>
          Transaction Reference (Optional)
        </label>
        <input
          type="text"
          className="form-control"
          placeholder="E.g., MOMO123456"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
        />
      </div>

      {/* Instructions Card */}
      <div className="alert alert-info">
        <h6 className="alert-heading">
          <i className="fas fa-lightbulb me-2"></i>
          How to Pay
        </h6>
        <ol className="small mb-0 ps-3">
          <li>Go to your {selectedProvider.toUpperCase()} app</li>
          <li>Select Send Money or Pay Bills</li>
          <li>Enter the amount: <strong>{amount} {currency}</strong></li>
          <li>Complete the transaction</li>
          <li>Copy the transaction reference number</li>
          <li>Come back and confirm payment</li>
        </ol>
      </div>
    </motion.div>
  );

  // Bank Transfer Gateway
  const renderBankTransferGateway = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-4"
    >
      <h5 className="mb-4 text-center fw-bold">
        <i className="fas fa-bank me-2 text-primary"></i>
        Bank Transfer Details
      </h5>

      {/* Owner's Bank Details */}
      {ownerPaymentDetails?.bankName && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="alert alert-success mb-4"
        >
          <h6 className="alert-heading fw-bold">
            <i className="fas fa-check-circle me-2"></i>
            Transfer To These Details
          </h6>
          <div className="row g-3">
            <div className="col-12">
              <div className="payment-bank-details">
                <div className="mb-3">
                  <small className="text-muted d-block">Bank Name</small>
                  <h6 className="fw-bold mb-0">{ownerPaymentDetails.bankName}</h6>
                </div>
                <div className="mb-3">
                  <small className="text-muted d-block">Account Number</small>
                  <h6 className="fw-bold mb-0 font-monospace">
                    {ownerPaymentDetails.accountNumber}
                    <button
                      className="btn btn-sm btn-outline-primary btn-copy-account"
                      onClick={() => {
                        navigator.clipboard.writeText(ownerPaymentDetails.accountNumber);
                        toast.success('Account number copied!');
                      }}
                      title="Copy account number to clipboard"
                    >
                      <i className="fas fa-copy"></i>
                    </button>
                  </h6>
                </div>
                <div>
                  <small className="text-muted d-block">Account Holder</small>
                  <h6 className="fw-bold mb-0">{ownerPaymentDetails.accountHolder}</h6>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Amount to Send */}
      <div className="alert alert-warning mb-4">
        <h6 className="alert-heading fw-bold">
          <i className="fas fa-money-bill-wave me-2"></i>
          Amount to Transfer
        </h6>
        <h5 className="mb-0 text-center">
          <strong className="text-warning payment-amount-display">
            {parseFloat(amount).toLocaleString()} ZMW
          </strong>
        </h5>
      </div>

      {/* Bank Transfer Form */}
      <div className="mb-4">
        <label className="form-label fw-bold">
          <i className="fas fa-user me-2 text-primary"></i>
          Your Account Holder Name
        </label>
        <input
          type="text"
          className="form-control"
          placeholder="Your full name"
          value={accountHolderName}
          onChange={(e) => setAccountHolderName(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="form-label fw-bold">
          <i className="fas fa-bank me-2 text-primary"></i>
          Your Bank Name
        </label>
        <input
          type="text"
          className="form-control"
          placeholder="E.g. Zanaco, Standard Chartered"
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="form-label fw-bold">
          <i className="fas fa-credit-card me-2 text-primary"></i>
          Your Account Number
        </label>
        <input
          type="text"
          className="form-control font-monospace"
          placeholder="Enter your account number"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
        />
      </div>

      {/* Reference */}
      <div className="mb-4">
        <label className="form-label fw-bold">
          <i className="fas fa-hashtag me-2 text-primary"></i>
          Bank Slip/Receipt Reference
        </label>
        <input
          type="text"
          className="form-control"
          placeholder="E.g., Bank slip number or invoice"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
        />
      </div>

      {/* Instructions */}
      <div className="alert alert-info">
        <h6 className="alert-heading">
          <i className="fas fa-lightbulb me-2"></i>
          How to Transfer
        </h6>
        <ol className="instruction-list">
          <li>Log in to your bank's online platform or visit a branch</li>
          <li>Select "Transfer Money" or "Send Funds"</li>
          <li>Fill in the recipient's bank details above</li>
          <li>Enter amount: <strong>{amount} {currency}</strong></li>
          <li>Complete the transfer</li>
          <li>Save your bank slip or receipt</li>
          <li>Return here and upload proof</li>
        </ol>
      </div>
    </motion.div>
  );

  // Confirmation Step
  const renderConfirmation = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-4"
    >
      <h5 className="mb-4 text-center fw-bold">
        <i className="fas fa-check-circle me-2 text-success"></i>
        Confirm Your Payment
      </h5>

      {/* Summary Card */}
      <div className="p-4 bg-light rounded-3 mb-4 border-2 border-success">
        <div className="row mb-3">
          <div className="col-6">
            <small className="text-muted d-block">Property</small>
            <h6 className="fw-bold mb-0">{propertyTitle}</h6>
          </div>
          <div className="col-6">
            <small className="text-muted d-block">Amount</small>
            <h6 className="fw-bold mb-0">
              {amount} {currency}
            </h6>
          </div>
        </div>

        <hr />

        <div className="row mb-3">
          <div className="col-6">
            <small className="text-muted d-block">Payment Method</small>
            <h6 className="fw-bold mb-0">
              {method === 'mobile-money'
                ? `${selectedProvider.toUpperCase()} Money`
                : method === 'bank-transfer'
                  ? 'Bank Transfer'
                  : 'Cash Payment'}
            </h6>
          </div>
          <div className="col-6">
            <small className="text-muted d-block">Status</small>
            <div className="badge bg-info">Pending Verification</div>
          </div>
        </div>

        {method === 'mobile-money' && (
          <>
            <hr />
            <div className="row">
              <div className="col-6">
                <small className="text-muted d-block">Phone</small>
                <h6 className="fw-bold mb-0">+260 {phone}</h6>
              </div>
              {reference && (
                <div className="col-6">
                  <small className="text-muted d-block">Reference</small>
                  <h6 className="fw-bold mb-0 font-monospace">{reference}</h6>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Proof Upload (Production Mode) */}
      {!useSandbox && (
        <div className="mb-4">
          <label htmlFor="proofInput" className="form-label fw-bold">
            <i className="fas fa-image me-2 text-primary"></i>
            Upload Payment Proof
          </label>
          <div
            className="proof-upload-zone"
            onClick={() => document.getElementById('proofInput')?.click()}
          >
            {proof ? (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="payment-icon-lg">
                  ✅
                </div>
                <h6 className="fw-bold mb-1">{proof.name}</h6>
                <small className="text-muted">{(proof.size / 1024).toFixed(2)} KB</small>
              </motion.div>
            ) : (
              <div>
                <div className="payment-icon-lg">
                  📸
                </div>
                <h6>Drop your proof here or click to upload</h6>
                <small className="text-muted">
                  Screenshot, receipt, or bank slip (JPG, PNG, PDF)
                </small>
              </div>
            )}
          </div>
          <input
            id="proofInput"
            type="file"
            className="d-none"
            onChange={(e) => setProof(e.target.files?.[0] || null)}
            accept="image/*,.pdf"
          />
        </div>
      )}


    </motion.div>
  );

  // Success Step
  const renderSuccess = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-5 text-center"
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 0.6 }}
        className="payment-icon-xxl"
      >
        ✅
      </motion.div>

      <h4 className="fw-bold mb-2">Payment Submitted!</h4>
      <p className="text-muted mb-3">
        Your payment has been successfully recorded and is pending verification.
      </p>

      {transactionId && (
        <div className="p-3 bg-light rounded mb-4">
          <small className="text-muted d-block">Transaction ID</small>
          <h6 className="fw-bold font-monospace mb-0">{transactionId}</h6>
        </div>
      )}

      <div className="alert alert-info mb-4">
        <i className="fas fa-clock me-2"></i>
        The property owner will verify your payment within 24 hours.
      </div>

      <button
        className="btn btn-zambia-green btn-lg"
        onClick={() => {
          onHide();
          setStep('method-selection');
        }}
      >
        <i className="fas fa-check me-2"></i>
        Done
      </button>
    </motion.div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || isNaN(Number(amount))) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      setSubmitting(true);

      // Validation
      if (method === 'mobile-money' && !phone) {
        toast.error('Please enter your phone number');
        return;
      }
      if (
        method === 'bank-transfer' &&
        (!accountHolderName || !accountNumber || !bankName)
      ) {
        toast.error('Please fill in all bank details');
        return;
      }

      // Create FormData
      const formData = new FormData();
      formData.append('propertyId', propertyId);
      formData.append('amount', amount);
      formData.append('currency', currency);
      formData.append('method', method);

      if (method === 'mobile-money') {
        formData.append('mobileProvider', selectedProvider);
        formData.append('phoneNumber', phone);
      } else if (method === 'bank-transfer') {
        formData.append('accountHolderName', accountHolderName);
        formData.append('accountNumber', accountNumber);
        formData.append('bankName', bankName);
      }

      if (reference) formData.append('reference', reference);
      if (proof) formData.append('proof', proof);

      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('Not authenticated');
        return;
      }

      setProcessing(true);

      // Submit payment
      const submitResp = await fetch('/api/payments', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!submitResp.ok) throw new Error('Failed to create payment');

      const submitData = await submitResp.json();
      const paymentId = submitData.payment?._id;

      if (!paymentId) throw new Error('No payment ID returned');

      // If sandbox enabled, process immediately
      if (useSandbox) {
        const sandboxPayload = {
          paymentId,
          amount: Number(amount),
          currency,
          method,
          ...(method === 'mobile-money' && {
            provider: selectedProvider,
            phone,
            reference,
          }),
          ...(method === 'bank-transfer' && {
            accountHolderName,
            accountNumber,
            bankName,
          }),
        };

        const sandboxResp = await fetch('/api/payments/sandbox/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(sandboxPayload),
        });

        if (!sandboxResp.ok) throw new Error('Sandbox processing failed');

        const sandboxData = await sandboxResp.json();
        setTransactionId(sandboxData.transactionId);

        const fetchResp = await fetch(`/api/payments?paymentId=${paymentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchData = await fetchResp.json();

        if (onSuccess && fetchData.data?.[0]) {
          onSuccess(fetchData.data[0]);
        }
      } else {
        if (onSuccess && submitData.payment) {
          onSuccess(submitData.payment);
        }
      }

      setStep('success');
      setTimeout(
        () => {
          onHide();
          setStep('method-selection');
        },
        useSandbox ? 2000 : 0
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit payment');
      console.error('Payment error:', err);
    } finally {
      setSubmitting(false);
      setProcessing(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="border-bottom-0 bg-light">
        <Modal.Title>
          <i className="fas fa-money-bill-wave me-2 text-success"></i>
          Complete Your Payment
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="py-4">
        {/* Sandbox Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4"
        >
          <div className="form-check d-flex align-items-center p-2 bg-light rounded">
            <input
              className="form-check-input"
              type="checkbox"
              id="sandboxMode"
              checked={useSandbox}
              onChange={async (e) => {
                setUseSandbox(e.target.checked);
                if (e.target.checked) {
                  try {
                    const token = localStorage.getItem('auth_token');
                    if (!token) return;
                    const resp = await fetch('/api/payments/sandbox/providers', {
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    if (resp.ok) {
                      const data = await resp.json();
                      setTestProviders(data);
                    }
                  } catch (err) {
                    console.warn('Failed to fetch test providers', err);
                  }
                }
              }}
              disabled={submitting}
            />
            <label className="form-check-label ms-2 mb-0" htmlFor="sandboxMode">
              <i className="fas fa-flask me-1"></i>
              <strong>Test Mode</strong>
            </label>
          </div>
          {useSandbox && testProviders && (
            <div className="alert alert-info mb-3">
              <strong>Sandbox test credentials</strong>
              <div className="mt-2">
                <em>Mobile Money</em>:
                <ul className="mb-1">
                  {Object.entries(testProviders.mobileMoney || {}).map(([key, val]: any) => (
                    <li key={key} className="small">
                      {val.name} – {val.testNumber} / PIN {val.testPin}
                    </li>
                  ))}
                </ul>
                <em>Bank Accounts</em>:
                <ul className="mb-0">
                  {Object.entries(testProviders.bankAccounts || {}).map(([key, val]: any) => (
                    <li key={key} className="small">
                      {val.bankName} ({val.currency}) – {val.accountNumber}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </motion.div>

        {/* Progress Indicator */}
        <div className="mb-4">
          <div className="d-flex justify-content-between mb-2">
            {(['method-selection', 'gateway', 'confirmation', 'success'] as const).map((s, i) => (
              <motion.div
                key={s}
                animate={{
                  scale: step === s ? 1.1 : 1,
                  opacity: step === s || s === 'success' ? 1 : 0.5,
                }}
                className={`flex-grow-1 h-2 rounded mx-1 ${
                  s === 'success' || step === s
                    ? 'bg-success'
                    : i < ['method-selection', 'gateway', 'confirmation', 'success'].indexOf(step)
                      ? 'bg-success'
                      : 'bg-light'
                }`}
                style={{ height: '4px' }}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 'method-selection' && (
            <motion.div
              key="method-selection"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="py-4"
            >
              <h5 className="mb-4 text-center fw-bold">
                <i className="fas fa-credit-card me-2"></i>
                Choose Payment Method
              </h5>

              <div className="row g-3 mb-4">
                {[
                  {
                    id: 'mobile-money',
                    name: 'Mobile Money',
                    icon: '📱',
                    desc: 'Quick & Easy',
                    color: 'text-warning',
                  },
                  {
                    id: 'bank-transfer',
                    name: 'Bank Transfer',
                    icon: '🏦',
                    desc: 'Direct to Account',
                    color: 'text-primary',
                  },
                  {
                    id: 'cash',
                    name: 'Cash in Hand',
                    icon: '💵',
                    desc: 'At Office',
                    color: 'text-success',
                  },
                ].map((m) => (
                  <div key={m.id} className="col-md-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() =>
                        handleMethodSelect(m.id as 'mobile-money' | 'bank-transfer' | 'cash')
                      }
                      className={`w-100 p-4 border-2 rounded-3 text-center transition-all ${
                        method === m.id ? 'border-success bg-light-success' : 'border-light'
                      }`}
                    >
                      <div className="payment-icon-xl">
                        {m.icon}
                      </div>
                      <h6 className="fw-bold mb-1">{m.name}</h6>
                      <small className="text-muted">{m.desc}</small>
                    </motion.button>
                  </div>
                ))}
              </div>

              <div className="alert alert-info">
                <i className="fas fa-info-circle me-2"></i>
                <strong>Property:</strong> {propertyTitle} — <strong>Amount:</strong> {amount}{' '}
                {currency}
              </div>
            </motion.div>
          )}

          {step === 'gateway' && (
            <motion.div
              key="gateway"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <form onSubmit={(e) => { e.preventDefault(); setStep('confirmation'); }}>
                {method === 'mobile-money' && renderMobileMoneyGateway()}
                {method === 'bank-transfer' && renderBankTransferGateway()}
                {method === 'cash' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-4 text-center"
                  >
                    <div className="payment-icon-xxl">
                      💵
                    </div>
                    <h5 className="fw-bold mb-3">Cash Payment</h5>
                    <p className="text-muted mb-4">
                      You can pay {amount} {currency} in cash directly to the property owner's office.
                    </p>
                    <div className="alert alert-info">
                      <small className="fw-bold">
                        Contact the owner to arrange a convenient payment time and location.
                      </small>
                    </div>
                  </motion.div>
                )}

                <div className="d-grid gap-2 mt-4">
                  <button
                    type="submit"
                    className="btn btn-zambia-green btn-lg"
                    disabled={
                      method === 'mobile-money' ? !phone : method === 'bank-transfer' ? !accountNumber : false
                    }
                  >
                    <i className="fas fa-arrow-right me-2"></i>
                    Review & Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('method-selection')}
                    className="btn btn-outline-secondary"
                  >
                    Back
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {step === 'confirmation' && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <form onSubmit={handleSubmit}>
                {renderConfirmation()}

                <div className="d-grid gap-2 mt-4">
                  <button
                    type="submit"
                    className="btn btn-zambia-green btn-lg"
                    disabled={submitting || processing || (!useSandbox && !proof)}
                  >
                    {submitting || processing ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check-circle me-2"></i>
                        Confirm & Submit
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('gateway')}
                    className="btn btn-outline-secondary"
                    disabled={submitting}
                  >
                    Back
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {renderSuccess()}
            </motion.div>
          )}
        </AnimatePresence>
      </Modal.Body>
    </Modal>
  );
};

export default PaymentFormModal;

import React, { useState } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [formData, setFormData] = useState({
    entityId: '',
    accessToken: '',
    currency: 'USD',
    amount: '',
    merchantIdentifier: '8ac7a4c7921bbc1e01922049d74b0738',
    environment: 'test',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [checkoutId, setCheckoutId] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error for this field
    setErrors({
      ...errors,
      [name]: '',
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.entityId.trim()) {
      newErrors.entityId = 'Entity ID cannot be empty';
    } else if (formData.entityId.length !== 32) {
      newErrors.entityId = 'Entity ID must be 32 characters long';
    }

    if (!formData.accessToken.trim()) {
      newErrors.accessToken = 'Access Token cannot be empty';
    }

    if (!formData.currency.trim()) {
      newErrors.currency = 'Currency cannot be empty';
    } else if (formData.currency.length !== 3) {
      newErrors.currency = 'Currency must be 3 characters long (e.g., USD, EUR)';
    }

    if (!formData.amount.trim()) {
      newErrors.amount = 'Amount cannot be empty';
    } else if (!/^\d+(\.\d{1,2})?$/.test(formData.amount)) {
      newErrors.amount = 'Invalid amount format. Please enter whole numbers or up to 2 decimal places';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ submit: data.error || 'Failed to generate checkout' });
        setLoading(false);
        return;
      }

      const id = data.id;
      const credToken = data.credToken;
      setCheckoutId(id);

      // Determine which environment to use
      const baseUrl = formData.environment === 'live' 
        ? 'https://eu-prod.oppwa.com' 
        : 'https://eu-test.oppwa.com';

      // Load the payment widget script
      const script = document.createElement('script');
      script.src = `${baseUrl}/v1/paymentWidgets.js?checkoutId=${id}`;
      script.onload = () => {
        // Create form for payment widget
        const container = document.getElementById('checkoutContainer');
        container.innerHTML = '';

        const form = document.createElement('form');
        // Use signed credToken instead of raw credentials in the result URL
        form.action = `/api/result?id=${id}&token=${encodeURIComponent(credToken)}`;
        form.className = 'paymentWidgets';
        form.setAttribute('data-brands', 'APPLEPAY');

        container.appendChild(form);

        // Initialize wpwlOptions configuration
        window.wpwlOptions = {
          applePay: {
            displayName: 'Apple Demo',
            style: 'black',
            currencyCode: formData.currency,
            requiredBillingContactFields: ['email', 'name', 'postalAddress'],
            submitOnPaymentAuthorized: ['customer'],
            checkAvailability: 'applePayCapabilities',
            merchantIdentifier: formData.merchantIdentifier,
          },
        };
      };

      document.body.appendChild(script);
    } catch (error) {
      setErrors({ submit: 'Network error: ' + error.message });
    }

    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2>ApplePay Test Page</h2>
      </header>

      <section className={styles.section}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Environment</label>
            <select
              name="environment"
              value={formData.environment}
              onChange={handleInputChange}
              className={styles.select}
            >
              <option value="test">Test (eu-test.oppwa.com)</option>
              <option value="live">Live (eu-prod.oppwa.com)</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <input
              type="text"
              name="entityId"
              placeholder="Entity ID (32 characters)"
              value={formData.entityId}
              onChange={handleInputChange}
              className={styles.input}
            />
            {errors.entityId && (
              <div className={styles.errorMessage}>{errors.entityId}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <input
              type="text"
              name="accessToken"
              placeholder="Access Token"
              value={formData.accessToken}
              onChange={handleInputChange}
              className={styles.input}
            />
            {errors.accessToken && (
              <div className={styles.errorMessage}>{errors.accessToken}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <input
              type="text"
              name="currency"
              placeholder="Currency (e.g., USD, EUR)"
              value={formData.currency}
              onChange={handleInputChange}
              className={styles.input}
            />
            {errors.currency && (
              <div className={styles.errorMessage}>{errors.currency}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <input
              type="text"
              name="amount"
              placeholder="Amount"
              value={formData.amount}
              onChange={handleInputChange}
              className={styles.input}
            />
            {errors.amount && (
              <div className={styles.errorMessage}>{errors.amount}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <input
              type="text"
              name="merchantIdentifier"
              placeholder="Merchant Identifier (Apple Pay)"
              value={formData.merchantIdentifier}
              onChange={handleInputChange}
              className={styles.input}
            />
          </div>

          {errors.submit && (
            <div className={styles.errorMessage}>{errors.submit}</div>
          )}

          <button
            type="submit"
            className={styles.button}
            disabled={loading}
          >
            {loading ? 'Generating Checkout...' : 'Generate Checkout'}
          </button>
        </form>

        <div id="checkoutContainer" className={styles.checkoutContainer}></div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          &copy; 2011-{new Date().getFullYear()} TEST Change
        </div>
      </footer>
    </div>
  );
}

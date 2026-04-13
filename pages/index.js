import React, { useState } from 'react';
import styles from '../styles/Home.module.css';

const TABS = ['Tokenization', 'Basic', 'Payment Details', 'Shipping', 'Billing', 'Coupons'];

const DEFAULT_WPWL = {
  // Basic
  version: '',
  checkAvailability: 'applePayCapabilities',
  merchantIdentifier: '8ac7a4c7921bbc1e01922049d74b0738',
  buttonSource: 'css',
  buttonStyle: 'black',
  buttonType: 'plain',
  displayName: 'Apple Demo',
  countryCode: '',
  // Payment Details
  currencyCode: '',
  totalLabel: '',
  totalType: 'final',
  lineItems: '',
  merchantCapabilities: ['supports3DS'],
  supportedNetworks: ['amex', 'discover', 'masterCard', 'visa'],
  // Shipping
  shippingMethods: '',
  shippingType: 'shipping',
  requiredShippingContactFields: '',
  shippingContact: '',
  shippingContactEditingMode: 'enabled',
  supportedCountries: '',
  // Billing
  requiredBillingContactFields: ['postalAddress'],
  billingContact: '',
  // Coupons
  supportsCouponCode: false,
  couponCode: '',
  // Tokenization
  tokenizationType: 'none', // none | automatic | recurring | deferred
  // submitOnPaymentAuthorized
  submitOnPaymentAuthorized: ['customer'],
};

function tryParseJSON(str) {
  if (!str || !str.trim()) return null;
  try {
    return JSON.parse(str);
  } catch {
    return '__INVALID__';
  }
}

function JsonTextarea({ label, name, value, onChange, placeholder, hint }) {
  const parsed = tryParseJSON(value);
  const isInvalid = parsed === '__INVALID__';
  return (
    <div className={styles.formGroup}>
      <label className={styles.label}>{label}</label>
      {hint && <div className={styles.hint}>{hint}</div>}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${styles.textarea} ${isInvalid ? styles.inputError : ''}`}
        rows={4}
      />
      {isInvalid && <div className={styles.errorMessage}>Invalid JSON</div>}
    </div>
  );
}

export default function Home() {
  const [formData, setFormData] = useState({
    entityId: '',
    accessToken: '',
    currency: 'USD',
    amount: '',
    environment: 'test',
    createRegistration: false,
  });

  const [wpwl, setWpwl] = useState(DEFAULT_WPWL);
  const [activeTab, setActiveTab] = useState('Tokenization');
  const [configOpen, setConfigOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [checkoutId, setCheckoutId] = useState(null);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleWpwlChange = (e) => {
    const { name, value, type, checked } = e.target;
    setWpwl((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleMultiSelect = (name, val) => {
    setWpwl((prev) => {
      const current = prev[name] || [];
      return {
        ...prev,
        [name]: current.includes(val)
          ? current.filter((v) => v !== val)
          : [...current, val],
      };
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.entityId.trim()) newErrors.entityId = 'Entity ID cannot be empty';
    else if (formData.entityId.length !== 32) newErrors.entityId = 'Entity ID must be 32 characters long';
    if (!formData.accessToken.trim()) newErrors.accessToken = 'Access Token cannot be empty';
    if (!formData.currency.trim()) newErrors.currency = 'Currency cannot be empty';
    else if (formData.currency.length !== 3) newErrors.currency = 'Currency must be 3 characters (e.g. USD)';
    if (!formData.amount.trim()) newErrors.amount = 'Amount cannot be empty';
    else if (!/^\d+(\.\d{1,2})?$/.test(formData.amount)) newErrors.amount = 'Invalid amount format';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildWpwlOptions = () => {
    const opts = {};

    if (wpwl.version) opts.version = parseInt(wpwl.version, 10);
    if (wpwl.checkAvailability) opts.checkAvailability = wpwl.checkAvailability;
    if (wpwl.merchantIdentifier) opts.merchantIdentifier = wpwl.merchantIdentifier;
    if (wpwl.buttonSource) opts.buttonSource = wpwl.buttonSource;
    if (wpwl.buttonStyle) opts.buttonStyle = wpwl.buttonStyle;
    if (wpwl.buttonType) opts.buttonType = wpwl.buttonType;
    if (wpwl.displayName) opts.displayName = wpwl.displayName;
    if (wpwl.countryCode) opts.countryCode = wpwl.countryCode;
    if (wpwl.currencyCode) opts.currencyCode = wpwl.currencyCode;

    if (wpwl.totalLabel) {
      opts.total = { label: wpwl.totalLabel, type: wpwl.totalType };
    }

    const lineItems = tryParseJSON(wpwl.lineItems);
    if (lineItems && lineItems !== '__INVALID__') opts.lineItems = lineItems;

    if (wpwl.merchantCapabilities?.length) opts.merchantCapabilities = wpwl.merchantCapabilities;
    if (wpwl.supportedNetworks?.length) opts.supportedNetworks = wpwl.supportedNetworks;

    const shippingMethods = tryParseJSON(wpwl.shippingMethods);
    if (shippingMethods && shippingMethods !== '__INVALID__') opts.shippingMethods = shippingMethods;

    if (wpwl.shippingType) opts.shippingType = wpwl.shippingType;
    if (wpwl.shippingContactEditingMode) opts.shippingContactEditingMode = wpwl.shippingContactEditingMode;

    const reqShipping = wpwl.requiredShippingContactFields
      ? wpwl.requiredShippingContactFields.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    if (reqShipping.length) opts.requiredShippingContactFields = reqShipping;

    const shippingContact = tryParseJSON(wpwl.shippingContact);
    if (shippingContact && shippingContact !== '__INVALID__') opts.shippingContact = shippingContact;

    const supportedCountries = wpwl.supportedCountries
      ? wpwl.supportedCountries.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    if (supportedCountries.length) opts.supportedCountries = supportedCountries;

    if (wpwl.requiredBillingContactFields?.length) opts.requiredBillingContactFields = wpwl.requiredBillingContactFields;

    const billingContact = tryParseJSON(wpwl.billingContact);
    if (billingContact && billingContact !== '__INVALID__') opts.billingContact = billingContact;

    if (wpwl.supportsCouponCode) opts.supportsCouponCode = true;
    if (wpwl.couponCode) opts.couponCode = wpwl.couponCode;

    if (wpwl.submitOnPaymentAuthorized?.length) opts.submitOnPaymentAuthorized = wpwl.submitOnPaymentAuthorized;

    // Tokenization
    if (wpwl.tokenizationType === 'automatic' && wpwl.automaticReloadPaymentRequest) {
      const v = tryParseJSON(wpwl.automaticReloadPaymentRequest);
      if (v && v !== '__INVALID__') opts.automaticReloadPaymentRequest = v;
    }
    if (wpwl.tokenizationType === 'recurring' && wpwl.recurringPaymentRequest) {
      const v = tryParseJSON(wpwl.recurringPaymentRequest);
      if (v && v !== '__INVALID__') opts.recurringPaymentRequest = v;
    }
    if (wpwl.tokenizationType === 'deferred' && wpwl.deferredPaymentRequest) {
      const v = tryParseJSON(wpwl.deferredPaymentRequest);
      if (v && v !== '__INVALID__') opts.deferredPaymentRequest = v;
    }

    return opts;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityId: formData.entityId,
          accessToken: formData.accessToken,
          currency: formData.currency,
          amount: formData.amount,
          environment: formData.environment,
          createRegistration: formData.createRegistration,
        }),
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

      const baseUrl = formData.environment === 'live'
        ? 'https://eu-prod.oppwa.com'
        : 'https://eu-test.oppwa.com';

      const script = document.createElement('script');
      script.src = `${baseUrl}/v1/paymentWidgets.js?checkoutId=${id}`;
      script.onload = () => {
        const container = document.getElementById('checkoutContainer');
        container.innerHTML = '';

        const form = document.createElement('form');
        form.action = `/api/result?id=${id}&token=${encodeURIComponent(credToken)}`;
        form.className = 'paymentWidgets';
        form.setAttribute('data-brands', 'APPLEPAY');
        container.appendChild(form);

        window.wpwlOptions = {
          applePay: buildWpwlOptions(),
        };
      };

      document.body.appendChild(script);
    } catch (error) {
      setErrors({ submit: 'Network error: ' + error.message });
    }

    setLoading(false);
  };

  // ─── Tab renderers ────────────────────────────────────────────────────────

  const renderTokenization = () => (
    <div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Registration / Tokenization Type</label>
        <select name="tokenizationType" value={wpwl.tokenizationType} onChange={handleWpwlChange} className={styles.select}>
          <option value="none">None</option>
          <option value="automatic">Automatic Reload</option>
          <option value="recurring">Recurring (Subscription)</option>
          <option value="deferred">Deferred</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>
          <input type="checkbox" name="createRegistration" checked={formData.createRegistration} onChange={handleFormChange} style={{ marginRight: 6 }} />
          Create Registration Token (createRegistration=true)
        </label>
        <div className={styles.hint}>Enables tokenization during payment so subsequent charges can be made without re-entering card details.</div>
      </div>

      {wpwl.tokenizationType === 'automatic' && (
        <JsonTextarea
          label="automaticReloadPaymentRequest"
          name="automaticReloadPaymentRequest"
          value={wpwl.automaticReloadPaymentRequest || ''}
          onChange={handleWpwlChange}
          placeholder={`{\n  "paymentDescription": "Card Top-up",\n  "automaticReloadBilling": {\n    "type": "final",\n    "label": "Automatic Top-up",\n    "amount": "10.00",\n    "paymentTiming": "automaticReload",\n    "automaticReloadPaymentThresholdAmount": "2.00"\n  },\n  "billingAgreement": "Reload when below $2",\n  "managementURL": "https://your-domain.com/manage"\n}`}
          hint="Leave tokenNotificationURL empty — the gateway sets it automatically."
        />
      )}

      {wpwl.tokenizationType === 'recurring' && (
        <JsonTextarea
          label="recurringPaymentRequest"
          name="recurringPaymentRequest"
          value={wpwl.recurringPaymentRequest || ''}
          onChange={handleWpwlChange}
          placeholder={`{\n  "paymentDescription": "Subscription",\n  "regularBilling": {\n    "type": "final",\n    "label": "Monthly Plan",\n    "amount": "20.00",\n    "paymentTiming": "recurring",\n    "recurringPaymentStartDate": "2026-01-01T00:00:00",\n    "recurringPaymentIntervalUnit": "month",\n    "recurringPaymentIntervalCount": 1\n  },\n  "billingAgreement": "Charge $20 monthly",\n  "managementURL": "https://your-domain.com/manage"\n}`}
          hint="Leave tokenNotificationURL empty — the gateway sets it automatically."
        />
      )}

      {wpwl.tokenizationType === 'deferred' && (
        <JsonTextarea
          label="deferredPaymentRequest"
          name="deferredPaymentRequest"
          value={wpwl.deferredPaymentRequest || ''}
          onChange={handleWpwlChange}
          placeholder={`{\n  "paymentDescription": "Hotel Booking",\n  "deferredBilling": {\n    "type": "final",\n    "label": "Hotel Stay",\n    "amount": "150.00",\n    "paymentTiming": "deferred",\n    "deferredPaymentDate": "2026-06-01T00:00:00"\n  },\n  "billingAgreement": "Charge $150 on 01/06/2026",\n  "managementURL": "https://your-domain.com/manage"\n}`}
        />
      )}
    </div>
  );

  const renderBasic = () => (
    <div>
      <div className={styles.formGroup}>
        <label className={styles.label}>API Version</label>
        <input type="number" name="version" value={wpwl.version} onChange={handleWpwlChange} className={styles.input} placeholder="1 (default)" min={1} />
        <div className={styles.hint}>1=iOS10+, 3=iOS11+, 4=iOS12.1+, 10=iOS14+, 12=iOS15+, 14=iOS16+</div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>checkAvailability</label>
        <select name="checkAvailability" value={wpwl.checkAvailability} onChange={handleWpwlChange} className={styles.select}>
          <option value="canMakePayments">canMakePayments</option>
          <option value="applePayCapabilities">applePayCapabilities (recommended)</option>
          <option value="canMakePaymentsWithActiveCard">canMakePaymentsWithActiveCard (deprecated)</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>merchantIdentifier</label>
        <input type="text" name="merchantIdentifier" value={wpwl.merchantIdentifier} onChange={handleWpwlChange} className={styles.input} placeholder="com.company or Entity ID" />
        <div className={styles.hint}>Required when checkAvailability is applePayCapabilities.</div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>buttonSource</label>
        <select name="buttonSource" value={wpwl.buttonSource} onChange={handleWpwlChange} className={styles.select}>
          <option value="css">css (default)</option>
          <option value="js">js</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>buttonStyle</label>
        <select name="buttonStyle" value={wpwl.buttonStyle} onChange={handleWpwlChange} className={styles.select}>
          <option value="white-outline">white-outline (default)</option>
          <option value="white">white</option>
          <option value="black">black</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>buttonType</label>
        <select name="buttonType" value={wpwl.buttonType} onChange={handleWpwlChange} className={styles.select}>
          {['plain','buy','pay','check-out','book','donate','subscribe','continue','contribute','order','reload','rent','support','tip','top-up','add-money'].map(t => (
            <option key={t} value={t}>{t}{t === 'plain' ? ' (default)' : ''}</option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>displayName</label>
        <input type="text" name="displayName" value={wpwl.displayName} onChange={handleWpwlChange} className={styles.input} placeholder="Your store name (shown in Touch Bar)" />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>countryCode</label>
        <input type="text" name="countryCode" value={wpwl.countryCode} onChange={handleWpwlChange} className={styles.input} placeholder="e.g. GB" maxLength={2} />
      </div>
    </div>
  );

  const renderPaymentDetails = () => {
    const networks = ['amex','bancomat','bancontact','cartesBancaires','chinaUnionPay','dankort','discover','eftpos','electron','elo','girocard','interac','jcb','mada','maestro','masterCard','mir','privateLabel','visa','vPay'];
    const capabilities = ['supports3DS','supportsCredit','supportsDebit','supportsEMV'];
    return (
      <div>
        <div className={styles.formGroup}>
          <label className={styles.label}>currencyCode</label>
          <input type="text" name="currencyCode" value={wpwl.currencyCode} onChange={handleWpwlChange} className={styles.input} placeholder="Uses checkout currency if blank (e.g. USD)" maxLength={3} />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>total.label</label>
          <input type="text" name="totalLabel" value={wpwl.totalLabel} onChange={handleWpwlChange} className={styles.input} placeholder="e.g. COMPANY, INC." />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>total.type</label>
          <select name="totalType" value={wpwl.totalType} onChange={handleWpwlChange} className={styles.select}>
            <option value="final">final (default)</option>
            <option value="pending">pending</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>merchantCapabilities</label>
          <div className={styles.hint}>supports3DS must always be included.</div>
          <div className={styles.checkboxGroup}>
            {capabilities.map(c => (
              <label key={c} className={styles.checkboxLabel}>
                <input type="checkbox" checked={wpwl.merchantCapabilities.includes(c)} onChange={() => handleMultiSelect('merchantCapabilities', c)} />
                {c}
              </label>
            ))}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>supportedNetworks</label>
          <div className={styles.checkboxGroup}>
            {networks.map(n => (
              <label key={n} className={styles.checkboxLabel}>
                <input type="checkbox" checked={wpwl.supportedNetworks.includes(n)} onChange={() => handleMultiSelect('supportedNetworks', n)} />
                {n}
              </label>
            ))}
          </div>
        </div>

        <JsonTextarea
          label="lineItems (JSON array)"
          name="lineItems"
          value={wpwl.lineItems}
          onChange={handleWpwlChange}
          placeholder={`[{"label": "Subtotal", "amount": "10.00"}, {"label": "Tax", "amount": "1.00"}]`}
          hint="Each item needs label and amount. Cannot be empty if present."
        />
      </div>
    );
  };

  const renderShipping = () => (
    <div>
      <div className={styles.formGroup}>
        <label className={styles.label}>shippingType</label>
        <select name="shippingType" value={wpwl.shippingType} onChange={handleWpwlChange} className={styles.select}>
          <option value="shipping">shipping (default)</option>
          <option value="delivery">delivery</option>
          <option value="storePickup">storePickup</option>
          <option value="servicePickup">servicePickup</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>requiredShippingContactFields</label>
        <input type="text" name="requiredShippingContactFields" value={wpwl.requiredShippingContactFields} onChange={handleWpwlChange} className={styles.input} placeholder="e.g. postalAddress, email, name, phone" />
        <div className={styles.hint}>Comma-separated. Options: email, name, phone, postalAddress, phoneticName</div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>shippingContactEditingMode</label>
        <select name="shippingContactEditingMode" value={wpwl.shippingContactEditingMode} onChange={handleWpwlChange} className={styles.select}>
          <option value="enabled">enabled (default)</option>
          <option value="storePickup">storePickup (read-only)</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>supportedCountries</label>
        <input type="text" name="supportedCountries" value={wpwl.supportedCountries} onChange={handleWpwlChange} className={styles.input} placeholder="e.g. US, GB" />
        <div className={styles.hint}>Comma-separated ISO 3166 country codes. Limits cards to those issued in these countries.</div>
      </div>

      <JsonTextarea
        label="shippingContact (JSON)"
        name="shippingContact"
        value={wpwl.shippingContact}
        onChange={handleWpwlChange}
        placeholder={`{"addressLines": ["123 Any Street"], "locality": "London", "postalCode": "SW1A 1AA", "countryCode": "GB", "familyName": "Smith"}`}
        hint="Pre-fills shipping address on the payment sheet."
      />

      <JsonTextarea
        label="shippingMethods (JSON array)"
        name="shippingMethods"
        value={wpwl.shippingMethods}
        onChange={handleWpwlChange}
        placeholder={`[{"label": "Free Shipping", "amount": "0.00", "identifier": "free", "detail": "5 business days"}, {"label": "Express", "amount": "5.00", "identifier": "express", "detail": "2 business days"}]`}
      />
    </div>
  );

  const renderBilling = () => (
    <div>
      <div className={styles.formGroup}>
        <label className={styles.label}>requiredBillingContactFields</label>
        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" checked={wpwl.requiredBillingContactFields.includes('postalAddress')} onChange={() => handleMultiSelect('requiredBillingContactFields', 'postalAddress')} />
            postalAddress
          </label>
        </div>
        <div className={styles.hint}>Requesting postalAddress also provides the user's name.</div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>submitOnPaymentAuthorized</label>
        <div className={styles.checkboxGroup}>
          {['customer', 'billing'].map(v => (
            <label key={v} className={styles.checkboxLabel}>
              <input type="checkbox" checked={wpwl.submitOnPaymentAuthorized.includes(v)} onChange={() => handleMultiSelect('submitOnPaymentAuthorized', v)} />
              {v}
            </label>
          ))}
        </div>
        <div className={styles.hint}>Auto-submits customer/billing data from Apple Pay into the transaction.</div>
      </div>

      <JsonTextarea
        label="billingContact (JSON)"
        name="billingContact"
        value={wpwl.billingContact}
        onChange={handleWpwlChange}
        placeholder={`{"addressLines": ["123 Any Street"], "locality": "London", "postalCode": "SW1A 1AA", "countryCode": "GB", "familyName": "Smith"}`}
        hint="Pre-fills billing address. Requires postalAddress in requiredBillingContactFields."
      />
    </div>
  );

  const renderCoupons = () => (
    <div>
      <div className={styles.formGroup}>
        <label className={styles.label}>
          <input type="checkbox" name="supportsCouponCode" checked={wpwl.supportsCouponCode} onChange={handleWpwlChange} style={{ marginRight: 6 }} />
          supportsCouponCode
        </label>
        <div className={styles.hint}>Shows a coupon code field on the payment sheet. Requires Apple Pay JS API version 12+.</div>
      </div>
      {wpwl.supportsCouponCode && (
        <div className={styles.formGroup}>
          <label className={styles.label}>couponCode (initial value)</label>
          <input type="text" name="couponCode" value={wpwl.couponCode} onChange={handleWpwlChange} className={styles.input} placeholder="e.g. DISCOUNT20" />
        </div>
      )}
    </div>
  );

  const renderTab = () => {
    switch (activeTab) {
      case 'Tokenization': return renderTokenization();
      case 'Basic': return renderBasic();
      case 'Payment Details': return renderPaymentDetails();
      case 'Shipping': return renderShipping();
      case 'Billing': return renderBilling();
      case 'Coupons': return renderCoupons();
      default: return null;
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2>ApplePay Test Page</h2>
      </header>

      <section className={styles.section}>
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* ── Core fields ── */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Environment</label>
            <select name="environment" value={formData.environment} onChange={handleFormChange} className={styles.select}>
              <option value="test">Test (eu-test.oppwa.com)</option>
              <option value="live">Live (eu-prod.oppwa.com)</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <input type="text" name="entityId" placeholder="Entity ID (32 characters)" value={formData.entityId} onChange={handleFormChange} className={styles.input} />
            {errors.entityId && <div className={styles.errorMessage}>{errors.entityId}</div>}
          </div>

          <div className={styles.formGroup}>
            <input type="text" name="accessToken" placeholder="Access Token" value={formData.accessToken} onChange={handleFormChange} className={styles.input} />
            {errors.accessToken && <div className={styles.errorMessage}>{errors.accessToken}</div>}
          </div>

          <div className={styles.formGroup}>
            <input type="text" name="currency" placeholder="Currency (e.g. USD, GBP)" value={formData.currency} onChange={handleFormChange} className={styles.input} />
            {errors.currency && <div className={styles.errorMessage}>{errors.currency}</div>}
          </div>

          <div className={styles.formGroup}>
            <input type="text" name="amount" placeholder="Amount" value={formData.amount} onChange={handleFormChange} className={styles.input} />
            {errors.amount && <div className={styles.errorMessage}>{errors.amount}</div>}
          </div>

          {/* ── Advanced config panel ── */}
          <div className={styles.configPanel}>
            <button type="button" className={styles.configToggle} onClick={() => setConfigOpen(o => !o)}>
              {configOpen ? '▾' : '▸'} Advanced Options (wpwlOptions)
            </button>

            {configOpen && (
              <div className={styles.configBody}>
                <div className={styles.tabBar}>
                  {TABS.map(t => (
                    <button
                      key={t}
                      type="button"
                      className={`${styles.tab} ${activeTab === t ? styles.tabActive : ''}`}
                      onClick={() => setActiveTab(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className={styles.tabContent}>
                  {renderTab()}
                </div>
              </div>
            )}
          </div>

          {errors.submit && <div className={styles.errorMessage}>{errors.submit}</div>}

          <button type="submit" className={styles.button} disabled={loading}>
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

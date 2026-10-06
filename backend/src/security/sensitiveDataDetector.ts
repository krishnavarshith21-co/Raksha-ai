import { SensitiveDataResult, DataClassification } from '../types';

// Regex patterns for sensitive data detection
const PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
  phone: /\b(\+?1?[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  ssn: /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g,
  creditCard: /\b(?:\d{4}[-.\s]?){3}\d{4}\b/g,
  apiKey: /\b(?:api[_-]?key|token|secret|password|credential)[s]?\s*[:=]\s*['"]?([A-Za-z0-9_\-./+=]{8,})/gi,
  ipAddress: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
  awsKey: /\bAKIA[0-9A-Z]{16}\b/g,
  privateKey: /-----BEGIN (?:RSA|DSA|EC|PGP)? ?PRIVATE KEY-----/g,
  jwt: /\beyJ[A-Za-z0-9_-]*\.eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*/g,
  internalId: /\b(?:internal|employee|emp|user|account)[_-]?id\s*[:=]\s*['"]?(\w+)/gi,
  financialAmount: /\$\s?\d{1,3}(?:,\d{3})*(?:\.\d{2})?/g,
  bankAccount: /\b\d{8,17}\b/g,
  passport: /\b[A-Z]{1,2}\d{6,9}\b/g,
};

const SENSITIVE_KEYWORDS = [
  'password', 'secret', 'credential', 'token', 'api_key', 'apikey',
  'private_key', 'access_key', 'secret_key', 'auth_token',
  'social security', 'ssn', 'tax id', 'ein',
  'credit card', 'bank account', 'routing number',
  'salary', 'compensation', 'payroll',
  'medical', 'diagnosis', 'prescription', 'health record',
  'confidential', 'restricted', 'classified', 'proprietary',
  'internal only', 'do not share', 'nda',
];

export function detectSensitiveData(text: string | null | undefined): SensitiveDataResult {
  if (!text || text.trim().length === 0) {
    return {
      detected: false,
      types: [],
      classification: 'PUBLIC',
    };
  }

  const detectedTypes: string[] = [];
  let maxClassification: DataClassification = 'PUBLIC';

  // Check patterns
  if (PATTERNS.email.test(text)) {
    detectedTypes.push('EMAIL');
    maxClassification = upgradeClassification(maxClassification, 'INTERNAL');
  }
  PATTERNS.email.lastIndex = 0;

  if (PATTERNS.phone.test(text)) {
    detectedTypes.push('PHONE_NUMBER');
    maxClassification = upgradeClassification(maxClassification, 'INTERNAL');
  }
  PATTERNS.phone.lastIndex = 0;

  if (PATTERNS.ssn.test(text)) {
    detectedTypes.push('SSN');
    maxClassification = upgradeClassification(maxClassification, 'RESTRICTED');
  }
  PATTERNS.ssn.lastIndex = 0;

  if (PATTERNS.creditCard.test(text)) {
    detectedTypes.push('CREDIT_CARD');
    maxClassification = upgradeClassification(maxClassification, 'RESTRICTED');
  }
  PATTERNS.creditCard.lastIndex = 0;

  if (PATTERNS.apiKey.test(text)) {
    detectedTypes.push('API_KEY');
    maxClassification = upgradeClassification(maxClassification, 'CONFIDENTIAL');
  }
  PATTERNS.apiKey.lastIndex = 0;

  if (PATTERNS.awsKey.test(text)) {
    detectedTypes.push('AWS_KEY');
    maxClassification = upgradeClassification(maxClassification, 'RESTRICTED');
  }
  PATTERNS.awsKey.lastIndex = 0;

  if (PATTERNS.privateKey.test(text)) {
    detectedTypes.push('PRIVATE_KEY');
    maxClassification = upgradeClassification(maxClassification, 'RESTRICTED');
  }
  PATTERNS.privateKey.lastIndex = 0;

  if (PATTERNS.jwt.test(text)) {
    detectedTypes.push('JWT_TOKEN');
    maxClassification = upgradeClassification(maxClassification, 'CONFIDENTIAL');
  }
  PATTERNS.jwt.lastIndex = 0;

  if (PATTERNS.financialAmount.test(text)) {
    detectedTypes.push('FINANCIAL_DATA');
    maxClassification = upgradeClassification(maxClassification, 'CONFIDENTIAL');
  }
  PATTERNS.financialAmount.lastIndex = 0;

  // Check keywords
  const lowerText = text.toLowerCase();
  for (const keyword of SENSITIVE_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      if (!detectedTypes.includes('SENSITIVE_KEYWORD')) {
        detectedTypes.push('SENSITIVE_KEYWORD');
      }
      maxClassification = upgradeClassification(maxClassification, 'CONFIDENTIAL');
      break;
    }
  }

  return {
    detected: detectedTypes.length > 0,
    types: detectedTypes,
    classification: maxClassification,
  };
}

export function redactSensitiveData(text: string): string {
  let redacted = text;

  redacted = redacted.replace(PATTERNS.email, '[EMAIL_REDACTED]');
  redacted = redacted.replace(PATTERNS.ssn, '[SSN_REDACTED]');
  redacted = redacted.replace(PATTERNS.creditCard, '[CARD_REDACTED]');
  redacted = redacted.replace(PATTERNS.awsKey, '[AWS_KEY_REDACTED]');
  redacted = redacted.replace(PATTERNS.privateKey, '[PRIVATE_KEY_REDACTED]');
  redacted = redacted.replace(PATTERNS.jwt, '[TOKEN_REDACTED]');
  redacted = redacted.replace(PATTERNS.phone, '[PHONE_REDACTED]');

  // Reset all lastIndex
  Object.values(PATTERNS).forEach(p => { if (p.lastIndex !== undefined) p.lastIndex = 0; });

  return redacted;
}

const CLASSIFICATION_ORDER: DataClassification[] = ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'];

function upgradeClassification(current: DataClassification, proposed: DataClassification): DataClassification {
  const currentIndex = CLASSIFICATION_ORDER.indexOf(current);
  const proposedIndex = CLASSIFICATION_ORDER.indexOf(proposed);
  return proposedIndex > currentIndex ? proposed : current;
}

// ── KIMBWETA BITES — Validators ────────────────────────────────

const Validators = {
  phone(v)  { return /^\+[1-9]\d{6,14}$/.test((v||'').trim()); },
  email(v)  { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v||'').trim()); },
  name(v)   { return (v||'').trim().length >= 2; },
  otp(v)    { return /^\d{6}$/.test((v||'').trim()); },
  required(v){ return (v||'').trim().length > 0; },

  /** Return first error or null */
  registerForm({ name, phone, email, campusId }) {
    if (!this.name(name))    return 'Enter your full name (at least 2 characters)';
    if (!this.phone(phone))  return 'Enter a valid phone number (e.g. +255712345678)';
    if (!this.email(email))  return 'Enter a valid email address';
    if (!campusId)           return 'Please select your campus';
    return null;
  },
};

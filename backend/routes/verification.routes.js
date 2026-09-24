import express from 'express';
import { createHash, randomBytes, randomInt, scryptSync, timingSafeEqual } from 'node:crypto';

const router = express.Router();

const requests = [
  {
    id: 'vr1',
    fullName: 'Savitri Reddy',
    role: 'farmer',
    mobile: '9876543210',
    email: 'savitri@example.com',
    state: 'Telangana',
    district: 'Warangal',
    status: 'UNDER REVIEW',
    score: 62,
    flags: ['Farmer document review required'],
    submittedAt: '2026-09-24',
    mobileVerified: true,
    emailVerified: true,
    documentChecks: { governmentId: 'submitted', roleProof: 'pending', face: 'not-submitted' },
  },
];
const sessions = new Map();
const adminKey = process.env.ADMIN_API_KEY;

const requireAdmin = (req, res, next) => {
  if (!adminKey || req.headers['x-admin-key'] !== adminKey) return res.status(401).json({ success: false, message: 'Authorized admin credentials are required.' });
  next();
};

const hash = (value) => createHash('sha256').update(String(value).trim().toLowerCase()).digest('hex');
const passwordHash = (password, salt) => scryptSync(String(password), salt, 64).toString('hex');
const maskEmail = (email) => email ? email.replace(/^(.{2}).*(@.*)$/, '$1***$2') : 'Not provided';
const maskMobile = (mobile) => `******${String(mobile).slice(-4)}`;

const publicRequest = (request) => ({
  id: request.id,
  fullName: request.fullName,
  role: request.role,
  mobile: maskMobile(request.mobile),
  email: maskEmail(request.email),
  state: request.state,
  district: request.district,
  status: request.status,
  score: request.score,
  flags: request.flags,
  submittedAt: request.submittedAt,
  mobileVerified: request.mobileVerified,
  emailVerified: request.emailVerified,
  documentChecks: request.documentChecks,
  history: request.history || [],
});

router.post('/register', (req, res) => {
  const { fullName, mobile, email, address, state, district, role, governmentId, profilePhotoName, roleDocumentName, businessName, businessIdName } = req.body;
  if (!fullName || !mobile || !address || !state || !district || !role || !governmentId) {
    return res.status(400).json({ success: false, message: 'Complete all identity and location fields before submitting.' });
  }
  if (!['farmer', 'buyer'].includes(role)) return res.status(400).json({ success: false, message: 'Choose Farmer or Buyer.' });
  if (requests.some((item) => item.mobileHash === hash(mobile) || (email && item.emailHash === hash(email)))) {
    return res.status(409).json({ success: false, message: 'A verification request already exists for this mobile or email.' });
  }
  if (role === 'farmer' && !roleDocumentName) return res.status(400).json({ success: false, message: 'Farmer land or agriculture proof is required.' });
  if (role === 'buyer' && (!businessName || !businessIdName)) return res.status(400).json({ success: false, message: 'Buyer business and valid ID details are required.' });

  if (String(req.body.password || '').length < 8) return res.status(400).json({ success: false, message: 'Password must contain at least 8 characters.' });
  const passwordSalt = randomBytes(16).toString('hex');
  const mobileOtp = String(randomInt(100000, 1000000));
  const emailOtp = email ? String(randomInt(100000, 1000000)) : null;
  const suspiciousFlags = [];
  if (!/^\+?[0-9]{10,13}$/.test(String(mobile).replace(/\s/g, ''))) suspiciousFlags.push('Phone format needs review');
  if (/^(test|admin|user)@/i.test(email)) suspiciousFlags.push('Email pattern needs review');
  const request = {
    id: `vr${Date.now()}`,
    fullName,
    mobile,
    email,
    address,
    state,
    district,
    role,
    businessName: businessName || '',
    governmentIdLast4: String(governmentId).slice(-4),
    governmentIdHash: hash(governmentId),
    mobileHash: hash(mobile),
    emailHash: email ? hash(email) : null,
    passwordSalt,
    passwordHash: passwordHash(req.body.password, passwordSalt),
    profilePhotoName: profilePhotoName || '',
    roleDocumentName: roleDocumentName || businessIdName || '',
    status: suspiciousFlags.length ? 'UNDER REVIEW' : 'UNDER REVIEW',
    score: Math.max(25, 80 - suspiciousFlags.length * 15),
    flags: suspiciousFlags.length ? suspiciousFlags : ['Human/admin review required'],
    submittedAt: new Date().toISOString().split('T')[0],
    mobileVerified: false,
    emailVerified: !email,
    mobileOtp,
    emailOtp,
    documentChecks: { governmentId: 'submitted', roleProof: 'submitted', face: profilePhotoName ? 'submitted' : 'not-submitted' },
    history: [{ status: 'UNDER REVIEW', at: new Date().toISOString(), note: 'Registration submitted' }],
  };
  requests.push(request);
  res.status(201).json({ success: true, data: publicRequest(request), verificationId: request.id, demoMode: process.env.NODE_ENV !== 'production', demoOtps: process.env.NODE_ENV === 'production' ? undefined : { mobile: mobileOtp, email: emailOtp }, message: 'Verification request submitted for human review.' });
});

router.get('/', requireAdmin, (req, res) => {
  res.json({ success: true, data: requests.map(publicRequest), source: 'demo-verification-queue' });
});

router.post('/login', (req, res) => {
  const identifier = String(req.body.identifier || '').trim();
  const request = requests.find((item) => item.emailHash === hash(identifier) || item.mobileHash === hash(identifier));
  if (!request) return res.status(401).json({ success: false, message: 'Account not found. Register for verification first.' });
  const supplied = Buffer.from(passwordHash(req.body.password || '', request.passwordSalt), 'hex');
  const stored = Buffer.from(request.passwordHash, 'hex');
  if (supplied.length !== stored.length || !timingSafeEqual(supplied, stored)) return res.status(401).json({ success: false, message: 'Invalid login details.' });
  if (request.status === 'NOT VERIFIED' || request.status === 'SUSPICIOUS') return res.status(403).json({ success: false, status: request.status, message: 'Access paused. Complete human verification review.' });
  request.loginOtp = String(randomInt(100000, 1000000));
  res.json({ success: true, requiresOtp: true, verificationId: request.id, status: request.status, demoMode: process.env.NODE_ENV !== 'production', demoOtp: process.env.NODE_ENV === 'production' ? undefined : request.loginOtp, message: 'A login OTP is required for this account.' });
});

router.post('/login/:id/verify', (req, res) => {
  const request = requests.find((item) => item.id === req.params.id);
  if (!request || String(req.body.otp || '') !== request.loginOtp) return res.status(401).json({ success: false, message: 'Incorrect login OTP.' });
  const token = randomBytes(32).toString('hex');
  sessions.set(token, { id: request.id, createdAt: Date.now() });
  res.json({ success: true, token, user: { id: request.id, name: request.fullName, role: request.role, status: request.status, score: request.score }, message: 'Login verified.' });
});

router.get('/session', (req, res) => {
  const session = sessions.get(String(req.headers.authorization || '').replace(/^Bearer\s+/i, ''));
  const request = session && requests.find((item) => item.id === session.id);
  if (!request || Date.now() - session.createdAt > 1000 * 60 * 60 * 24) return res.status(401).json({ success: false, message: 'Session expired.' });
  res.json({ success: true, user: { id: request.id, name: request.fullName, role: request.role, status: request.status, score: request.score } });
});

router.post('/:id/verify/:channel', (req, res) => {
  const request = requests.find((item) => item.id === req.params.id);
  const channel = req.params.channel;
  if (!request) return res.status(404).json({ success: false, message: 'Verification request not found.' });
  if (!['mobile', 'email'].includes(channel)) return res.status(400).json({ success: false, message: 'Unsupported verification channel.' });
  if (String(req.body.otp || '') !== request[`${channel}Otp`]) return res.status(400).json({ success: false, message: `Incorrect ${channel} OTP.` });
  request[`${channel}Verified`] = true;
  if (request.mobileVerified && request.emailVerified && request.status === 'NOT VERIFIED') request.status = 'UNDER REVIEW';
  res.json({ success: true, data: publicRequest(request), message: `${channel} verified. Human/admin review is still required.` });
});

router.put('/:id/status', requireAdmin, (req, res) => {
  const request = requests.find((item) => item.id === req.params.id);
  if (!request) return res.status(404).json({ success: false, message: 'Verification request not found.' });
  if (!['VERIFIED', 'UNDER REVIEW', 'NOT VERIFIED', 'SUSPICIOUS'].includes(req.body.status)) return res.status(400).json({ success: false, message: 'Invalid verification status.' });
  request.status = req.body.status;
  request.flags = req.body.status === 'VERIFIED' ? [] : (request.flags.length ? request.flags : ['Additional human review required']);
  request.history = [...(request.history || []), { status: request.status, at: new Date().toISOString(), note: String(req.body.note || 'Admin review decision') }];
  res.json({ success: true, data: publicRequest(request), message: `Request marked ${request.status}.` });
});

export default router;

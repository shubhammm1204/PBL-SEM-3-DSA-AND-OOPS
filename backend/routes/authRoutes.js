const express = require('express');
const fs = require('fs');
const path = require('path');
const { requireUser } = require('../middleware/auth');
const router = express.Router();
const studentsFile = path.join(__dirname, '..', 'data', 'students.txt');
function readMembers() {
  if (!fs.existsSync(studentsFile)) return [];
  return fs.readFileSync(studentsFile, 'utf8').split(/\r?\n/).filter(Boolean).map(line => {
    const [collegeId, name, balance] = line.split('|');
    return { collegeId: String(collegeId || '').trim().toUpperCase(), name: String(name || '').trim(), balance: Number(balance) || 0 };
  });
}
router.get('/check-college/:collegeId', (req, res) => {
  const id = String(req.params.collegeId || '').trim().toUpperCase();
  const member = readMembers().find(m => m.collegeId === id);
  if (!member) return res.status(404).json({ error: 'College ID was not found in the canteen records. Ask the administrator to add your account.' });
  res.json({ exists: true, collegeId: member.collegeId, fullName: member.name });
});
router.get('/me', requireUser, (req, res) => res.json({
  userId: req.auth.user.id, email: req.auth.user.email,
  collegeId: req.auth.profile.college_id, fullName: req.auth.profile.full_name,
  role: req.auth.profile.role
}));
module.exports = router;

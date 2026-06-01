const bcrypt = require('bcryptjs');
const { withTransaction } = require('../db');
const User = require('../models/User');
const Organization = require('../models/Organization');

async function findUserByEmail(email) {
  return User.findByEmail(email);
}

async function createUserWithOrg(email, password, organizationName) {
  const passwordHash = await bcrypt.hash(password, 10);
  return withTransaction(async (txDb) => {
    const org = await Organization.create(organizationName);
    const user = await User.create(org.lastID, email, passwordHash);
    return {
      userId: user.lastID,
      orgId: org.lastID,
      email: email.toLowerCase(),
      organizationName: organizationName.trim(),
    };
  });
}

async function verifyCredentials(email, password) {
  const user = await User.findByEmailWithOrg(email);
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.password_hash);
  return valid ? user : null;
}

async function getUserById(userId) {
  return User.findByIdWithOrg(userId);
}

module.exports = { findUserByEmail, createUserWithOrg, verifyCredentials, getUserById };

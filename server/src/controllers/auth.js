import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { generateToken } from '../utils/auth.js';
import {
  Ok,
  Created,
  BadRequest,
  Conflict,
  Unauthorized,
  NotFound,
  InternalError
} from '../utils/ApiResponse.js';

export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .catch(() => []);
  if (existing) return Conflict('Email already registered');

  const hashed = await bcrypt.hash(password, 10).catch(() => null);
  if (!hashed) return InternalError('Failed to hash password');

  const result = await db
    .insert(users)
    .values({ name, email, password: hashed })
    .catch((err) => err);
  console.log(result);
  if (!result) return InternalError('Failed to create user');

  const userId = result[0].insertId;
  const token = generateToken({ id: userId, email, name });

  return Created(
    { token, user: { id: userId, name, email, phone: null } },
    'Signed up successfully'
  );
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .catch(() => []);
  if (!user) return Unauthorized('Invalid email or password');

  const valid = await bcrypt.compare(password, user.password).catch(() => false);
  if (!valid) return Unauthorized('Invalid email or password');

  const token = generateToken({ id: user.id, email: user.email, name: user.name });

  return Ok(
    { token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone } },
    'Logged in successfully'
  );
};

export const getMe = async (req, res) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, req.user.id))
    .catch(() => []);
  if (!user) return NotFound('User not found');

  return Ok({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone
  });
};

export const updateMe = async (req, res) => {
  const updates = {};
  if (req.body.name) updates.name = req.body.name;
  if (req.body.phone !== undefined) updates.phone = req.body.phone;

  if (Object.keys(updates).length === 0) return BadRequest('No fields to update');

  const updated = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, req.user.id))
    .catch(() => null);
  if (!updated) return InternalError('Failed to update user');

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, req.user.id))
    .catch(() => []);
  if (!user) return NotFound('User not found after update');

  return Ok(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone
    },
    'Updated successfully'
  );
};

import test from 'node:test';
import assert from 'node:assert/strict';
import { isEmailWhitelisted, assertAdminSession } from '../lib/auth-guard.ts';

test('isEmailWhitelisted: returns true for matching emails regardless of casing and spaces', () => {
  const whitelist = 'shapak@gmail.com, admin_sia@untad.ac.id , ketua_kelas@gmail.com';

  assert.strictEqual(isEmailWhitelisted('shapak@gmail.com', whitelist), true);
  assert.strictEqual(isEmailWhitelisted('SHAPAK@GMAIL.COM', whitelist), true);
  assert.strictEqual(isEmailWhitelisted('  admin_sia@untad.ac.id  ', whitelist), true);
  assert.strictEqual(isEmailWhitelisted('ketua_kelas@gmail.com', whitelist), true);
});

test('isEmailWhitelisted: returns false for non-whitelisted or invalid emails', () => {
  const whitelist = 'shapak@gmail.com, admin_sia@untad.ac.id';

  assert.strictEqual(isEmailWhitelisted('random_user@gmail.com', whitelist), false);
  assert.strictEqual(isEmailWhitelisted('', whitelist), false);
  assert.strictEqual(isEmailWhitelisted(null, whitelist), false);
  assert.strictEqual(isEmailWhitelisted(undefined, whitelist), false);
  assert.strictEqual(isEmailWhitelisted('shapak@gmail.com', ''), false);
  assert.strictEqual(isEmailWhitelisted('shapak@gmail.com', undefined), false);
});

test('assertAdminSession: returns admin profile when session email is whitelisted', () => {
  process.env.ADMIN_EMAILS = 'shapak@gmail.com, pj@untad.ac.id';

  const validSession = {
    user: {
      email: 'Shapak@Gmail.com',
      name: 'Shapak Admin',
    },
  };

  const admin = assertAdminSession(validSession);
  assert.strictEqual(admin.email, 'shapak@gmail.com');
  assert.strictEqual(admin.name, 'Shapak Admin');
});

test('assertAdminSession: throws Unauthorized error when session is null or email is not whitelisted', () => {
  process.env.ADMIN_EMAILS = 'shapak@gmail.com, pj@untad.ac.id';

  assert.throws(() => assertAdminSession(null), { message: 'Unauthorized: Session missing' });
  assert.throws(() => assertAdminSession({ user: {} }), { message: 'Unauthorized: Missing user email' });
  assert.throws(
    () =>
      assertAdminSession({
        user: { email: 'stranger@gmail.com', name: 'Stranger' },
      }),
    { message: 'Unauthorized: Email stranger@gmail.com not whitelisted' }
  );
});

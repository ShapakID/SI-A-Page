export const DEFAULT_ADMIN_EMAILS = [
  'shapakid@gmail.com',
  'shafairunizarne@gmail.com',
  'zalfafya@gmail.com',
  'awaasalwa07@gmail.com',
].join(',');

export function isEmailWhitelisted(
  email: string | null | undefined,
  whitelistCsv: string | undefined = process.env.ADMIN_EMAILS
): boolean {
  if (!email || !whitelistCsv) {
    return false;
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return false;
  }

  const allowedEmails = whitelistCsv
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return allowedEmails.includes(normalizedEmail);
}

export interface AdminUser {
  email: string;
  name: string;
}

export function assertAdminSession(session: any): AdminUser {
  if (!session || !session.user) {
    throw new Error('Unauthorized: Session missing');
  }

  const rawEmail = session.user.email;
  if (!rawEmail || typeof rawEmail !== 'string') {
    throw new Error('Unauthorized: Missing user email');
  }

  const email = rawEmail.trim().toLowerCase();
  const whitelist = process.env.ADMIN_EMAILS || DEFAULT_ADMIN_EMAILS;

  if (!isEmailWhitelisted(email, whitelist)) {
    throw new Error(`Unauthorized: Email ${email} not whitelisted`);
  }

  return {
    email,
    name: session.user.name || email,
  };
}

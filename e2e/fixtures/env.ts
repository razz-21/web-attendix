export type E2ECredentials = {
  email: string;
  password: string;
};

function getCredentials(email?: string, password?: string): E2ECredentials | null {
  if (!email || !password) {
    return null;
  }

  return { email, password };
}

export function getE2EUserCredentials(): E2ECredentials | null {
  return getCredentials(process.env.E2E_USER_EMAIL, process.env.E2E_USER_PASSWORD);
}

export function getE2EAdminCredentials(): E2ECredentials | null {
  return getCredentials(process.env.E2E_ADMIN_EMAIL, process.env.E2E_ADMIN_PASSWORD);
}
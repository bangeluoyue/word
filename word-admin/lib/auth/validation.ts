export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function validateAdminInput(input: {
  name: unknown;
  email: unknown;
  password?: unknown;
  passwordRequired?: boolean;
}) {
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const email = typeof input.email === "string" ? normalizeEmail(input.email) : "";
  const password = typeof input.password === "string" ? input.password : "";

  if (name.length < 2 || name.length > 100) return "姓名长度应为 2 到 100 个字符";
  if (email.length > 320 || !EMAIL_PATTERN.test(email)) return "请输入有效的邮箱地址";
  if ((input.passwordRequired || password) && (password.length < 8 || password.length > 128)) {
    return "密码长度应为 8 到 128 个字符";
  }
  return null;
}


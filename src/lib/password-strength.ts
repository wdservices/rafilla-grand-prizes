export function getPasswordStrength(pwd: string): 0 | 1 | 2 | 3 {
  if (!pwd || pwd.length < 6) return 0;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasDigit = /[0-9]/.test(pwd);
  const symbols = pwd.match(/[^A-Za-z0-9]/g) ?? [];
  const hasSymbol = symbols.length > 0;
  const symbolCount = symbols.length;

  if (pwd.length >= 12 && hasUpper && hasLower && hasDigit && symbolCount >= 2) return 3;
  if (pwd.length >= 10 && hasUpper && hasLower && hasDigit && hasSymbol) return 2;
  if (pwd.length >= 8 && hasUpper && hasDigit) return 1;
  if (pwd.length < 8 || (!hasUpper && !hasDigit)) return 0;
  return 0;
}

export const passwordStrengthLabels = {
  0: { label: "Weak", color: "bg-coral", dots: 1 },
  1: { label: "Medium", color: "bg-lemon", dots: 2 },
  2: { label: "Strong", color: "bg-sky", dots: 3 },
  3: { label: "Very strong", color: "bg-mint", dots: 4 },
} as const;

export const validatePassword = (password: string): string | null => {
  const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

  if (!PASSWORD_COMPLEXITY_REGEX.test(password)) {
    return "Password must be at least 8 characters long and include both letters and numbers.";
  }
  return null;
};

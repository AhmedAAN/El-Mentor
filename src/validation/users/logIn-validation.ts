export function loginValidation(email: string, password: string) {
    if (!email && !password) {
      return false;
    }
    return true;
  }
  
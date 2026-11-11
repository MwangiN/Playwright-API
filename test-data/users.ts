// Public demo credentials published on saucedemo.com's login page (not secrets).
// Overridable via env so the framework can target other environments.
const password = process.env.SAUCE_PASSWORD ?? 'secret_sauce';

export const users = {
  standard: { username: 'standard_user', password },
  lockedOut: { username: 'locked_out_user', password },
  problem: { username: 'problem_user', password },
  performanceGlitch: { username: 'performance_glitch_user', password },
  error: { username: 'error_user', password },
  visual: { username: 'visual_user', password },
};

export const errorMessages = {
  usernameRequired: 'Epic sadface: Username is required',
  passwordRequired: 'Epic sadface: Password is required',
  invalidCredentials: 'Epic sadface: Username and password do not match any user in this service',
  lockedOut: 'Epic sadface: Sorry, this user has been locked out.',
  notLoggedIn: (page: string) =>
    `Epic sadface: You can only access '/${page}' when you are logged in.`,
};

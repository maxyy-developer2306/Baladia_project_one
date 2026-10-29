// Simple auth store using React context pattern via plain JS.
// Holds the logged-in admin user and login/logout helpers.
let user = null;
let listeners = [];

export const authStore = {
  getUser() {
    return user;
  },
  setUser(u) {
    user = u;
    listeners.forEach((fn) => fn(user));
  },
  clearUser() {
    user = null;
    listeners.forEach((fn) => null);
  },
  subscribe(fn) {
    listeners.push(fn);
    return () => {
      listeners = listeners.filter((f) => f !== fn);
    };
  },
  isAuthenticated() {
    return !!user;
  },
};
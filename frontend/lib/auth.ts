export const auth = {
  saveToken(token: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
  },

  getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  },

  removeToken() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
  },

  isLoggedIn(): boolean {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token") !== null;
    }
    return false;
  }
};

export default auth;

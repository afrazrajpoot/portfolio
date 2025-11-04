import { account, ID } from "@/lib/appwrite";

export const authService = {
  // Create new user account
  async signUp(email, password, name = "") {
    try {
      const user = await account.create(ID.unique(), email, password, name);

      // Automatically log in the user after sign up
      await this.signIn(email, password);

      return user;
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    }
  },

  // Sign in user
  async signIn(email, password) {
    try {
      const session = await account.createEmailPasswordSession(email, password);
      return session;
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  },

  // Sign out user
  async signOut() {
    try {
      await account.deleteSession("current");
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      return await account.get();
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  },

  // Check if user is logged in
  async isLoggedIn() {
    try {
      const user = await this.getCurrentUser();
      return !!user;
    } catch (error) {
      return false;
    }
  },
};

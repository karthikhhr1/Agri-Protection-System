import type { Express } from "express";
import { authStorage } from "./storage";
import { isAuthenticated } from "./replitAuth";

// Register auth-specific routes
export function registerAuthRoutes(app: Express): void {
  // Get current authenticated user
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const devAuthBypass =
        process.env.NODE_ENV !== "production" && process.env.DEV_DISABLE_AUTH === "1";
      if (devAuthBypass) {
        return res.json({
          id: "dev",
          email: "dev@local",
          firstName: "Dev",
          lastName: "User",
          profileImageUrl: null,
        });
      }

      const userId = req.user.claims.sub;
      const user = await authStorage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}

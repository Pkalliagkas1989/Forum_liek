import { AuthGuard } from "./user-auth-guard.js";
import { ConfigManager } from "./user-config-manager.js";
import { DataManager } from "./user-data-manager.js";
import { ReactionHandler } from "./user-reaction-handler.js";
import { CommentHandler } from "./user-comment-handler.js";
import { PostRenderer } from "./user-post-renderer.js";
import { ForumRenderer } from "./user-forum-renderer.js";
import { NavigationHandler } from "./user-navigation-handler.js";
import { setupCreatedPostsHandler } from "./user-created-posts.js";
import { initModal } from "./modal.js";

(async () => {
  const authGuard = new AuthGuard();
  const configManager = new ConfigManager();

  history.replaceState(null, "", location.href);
  history.pushState(null, "", location.href);

  window.addEventListener("popstate", () => {
    history.pushState(null, "/user", location.href);
  });

  try {
    // Load configuration and check authentication
    await configManager.loadConfig();
    const isAuthenticated = await authGuard.checkAuthentication(
      configManager.getConfig()
    );

    if (!isAuthenticated) {
      window.location.href = "/login.html";
      return; // Stop further execution if not authenticated
    }

    // Initialize all components
    const dataManager = new DataManager();
    const reactionHandler = new ReactionHandler(configManager, dataManager);
    const commentHandler = new CommentHandler(configManager, dataManager);
    const postRenderer = new PostRenderer(reactionHandler, commentHandler);
    const forumRenderer = new ForumRenderer(postRenderer, dataManager);
    const navigationHandler = new NavigationHandler(
      forumRenderer,
      configManager
    );
    setupCreatedPostsHandler(configManager, postRenderer);

    // Setup navigation
    navigationHandler.setupMyFeedLink();
    navigationHandler.setupLogoutLink();

    // Fetch data
    const API_CONFIG = configManager.getConfig();

    const [categoryRes, guestRes] = await Promise.all([
      fetch(API_CONFIG.CategoriesURI),
      fetch(API_CONFIG.DataURI),
    ]);

    if (!categoryRes.ok || !guestRes.ok) {
      throw new Error("Failed to fetch categories or guest data");
    }

    const [categories, guestData] = await Promise.all([
      categoryRes.json(),
      guestRes.json(),
    ]);

    // Use categories ONLY for tabs
    navigationHandler.setupCategoryTabs(categories);

    // Use guestData as your data source for categories + posts
    dataManager.setData(guestData);

    //  Render all posts initially
    forumRenderer.renderAllPosts();

    // Initialize Modal
    initModal(API_CONFIG);
  } catch (err) {
    console.error("Error fetching forum data:", err);
  }
})();

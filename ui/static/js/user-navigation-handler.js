// Navigation handling functionality
class NavigationHandler {
  constructor(forumRenderer, configManager) {
    this.forumRenderer = forumRenderer;
    this.configManager = configManager;
  }

  setupMyFeedLink() {
    const myFeedLink = document.getElementById("my-feed-link");
    if (myFeedLink) {
      myFeedLink.addEventListener("click", (e) => {
        e.preventDefault();
        document
          .querySelectorAll(".category-tabs a")
          .forEach((a) => a.classList.remove("active"));
        this.forumRenderer.renderAllPosts();
      });
    }
  }

  setupCategoryTabs(categories) {
    const categoryTabs = document.getElementById("category-tabs");
    categoryTabs.innerHTML = "";
    categories.forEach((category) => {
      const tabItem = document.createElement("li");
      const link = document.createElement("a");
      link.href = "#";
      link.textContent = category.name;
      link.dataset.categoryId = category.id;

      link.addEventListener("click", (e) => {
        e.preventDefault();
        document
          .querySelectorAll(".category-tabs a")
          .forEach((a) => a.classList.remove("active"));
        link.classList.add("active");

        this.forumRenderer.renderPostsForCategory(category.id);
      });

      tabItem.appendChild(link);
      categoryTabs.appendChild(tabItem);
    });
  }

  setupLogoutLink() {
    const logoutLink = document.getElementById("logout-link");
    if (logoutLink) {
      logoutLink.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
          await this.configManager.loadConfig();
          const API_CONFIG = this.configManager.getConfig();
          
          const res = await fetch(API_CONFIG.LogoutURI, {
            method: "POST",
            credentials: "include",
          });

          if (!res.ok) throw new Error("Logout failed");

          // Optionally, clear CSRF token
          sessionStorage.removeItem("csrf_token");

          // Redirect to login
          window.location.href = "/login";
        } catch (err) {
          console.error("Logout failed:", err);
          alert("Logout failed. Please try again.");
        }
      });
    }
  }
}

export { NavigationHandler };
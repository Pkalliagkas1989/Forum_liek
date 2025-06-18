function setupLikedPostsHandler(configManager, postRenderer) {
  const link = document.getElementById("liked-posts-link");
  if (!link) return;

  link.addEventListener("click", async (event) => {
    event.preventDefault();

    const API_CONFIG = configManager.getConfig();

    try {
      const response = await fetch(API_CONFIG.LikedPostsURI, {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch posts.");

      const posts = await response.json();

      const container = document.getElementById("forumContainer");
      const postTemplate = document.getElementById("post-template");

      container.innerHTML = "";

      posts.forEach((post) => {
        const categoryName = post.category_name || "General";
        postRenderer.renderPost(
          post,
          postTemplate,
          container,
          categoryName
        );
      });
    } catch (error) {
      console.error("Error loading liked posts:", error);
    }
  });
}

export { setupLikedPostsHandler };

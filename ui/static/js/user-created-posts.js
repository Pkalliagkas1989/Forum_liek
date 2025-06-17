function setupCreatedPostsHandler(configManager, postRenderer) {
  const link = document.getElementById("created-posts-link");
  if (!link) return;

  link.addEventListener("click", async (event) => {
    event.preventDefault();

    const API_CONFIG = configManager.getConfig();

    try {
      const response = await fetch(API_CONFIG.MyPostsURI, {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch posts.");

      const posts = await response.json();

      const container = document.getElementById("forumContainer");
      const postTemplate = document.getElementById("post-template");
      const commentTemplate = document.getElementById("comment-template");

      container.innerHTML = ""; // Clear previous posts

      posts.forEach((post) => {
        const categoryName = post.category_name || "General";
        postRenderer.renderPost(
          post,
          commentTemplate,
          postTemplate,
          container,
          categoryName,
          () => {} // Optional refresh callback
        );
      });
    } catch (error) {
      console.error("Error loading created posts:", error);
    }
  });
}

export { setupCreatedPostsHandler };

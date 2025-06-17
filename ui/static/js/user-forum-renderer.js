// Forum rendering functionality
class ForumRenderer {
  constructor(postRenderer, dataManager) {
    this.postRenderer = postRenderer;
    this.dataManager = dataManager;
    this.forumContainer = document.getElementById("forumContainer");
  }

  renderAllPosts() {
    this.forumContainer.innerHTML = "";
    const postTemplate = document.getElementById("post-template");
    const commentTemplate = document.getElementById("comment-template");
    const data = this.dataManager.getData();

    if (!data || !Array.isArray(data.categories)) {
      console.error("No valid categories to render");
      return;
    }

    // Deduplicate posts using a Map and gather category names
    const map = new Map();
    data.categories.forEach((category) => {
      (category.posts || []).forEach((post) => {
        if (map.has(post.id)) {
          map.get(post.id).categoryNames.push(category.name);
        } else {
          map.set(post.id, {
            ...post,
            categoryNames: [category.name],
          });
        }
      });
    });

    const allPosts = Array.from(map.values()).sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    allPosts.forEach((post) => {
      this.postRenderer.renderPost(
        post,
        commentTemplate,
        postTemplate,
        this.forumContainer,
        post.categoryNames.join(", "),
        () => this.renderAllPosts()
      );
    });
  }

  renderPostsForCategory(categoryId) {
    this.forumContainer.innerHTML = "";
    const data = this.dataManager.getData();
    if (!data || !data.categories) return;

    const category = data.categories.find((c) => c.id === +categoryId);
    if (!category) return;

    const categoryTemplate = document.getElementById("category-template");
    const postTemplate = document.getElementById("post-template");
    const commentTemplate = document.getElementById("comment-template");

    const categoryElement = categoryTemplate.content.cloneNode(true);
    categoryElement.querySelector(".category-title").textContent =
      category.name;
    const postsContainer = categoryElement.querySelector(".category-posts");

    category.posts.forEach((post) => {
      this.postRenderer.renderPost(
        post,
        commentTemplate,
        postTemplate,
        postsContainer,
        category.name,
        () => this.renderPostsForCategory(categoryId)
      );
    });

    this.forumContainer.appendChild(categoryElement);
  }
}

export { ForumRenderer };
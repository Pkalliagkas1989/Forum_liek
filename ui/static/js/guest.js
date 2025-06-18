function countReactions(reactions = []) {
  return {
    likes: reactions.filter((r) => r.reaction_type === 1).length,
    dislikes: reactions.filter((r) => r.reaction_type === 2).length,
  };
}

async function handleReaction(
  targetId,
  targetType,
  reactionType,
  likeBtn,
  dislikeBtn
) {
  try {
    const res = await fetch("/api/react", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target_id: targetId,
        target_type: targetType,
        reaction_type: reactionType,
      }),
    });

    if (!res.ok) throw new Error("Failed to react");

    const updatedReactions = await res.json();
    const { likes, dislikes } = countReactions(updatedReactions);
    likeBtn.querySelector(".like-count").textContent = likes;
    dislikeBtn.querySelector(".dislike-count").textContent = dislikes;
  } catch (err) {
    console.error("Reaction failed:", err);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const myFeedLink = document.getElementById("my-feed-link");
  const urlParams = new URLSearchParams(window.location.search);
  const isGuest = urlParams.get("guest") === "true";
  let isAuthenticated = false;
  let data;

  // Cache containers here so they're accessible throughout
  const forumContainer = document.getElementById("forumContainer");
  const categoryTabs = document.getElementById("category-tabs");

  if (!isGuest) {
    const authResponse = await fetch("/api/verify-session", {
      method: "GET",
      credentials: "include",
    });
    isAuthenticated = authResponse.ok;
  }

  // Show/hide elements based on auth
  document.querySelectorAll(".auth-only").forEach((el) => {
    el.style.display = isAuthenticated ? "list-item" : "none";
  });
  document.querySelectorAll(".guest-only").forEach((el) => {
    el.style.display = isAuthenticated ? "none" : "list-item";
  });

  function renderAllPosts() {
    forumContainer.innerHTML = "";
    const postTemplate = document.getElementById("post-template");
    const commentTemplate = document.getElementById("comment-template");

    if (!data || !data.categories) return;

    let allPosts = data.categories.flatMap((category) =>
      category.posts.map((post) => ({ ...post, categoryName: category.name }))
    );
    allPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    allPosts.forEach((post) => {
      const postElement = postTemplate.content.cloneNode(true);
      postElement.querySelector(
        ".post-header"
      ).textContent = `${post.username} posted in ${post.categoryName}`;
      postElement.querySelector(".post-title").textContent = post.title;
      postElement.querySelector(".post-content").textContent = post.content;
      postElement.querySelector(".post-time").textContent = new Date(
        post.created_at
      ).toLocaleString();

      const postContainer = postElement.querySelector(".post");
      const likeBtn = postContainer.querySelector(".like-btn");
      const dislikeBtn = postContainer.querySelector(".dislike-btn");
      const { likes, dislikes } = countReactions(post.reactions || []);

      likeBtn.querySelector(".like-count").textContent = likes;
      dislikeBtn.querySelector(".dislike-count").textContent = dislikes;
      likeBtn.disabled = dislikeBtn.disabled = !isAuthenticated;

      // Remove old event listeners by replacing nodes
      likeBtn.replaceWith(likeBtn.cloneNode(true));
      dislikeBtn.replaceWith(dislikeBtn.cloneNode(true));
      const newLikeBtn = postContainer.querySelector(".like-btn");
      const newDislikeBtn = postContainer.querySelector(".dislike-btn");

      if (isAuthenticated) {
        newLikeBtn.addEventListener("click", () =>
          handleReaction(post.id, "post", 1, newLikeBtn, newDislikeBtn)
        );
        newDislikeBtn.addEventListener("click", () =>
          handleReaction(post.id, "post", 2, newLikeBtn, newDislikeBtn)
        );
      }

      const commentsContainer = postElement.querySelector(".post-comments");
      commentsContainer.innerHTML = "";

      post.comments.forEach((comment) => {
        const commentElement = commentTemplate.content.cloneNode(true);
        const commentNode = commentElement.querySelector(".comment");

        commentNode.querySelector(".comment-user").textContent =
          comment.username;
        commentNode.querySelector(".comment-content").textContent =
          comment.content;
        commentNode.querySelector(".comment-time").textContent = new Date(
          comment.created_at
        ).toLocaleString();

        const commentLikeBtn = commentNode.querySelector(".like-btn");
        const commentDislikeBtn = commentNode.querySelector(".dislike-btn");
        const { likes, dislikes } = countReactions(comment.reactions || []);

        commentLikeBtn.querySelector(".like-count").textContent = likes;
        commentDislikeBtn.querySelector(".dislike-count").textContent =
          dislikes;
        commentLikeBtn.disabled = commentDislikeBtn.disabled = !isAuthenticated;

        commentLikeBtn.replaceWith(commentLikeBtn.cloneNode(true));
        commentDislikeBtn.replaceWith(commentDislikeBtn.cloneNode(true));
        const newCommentLikeBtn = commentNode.querySelector(".like-btn");
        const newCommentDislikeBtn = commentNode.querySelector(".dislike-btn");

        if (isAuthenticated) {
          newCommentLikeBtn.addEventListener("click", () =>
            handleReaction(
              comment.id,
              "comment",
              1,
              newCommentLikeBtn,
              newCommentDislikeBtn
            )
          );
          newCommentDislikeBtn.addEventListener("click", () =>
            handleReaction(
              comment.id,
              "comment",
              2,
              newCommentLikeBtn,
              newCommentDislikeBtn
            )
          );
        }

      commentsContainer.appendChild(commentElement);
      });

      postContainer.addEventListener("click", (e) => {
        if (e.target.closest("button")) return;
        window.location.href = `/post.html?id=${post.id}`;
      });

      forumContainer.appendChild(postElement);
    });
  }

  function renderPostsForCategory(categoryId) {
    forumContainer.innerHTML = "";
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
      const postElement = postTemplate.content.cloneNode(true);
      postElement.querySelector(
        ".post-header"
      ).textContent = `${post.username} posted in ${post.category_name}`;
      postElement.querySelector(".post-title").textContent = post.title;
      postElement.querySelector(".post-content").textContent = post.content;
      postElement.querySelector(".post-time").textContent = new Date(
        post.created_at
      ).toLocaleString();

      const postContainer = postElement.querySelector(".post");
      const likeBtn = postContainer.querySelector(".like-btn");
      const dislikeBtn = postContainer.querySelector(".dislike-btn");
      const { likes, dislikes } = countReactions(post.reactions || []);

      likeBtn.querySelector(".like-count").textContent = likes;
      dislikeBtn.querySelector(".dislike-count").textContent = dislikes;
      likeBtn.disabled = dislikeBtn.disabled = !isAuthenticated;

      likeBtn.replaceWith(likeBtn.cloneNode(true));
      dislikeBtn.replaceWith(dislikeBtn.cloneNode(true));
      const newLikeBtn = postContainer.querySelector(".like-btn");
      const newDislikeBtn = postContainer.querySelector(".dislike-btn");

      if (isAuthenticated) {
        newLikeBtn.addEventListener("click", () =>
          handleReaction(post.id, "post", 1, newLikeBtn, newDislikeBtn)
        );
        newDislikeBtn.addEventListener("click", () =>
          handleReaction(post.id, "post", 2, newLikeBtn, newDislikeBtn)
        );
      }

      const commentsContainer = postElement.querySelector(".post-comments");
      commentsContainer.innerHTML = "";

      post.comments.forEach((comment) => {
        const commentElement = commentTemplate.content.cloneNode(true);
        const commentNode = commentElement.querySelector(".comment");

        commentNode.querySelector(".comment-user").textContent =
          comment.username;
        commentNode.querySelector(".comment-content").textContent =
          comment.content;
        commentNode.querySelector(".comment-time").textContent = new Date(
          comment.created_at
        ).toLocaleString();

        const commentLikeBtn = commentNode.querySelector(".like-btn");
        const commentDislikeBtn = commentNode.querySelector(".dislike-btn");
        const { likes, dislikes } = countReactions(comment.reactions || []);

        commentLikeBtn.querySelector(".like-count").textContent = likes;
        commentDislikeBtn.querySelector(".dislike-count").textContent =
          dislikes;
        commentLikeBtn.disabled = commentDislikeBtn.disabled = !isAuthenticated;

        commentLikeBtn.replaceWith(commentLikeBtn.cloneNode(true));
        commentDislikeBtn.replaceWith(commentDislikeBtn.cloneNode(true));
        const newCommentLikeBtn = commentNode.querySelector(".like-btn");
        const newCommentDislikeBtn = commentNode.querySelector(".dislike-btn");

        if (isAuthenticated) {
          newCommentLikeBtn.addEventListener("click", () =>
            handleReaction(
              comment.id,
              "comment",
              1,
              newCommentLikeBtn,
              newCommentDislikeBtn
            )
          );
          newCommentDislikeBtn.addEventListener("click", () =>
            handleReaction(
              comment.id,
              "comment",
              2,
              newCommentLikeBtn,
              newCommentDislikeBtn
            )
          );
        }

      commentsContainer.appendChild(commentElement);
      });

      postContainer.addEventListener("click", (e) => {
        if (e.target.closest("button")) return;
        window.location.href = `/post.html?id=${post.id}`;
      });

      postsContainer.appendChild(postElement);
    });

    forumContainer.appendChild(categoryElement);
  }

  if (myFeedLink) {
    myFeedLink.addEventListener("click", (e) => {
      e.preventDefault();
      document
        .querySelectorAll(".category-tabs a")
        .forEach((a) => a.classList.remove("active"));
      renderAllPosts();
    });
  }

  try {
    const response = await fetch("http://localhost:8080/forum/api/guest");
    if (!response.ok) throw new Error("Network response was not ok");

    data = await response.json(); // Assign to outer 'data'

    categoryTabs.innerHTML = "";

    data.categories.forEach((category, index) => {
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
        renderPostsForCategory(category.id);
      });

      tabItem.appendChild(link);
      categoryTabs.appendChild(tabItem);
    });

    renderAllPosts();
  } catch (err) {
    console.error("Error fetching forum data:", err);
  }
});

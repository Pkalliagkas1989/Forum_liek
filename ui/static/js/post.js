import { ConfigManager } from "./user-config-manager.js";
import { AuthGuard } from "./user-auth-guard.js";
import { countReactions } from "./user-utils.js";

(async () => {
  const configManager = new ConfigManager();
  await configManager.loadConfig();
  const API_CONFIG = configManager.getConfig();
  const authGuard = new AuthGuard();
  const authenticated = await authGuard.checkAuthentication(API_CONFIG);
  if (!authenticated) return;

  const isAuthenticated = true;

  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get("id");
  if (!postId) {
    document.getElementById("forumContainer").textContent = "Post ID missing";
    return;
  }

  async function fetchPost() {
    const res = await fetch(`${API_CONFIG.APIBaseURL}/posts/${postId}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to load post");
    return res.json();
  }

  async function handleReaction(targetId, targetType, reactionType, likeBtn, dislikeBtn) {
    const res = await fetch(API_CONFIG.ReactionsURI, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": sessionStorage.getItem("csrf_token"),
      },
      body: JSON.stringify({
        target_id: targetId,
        target_type: targetType,
        reaction_type: reactionType,
      }),
    });
    if (!res.ok) return;
    const updated = await res.json();
    const { likes, dislikes } = countReactions(updated);
    likeBtn.querySelector(".like-count").textContent = likes;
    dislikeBtn.querySelector(".dislike-count").textContent = dislikes;
  }

  function addCommentInput(postContainer) {
    const commentBtn = postContainer.querySelector(".comment-btn");
    if (!isAuthenticated) {
      if (commentBtn) commentBtn.style.display = "none";
      return;
    }

    commentBtn.addEventListener("click", () => {
      let box = postContainer.querySelector(".comment-input");
      if (!box) {
        box = document.createElement("div");
        box.classList.add("comment-input");
        const ta = document.createElement("textarea");
        ta.placeholder = "Write your comment...";
        ta.rows = 3;
        ta.style.width = "100%";
        const sb = document.createElement("button");
        sb.textContent = "Submit Comment";
        sb.classList.add("comment-btn");
        sb.addEventListener("click", async () => {
          const content = ta.value.trim();
          if (!content) return;
          const res = await fetch(API_CONFIG.CommentsURI, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              "X-CSRF-Token": sessionStorage.getItem("csrf_token"),
            },
            body: JSON.stringify({ post_id: postId, content }),
          });
          if (!res.ok) return;
          ta.value = "";
          await render();
        });
        box.appendChild(ta);
        box.appendChild(sb);
        postContainer.appendChild(box);
      }
    });
  }

  async function render() {
    const data = await fetchPost();
    const container = document.getElementById("forumContainer");
    container.innerHTML = "";
    const postTemplate = document.getElementById("post-template");
    const commentTemplate = document.getElementById("comment-template");

    const postElement = postTemplate.content.cloneNode(true);
    postElement.querySelector(
      ".post-header"
    ).textContent = `${data.username} posted in ${data.categories.map((c) => c.name).join(", ")}`;
    postElement.querySelector(".post-title").textContent = data.title;
    postElement.querySelector(".post-content").textContent = data.content;
    postElement.querySelector(".post-time").textContent = new Date(data.created_at).toLocaleString();

    const postContainer = postElement.querySelector(".post");
    const likeBtn = postContainer.querySelector(".like-btn");
    const dislikeBtn = postContainer.querySelector(".dislike-btn");
    const { likes, dislikes } = countReactions(data.reactions || []);
    likeBtn.querySelector(".like-count").textContent = likes;
    dislikeBtn.querySelector(".dislike-count").textContent = dislikes;
    if (isAuthenticated) {
      likeBtn.addEventListener("click", () =>
        handleReaction(data.id, "post", 1, likeBtn, dislikeBtn)
      );
      dislikeBtn.addEventListener("click", () =>
        handleReaction(data.id, "post", 2, likeBtn, dislikeBtn)
      );
    } else {
      likeBtn.disabled = true;
      dislikeBtn.disabled = true;
    }

    const commentsContainer = postElement.querySelector(".post-comments");
    commentsContainer.innerHTML = "";
    (data.comments || []).forEach((comment) => {
      const commentElement = commentTemplate.content.cloneNode(true);
      const node = commentElement.querySelector(".comment");
      node.querySelector(".comment-user").textContent = comment.username;
      node.querySelector(".comment-content").textContent = comment.content;
      node.querySelector(".comment-time").textContent = new Date(comment.created_at).toLocaleString();
      const cLike = node.querySelector(".like-btn");
      const cDis = node.querySelector(".dislike-btn");
      const counts = countReactions(comment.reactions || []);
      cLike.querySelector(".like-count").textContent = counts.likes;
      cDis.querySelector(".dislike-count").textContent = counts.dislikes;
      if (isAuthenticated) {
        cLike.addEventListener("click", () =>
          handleReaction(comment.id, "comment", 1, cLike, cDis)
        );
        cDis.addEventListener("click", () =>
          handleReaction(comment.id, "comment", 2, cLike, cDis)
        );
      } else {
        cLike.disabled = true;
        cDis.disabled = true;
      }
      commentsContainer.appendChild(commentElement);
    });

    addCommentInput(postContainer);
    container.appendChild(postElement);
  }

  render();
})();

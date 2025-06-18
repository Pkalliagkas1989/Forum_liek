import { ConfigManager } from "./user-config-manager.js";
import { countReactions } from "./user-utils.js";

(async () => {
  const configManager = new ConfigManager();
  await configManager.loadConfig();
  const API_CONFIG = configManager.getConfig();

  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get("id");
  if (!postId) {
    document.getElementById("forumContainer").textContent = "Post ID missing";
    return;
  }

  async function fetchPost() {
    const res = await fetch(`${API_CONFIG.APIBaseURL}/posts/${postId}`);
    if (!res.ok) throw new Error("Failed to load post");
    return res.json();
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
    ).textContent = `${data.username} posted in ${data.categories
      .map((c) => c.name)
      .join(", ")}`;
    postElement.querySelector(".post-title").textContent = data.title;
    postElement.querySelector(".post-content").textContent = data.content;
    postElement.querySelector(".post-time").textContent = new Date(
      data.created_at
    ).toLocaleString();

    const postContainer = postElement.querySelector(".post");
    const likeBtn = postContainer.querySelector(".like-btn");
    const dislikeBtn = postContainer.querySelector(".dislike-btn");
    const commentBtn = postContainer.querySelector(".comment-btn");
    likeBtn.disabled = true;
    dislikeBtn.disabled = true;
    commentBtn.style.display = "none";
    const { likes, dislikes } = countReactions(data.reactions || []);
    likeBtn.querySelector(".like-count").textContent = likes;
    dislikeBtn.querySelector(".dislike-count").textContent = dislikes;

    const commentsContainer = postElement.querySelector(".post-comments");
    commentsContainer.innerHTML = "";
    (data.comments || []).forEach((comment) => {
      const commentElement = commentTemplate.content.cloneNode(true);
      const node = commentElement.querySelector(".comment");
      node.querySelector(".comment-user").textContent = comment.username;
      node.querySelector(".comment-content").textContent = comment.content;
      node.querySelector(".comment-time").textContent = new Date(
        comment.created_at
      ).toLocaleString();
      const cLike = node.querySelector(".like-btn");
      const cDis = node.querySelector(".dislike-btn");
      const counts = countReactions(comment.reactions || []);
      cLike.querySelector(".like-count").textContent = counts.likes;
      cDis.querySelector(".dislike-count").textContent = counts.dislikes;
      cLike.disabled = true;
      cDis.disabled = true;
      commentsContainer.appendChild(commentElement);
    });

    container.appendChild(postElement);
  }

  render();
})();

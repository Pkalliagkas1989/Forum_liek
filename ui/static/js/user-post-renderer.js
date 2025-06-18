import { countReactions } from './user-utils.js';

// Post rendering functionality
class PostRenderer {
  constructor(reactionHandler) {
    this.reactionHandler = reactionHandler;
  }

  renderPost(post, postTemplate, container, categoryName) {
    const postElement = postTemplate.content.cloneNode(true);
    postElement.querySelector(
      ".post-header"
    ).textContent = `${post.username} posted in ${categoryName}`;
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
    likeBtn.replaceWith(likeBtn.cloneNode(true));
    dislikeBtn.replaceWith(dislikeBtn.cloneNode(true));
    const newLikeBtn = postContainer.querySelector(".like-btn");
    const newDislikeBtn = postContainer.querySelector(".dislike-btn");
    newLikeBtn.addEventListener("click", () =>
      this.reactionHandler.handleReaction(post.id, "post", 1, newLikeBtn, newDislikeBtn)
    );
    newDislikeBtn.addEventListener("click", () =>
      this.reactionHandler.handleReaction(post.id, "post", 2, newLikeBtn, newDislikeBtn)
    );



    postContainer.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;
      window.location.href = `/post.html?id=${post.id}`;
    });

    container.appendChild(postElement);
  }
}

export { PostRenderer };
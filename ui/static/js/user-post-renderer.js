import { countReactions } from './user-utils.js';

// Post rendering functionality
class PostRenderer {
  constructor(reactionHandler, commentHandler) {
    this.reactionHandler = reactionHandler;
    this.commentHandler = commentHandler;
  }

  renderPost(post, commentTemplate, postTemplate, container, categoryName, refreshFn) {
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

    const commentsContainer = postElement.querySelector(".post-comments");
    commentsContainer.innerHTML = "";
    (post.comments || []).forEach((comment) => {
      const commentElement = commentTemplate.content.cloneNode(true);
      const commentNode = commentElement.querySelector(".comment");
      commentNode.querySelector(".comment-user").textContent = comment.username;
      commentNode.querySelector(".comment-content").textContent =
        comment.content;
      commentNode.querySelector(".comment-time").textContent = new Date(
        comment.created_at
      ).toLocaleString();
      const commentLikeBtn = commentNode.querySelector(".like-btn");
      const commentDislikeBtn = commentNode.querySelector(".dislike-btn");
      const { likes, dislikes } = countReactions(comment.reactions || []);
      commentLikeBtn.querySelector(".like-count").textContent = likes;
      commentDislikeBtn.querySelector(".dislike-count").textContent = dislikes;
      commentLikeBtn.replaceWith(commentLikeBtn.cloneNode(true));
      commentDislikeBtn.replaceWith(commentDislikeBtn.cloneNode(true));
      const newCommentLikeBtn = commentNode.querySelector(".like-btn");
      const newCommentDislikeBtn = commentNode.querySelector(".dislike-btn");
      newCommentLikeBtn.addEventListener("click", () =>
        this.reactionHandler.handleReaction(
          comment.id,
          "comment",
          1,
          newCommentLikeBtn,
          newCommentDislikeBtn
        )
      );
      newCommentDislikeBtn.addEventListener("click", () =>
        this.reactionHandler.handleReaction(
          comment.id,
          "comment",
          2,
          newCommentLikeBtn,
          newCommentDislikeBtn
        )
      );
      commentsContainer.appendChild(commentElement);
    });

    this.commentHandler.addCommentInput(postContainer, post, refreshFn);

    postContainer.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;
      window.location.href = `/post.html?id=${post.id}`;
    });

    container.appendChild(postElement);
  }
}

export { PostRenderer };
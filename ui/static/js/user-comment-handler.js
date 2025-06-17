// Comment handling functionality
class CommentHandler {
  constructor(configManager, dataManager) {
    this.configManager = configManager;
    this.dataManager = dataManager;
  }

  addCommentInput(postContainer, post, refreshFn) {
    const commentBtn = postContainer.querySelector(".comment-btn");
    commentBtn.addEventListener("click", () => {
      let commentInput = postContainer.querySelector(".comment-input");
      if (!commentInput) {
        commentInput = document.createElement("div");
        commentInput.classList.add("comment-input");
        const textarea = document.createElement("textarea");
        textarea.placeholder = "Write your comment...";
        textarea.rows = 3;
        textarea.style.width = "100%";
        const submitBtn = document.createElement("button");
        submitBtn.textContent = "Submit Comment";
        submitBtn.classList.add("comment-btn");
        submitBtn.addEventListener("click", async () => {
          const content = textarea.value.trim();
          if (!content) return;
          try {
            await this.configManager.loadConfig();
            const API_CONFIG = this.configManager.getConfig();
            
            const res = await fetch(API_CONFIG.CommentsURI, {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": sessionStorage.getItem("csrf_token"),
              },
              body: JSON.stringify({
                post_id: post.id,
                content: content,
              }),
            });
            if (!res.ok) throw new Error("Failed to post comment");
            const newComment = await res.json();
            textarea.value = "";

            // Update the local `data` object by adding the new comment
            this.dataManager.addCommentToPost(post.id, newComment);
            refreshFn();
          } catch (err) {
            console.error("Failed to submit comment:", err);
          }
        });
        commentInput.appendChild(textarea);
        commentInput.appendChild(submitBtn);
        postContainer.appendChild(commentInput);
      }
    });
  }
}

export { CommentHandler };
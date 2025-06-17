import { countReactions } from "./user-utils.js";

// Reaction handling functionality
class ReactionHandler {
  constructor(configManager, dataManager) {
    this.configManager = configManager;
    this.dataManager = dataManager;
  }

  async handleReaction(
    targetId,
    targetType,
    reactionType,
    likeBtn,
    dislikeBtn
  ) {
    try {
      await this.configManager.loadConfig();
      const API_CONFIG = this.configManager.getConfig();

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

      if (!res.ok) throw new Error("Failed to react");

      const updatedReactions = await res.json();
      const data = this.dataManager.getData();

      // Update the reactions inside `data`
      if (targetType === "post") {
        for (const category of data.categories) {
          const post = category.posts.find((p) => p.id === targetId);
          if (post) post.reactions = updatedReactions;
        }
      } else if (targetType === "comment") {
        for (const category of data.categories) {
          for (const post of category.posts) {
            if (!Array.isArray(post.comments)) continue;
            const comment = post.comments.find((c) => c.id === targetId);
            if (comment) comment.reactions = updatedReactions;
          }
        }
      }

      // Update the counts in UI
      const { likes, dislikes } = countReactions(updatedReactions);
      likeBtn.querySelector(".like-count").textContent = likes;
      dislikeBtn.querySelector(".dislike-count").textContent = dislikes;
    } catch (err) {
      console.error("Reaction failed:", err);
    }
  }
}

export { ReactionHandler };

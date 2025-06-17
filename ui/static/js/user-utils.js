// Utility functions
function countReactions(reactions = []) {
  if (!Array.isArray(reactions)) reactions = [];
  return {
    likes: reactions.filter((r) => r.reaction_type === 1).length,
    dislikes: reactions.filter((r) => r.reaction_type === 2).length,
  };
}

export { countReactions };
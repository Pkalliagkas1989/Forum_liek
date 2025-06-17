// Data management functionality
class DataManager {
  constructor() {
    this.data = null;
  }

  setData(data) {
    this.data = data;
  }

  getData() {
    return this.data;
  }

  addCommentToPost(postId, newComment) {
    if (!this.data || !this.data.categories) return;
    
    for (const category of this.data.categories) {
      const postToUpdate = category.posts.find((p) => p.id === postId);
      if (postToUpdate) {
        if (!postToUpdate.comments) postToUpdate.comments = [];
        postToUpdate.comments.push(newComment);
        break;
      }
    }
  }
}

export { DataManager };
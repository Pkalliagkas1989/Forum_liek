package handlers

import (
	"forum/repository"
	"forum/utils"
	"net/http"
	"strings"
)

type PostDetailsHandler struct {
	PostRepo     *repository.PostRepository
	CommentRepo  *repository.CommentRepository
	ReactionRepo *repository.ReactionRepository
}

func NewPostDetailsHandler(postRepo *repository.PostRepository, commentRepo *repository.CommentRepository, reactionRepo *repository.ReactionRepository) *PostDetailsHandler {
	return &PostDetailsHandler{PostRepo: postRepo, CommentRepo: commentRepo, ReactionRepo: reactionRepo}
}

func (h *PostDetailsHandler) GetPost(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.ErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	path := strings.Trim(r.URL.Path, "/")
	parts := strings.Split(path, "/")
	if len(parts) == 0 {
		utils.ErrorResponse(w, "Post ID required", http.StatusBadRequest)
		return
	}
	id := parts[len(parts)-1]
	if id == "" {
		utils.ErrorResponse(w, "Post ID required", http.StatusBadRequest)
		return
	}

	post, err := h.PostRepo.GetPostByIDWithUser(id)
	if err != nil {
		utils.ErrorResponse(w, "Failed to load post", http.StatusInternalServerError)
		return
	}

	categories, err := h.PostRepo.GetCategoriesByPostID(post.ID)
	if err != nil {
		utils.ErrorResponse(w, "Failed to load categories", http.StatusInternalServerError)
		return
	}
	var catInfo []CategoryInfo
	for _, c := range categories {
		catInfo = append(catInfo, CategoryInfo{ID: c.ID, Name: c.Name})
	}

	comments, err := h.CommentRepo.GetCommentsByPostWithUser(post.ID)
	if err != nil {
		utils.ErrorResponse(w, "Failed to load comments", http.StatusInternalServerError)
		return
	}
	var commentResp []CommentResponse
	for _, c := range comments {
		cr := CommentResponse{
			ID:        c.ID,
			UserID:    c.UserID,
			Username:  c.Username,
			Content:   c.Content,
			CreatedAt: c.CreatedAt,
			Reactions: []ReactionResponse{},
		}
		reactions, err := h.ReactionRepo.GetReactionsByCommentWithUser(c.ID)
		if err != nil {
			utils.ErrorResponse(w, "Failed to load reactions", http.StatusInternalServerError)
			return
		}
		for _, r := range reactions {
			cr.Reactions = append(cr.Reactions, ReactionResponse{
				UserID:       r.UserID,
				Username:     r.Username,
				ReactionType: r.ReactionType,
				CreatedAt:    r.CreatedAt,
			})
		}
		commentResp = append(commentResp, cr)
	}

	reactions, err := h.ReactionRepo.GetReactionsByPostWithUser(post.ID)
	if err != nil {
		utils.ErrorResponse(w, "Failed to load reactions", http.StatusInternalServerError)
		return
	}
	var reactResp []ReactionResponse
	for _, r := range reactions {
		reactResp = append(reactResp, ReactionResponse{
			UserID:       r.UserID,
			Username:     r.Username,
			ReactionType: r.ReactionType,
			CreatedAt:    r.CreatedAt,
		})
	}

	response := MyPostResponse{
		ID:         post.ID,
		UserID:     post.UserID,
		Username:   post.Username,
		Categories: catInfo,
		Title:      post.Title,
		Content:    post.Content,
		CreatedAt:  post.CreatedAt,
		Comments:   commentResp,
		Reactions:  reactResp,
	}

	utils.JSONResponse(w, response, http.StatusOK)
}

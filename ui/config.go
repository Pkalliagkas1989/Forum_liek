package main

var (
	APIBaseURL    = "http://localhost:8080/forum/api"
	AuthURI       = APIBaseURL + "/session/verify"
	DataURI       = APIBaseURL + "/guest"
	LoginURI      = APIBaseURL + "/session/login"
	LogoutURI     = APIBaseURL + "/session/logout"
	RegisterURI   = APIBaseURL + "/register"
	CategoriesURI = APIBaseURL + "/categories"
	ReactionsURI  = APIBaseURL + "/react"
	CommentsURI   = APIBaseURL + "/comments"
	CreatePostURI = APIBaseURL + "/posts/create"
	MyPostsURI    = APIBaseURL + "/user/posts"
)
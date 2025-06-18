package main

import (
	"encoding/json"
	"log"
	"net/http"
)

func main() {
	// Serve static assets (css, js, images)
	fs := http.FileServer(http.Dir("./static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	// Serve individual HTML pages
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./static/templates/index.html")
	})
	http.HandleFunc("/login", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./static/templates/login.html")
	})
	http.HandleFunc("/register", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./static/templates/register.html")
	})
	http.HandleFunc("/guest", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./static/templates/guest.html")
	})
	http.HandleFunc("/user", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./static/templates/user.html")
	})
	http.HandleFunc("/post", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./static/templates/post.html")
	})
	http.HandleFunc("/guest-post", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./static/templates/post_guest.html")
	})
	http.HandleFunc("/config", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		config := map[string]string{
			"APIBaseURL":    APIBaseURL,
			"AuthURI":       AuthURI,
			"DataURI":       DataURI,
			"LoginURI":      LoginURI,
			"LogoutURI":     LogoutURI,
			"RegisterURI":   RegisterURI,
			"CategoriesURI": CategoriesURI,
			"ReactionsURI":  ReactionsURI,
			"CommentsURI":   CommentsURI,
			"CreatePostURI": CreatePostURI,
			"MyPostsURI":    MyPostsURI,
			"LikedPostsURI": LikedPostsURI,
			"UserPostURI":   UserPostURI,
		}
		json.NewEncoder(w).Encode(config)
	})

	// Start the server
	log.Println("Serving on http://localhost:8081/")
	if err := http.ListenAndServe(":8081", nil); err != nil {
		log.Fatal(err)
	}
}

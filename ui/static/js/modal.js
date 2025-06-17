class Modal {
  constructor(API_CONFIG) {
    this.API_CONFIG = API_CONFIG;
    this.init();
  }

  async init() {
    const createBtn = document.getElementById("create-post-btn");
    const modal = document.getElementById("post-modal");
    const closeBtn = document.querySelector(".close-btn");
    const submitBtn = document.getElementById("submit-post");
    const postTitle = document.getElementById("post-title");
    const postBody = document.getElementById("post-body");

    createBtn.onclick = () => modal.classList.remove("hidden");
    closeBtn.onclick = () => modal.classList.add("hidden");
    submitBtn.onclick = () => this.handleSubmit(postTitle, postBody, modal);

    await this.populateCategories();
  }

  async populateCategories() {
    try {
      const response = await fetch(this.API_CONFIG.CategoriesURI);
      const data = await response.json();

      const container = document.getElementById("post-category");
      container.innerHTML = "";

      data.forEach((category) => {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = `cat-${category.id}`;
        checkbox.name = "categories";
        checkbox.value = category.id;

        const label = document.createElement("label");
        label.htmlFor = checkbox.id;
        label.textContent = category.name;

        const wrapper = document.createElement("div");
        wrapper.classList.add("checkbox-item");
        wrapper.appendChild(checkbox);
        wrapper.appendChild(label);

        container.appendChild(wrapper);
      });
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }

  async handleSubmit(postTitle, postBody, modal) {
    const title = postTitle.value.trim();
    const content = postBody.value.trim();
    const checkedCategories = document.querySelectorAll(
      'input[name="categories"]:checked'
    );
    const categoryContainer = document.getElementById("post-category");

    if (checkedCategories.length === 0) {
      if (!document.getElementById("category-warning")) {
        const warning = document.createElement("div");
        warning.id = "category-warning";
        warning.textContent = "Please select at least one category";
        warning.style.color = "red";
        warning.style.marginTop = "5px";
        categoryContainer.appendChild(warning);
      }
      return;
    } else {
      const warning = document.getElementById("category-warning");
      if (warning) warning.remove();
    }

    const categoryIds = Array.from(checkedCategories).map((cb) =>
      parseInt(cb.value, 10)
    );
    if (!title || !content || categoryIds.length === 0) return;

    try {
      const res = await fetch(this.API_CONFIG.AuthURI, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Not authenticated");
      await res.json();
    } catch (err) {
      window.location.href = "/login";
      return;
    }

    try {
      const response = await fetch(this.API_CONFIG.CreatePostURI, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": sessionStorage.getItem("csrf_token"),
        },
        credentials: "include",
        body: JSON.stringify({
          title,
          content,
          category_ids: categoryIds,
        }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const result = await response.json();
      console.log("Post created successfully:", result);

      postTitle.value = "";
      postBody.value = "";
      modal.classList.add("hidden");
      window.location.reload();
    } catch (error) {
      console.error("Error creating post:", error);
    }
  }
}

// ✅ Export this
export function initModal(API_CONFIG) {
  new Modal(API_CONFIG);
}

let API_CONFIG;

async function loadConfig() {
  const res = await fetch("/config");
  if (!res.ok) throw new Error("Failed to load config");
  API_CONFIG = await res.json();
}

window.addEventListener("pageshow", function (event) {
  const form = document.getElementById("loginForm");
  if (form) {
    form.reset(); // Clears all inputs
    const message = document.getElementById("message");
    if (message) {
      message.textContent = "";
    }

    // Optional: clear stored credentials
    // sessionStorage.removeItem("csrf_token");
  }
});

document
  .getElementById("loginForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const message = document.getElementById("message");

    message.textContent = "";
    message.style.color = "red";

    try {
      await loadConfig();
      const res = await fetch(API_CONFIG.LoginURI, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          //"X-CSRF-Token": sessionStorage.getItem("csrf_token"),
        },
        // 💡 Important: Include credentials to allow cookies to be set
        credentials: "include", // 💡 important: allows cookies to be set
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }

      const result = await res.json();
      message.style.color = "green";
      message.textContent = "Login successful!";
      // ✅ Store CSRF token in sessionStorage (or localStorage if session is not enough)
      sessionStorage.setItem("csrf_token", result.csrf_token);
      // Let other tabs know the session is active
      localStorage.setItem(
        "session_status",
        JSON.stringify({ status: "logged_in", timestamp: Date.now() })
      );

      window.location.replace("/user");
    } catch (err) {
      let errorMessage = "Unknown error";

      try {
        // Try to parse the message if it's JSON
        const parsed = JSON.parse(err.message);
        errorMessage = parsed.message || errorMessage;
      } catch (e) {
        // If it's not JSON, just use it as-is
        errorMessage = err.message;
      }

      message.textContent = "Error: " + errorMessage;
    }
  });

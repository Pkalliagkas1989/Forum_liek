// Authentication guard functionality
class AuthGuard {
  constructor() {
    this.hideBodyImmediately();
  }

  hideBodyImmediately() {
    // Hide body immediately to prevent flash of protected content (with unique id)
    const style = document.createElement("style");
    style.id = "auth-guard-style";
    style.innerHTML = "body { display: none !important; }";
    document.head.appendChild(style);
  }

  async checkAuthentication(API_CONFIG) {
    try {
      const res = await fetch(API_CONFIG.AuthURI, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Not authenticated");

      // Defensive JSON parse
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error("Expected JSON response");
      }
      const sessionData = await res.json();

      // Remove injected style to reveal page
      const guardStyle = document.getElementById("auth-guard-style");
      if (guardStyle) guardStyle.remove();
      document.body.style.display = "";

      return true;
    } catch (err) {
      window.location.href = "/login";
      return false;
    }
  }
}

export { AuthGuard };

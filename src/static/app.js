document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");
  const loginForm = document.getElementById("login-form");
  const adminPanel = document.getElementById("admin-panel");
  const loginToggle = document.getElementById("login-toggle");
  const adminLoginForm = document.getElementById("admin-login");
  const logoutBtn = document.getElementById("logout-btn");
  const adminGreeting = document.getElementById("admin-greeting");

  // Student elements
  const studentAuth = document.getElementById("student-auth");
  const studentLoginForm = document.getElementById("student-login-form");
  const studentRegisterForm = document.getElementById("student-register-form");
  const studentPanel = document.getElementById("student-panel");
  const studentLoginToggle = document.getElementById("student-login-toggle");
  const studentRegisterToggle = document.getElementById("student-register-toggle");
  const studentLoginFormEl = document.getElementById("student-login");
  const studentRegisterFormEl = document.getElementById("student-register");
  const studentLogoutBtn = document.getElementById("student-logout-btn");
  const studentGreeting = document.getElementById("student-greeting");

  const signupContainer = document.getElementById("signup-container");

  let currentUser = null;
  let currentRole = null;

  // Check authentication status
  async function checkAuthStatus() {
    try {
      const response = await fetch("/auth-status");
      const data = await response.json();
      currentUser = data.user;
      currentRole = data.role;
      updateAuthUI();
      fetchActivities();
    } catch (error) {
      console.error("Error checking auth status:", error);
    }
  }

  // Update UI based on auth status
  function updateAuthUI() {
    if (currentRole === "admin") {
      loginForm.classList.add("hidden");
      adminPanel.classList.remove("hidden");
      loginToggle.classList.add("hidden");
      adminGreeting.textContent = `Logged in as Admin: ${currentUser}`;
      studentAuth.classList.add("hidden");
      signupContainer.classList.add("hidden");
    } else if (currentRole === "student") {
      loginForm.classList.add("hidden");
      adminPanel.classList.add("hidden");
      loginToggle.classList.add("hidden");
      studentAuth.classList.remove("hidden");
      studentLoginForm.classList.add("hidden");
      studentRegisterForm.classList.add("hidden");
      studentPanel.classList.remove("hidden");
      studentGreeting.textContent = `Logged in as Student: ${currentUser}`;
      signupContainer.classList.remove("hidden");
    } else {
      loginForm.classList.add("hidden");
      adminPanel.classList.add("hidden");
      loginToggle.classList.remove("hidden");
      studentAuth.classList.remove("hidden");
      studentLoginForm.classList.add("hidden");
      studentRegisterForm.classList.add("hidden");
      studentPanel.classList.add("hidden");
      signupContainer.classList.add("hidden");
    }
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft =
          details.max_participants - details.participants.length;

        // Create participants HTML with delete icons only for admins
        const participantsHTML =
          details.participants.length > 0
            ? `<div class="participants-section">
              <h5>Participants:</h5>
              <ul class="participants-list">
                ${details.participants
                  .map(
                    (email) =>
                      `<li><span class="participant-email">${email}</span>${currentRole === "admin" ? `<button class="delete-btn" data-activity="${name}" data-email="${email}">❌</button>` : ''}</li>`
                  )
                  .join("")}
              </ul>
            </div>`
            : `<p><em>No participants yet</em></p>`;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-container">
            ${participantsHTML}
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });

      // Add event listeners to delete buttons if admin
      if (currentRole === "admin") {
        document.querySelectorAll(".delete-btn").forEach((button) => {
          button.addEventListener("click", handleUnregister);
        });
      }
    } catch (error) {
      activitiesList.innerHTML =
        "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle unregister functionality
  async function handleUnregister(event) {
    const button = event.target;
    const activity = button.getAttribute("data-activity");
    const email = button.getAttribute("data-email");

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(
          activity
        )}/unregister?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";

        // Refresh activities list to show updated participants
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to unregister. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error unregistering:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(
          activity
        )}/signup`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();

        // Refresh activities list to show updated participants
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Handle login toggle
  loginToggle.addEventListener("click", () => {
    loginForm.classList.toggle("hidden");
  });

  // Handle admin login
  adminLoginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username, password }),
      });
      const result = await response.json();
      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        checkAuthStatus();
        adminLoginForm.reset();
        loginForm.classList.add("hidden");
      } else {
        messageDiv.textContent = result.detail || "Login failed";
        messageDiv.className = "error";
      }
      messageDiv.classList.remove("hidden");
      setTimeout(() => messageDiv.classList.add("hidden"), 5000);
    } catch (error) {
      messageDiv.textContent = "Login failed";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Login error:", error);
    }
  });

  // Handle logout
  logoutBtn.addEventListener("click", async () => {
    try {
      const response = await fetch("/logout", { method: "POST" });
      const result = await response.json();
      messageDiv.textContent = result.message;
      messageDiv.className = "success";
      checkAuthStatus();
      messageDiv.classList.remove("hidden");
      setTimeout(() => messageDiv.classList.add("hidden"), 5000);
    } catch (error) {
      console.error("Logout error:", error);
    }
  });

  // Handle student login toggle
  studentLoginToggle.addEventListener("click", () => {
    studentLoginForm.classList.toggle("hidden");
    studentRegisterForm.classList.add("hidden");
  });

  // Handle student register toggle
  studentRegisterToggle.addEventListener("click", () => {
    studentRegisterForm.classList.toggle("hidden");
    studentLoginForm.classList.add("hidden");
  });

  // Handle student login
  studentLoginFormEl.addEventListener("submit", async (event) => {
    event.preventDefault();
    const username = document.getElementById("student-email").value;
    const password = document.getElementById("student-password").value;

    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username, password }),
      });
      const result = await response.json();
      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        checkAuthStatus();
        studentLoginFormEl.reset();
        studentLoginForm.classList.add("hidden");
      } else {
        messageDiv.textContent = result.detail || "Login failed";
        messageDiv.className = "error";
      }
      messageDiv.classList.remove("hidden");
      setTimeout(() => messageDiv.classList.add("hidden"), 5000);
    } catch (error) {
      messageDiv.textContent = "Login failed";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Login error:", error);
    }
  });

  // Handle student register
  studentRegisterFormEl.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("student-reg-email").value;
    const password = document.getElementById("student-reg-password").value;

    try {
      const response = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ email, password }),
      });
      const result = await response.json();
      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        studentRegisterFormEl.reset();
        studentRegisterForm.classList.add("hidden");
      } else {
        messageDiv.textContent = result.detail || "Registration failed";
        messageDiv.className = "error";
      }
      messageDiv.classList.remove("hidden");
      setTimeout(() => messageDiv.classList.add("hidden"), 5000);
    } catch (error) {
      messageDiv.textContent = "Registration failed";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Registration error:", error);
    }
  });

  // Handle student logout
  studentLogoutBtn.addEventListener("click", async () => {
    try {
      const response = await fetch("/logout", { method: "POST" });
      const result = await response.json();
      messageDiv.textContent = result.message;
      messageDiv.className = "success";
      checkAuthStatus();
      messageDiv.classList.remove("hidden");
      setTimeout(() => messageDiv.classList.add("hidden"), 5000);
    } catch (error) {
      console.error("Logout error:", error);
    }
  });

  // Initialize app
  checkAuthStatus();
});

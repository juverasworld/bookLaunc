let token = localStorage.getItem("token");
let quill;

// Initialize Quill editor and check page
document.addEventListener("DOMContentLoaded", () => {
  console.log("Page loaded:", window.location.pathname);
  if (window.location.pathname.includes("/post/")) {
    fetchSinglePost();
  } else if (window.location.pathname === "/login") {
    // Login page: do nothing
  } else {
    fetchPosts();
    updateUIBasedOnAuth();
    if (document.getElementById("editor")) {
      quill = new Quill("#editor", {
        theme: "snow",
        modules: {
          toolbar: [
            ["bold", "italic", "underline"],
            [{ header: [1, 2, 3, false] }],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "blockquote"],
            ["clean"],
          ],
        },
      });
    }
  }
});

// Fetch and display posts (public)
async function fetchPosts() {
  try {
    const response = await fetch("/api/posts");
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const posts = await response.json();
    const postsContainer = document.getElementById("postsContainer");
    const heroSection = document.getElementById("hero");
    const heroContent = document.getElementById("heroContent");

    postsContainer.innerHTML = "";
    if (posts.length > 0) {
      // Populate hero section with latest post
      const latestPost = posts[0];
      console.log("Latest post ID:", latestPost._id); // Debug: Log post ID
      document.getElementById("heroTitle").textContent =
        latestPost.title || "No Title";
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = latestPost.content;
      document.getElementById("heroExcerpt").textContent =
        tempDiv.textContent.substring(0, 150) + "...";
      document.getElementById("heroDate").textContent = `📅 ${new Date(
        latestPost.createdAt
      ).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })}`;
      document.getElementById("heroReadTime").textContent = `⏱️ ${Math.ceil(
        latestPost.content.length / 200
      )} min read`;
      const heroReadMore = document.getElementById("heroReadMore");
      heroReadMore.href = `/post/${latestPost._id}`; // Set href
      console.log("Hero Read More href:", heroReadMore.href); // Debug: Log href
      heroSection.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${
        latestPost.image ||
        `https://picsum.photos/seed/${latestPost._id}/1200/800`
      })`;

      // Populate blog grid with remaining posts
      posts.slice(1).forEach((post, index) => {
        const postElement = document.createElement("article");
        postElement.classList.add("blog-card");
        postElement.style.animationDelay = `${(index + 1) * 0.1}s`;
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = post.content;
        postElement.innerHTML = `
          ${
            post.image
              ? `<img src="${post.image}" alt="${post.title}" class="blog-image">`
              : ""
          }
          <div class="blog-content">
            <div class="blog-meta">
              <div class="blog-date">📅 ${new Date(
                post.createdAt
              ).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}</div>
              <div class="read-time">${Math.ceil(
                post.content.length / 200
              )} min read</div>
            </div>
            <h3 class="blog-title">${post.title}</h3>
            <p class="blog-excerpt">${tempDiv.textContent.substring(
              0,
              150
            )}...</p>
            <a href="/post/${post._id}" class="read-more">See More →</a>
          </div>
        `;
        postsContainer.appendChild(postElement);
      });
    } else {
      console.log("No posts found");
      heroSection.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(https://picsum.photos/1200/800)`;
      heroContent.innerHTML = `
        <div class="hero-badge">✨ Welcome</div>
        <h1>No Posts Yet</h1>
        <p>Check back soon for new stories!</p>
      `;
      document.getElementById("heroReadMore").href = "#";
    }
  } catch (error) {
    console.error("Error fetching posts:", error);
    const heroSection = document.getElementById("hero");
    heroSection.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(https://picsum.photos/1200/800)`;
    document.getElementById("heroContent").innerHTML = `
      <div class="hero-badge">✨ Error</div>
      <h1>Error Loading Posts</h1>
      <p>Please try again later.</p>
    `;
    document.getElementById("heroReadMore").href = "#";
  }
}

// Fetch single post for post.html
async function fetchSinglePost() {
  const postId = window.location.pathname.split("/").pop();
  console.log("Fetching post with ID:", postId);
  try {
    const response = await fetch(`/api/posts/${postId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const post = await response.json();
    console.log("Post data:", post);
    document.getElementById("postTitle").textContent = post.title || "No Title";
    document.getElementById("postContent").innerHTML =
      post.content || "<p>No content available</p>";
    document.getElementById("postDate").textContent = post.createdAt
      ? `📅 ${new Date(post.createdAt).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}`
      : "📅 Unknown Date";
    document.getElementById("postReadTime").textContent = post.content
      ? `⏱️ ${Math.ceil(post.content.length / 200)} min read`
      : "⏱️ 0 min read";
    if (post.image) {
      document.getElementById(
        "postImage"
      ).innerHTML = `<img src="${post.image}" alt="${post.title}" class="post-image">`;
    } else {
      document.getElementById("postImage").innerHTML = "";
    }
  } catch (error) {
    console.error("Error fetching post:", error);
    document.getElementById("postContent").innerHTML =
      "<p>Post not found or an error occurred. Please try again later.</p>";
    document.getElementById("postTitle").textContent = "Error";
    document.getElementById("postDate").textContent = "";
    document.getElementById("postReadTime").textContent = "";
    document.getElementById("postImage").innerHTML = "";
  }
}

// Login function
async function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    alert("Please fill in both email and password");
    return;
  }

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      token = data.token;
      localStorage.setItem("token", token);
      window.location.href = "/";
    } else {
      const error = await response.json();
      alert(`Error: ${error.error}`);
    }
  } catch (error) {
    console.error("Error logging in:", error);
    alert("Failed to login");
  }
}

// Logout function
function logout() {
  token = null;
  localStorage.removeItem("token");
  updateUIBasedOnAuth();
}

// Add post function (admin only)
async function addPost() {
  const title = document.getElementById("postTitle").value;
  const content = quill.root.innerHTML;
  const image = document.getElementById("postImage").files[0];

  if (!title || !content || content === "<p><br></p>") {
    alert("Please fill in both title and content");
    return;
  }

  const formData = new FormData();
  formData.append("title", title);
  formData.append("content", content);
  if (image) formData.append("image", image);

  try {
    const response = await fetch("/api/posts", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (response.ok) {
      document.getElementById("postTitle").value = "";
      quill.setContents([]);
      document.getElementById("postImage").value = "";
      fetchPosts();
      alert("Post published successfully!");
    } else {
      const error = await response.json();
      alert(`Error: ${error.error}`);
    }
  } catch (error) {
    console.error("Error adding post:", error);
    alert("Failed to add post");
  }
}

// Update UI based on authentication status
function updateUIBasedOnAuth() {
  const addPostSection = document.getElementById("addPostForm");
  const loginLink = document.getElementById("loginLink");
  const logoutLink = document.getElementById("logoutLink");
  const addPostLink = document.getElementById("addPostLink");

  if (token) {
    fetch("/api/posts", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.ok) {
          addPostSection.style.display = "block";
          loginLink.style.display = "none";
          logoutLink.style.display = "inline";
          addPostLink.style.display = "inline";
        } else {
          token = null;
          localStorage.removeItem("token");
          addPostSection.style.display = "none";
          loginLink.style.display = "inline";
          logoutLink.style.display = "none";
          addPostLink.style.display = "none";
        }
      })
      .catch(() => {
        token = null;
        localStorage.removeItem("token");
        addPostSection.style.display = "none";
        loginLink.style.display = "inline";
        logoutLink.style.display = "none";
        addPostLink.style.display = "none";
      });
  } else {
    addPostSection.style.display = "none";
    loginLink.style.display = "inline";
    logoutLink.style.display = "none";
    addPostLink.style.display = "none";
  }
}

// Attach logout event listener
document.getElementById("logoutLink")?.addEventListener("click", (e) => {
  e.preventDefault();
  logout();
});

// Smooth scrolling for anchor links only
// document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
//   anchor.addEventListener("click", function (e) {
//     e.preventDefault();
//     document.querySelector(this.getAttribute("href")).scrollIntoView({
//       behavior: "smooth",
//     });
//   });
// });

// Debug click on heroReadMore
document.getElementById("heroReadMore")?.addEventListener("click", (e) => {
  console.log("Hero Read More clicked, href:", e.target.href);
  if (!e.target.href || e.target.href.endsWith("#")) {
    console.warn("Invalid href for heroReadMore");
    e.preventDefault();
    alert("No post available to view.");
  }
});

// Parallax effect for floating shapes
document.addEventListener("mousemove", function (e) {
  const shapes = document.querySelectorAll(".shape");
  const mouseX = e.clientX;
  const mouseY = e.clientY;

  shapes.forEach((shape, index) => {
    const rate = (index + 1) * 0.5;
    const x = (mouseX * rate) / 100;
    const y = (mouseY * rate) / 100;
    shape.style.transform = `translate(${x}px, ${y}px)`;
  });
});

// Header background on scroll
window.addEventListener("scroll", function () {
  const header = document.querySelector(".header");
  if (window.scrollY > 100) {
    header.style.background = "rgba(255, 255, 255, 0.98)";
  } else {
    header.style.background = "rgba(255, 255, 255, 0.95)";
  }
});

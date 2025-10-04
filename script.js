// Reuse same script for both pages
const form = document.getElementById("blog-form");
const titleInput = document.getElementById("title");
const contentInput = document.getElementById("content");
const draftList = document.getElementById("draft-list");
const publishedSection = document.getElementById("published-blogs");

let blogs = JSON.parse(localStorage.getItem("blogs")) || [];
let editingIndex = null;

// 📝 Save new blog
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const blog = {
      title: titleInput.value.trim(),
      content: contentInput.value.trim(),
      date: new Date().toLocaleString(),
    };

    if (editingIndex !== null) {
      blogs[editingIndex] = blog;
      editingIndex = null;
      document.getElementById("update-btn").classList.add("hidden");
    } else {
      blogs.push(blog);
    }

    localStorage.setItem("blogs", JSON.stringify(blogs));
    form.reset();
    loadDrafts();
    alert("Blog published successfully!");
  });
}

// 🗂️ Load drafts
function loadDrafts() {
  if (!draftList) return;
  draftList.innerHTML = "";

  blogs.forEach((b, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${b.title}</strong> 
      <small>(${b.date})</small>
      <div>
        <button onclick="editBlog(${i})">✏️ Edit</button>
        <button onclick="deleteBlog(${i})">🗑️ Delete</button>
      </div>
    `;
    draftList.appendChild(li);
  });
}

// ✏️ Edit blog
function editBlog(index) {
  const b = blogs[index];
  titleInput.value = b.title;
  contentInput.value = b.content;
  editingIndex = index;
  document.getElementById("update-btn").classList.remove("hidden");
}

// 🗑️ Delete blog
function deleteBlog(index) {
  blogs.splice(index, 1);
  localStorage.setItem("blogs", JSON.stringify(blogs));
  loadDrafts();
  renderPublishedBlogs();
}

// 🌍 Display published blogs (clickable)
function renderPublishedBlogs() {
  if (!publishedSection) return;
  publishedSection.innerHTML = blogs
    .map(
      (b, i) => `
    <div class="blog-card" onclick="location.href='blog-detail.html?index=${i}'">
      <h3>${b.title}</h3>
      <p>${b.content.slice(0, 120)}...</p>
      <small>🕒 ${b.date}</small>
    </div>`
    )
    .join("");
}

renderPublishedBlogs();

// -------------------- Blog Detail Page --------------------
const blogDetailSection = document.getElementById("blog-detail");
const commentForm = document.getElementById("comment-form");
const commentList = document.getElementById("comment-list");

// Get blog index from URL query parameter
const urlParams = new URLSearchParams(window.location.search);
const blogIndex = urlParams.get("index");

if (blogDetailSection && blogIndex !== null) {
  const blog = blogs[blogIndex];
  if (!blog) {
    blogDetailSection.innerHTML = "<p>Blog not found.</p>";
  } else {
    blogDetailSection.innerHTML = `
      <h2>${blog.title}</h2>
      <p>${blog.content}</p>
      <small>🕒 ${blog.date}</small>
    `;

    // Load comments from localStorage
    let comments = JSON.parse(localStorage.getItem(`comments-${blogIndex}`)) || [];
    renderComments();

    // Post comment
    if (commentForm) {
      commentForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const commenter = document.getElementById("commenter").value.trim();
        const commentText = document.getElementById("comment-text").value.trim();

        if (!commenter || !commentText) return;

        const comment = { name: commenter, text: commentText, date: new Date().toLocaleString() };
        comments.push(comment);
        localStorage.setItem(`comments-${blogIndex}`, JSON.stringify(comments));
        commentForm.reset();
        renderComments();
      });
    }

    function renderComments() {
      commentList.innerHTML = comments
        .map(
          (c) => `<li><strong>${c.name}</strong> <small>(${c.date})</small><p>${c.text}</p></li>`
        )
        .join("");
    }
  }
}

// 🚀 Initialize drafts if on editor page
if (draftList) loadDrafts();

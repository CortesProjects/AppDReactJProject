const uploadBtn = document.getElementById("uploadBtn");
const uploadModal = document.getElementById("uploadModal");
const closeModal = document.getElementById("closeModal");
const postBtn = document.getElementById("postBtn");
const postTitle = document.getElementById("postTitle");
const postDesc = document.getElementById("postDesc");
const postPrice = document.getElementById("postPrice");
const postImages = document.getElementById("postImages");
const preview = document.getElementById("preview");
const postsDiv = document.getElementById("posts");

let posts = JSON.parse(localStorage.getItem("posts")) || [];
let selectedFiles = [];

uploadBtn.onclick = () => uploadModal.classList.remove("hidden");
closeModal.onclick = () => uploadModal.classList.add("hidden");

function renderPreview() {
  preview.innerHTML = "";
  selectedFiles.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement("img");
      img.src = e.target.result;
      img.title = "Click to remove";
      img.onclick = () => {
        selectedFiles.splice(index, 1);
        renderPreview();
      };
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
}

postImages.addEventListener("change", () => {
  const files = Array.from(postImages.files);
  selectedFiles = selectedFiles.concat(files);
  renderPreview();
  postImages.value = "";
});

postBtn.addEventListener("click", () => {
  const title = postTitle.value.trim();
  const desc = postDesc.value.trim();
  const price = postPrice.value.trim();

  if (!title || !desc || !price) {
    alert("Please fill in all fields");
    return;
  }
  if (selectedFiles.length === 0) {
    alert("Please upload at least one image");
    return;
  }

  Promise.all(
    selectedFiles.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(file);
        })
    )
  ).then((images) => {
    const newPost = { title, desc, price, images };
    posts.push(newPost);
    localStorage.setItem("posts", JSON.stringify(posts));
    renderPosts();
    uploadModal.classList.add("hidden");
    postTitle.value = "";
    postDesc.value = "";
    postPrice.value = "";
    selectedFiles = [];
    renderPreview();
  });
});

function renderPosts() {
  postsDiv.innerHTML = "";
  posts.slice(-12).forEach((post, idx) => {
    const div = document.createElement("div");
    div.className = "post";

    if (post.images.length > 0) {
      const container = document.createElement("div");
      container.className = "image-container";

      const img = document.createElement("img");
      img.src = post.images[0];
      img.dataset.index = 0;

      const leftOverlay = document.createElement("div");
      leftOverlay.className = "overlay left";
      leftOverlay.onclick = () => {
        let currentIndex = parseInt(img.dataset.index);
        currentIndex =
          (currentIndex - 1 + post.images.length) % post.images.length;
        img.dataset.index = currentIndex;
        img.src = post.images[currentIndex];
      };

      const rightOverlay = document.createElement("div");
      rightOverlay.className = "overlay right";
      rightOverlay.onclick = () => {
        let currentIndex = parseInt(img.dataset.index);
        currentIndex = (currentIndex + 1) % post.images.length;
        img.dataset.index = currentIndex;
        img.src = post.images[currentIndex];
      };

      container.appendChild(img);
      container.appendChild(leftOverlay);
      container.appendChild(rightOverlay);
      div.appendChild(container);
    }

    const title = document.createElement("h3");
    title.textContent = post.title;
    div.appendChild(title);

    const desc = document.createElement("p");
    desc.textContent = post.desc;
    div.appendChild(desc);

    const price = document.createElement("strong");
    price.textContent = "$" + post.price;
    div.appendChild(price);

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.onclick = () => {
      posts.splice(idx, 1);
      localStorage.setItem("posts", JSON.stringify(posts));
      renderPosts();
    };
    div.appendChild(delBtn);

    postsDiv.appendChild(div);
  });
}

renderPosts();

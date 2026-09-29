let container = document.querySelector(".container");
let categories = document.querySelector(".categories");

let allProducts = [];
let currentCategoryId = null;

const API_BASE = "https://restaurant.stepprojects.ge/api";

fetch(`${API_BASE}/Categories/GetAll`)
  .then((res) => res.json())
  .then((data) => {
    categories.innerHTML = `<li><button class="active" onclick="getAllProducts(this)">All</button></li>`;
    data.forEach((item) => {
      categories.innerHTML += `<li><button onclick="changeCategory(${item.id}, this)">${item.name}</button></li>`;
    });
  })
  .catch((err) => console.error("Error loading categories:", err));

function loadInitialProducts() {
  container.innerHTML = "<p style='text-align:center; width:100%;'>Loading...</p>";

  fetch(`${API_BASE}/Products/GetAll`)
    .then((res) => res.json())
    .then((data) => {
      allProducts = data || [];
      applyLocalFilters();
    })
    .catch(() => {
      allProducts = [];
      renderProductsList([]);
    });
}

loadInitialProducts();

function changeCategory(id, btnElement) {
  currentCategoryId = id;
  updateActiveCategoryBtn(btnElement);
  applyLocalFilters();
}

function getAllProducts(btnElement) {
  currentCategoryId = null;
  if (btnElement) {
    updateActiveCategoryBtn(btnElement);
  } else {
    const firstBtn = document.querySelector(".categories button");
    if (firstBtn) updateActiveCategoryBtn(firstBtn);
  }
  applyLocalFilters();
}

function updateActiveCategoryBtn(btnElement) {
  if (!btnElement) return;
  document.querySelectorAll(".categories button").forEach((btn) => btn.classList.remove("active"));
  btnElement.classList.add("active");
}

function applyFilters() {
  applyLocalFilters();
}

function applyLocalFilters() {
  const spicinessInput = document.getElementById("spicinessFilter");
  const maxSpiciness = spicinessInput ? parseInt(spicinessInput.value, 10) : 5;
  const noNuts = document.getElementById("noNutsFilter")?.checked || false;
  const vegOnly = document.getElementById("vegOnlyFilter")?.checked || false;

  let filtered = allProducts.filter((item) => {
    if (currentCategoryId !== null) {
      const itemCategoryId = item.categoryId ?? item.category?.id;
      if (itemCategoryId != currentCategoryId) return false;
    }

    let rawSpiciness = item.spiciness ?? item.spiceness ?? 0;
    let itemSpiciness = parseInt(rawSpiciness, 10);
    if (isNaN(itemSpiciness)) itemSpiciness = 0;

    if (itemSpiciness > maxSpiciness) return false;

    const hasNuts = item.nuts === true || item.nuts === "true" || item.nuts === 1;
    if (noNuts && hasNuts) return false;

    const isVeg = item.vegeterian === true || item.vegeterian === "true" || item.vegeterian === 1;
    if (vegOnly && !isVeg) return false;

    return true;
  });

  renderProductsList(filtered);
}

function clearFilters() {
  clearFiltersUI();
  applyLocalFilters();
}

function clearFiltersUI() {
  const spicinessInput = document.getElementById("spicinessFilter");
  const spicinessLabel = document.getElementById("spicinessValue");
  const noNutsInput = document.getElementById("noNutsFilter");
  const vegOnlyInput = document.getElementById("vegOnlyFilter");

  if (spicinessInput) spicinessInput.value = 5;
  if (spicinessLabel) spicinessLabel.innerText = "All";
  if (noNutsInput) noNutsInput.checked = false;
  if (vegOnlyInput) vegOnlyInput.checked = false;
}

function updateSpicinessLabel(val) {
  const label = document.getElementById("spicinessValue");
  if (label) {
    label.innerText = val == 5 ? "All" : val;
  }
}

function renderProductsList(products) {
  container.innerHTML = "";
  if (!products || products.length === 0) {
    container.innerHTML = "<p style='text-align:center; width:100%; font-size:18px;'>No products found.</p>";
    return;
  }
  products.forEach((item) => (container.innerHTML += cardCode(item)));
}

function cardCode(item) {
  let rawSpiciness = item.spiciness ?? item.spiceness ?? 0;
  let spicinessValue = parseInt(rawSpiciness, 10);
  if (isNaN(spicinessValue)) spicinessValue = 0;

  const hasNuts = item.nuts === true || item.nuts === "true" || item.nuts === 1;
  const isVeg = item.vegeterian === true || item.vegeterian === "true" || item.vegeterian === 1;

  return `
    <div class="card">
        <img src="${item.image}" alt="${item.name}">
        <h2>${item.name}</h2>
        <p class="spiciness">Spiciness: ${spicinessValue}</p>
        <div class="cardBadges">
            <label><input type="checkbox" disabled ${hasNuts ? 'checked' : ''}> Nuts</label>
            <label><input type="checkbox" disabled ${isVeg ? 'checked' : ''}> Vegetarian</label>
        </div>
        <p>Price: ${item.price} ₾</p>
        <button onclick="addToCart(${item.id}, ${item.price})">ADD TO CART</button>
    </div>`;
}

function addToCart(id, fasi) {
  fetch(`${API_BASE}/Baskets/GetAll`)
    .then((res) => res.json())
    .then((basketProducts) => {
      const existingProduct = basketProducts.find((item) => item.product.id === id);

      if (existingProduct) {
        const updatedData = {
          quantity: existingProduct.quantity + 1,
          price: fasi,
          productId: id,
        };

        fetch(`${API_BASE}/Baskets/UpdateBasket`, {
          method: "PUT",
          headers: {
            "accept": "*/*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        });
      } else {
        const payload = {
          quantity: 1,
          price: fasi,
          productId: id,
        };

        fetch(`${API_BASE}/Baskets/AddToBasket`, {
          method: "POST",
          headers: {
            "accept": "text/plain",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }
    })
    .catch((err) => console.error("Error adding to cart:", err));
}

window.addEventListener("scroll", function () {
  const nav = document.querySelector("nav");
  if (nav) {
    if (window.scrollY > 10) {
      nav.classList.add("scrolled");
    } else {
      nav.classList.remove("scrolled");
    }
  }
});
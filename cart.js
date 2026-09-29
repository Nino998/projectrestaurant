const API_BASE = "https://restaurant.stepprojects.ge/api";

async function renderCartPage() {
  const cartItemsContainer = document.getElementById("cartPageItems");
  const cartTotal = document.getElementById("cartPageTotal");

  if (!cartItemsContainer || !cartTotal) return;

  try {
    const res = await fetch(`${API_BASE}/Baskets/GetAll`);
    const basketProducts = await res.json();

  if (!basketProducts || basketProducts.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="emptyCartMsg">
          <i class="fa-solid fa-cart-flatbed"></i>
          <p>Your cart is empty</p>
          <a href="index.html" class="backBtn">Return to Menu</a>
        </div>`;
      cartTotal.innerText = "0.00";
      return;
    }

    let total = 0;
    const itemsHTML = basketProducts
      .map((item) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        return `
        <div class="cartRow">
            <img class="cartThumb" src="${item.product.image}" alt="${item.product.name}">
            
            <div class="cartDetails">
                <h4>${item.product.name}</h4>
                <p class="unitPrice">ფასი: <span>${item.price} ₾</span></p>
            </div>

            <div class="qtyBox">
                <button onclick="updateQuantity(${item.product.id}, ${item.quantity - 1}, ${item.price})">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQuantity(${item.product.id}, ${item.quantity + 1}, ${item.price})">+</button>
            </div>

            <div class="cartRowTotal">${itemTotal.toFixed(2)} ₾</div>

            <button class="deleteBtn" onclick="removeFromCart(${item.product.id})" title="წაშლა">
              <i class="fa-solid fa-trash-can"></i>
            </button>
        </div>`;
      })
      .join("");

    cartItemsContainer.innerHTML = itemsHTML;
    cartTotal.innerText = total.toFixed(2);
  } catch (error) {
    console.error("Error fetching cart:", error);
    cartItemsContainer.innerHTML =
      "<p style='text-align:center; color:red; padding:20px;'>შეცდომა კალათის ჩატვირთვისას</p>";
  }
}

async function updateQuantity(productId, newQuantity, price) {
  if (newQuantity <= 0) {
    return removeFromCart(productId);
  }

  try {
    await fetch(`${API_BASE}/Baskets/UpdateBasket`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quantity: newQuantity,
        price: price,
        productId: productId,
      }),
    });
    renderCartPage();
  } catch (error) {
    console.error("Error updating quantity:", error);
  }
}

async function removeFromCart(productId) {
  try {
    await fetch(`${API_BASE}/Baskets/DeleteProduct/${productId}`, {
      method: "DELETE",
    });
    renderCartPage();
  } catch (error) {
    console.error("Error removing item:", error);
  }
}

function checkout() {
  const total = document.getElementById("cartPageTotal").innerText;
  if (parseFloat(total) === 0) {
    alert("კალათა ცარიელია!");
    return;
  }
  alert(`გადახდა წარმატებით განხორციელდა! სულ გადახდილია: ${total} ₾`);
}

document.addEventListener("DOMContentLoaded", renderCartPage);
// ===============================
// KeyTop Fresh - Main JavaScript
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    // ===============================
    // ELEMENTS
    // ===============================

    const cartCountElement = document.getElementById("cart-count");
    const cartContainer = document.getElementById("cart-items");
    const totalItemsElement = document.getElementById("total-items");
    const totalPriceElement = document.getElementById("total-price");
    const checkoutBtn = document.querySelector(".checkout-btn");

    // ===============================
    // STORAGE
    // ===============================

    function getCart() {
        return JSON.parse(localStorage.getItem("cart")) || [];
    }

    function saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    // ===============================
    // UPDATE CART COUNTER
    // ===============================

    function updateCartCounter(animate = false) {

        if (!cartCountElement) return;

        const total = getCart().reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = total;

        if (animate) {
            cartCountElement.classList.add("cart-bounce");
            setTimeout(() => {
                cartCountElement.classList.remove("cart-bounce");
            }, 400);
        }
    }

    // ===============================
    // ADD TO CART
    // ===============================

    function addToCart(name, basePrice, addons = []) {

        let cart = getCart();

        const addonsTotal = addons.reduce((sum, addon) => sum + addon.price, 0);
        const finalPrice = basePrice + addonsTotal;

        const existingItem = cart.find(item =>
            item.name === name &&
            JSON.stringify(item.addons) === JSON.stringify(addons)
        );

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                name,
                price: finalPrice,
                quantity: 1,
                addons
            });
        }

        saveCart(cart);
        updateCartCounter(true);
        showPopup(name + " added to cart!");
    }

    // ===============================
    // BUTTON EVENTS
    // ===============================

    const addButtons = document.querySelectorAll(".add-to-cart");

    addButtons.forEach(button => {

        button.addEventListener("click", () => {

            const name = button.dataset.name;
            const price = parseFloat(button.dataset.price);

            // ICE CREAM
            if (name === "Vanilla Dream") {

                const sauce = prompt(
                    "Choose sauce:\n1 - Chocolate Sauce (+$1)\n2 - Pistachio Sauce (+$2)\n0 - No Sauce"
                );

                let addons = [];

                if (sauce === "1") {
                    addons.push({ name: "Chocolate Sauce", price: 1 });
                }

                if (sauce === "2") {
                    addons.push({ name: "Pistachio Sauce", price: 2 });
                }

                addToCart(name, price, addons);
                return;
            }

            // FRUIT SALAD
            if (name === "Tropical Mix") {

                const extra = prompt(
                    "Add extras?\n1 - Whipped Cream (+$1)\n2 - Extra Fruits (+$2)\n0 - None"
                );

                let addons = [];

                if (extra === "1") {
                    addons.push({ name: "Whipped Cream", price: 1 });
                }

                if (extra === "2") {
                    addons.push({ name: "Extra Fruits", price: 2 });
                }

                addToCart(name, price, addons);
                return;
            }

            // NORMAL PRODUCTS
            addToCart(name, price);
        });
    });

    // ===============================
    // IMAGE MAPPING
    // ===============================

    function getImageName(name) {

        const images = {
            "Orange Boost": "orange-juice.jpg",
            "Mango Delight": "mango-juice.jpg",
            "Strawberry Fresh": "Strawberry-juice.jpg",
            "Watermelon Chill": "watermelon-juice.jpg",
            "Strawberry Banana Milkshake": "milkshake-cocktail-juice.jpg",
            "Kiwi Vital Smoothie": "kiwi-juice.jpg",
            "Tropical Mix": "fruit-salad.jpg",
            "Vanilla Dream": "ice-cream.jpg"
        };

        return images[name] || "orange-juice.jpg";
    }

    // ===============================
    // LOAD CART
    // ===============================

    function loadCart() {

        if (!cartContainer) return;

        const cart = getCart();
        cartContainer.innerHTML = "";

        if (cart.length === 0) {
            cartContainer.innerHTML = "<p>Your cart is empty.</p>";
            updateSummary();
            return;
        }

        cart.forEach((item, index) => {

            const itemDiv = document.createElement("div");
            itemDiv.classList.add("cart-item");

            let addonsHTML = "";

            if (item.addons && item.addons.length > 0) {
                addonsHTML = `
                    <ul class="addon-list">
                        ${item.addons
                            .map(addon => `<li>+ ${addon.name}</li>`)
                            .join("")}
                    </ul>
                `;
            }

            itemDiv.innerHTML = `
                <div class="cart-left">
                    <img src="images/${getImageName(item.name)}" alt="${item.name}">
                </div>

                <div class="cart-right">
                    <h4>${item.name}</h4>
                    ${addonsHTML}
                    <p class="item-price">$${item.price.toFixed(2)}</p>

                    <input type="number" min="1" value="${item.quantity}" 
                        data-index="${index}" class="quantity-input">

                    <button data-index="${index}" class="remove-btn">Remove</button>
                </div>
            `;

            cartContainer.appendChild(itemDiv);
        });

        attachCartEvents();
        updateSummary();
    }

    // ===============================
    // CART EVENTS
    // ===============================

    function attachCartEvents() {

        document.querySelectorAll(".quantity-input").forEach(input => {
            input.addEventListener("change", (e) => {

                const index = e.target.dataset.index;
                let cart = getCart();

                let newQuantity = parseInt(e.target.value);
                if (newQuantity < 1) newQuantity = 1;

                cart[index].quantity = newQuantity;
                saveCart(cart);

                updateCartCounter();
                updateSummary();
            });
        });

        document.querySelectorAll(".remove-btn").forEach(button => {
            button.addEventListener("click", (e) => {

                const index = e.target.dataset.index;
                let cart = getCart();

                cart.splice(index, 1);
                saveCart(cart);

                loadCart();
                updateCartCounter();
            });
        });
    }

    // ===============================
    // UPDATE SUMMARY
    // ===============================

    function updateSummary() {

    const cart = getCart();

    let totalItems = 0;
    let subtotal = 0;

    cart.forEach(item => {
        totalItems += item.quantity;
        subtotal += item.price * item.quantity;
    });

    const taxRate = 0.15;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    // Update items count
    if (totalItemsElement) {
        totalItemsElement.textContent = totalItems;
    }

    // Update subtotal
    const subtotalElement = document.getElementById("subtotal-amount");
    if (subtotalElement) {
        subtotalElement.textContent = subtotal.toFixed(2);
    }

    // Update tax
    const taxElement = document.getElementById("tax-amount");
    if (taxElement) {
        taxElement.textContent = tax.toFixed(2);
    }

    // Update final total
    if (totalPriceElement) {
        totalPriceElement.textContent = total.toFixed(2);
    }
}

    // ===============================
    // CHECKOUT
    // ===============================

    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", () => {

            if (getCart().length === 0) {
                showPopup("Your cart is empty.");
                return;
            }

            showPopup("Thank you for your order!");
            localStorage.removeItem("cart");

            updateCartCounter();
            loadCart();
        });
    }

    // ===============================
    // POPUP
    // ===============================

    function showPopup(message) {

        const popup = document.createElement("div");
        popup.classList.add("popup");
        popup.textContent = message;

        document.body.appendChild(popup);

        setTimeout(() => {
            popup.remove();
        }, 2000);
    }

    // ===============================
    // INIT
    // ===============================

    updateCartCounter();
    loadCart();
});


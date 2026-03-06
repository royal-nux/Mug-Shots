// Order management
let order = [];
let userRole = null;
let deliveryMethod = null;
let deliveryLocation = null;
let currentRating = 0;

// Check if first time visitor
if (!localStorage.getItem('hasVisited')) {
    document.getElementById('role-popup').style.display = 'flex';
}

function selectRole(role) {
    userRole = role;
    localStorage.setItem('userRole', role);
    localStorage.setItem('hasVisited', 'true');
    document.getElementById('role-popup').style.display = 'none';
    updateOrderDisplay();
}

function addToOrder(name, price) {
    if (!userRole) {
        document.getElementById('role-popup').style.display = 'flex';
        return;
    }
    
    const existingItem = order.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        order.push({
            name: name,
            price: price,
            quantity: 1
        });
    }
    
    updateOrderDisplay();
    document.getElementById('checkout-btn').disabled = false;
}

function updateQuantity(name, change) {
    const item = order.find(item => item.name === name);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            order = order.filter(i => i.name !== name);
        }
    }
    updateOrderDisplay();
    document.getElementById('checkout-btn').disabled = order.length === 0;
}

function removeItem(name) {
    order = order.filter(item => item.name !== name);
    updateOrderDisplay();
    document.getElementById('checkout-btn').disabled = order.length === 0;
}

function updateOrderDisplay() {
    const orderItemsDiv = document.getElementById('order-items');
    orderItemsDiv.innerHTML = '';
    
    let subtotal = 0;
    
    order.forEach(item => {
        subtotal += item.price * item.quantity;
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'order-item';
        itemDiv.innerHTML = `
            <span>${item.name}</span>
            <div class="order-item-controls">
                <button onclick="updateQuantity('${item.name}', -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQuantity('${item.name}', 1)">+</button>
                <button class="remove-btn" onclick="removeItem('${item.name}')">×</button>
            </div>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
        `;
        orderItemsDiv.appendChild(itemDiv);
    });
    
    const discount = userRole === 'student' ? subtotal * 0.05 : 0;
    const total = subtotal - discount;
    
    document.getElementById('subtotal').textContent = subtotal.toFixed(2);
    document.getElementById('discount-amount').textContent = `$${discount.toFixed(2)}`;
    document.getElementById('total').textContent = total.toFixed(2);
}

function checkout() {
    if (order.length === 0) return;
    
    // Show delivery options
    document.getElementById('delivery-popup').style.display = 'flex';
}

function selectDelivery(method) {
    deliveryMethod = method;
    document.getElementById('delivery-popup').style.display = 'none';
    
    if (method === 'collect') {
        completeOrder();
    }
}

function showDeliveryLocation() {
    document.getElementById('delivery-popup').style.display = 'none';
    document.getElementById('location-popup').style.display = 'flex';
}

function confirmDelivery() {
    const selectLocation = document.getElementById('campus-location').value;
    const otherLocation = document.getElementById('other-location').value;
    
    deliveryLocation = otherLocation || selectLocation;
    
    if (!deliveryLocation) {
        alert('Please select or enter a delivery location');
        return;
    }
    
    document.getElementById('location-popup').style.display = 'none';
    completeOrder();
}

function completeOrder() {
    // Show confirmation message
    const message = document.getElementById('confirmation-message');
    let deliveryText = '';
    
    if (deliveryMethod === 'collect') {
        deliveryText = 'Please collect your order from Mug Shots counter.';
    } else {
        deliveryText = `Your coffee will be delivered to: ${deliveryLocation}`;
    }
    
    message.innerHTML = `
        Thank you for ordering from Mug Shots!<br>
        ${deliveryText}<br>
        Total: $${document.getElementById('total').textContent}
    `;
    
    document.getElementById('confirmation-popup').style.display = 'flex';
    
    // Clear order
    order = [];
    updateOrderDisplay();
    document.getElementById('checkout-btn').disabled = true;
    
    // Reset for next order
    deliveryMethod = null;
    deliveryLocation = null;
    
    // Show rating popup after 30 seconds (simulating coffee received)
    setTimeout(() => {
        document.getElementById('rating-popup').style.display = 'flex';
    }, 30000);
}

function setRating(rating) {
    currentRating = rating;
    const stars = document.querySelectorAll('.rating-stars span');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
    document.getElementById('selected-rating').textContent = `You rated: ${rating} star${rating > 1 ? 's' : ''}`;
}

function submitRating() {
    const review = document.getElementById('review-text').value;
    
    // Save rating to localStorage (in real app, this would go to a server)
    const ratings = JSON.parse(localStorage.getItem('ratings') || '[]');
    ratings.push({
        rating: currentRating,
        review: review,
        date: new Date().toISOString(),
        role: userRole
    });
    localStorage.setItem('ratings', JSON.stringify(ratings));
    
    alert('Thank you for your rating! Your feedback helps us improve.');
    closeRatingPopup();
}

function closeRatingPopup() {
    document.getElementById('rating-popup').style.display = 'none';
    document.getElementById('review-text').value = '';
    currentRating = 0;
    document.querySelectorAll('.rating-stars span').forEach(star => {
        star.classList.remove('active');
    });
    document.getElementById('selected-rating').textContent = '';
}

function closeConfirmation() {
    document.getElementById('confirmation-popup').style.display = 'none';
}

// Close popups when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('popup')) {
        event.target.style.display = 'none';
    }
}

// Load user role from localStorage on page load
window.onload = function() {
    const savedRole = localStorage.getItem('userRole');
    if (savedRole) {
        userRole = savedRole;
    }
}

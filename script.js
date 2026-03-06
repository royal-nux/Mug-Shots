// Order management
let order = [];
let userRole = null;
let deliveryMethod = null;
let deliveryLocation = null;
let currentRating = 0;
let currentCoffeeItem = null;

// Admin credentials
const admins = [
    { username: 'admin1', password: 'MugShots2024@1' },
    { username: 'admin2', password: 'MugShots2024@2' },
    { username: 'admin3', password: 'MugShots2024@3' }
];

let currentAdmin = null;

// Check if first time visitor
window.onload = function() {
    if (!localStorage.getItem('hasVisited')) {
        document.getElementById('role-popup').style.display = 'flex';
    }
    
    const savedRole = localStorage.getItem('userRole');
    if (savedRole) {
        userRole = savedRole;
    }
};

// Category toggle
function toggleCategory(categoryId) {
    const category = document.getElementById(categoryId);
    const toggle = event.currentTarget.querySelector('.category-toggle');
    
    if (category.classList.contains('collapsed')) {
        category.classList.remove('collapsed');
        toggle.style.transform = 'rotate(0deg)';
    } else {
        category.classList.add('collapsed');
        toggle.style.transform = 'rotate(-90deg)';
    }
}

// Size popup
function showSizePopup(button) {
    if (!userRole) {
        document.getElementById('role-popup').style.display = 'flex';
        return;
    }
    
    const coffeeItem = button.closest('.coffee-item');
    const name = coffeeItem.dataset.name;
    const price = parseFloat(coffeeItem.dataset.price);
    const type = coffeeItem.dataset.type;
    
    currentCoffeeItem = { name, price, type };
    
    const popup = document.getElementById('size-popup');
    const title = document.getElementById('size-popup-title');
    const options = document.getElementById('size-options');
    
    title.textContent = `Select Size - ${name}`;
    options.innerHTML = '';
    
    if (type === 'latte') {
        options.innerHTML = `
            <button class="size-btn" onclick="addToOrder('Cafe Latte (Short)', 18.00)">Short (Small) - P 18.00</button>
            <button class="size-btn" onclick="addToOrder('Cafe Latte (Tall)', 23.00)">Tall (Large) - P 23.00</button>
        `;
    } else if (type === 'milo') {
        options.innerHTML = `
            <button class="size-btn" onclick="addToOrder('Milo (Short)', 23.00)">Short (Small) - P 23.00</button>
            <button class="size-btn" onclick="addToOrder('Milo (Tall)', 27.00)">Tall (Large) - P 27.00</button>
        `;
    } else if (type === 'milkshake') {
        options.innerHTML = `
            <button class="size-btn" onclick="addToOrder('${name}', 26.00)">Regular - P 26.00</button>
        `;
    } else {
        options.innerHTML = `
            <button class="size-btn" onclick="addToOrder('${name}', ${price})">Regular - P ${price.toFixed(2)}</button>
        `;
    }
    
    popup.style.display = 'flex';
}

function closeSizePopup() {
    document.getElementById('size-popup').style.display = 'none';
}

// Role selection
function selectRole(role) {
    userRole = role;
    localStorage.setItem('userRole', role);
    localStorage.setItem('hasVisited', 'true');
    document.getElementById('role-popup').style.display = 'none';
    updateOrderDisplay();
    alert(`Welcome ${role}!`);
}

// Add to order
function addToOrder(name, price) {
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
    
    closeSizePopup();
    updateOrderDisplay();
    document.getElementById('checkout-btn').disabled = false;
    alert(`${name} added to order!`);
}

// Update quantity
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

// Remove item
function removeItem(name) {
    order = order.filter(item => item.name !== name);
    updateOrderDisplay();
    document.getElementById('checkout-btn').disabled = order.length === 0;
}

// Update order display
function updateOrderDisplay() {
    const orderItemsDiv = document.getElementById('order-items');
    orderItemsDiv.innerHTML = '';
    
    let subtotal = 0;
    
    if (order.length === 0) {
        orderItemsDiv.innerHTML = '<p class="empty-order">Your order is empty</p>';
        document.getElementById('subtotal').textContent = '0.00';
        document.getElementById('discount-amount').textContent = '0.00';
        document.getElementById('total').textContent = '0.00';
        return;
    }
    
    order.forEach(item => {
        subtotal += item.price * item.quantity;
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'order-item';
        itemDiv.innerHTML = `
            <span>${item.name}</span>
            <div>
                <button onclick="updateQuantity('${item.name}', -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQuantity('${item.name}', 1)">+</button>
                <button onclick="removeItem('${item.name}')" style="background:#dc3545; color:white;">×</button>
            </div>
            <span>P ${(item.price * item.quantity).toFixed(2)}</span>
        `;
        orderItemsDiv.appendChild(itemDiv);
    });
    
    const discount = userRole === 'student' ? subtotal * 0.05 : 0;
    const total = subtotal - discount;
    
    document.getElementById('subtotal').textContent = subtotal.toFixed(2);
    document.getElementById('discount-amount').textContent = discount.toFixed(2);
    document.getElementById('total').textContent = total.toFixed(2);
}

// Checkout
function checkout() {
    if (order.length === 0) {
        alert('Your order is empty!');
        return;
    }
    document.getElementById('delivery-popup').style.display = 'flex';
}

// Delivery selection
function selectDelivery(method) {
    deliveryMethod = method;
    document.getElementById('delivery-popup').style.display = 'none';
    
    if (method === 'collect') {
        deliveryLocation = 'Collection';
        completeOrder();
    } else {
        document.getElementById('location-popup').style.display = 'flex';
    }
}

function showDeliveryLocation() {
    document.getElementById('delivery-popup').style.display = 'none';
    document.getElementById('location-popup').style.display = 'flex';
}

// Location functions
function updateCampusLocation() {
    const campus = document.getElementById('campus-select').value;
    
    document.getElementById('main-campus-locations').style.display = 'none';
    document.getElementById('new-campus-locations').style.display = 'none';
    document.getElementById('lab-numbers').style.display = 'none';
    document.getElementById('academic-block-select').style.display = 'none';
    document.getElementById('lecture-theatre-details').style.display = 'none';
    document.getElementById('office-details').style.display = 'none';
    document.getElementById('new-block-details').style.display = 'none';
    
    if (campus === 'main') {
        document.getElementById('main-campus-locations').style.display = 'block';
    } else if (campus === 'new') {
        document.getElementById('new-campus-locations').style.display = 'block';
    }
}

function updateMainLocationDetails() {
    const location = document.getElementById('main-location').value;
    
    document.getElementById('lab-numbers').style.display = 'none';
    document.getElementById('academic-block-select').style.display = 'none';
    document.getElementById('lecture-theatre-details').style.display = 'none';
    document.getElementById('office-details').style.display = 'none';
    
    if (location === 'labs') {
        document.getElementById('lab-numbers').style.display = 'block';
    } else if (location === 'academic-blocks') {
        document.getElementById('academic-block-select').style.display = 'block';
    } else if (location === 'lecture-theatre') {
        document.getElementById('lecture-theatre-details').style.display = 'block';
    } else if (location === 'offices') {
        document.getElementById('office-details').style.display = 'block';
    }
}

function updateNewLocationDetails() {
    const location = document.getElementById('new-location').value;
    document.getElementById('new-block-details').style.display = location === 'block-a' || location === 'block-b' ? 'block' : 'none';
}

// Confirm delivery
function confirmDelivery() {
    const campus = document.getElementById('campus-select').value;
    const mainLocation = document.getElementById('main-location').value;
    const newLocation = document.getElementById('new-location').value;
    const labNumber = document.getElementById('lab-number').value;
    const academicBlock = document.getElementById('academic-block-letter').value;
    const lectureTheatre = document.getElementById('lecture-theatre').value;
    const officeNumber = document.getElementById('office-number').value;
    const newBlockRoom = document.getElementById('new-block-room').value;
    const otherLocation = document.getElementById('other-location').value;
    
    let location = '';
    
    if (otherLocation) {
        location = otherLocation;
    } else if (campus === 'main') {
        if (mainLocation === 'reception') location = 'Main Campus - Reception';
        else if (mainLocation === 'cafeteria') location = 'Main Campus - Cafeteria';
        else if (mainLocation === 'labs' && labNumber) location = `Main Campus - Lab ${labNumber}`;
        else if (mainLocation === 'offices' && officeNumber) location = `Main Campus - Offices (${officeNumber})`;
        else if (mainLocation === 'lecture-theatre' && lectureTheatre) location = `Main Campus - ${lectureTheatre}`;
        else if (mainLocation === 'academic-blocks' && academicBlock) location = `Main Campus - Block ${academicBlock}`;
    } else if (campus === 'new') {
        if (newLocation === 'library') location = 'New Campus - Library';
        else if (newLocation === 'block-a' && newBlockRoom) location = `New Campus - Block A (Room ${newBlockRoom})`;
        else if (newLocation === 'block-b' && newBlockRoom) location = `New Campus - Block B (Room ${newBlockRoom})`;
    }
    
    if (!location) {
        alert('Please select a complete delivery location');
        return;
    }
    
    deliveryLocation = location;
    closeLocationPopup();
    completeOrder();
}

function closeLocationPopup() {
    document.getElementById('location-popup').style.display = 'none';
    
    // Reset all fields
    document.getElementById('campus-select').value = '';
    document.getElementById('main-location').value = '';
    document.getElementById('new-location').value = '';
    document.getElementById('lab-number').value = '';
    document.getElementById('academic-block-letter').value = '';
    document.getElementById('lecture-theatre').value = '';
    document.getElementById('office-number').value = '';
    document.getElementById('new-block-room').value = '';
    document.getElementById('other-location').value = '';
    
    // Hide all sections
    document.getElementById('main-campus-locations').style.display = 'none';
    document.getElementById('new-campus-locations').style.display = 'none';
    document.getElementById('lab-numbers').style.display = 'none';
    document.getElementById('academic-block-select').style.display = 'none';
    document.getElementById('lecture-theatre-details').style.display = 'none';
    document.getElementById('office-details').style.display = 'none';
    document.getElementById('new-block-details').style.display = 'none';
}

// Complete order
function completeOrder() {
    const orderData = {
        id: 'ORD' + Date.now(),
        timestamp: new Date().toISOString(),
        items: [...order],
        subtotal: parseFloat(document.getElementById('subtotal').textContent),
        discount: parseFloat(document.getElementById('discount-amount').textContent),
        total: parseFloat(document.getElementById('total').textContent),
        role: userRole,
        deliveryMethod: deliveryMethod,
        location: deliveryLocation,
        status: 'pending'
    };
    
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(orderData);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    const message = document.getElementById('confirmation-message');
    message.innerHTML = `
        <strong>Order #${orderData.id}</strong><br>
        Thank you for ordering!<br>
        ${deliveryMethod === 'collect' ? 'Please collect from counter' : 'Delivery to: ' + deliveryLocation}<br>
        <strong>Total: P ${orderData.total.toFixed(2)}</strong>
    `;
    
    if (userRole === 'student') {
        document.getElementById('student-call-section').style.display = 'block';
        document.getElementById('staff-message').style.display = 'none';
    } else {
        document.getElementById('student-call-section').style.display = 'none';
        document.getElementById('staff-message').style.display = 'block';
    }
    
    document.getElementById('confirmation-popup').style.display = 'flex';
    
    order = [];
    updateOrderDisplay();
    document.getElementById('checkout-btn').disabled = true;
    
    setTimeout(() => {
        document.getElementById('rating-popup').style.display = 'flex';
    }, 5000);
}

// Rating functions
function setRating(rating) {
    currentRating = rating;
    const stars = document.querySelectorAll('.rating-stars span');
    stars.forEach((star, index) => {
        star.style.color = index < rating ? '#ffc107' : '#ddd';
    });
    document.getElementById('selected-rating').textContent = `You rated: ${rating} star${rating > 1 ? 's' : ''}`;
}

function submitRating() {
    if (currentRating === 0) {
        alert('Please select a rating');
        return;
    }
    
    const ratings = JSON.parse(localStorage.getItem('ratings') || '[]');
    ratings.push({
        rating: currentRating,
        review: document.getElementById('review-text').value,
        date: new Date().toISOString(),
        role: userRole
    });
    localStorage.setItem('ratings', JSON.stringify(ratings));
    
    alert('Thank you for your rating!');
    closeRatingPopup();
}

function closeRatingPopup() {
    document.getElementById('rating-popup').style.display = 'none';
    document.getElementById('review-text').value = '';
    currentRating = 0;
    document.querySelectorAll('.rating-stars span').forEach(star => star.style.color = '#ddd');
    document.getElementById('selected-rating').textContent = '';
}

function closeConfirmation() {
    document.getElementById('confirmation-popup').style.display = 'none';
}

// Admin functions
function showAdminLogin() {
    document.getElementById('admin-login-popup').style.display = 'flex';
}

function closeAdminLogin() {
    document.getElementById('admin-login-popup').style.display = 'none';
    document.getElementById('admin-username').value = '';
    document.getElementById('admin-password').value = '';
}

function adminLogin() {
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    
    if (admins.some(a => a.username === username && a.password === password)) {
        currentAdmin = username;
        closeAdminLogin();
        loadAdminDashboard();
        document.getElementById('admin-dashboard').style.display = 'flex';
    } else {
        alert('Invalid credentials');
    }
}

function loadAdminDashboard() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const ratings = JSON.parse(localStorage.getItem('ratings') || '[]');
    
    // Pending orders
    const pending = orders.filter(o => o.status === 'pending');
    document.getElementById('pending-orders-list').innerHTML = pending.length ? 
        pending.map(o => `<div class="admin-list-item">Order #${o.id} - P${o.total} <button onclick="markOrderCompleted('${o.id}')">Complete</button></div>`).join('') :
        '<p>No pending orders</p>';
    
    // Completed orders
    const completed = orders.filter(o => o.status === 'completed');
    document.getElementById('completed-orders-list').innerHTML = completed.length ?
        completed.map(o => `<div class="admin-list-item">Order #${o.id} - P${o.total}</div>`).join('') :
        '<p>No completed orders</p>';
    
    // Ratings
    document.getElementById('all-ratings-list').innerHTML = ratings.length ?
        ratings.map(r => `<div class="admin-list-item">${r.rating}/5 - ${r.review || 'No review'}</div>`).join('') :
        '<p>No ratings yet</p>';
    
    // Stats
    const avg = ratings.length ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length : 0;
    document.getElementById('avg-rating').textContent = avg.toFixed(1);
    document.getElementById('total-reviews').textContent = ratings.length;
    document.getElementById('total-orders').textContent = orders.length;
    document.getElementById('total-revenue').textContent = `P ${orders.reduce((s, o) => s + o.total, 0).toFixed(2)}`;
    document.getElementById('total-deliveries').textContent = orders.filter(o => o.deliveryMethod === 'delivery').length;
}

function markOrderCompleted(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = orders.find(o => o.id === orderId);
    if (order) order.status = 'completed';
    localStorage.setItem('orders', JSON.stringify(orders));
    loadAdminDashboard();
}

function switchAdminTab(tabName) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`admin-${tabName}-tab`).classList.add('active');
}

function logoutAdmin() {
    currentAdmin = null;
    document.getElementById('admin-dashboard').style.display = 'none';
}

function closeAdminDashboard() {
    document.getElementById('admin-dashboard').style.display = 'none';
}

// Close popups when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('popup')) {
        event.target.style.display = 'none';
    }
};

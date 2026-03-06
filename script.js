// Order management
let order = [];
let userRole = null;
let deliveryMethod = null;
let deliveryLocation = null;
let currentRating = 0;

// Admin credentials
const admins = [
    { username: 'admin1', password: 'MugShots2024@1' },
    { username: 'admin2', password: 'MugShots2024@2' },
    { username: 'admin3', password: 'MugShots2024@3' }
];

let currentAdmin = null;

// Check if first time visitor
if (!localStorage.getItem('hasVisited')) {
    document.getElementById('role-popup').style.display = 'flex';
}

// Category toggle function
function toggleCategory(categoryId) {
    const category = document.getElementById(categoryId);
    const toggle = event.currentTarget.querySelector('.category-toggle');
    
    category.classList.toggle('collapsed');
    if (category.classList.contains('collapsed')) {
        toggle.style.transform = 'rotate(-90deg)';
    } else {
        toggle.style.transform = 'rotate(0deg)';
    }
}

// Size selection functions
function showSizeOptions(name, price, type) {
    if (!userRole) {
        document.getElementById('role-popup').style.display = 'flex';
        return;
    }
    
    const popup = document.getElementById('size-popup');
    const title = document.getElementById('size-popup-title');
    const options = document.getElementById('size-options');
    
    title.textContent = `Select Size - ${name}`;
    
    if (type === 'latte') {
        options.innerHTML = `
            <button class="size-btn" onclick="addToOrder('Cafe Latte (Short)', 18.00)">
                <span>Short (Small)</span>
                <span>P 18.00</span>
            </button>
            <button class="size-btn" onclick="addToOrder('Cafe Latte (Tall)', 23.00)">
                <span>Tall (Large)</span>
                <span>P 23.00</span>
            </button>
        `;
    } else if (type === 'milo') {
        options.innerHTML = `
            <button class="size-btn" onclick="addToOrder('Milo (Short)', 23.00)">
                <span>Short (Small)</span>
                <span>P 23.00</span>
            </button>
            <button class="size-btn" onclick="addToOrder('Milo (Tall)', 27.00)">
                <span>Tall (Large)</span>
                <span>P 27.00</span>
            </button>
        `;
    } else if (type === 'milkshake') {
        options.innerHTML = `
            <button class="size-btn" onclick="addToOrder('${name} Milkshake', 26.00)">
                <span>Regular</span>
                <span>P 26.00</span>
            </button>
        `;
    } else {
        options.innerHTML = `
            <button class="size-btn" onclick="addToOrder('${name}', ${price})">
                <span>Regular</span>
                <span>P ${price.toFixed(2)}</span>
            </button>
        `;
    }
    
    popup.style.display = 'flex';
}

function showLatteOptions() {
    showSizeOptions('Cafe Latte', 0, 'latte');
}

function showMiloOptions() {
    showSizeOptions('Milo', 0, 'milo');
}

function showMilkshakeOptions(flavor) {
    showSizeOptions(flavor, 26.00, 'milkshake');
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
}

// Add to order
function addToOrder(name, price) {
    if (!userRole) {
        document.getElementById('role-popup').style.display = 'flex';
        closeSizePopup();
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
    
    closeSizePopup();
    updateOrderDisplay();
    document.getElementById('checkout-btn').disabled = false;
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
    if (order.length === 0) return;
    document.getElementById('delivery-popup').style.display = 'flex';
}

// Delivery selection
function selectDelivery(method) {
    deliveryMethod = method;
    document.getElementById('delivery-popup').style.display = 'none';
    
    if (method === 'collect') {
        completeOrder();
    }
}

// Show delivery location
function showDeliveryLocation() {
    document.getElementById('delivery-popup').style.display = 'none';
    document.getElementById('location-popup').style.display = 'flex';
}

// Campus location functions
function updateCampusLocation() {
    const campus = document.getElementById('campus-select').value;
    
    document.getElementById('main-campus-options').style.display = 'none';
    document.getElementById('new-campus-options').style.display = 'none';
    document.getElementById('lecture-block-options').style.display = 'none';
    document.getElementById('room-number-container').style.display = 'none';
    
    if (campus === 'main') {
        document.getElementById('main-campus-options').style.display = 'block';
    } else if (campus === 'new') {
        document.getElementById('new-campus-options').style.display = 'block';
    }
}

function updateMainLocationDetails() {
    const location = document.getElementById('main-location').value;
    
    document.getElementById('lecture-block-options').style.display = 'none';
    document.getElementById('room-number-container').style.display = 'none';
    
    if (location === 'lecture-theaters') {
        document.getElementById('lecture-block-options').style.display = 'block';
    } else if (location === 'offices') {
        document.getElementById('room-number-container').style.display = 'block';
    }
}

function updateNewLocationDetails() {
    document.getElementById('room-number-container').style.display = 'block';
}

function updateBlockDetails() {
    document.getElementById('room-number-container').style.display = 'block';
}

// Confirm delivery
function confirmDelivery() {
    const campus = document.getElementById('campus-select').value;
    const mainLocation = document.getElementById('main-location').value;
    const newLocation = document.getElementById('new-location').value;
    const lectureBlock = document.getElementById('lecture-block').value;
    const roomNumber = document.getElementById('room-number').value;
    const otherLocation = document.getElementById('other-location').value;
    
    let location = '';
    
    if (otherLocation) {
        location = otherLocation;
    } else if (campus === 'main') {
        if (mainLocation === 'reception') location = 'Main Campus - Reception';
        else if (mainLocation === 'labs') location = 'Main Campus - Labs 1-12';
        else if (mainLocation === 'cafeteria') location = 'Main Campus - Cafeteria';
        else if (mainLocation === 'offices') {
            location = `Main Campus - Offices ${roomNumber ? '(Office ' + roomNumber + ')' : ''}`;
        } else if (mainLocation === 'lecture-theaters' && lectureBlock) {
            location = `Main Campus - Block ${lectureBlock} ${roomNumber ? '(Room ' + roomNumber + ')' : ''}`;
        }
    } else if (campus === 'new') {
        if (newLocation === 'library') location = 'New Campus - Library';
        else if (newLocation === 'block-a') {
            location = `New Campus - Block A ${roomNumber ? '(Room ' + roomNumber + ')' : ''}`;
        } else if (newLocation === 'block-b') {
            location = `New Campus - Block B ${roomNumber ? '(Room ' + roomNumber + ')' : ''}`;
        }
    }
    
    if (!location) {
        alert('Please select a delivery location');
        return;
    }
    
    deliveryLocation = location;
    closeLocationPopup();
    completeOrder();
}

function closeLocationPopup() {
    document.getElementById('location-popup').style.display = 'none';
    // Reset form
    document.getElementById('campus-select').value = '';
    document.getElementById('main-location').value = '';
    document.getElementById('new-location').value = '';
    document.getElementById('lecture-block').value = '';
    document.getElementById('room-number').value = '';
    document.getElementById('other-location').value = '';
    document.getElementById('main-campus-options').style.display = 'none';
    document.getElementById('new-campus-options').style.display = 'none';
    document.getElementById('lecture-block-options').style.display = 'none';
    document.getElementById('room-number-container').style.display = 'none';
}

// Complete order
function completeOrder() {
    const orderItems = [...order];
    const subtotal = parseFloat(document.getElementById('subtotal').textContent);
    const discount = parseFloat(document.getElementById('discount-amount').textContent);
    const total = parseFloat(document.getElementById('total').textContent);
    
    const orderData = {
        id: 'ORD' + Date.now(),
        timestamp: new Date().toISOString(),
        items: orderItems,
        subtotal: subtotal,
        discount: discount,
        total: total,
        role: userRole,
        deliveryMethod: deliveryMethod,
        location: deliveryLocation || 'collection',
        status: 'pending'
    };
    
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(orderData);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    const message = document.getElementById('confirmation-message');
    let deliveryText = '';
    
    if (deliveryMethod === 'collect') {
        deliveryText = 'Please collect your order from Mug Shots counter.';
    } else {
        deliveryText = `Your coffee will be delivered to: ${deliveryLocation}`;
    }
    
    message.innerHTML = `
        <strong>Order #${orderData.id}</strong><br>
        Thank you for ordering from Mug Shots!<br>
        ${deliveryText}<br>
        Total: P ${total.toFixed(2)}
    `;
    
    document.getElementById('confirmation-popup').style.display = 'flex';
    
    order = [];
    updateOrderDisplay();
    document.getElementById('checkout-btn').disabled = true;
    
    deliveryMethod = null;
    deliveryLocation = null;
    
    setTimeout(() => {
        document.getElementById('rating-popup').style.display = 'flex';
    }, 30000);
}

// Rating functions
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
    
    const ratings = JSON.parse(localStorage.getItem('ratings') || '[]');
    ratings.push({
        rating: currentRating,
        review: review,
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
    document.querySelectorAll('.rating-stars span').forEach(star => {
        star.classList.remove('active');
    });
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
    
    const admin = admins.find(a => a.username === username && a.password === password);
    
    if (admin) {
        currentAdmin = username;
        closeAdminLogin();
        loadAdminDashboard();
        document.getElementById('admin-dashboard').style.display = 'flex';
    } else {
        alert('Invalid admin credentials!');
    }
}

function loadAdminDashboard() {
    loadPendingOrders();
    loadCompletedOrders();
    loadAllRatings();
    updateRatingSummary();
    loadStatistics();
    loadPopularItems();
    loadLocationStats();
}

function loadPendingOrders() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const pendingOrders = orders.filter(o => o.status === 'pending');
    
    const list = document.getElementById('pending-orders-list');
    if (pendingOrders.length === 0) {
        list.innerHTML = '<p class="no-items">No pending orders</p>';
        return;
    }
    
    list.innerHTML = pendingOrders.map(order => `
        <div class="admin-list-item">
            <div class="item-info">
                <strong>Order #${order.id}</strong><br>
                <small>${new Date(order.timestamp).toLocaleString()}</small><br>
                <small>Role: ${order.role}</small><br>
                <small>Total: P ${order.total}</small>
            </div>
            <button onclick="markOrderCompleted('${order.id}')" class="status-pending">
                Mark Complete
            </button>
        </div>
    `).join('');
}

function loadCompletedOrders() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const completedOrders = orders.filter(o => o.status === 'completed');
    
    const list = document.getElementById('completed-orders-list');
    if (completedOrders.length === 0) {
        list.innerHTML = '<p class="no-items">No completed orders</p>';
        return;
    }
    
    list.innerHTML = completedOrders.map(order => `
        <div class="admin-list-item">
            <div class="item-info">
                <strong>Order #${order.id}</strong><br>
                <small>${new Date(order.timestamp).toLocaleString()}</small><br>
                <small>Role: ${order.role}</small><br>
                <small>Total: P ${order.total}</small>
            </div>
            <span class="item-status status-completed">Completed</span>
        </div>
    `).join('');
}

function markOrderCompleted(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex !== -1) {
        orders[orderIndex].status = 'completed';
        localStorage.setItem('orders', JSON.stringify(orders));
        loadAdminDashboard();
    }
}

function loadAllRatings() {
    const ratings = JSON.parse(localStorage.getItem('ratings') || '[]');
    
    const list = document.getElementById('all-ratings-list');
    if (ratings.length === 0) {
        list.innerHTML = '<p class="no-items">No ratings yet</p>';
        return;
    }
    
    list.innerHTML = ratings.map(rating => `
        <div class="admin-list-item">
            <div class="item-info">
                <strong>Rating: ${rating.rating}/5</strong><br>
                <small>${new Date(rating.date).toLocaleString()}</small><br>
                <small>Role: ${rating.role}</small><br>
                ${rating.review ? `<small>"${rating.review}"</small>` : ''}
            </div>
        </div>
    `).join('');
}

function updateRatingSummary() {
    const ratings = JSON.parse(localStorage.getItem('ratings') || '[]');
    
    if (ratings.length === 0) {
        document.getElementById('avg-rating').textContent = '0';
        document.getElementById('total-reviews').textContent = '0';
        return;
    }
    
    const avg = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    document.getElementById('avg-rating').textContent = avg.toFixed(1);
    document.getElementById('total-reviews').textContent = ratings.length;
}

function loadStatistics() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    document.getElementById('total-orders').textContent = orders.length;
    
    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total), 0);
    document.getElementById('total-revenue').textContent = `P ${totalRevenue.toFixed(2)}`;
    
    const totalDiscounts = orders.reduce((sum, o) => sum + parseFloat(o.discount), 0);
    document.getElementById('total-discounts').textContent = `P ${totalDiscounts.toFixed(2)}`;
    
    const totalDeliveries = orders.filter(o => o.deliveryMethod === 'delivery').length;
    document.getElementById('total-deliveries').textContent = totalDeliveries;
}

function loadPopularItems() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const itemCount = {};
    
    orders.forEach(order => {
        order.items.forEach(item => {
            itemCount[item.name] = (itemCount[item.name] || 0) + item.quantity;
        });
    });
    
    const sortedItems = Object.entries(itemCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    const list = document.getElementById('popular-items-list');
    if (sortedItems.length === 0) {
        list.innerHTML = '<p class="no-items">No sales data yet</p>';
        return;
    }
    
    list.innerHTML = sortedItems.map(([name, count]) => `
        <div class="admin-list-item">
            <span><strong>${name}</strong></span>
            <span class="item-status">${count} sold</span>
        </div>
    `).join('');
}

function loadLocationStats() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const locationCount = {};
    
    orders.filter(o => o.deliveryMethod === 'delivery').forEach(order => {
        locationCount[order.location] = (locationCount[order.location] || 0) + 1;
    });
    
    const list = document.getElementById('location-stats');
    if (Object.keys(locationCount).length === 0) {
        list.innerHTML = '<p class="no-items">No delivery data yet</p>';
        return;
    }
    
    list.innerHTML = Object.entries(locationCount)
        .sort((a, b) => b

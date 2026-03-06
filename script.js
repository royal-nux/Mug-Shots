// Admin credentials (3 administrators)
const admins = [
    { username: 'admin1', password: 'MugShots2024@1' },
    { username: 'admin2', password: 'MugShots2024@2' },
    { username: 'admin3', password: 'MugShots2024@3' }
];

let currentAdmin = null;

// Show admin login popup
function showAdminLogin() {
    document.getElementById('admin-login-popup').style.display = 'flex';
}

// Close admin login popup
function closeAdminLogin() {
    document.getElementById('admin-login-popup').style.display = 'none';
    document.getElementById('admin-username').value = '';
    document.getElementById('admin-password').value = '';
}

// Admin login function
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

// Load admin dashboard data
function loadAdminDashboard() {
    // Load orders
    loadPendingOrders();
    loadCompletedOrders();
    
    // Load ratings
    loadAllRatings();
    updateRatingSummary();
    
    // Load statistics
    loadStatistics();
    loadPopularItems();
    loadLocationStats();
}

// Load pending orders
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
                <small>Total: P${order.total}</small>
            </div>
            <button onclick="markOrderCompleted('${order.id}')" class="status-pending">
                Mark Complete
            </button>
        </div>
    `).join('');
}

// Load completed orders
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
                <small>Total: P${order.total}</small>
            </div>
            <span class="item-status status-completed">Completed</span>
        </div>
    `).join('');
}

// Mark order as completed
function markOrderCompleted(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex !== -1) {
        orders[orderIndex].status = 'completed';
        localStorage.setItem('orders', JSON.stringify(orders));
        loadAdminDashboard(); // Reload dashboard
    }
}

// Load all ratings
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

// Update rating summary
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

// Load statistics
function loadStatistics() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    // Total orders
    document.getElementById('total-orders').textContent = orders.length;
    
    // Total revenue
    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total), 0);
    document.getElementById('total-revenue').textContent = `P ${totalRevenue.toFixed(2)}`;
    
    // Total discounts
    const totalDiscounts = orders.reduce((sum, o) => sum + parseFloat(o.discount), 0);
    document.getElementById('total-discounts').textContent = `P ${totalDiscounts.toFixed(2)}`;
    
    // Total deliveries
    const totalDeliveries = orders.filter(o => o.deliveryMethod === 'delivery').length;
    document.getElementById('total-deliveries').textContent = totalDeliveries;
}

// Load popular items
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

// Load location statistics
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
        .sort((a, b) => b[1] - a[1])
        .map(([location, count]) => `
            <div class="admin-list-item">
                <span><strong>${location}</strong></span>
                <span class="item-status">${count} deliveries</span>
            </div>
        `).join('');
}

// Switch admin tabs
function switchAdminTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.admin-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`admin-${tabName}-tab`).classList.add('active');
}

// Logout admin
function logoutAdmin() {
    currentAdmin = null;
    document.getElementById('admin-dashboard').style.display = 'none';
}

// Close admin dashboard
function closeAdminDashboard() {
    document.getElementById('admin-dashboard').style.display = 'none';
}

// Modify the completeOrder function to save order data
function completeOrder() {
    // Get order details
    const orderItems = [...order];
    const subtotal = parseFloat(document.getElementById('subtotal').textContent);
    const discount = parseFloat(document.getElementById('discount-amount').textContent.replace('P', ''));
    const total = parseFloat(document.getElementById('total').textContent);
    
    // Create order object
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
    
    // Save to localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(orderData);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Show confirmation message
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
        Total: P${total.toFixed(2)}
    `;
    
    document.getElementById('confirmation-popup').style.display = 'flex';
    
    // Clear order
    order = [];
    updateOrderDisplay();
    document.getElementById('checkout-btn').disabled = true;
    
    // Reset for next order
    deliveryMethod = null;
    deliveryLocation = null;
    
    // Show rating popup after 30 seconds
    setTimeout(() => {
        document.getElementById('rating-popup').style.display = 'flex';
    }, 30000);
}

// Update location details based on selection
function updateLocationDetails() {
    const mainCampus = document.getElementById('main-campus').value;
    const lectureBlock = document.getElementById('lecture-blocks').value;
    const newCampus = document.getElementById('new-campus').value;
    
    const roomDetails = document.getElementById('room-details');
    
    // Show room number input for specific locations
    if (mainCampus === 'Offices' || lectureBlock || newCampus) {
        roomDetails.style.display = 'block';
    } else {
        roomDetails.style.display = 'none';
    }
}

// Update confirmDelivery function
function confirmDelivery() {
    const mainCampus = document.getElementById('main-campus').value;
    const lectureBlock = document.getElementById('lecture-blocks').value;
    const newCampus = document.getElementById('new-campus').value;
    const otherLocation = document.getElementById('other-location').value;
    const roomNumber = document.getElementById('room-number').value;
    
    let location = '';
    
    if (mainCampus) {
        location = mainCampus;
        if (mainCampus === 'Offices' && roomNumber) {
            location += ` - Office ${roomNumber}`;
        }
    } else if (lectureBlock) {
        location = lectureBlock;
        if (roomNumber) {
            location += ` - Room ${roomNumber}`;
        }
    } else if (newCampus) {
        location = newCampus;
        if (roomNumber) {
            location += ` - Room ${roomNumber}`;
        }
    } else if (otherLocation) {
        location = otherLocation;
    }
    
    if (!location) {
        alert('Please select or enter a delivery location');
        return;
    }
    
    deliveryLocation = location;
    document.getElementById('location-popup').style.display = 'none';
    completeOrder();
}

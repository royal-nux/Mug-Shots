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
    window.onload = function() {
        document.getElementById('role-popup').style.display = 'flex';
    };
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
            <button class="size-btn" onclick="addToOrder('Cafe Latte (Short)', 18.00); event.stopPropagation();">
                <span>Short (Small)</span>
                <span>P 18.00</span>
            </button>
            <button class="size-btn" onclick="addToOrder('Cafe Latte (Tall)', 23.00); event.stopPropagation();">
                <span>Tall (Large)</span>
                <span>P 23.00</span>
            </button>
        `;
    } else if (type === 'milo') {
        options.innerHTML = `
            <button class="size-btn" onclick="addToOrder('Milo (Short)', 23.00); event.stopPropagation();">
                <span>Short (Small)</span>
                <span>P 23.00</span>
            </button>
            <button class="size-btn" onclick="addToOrder('Milo (Tall)', 27.00); event.stopPropagation();">
                <span>Tall (Large)</span>
                <span>P 27.00</span>
            </button>
        `;
    } else {
        options.innerHTML = `
            <button class="size-btn" onclick="addToOrder('${name}', ${price}); event.stopPropagation();">
                <span>Regular</span>
                <span>P ${price.toFixed(2)}</span>
            </button>
        `;
    }
    
    popup.style.display = 'flex';
}

function showLatteOptions() {
    if (!userRole) {
        document.getElementById('role-popup').style.display = 'flex';
        return;
    }
    showSizeOptions('Cafe Latte', 0, 'latte');
}

function showMiloOptions() {
    if (!userRole) {
        document.getElementById('role-popup').style.display = 'flex';
        return;
    }
    showSizeOptions('Milo', 0, 'milo');
}

function showMilkshakeOptions(flavor) {
    if (!userRole) {
        document.getElementById('role-popup').style.display = 'flex';
        return;
    }
    const popup = document.getElementById('size-popup');
    const title = document.getElementById('size-popup-title');
    const options = document.getElementById('size-options');
    
    title.textContent = `Select - ${flavor} Milkshake`;
    options.innerHTML = `
        <button class="size-btn" onclick="addToOrder('${flavor} Milkshake', 26.00); event.stopPropagation();">
            <span>Regular</span>
            <span>P 26.00</span>
        </button>
    `;
    
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
    
    // Show confirmation message
    showNotification(`${name} added to order!`);
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 2000);
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
    if (!orderItemsDiv) return;
    
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
            <span class="item-name">${item.name}</span>
            <div class="order-item-controls">
                <button onclick="updateQuantity('${item.name.replace(/'/g, "\\'")}', -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQuantity('${item.name.replace(/'/g, "\\'")}', 1)">+</button>
                <button class="remove-btn" onclick="removeItem('${item.name.replace(/'/g, "\\'")}')">×</button>
            </div>
            <span class="item-price">P ${(item.price * item.quantity).toFixed(2)}</span>
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
        showNotification('Your order is empty!');
        return;
    }
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

// Location selection variables
let selectedCampus = '';
let selectedSpecificLocation = '';
let selectedRoom = '';

// Campus location functions
function updateCampusLocation() {
    const campus = document.getElementById('campus-select').value;
    selectedCampus = campus;
    
    // Hide all location sections
    document.getElementById('main-campus-locations').style.display = 'none';
    document.getElementById('new-campus-locations').style.display = 'none';
    document.getElementById('lecture-theatre-details').style.display = 'none';
    document.getElementById('academic-block-details').style.display = 'none';
    document.getElementById('office-details').style.display = 'none';
    document.getElementById('new-block-details').style.display = 'none';
    document.getElementById('location-summary').style.display = 'none';
    
    // Reset all fields
    resetLocationFields();
    
    // Show appropriate campus locations
    if (campus === 'main') {
        document.getElementById('main-campus-locations').style.display = 'block';
    } else if (campus === 'new') {
        document.getElementById('new-campus-locations').style.display = 'block';
    }
}

function resetLocationFields() {
    // Reset all select and input fields
    const selects = ['main-location', 'new-location', 'lecture-theatre', 'academic-block'];
    const inputs = ['lecture-room', 'academic-room', 'office-number', 'new-block-room', 'other-location'];
    
    selects.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
}

function updateMainLocationDetails() {
    const location = document.getElementById('main-location').value;
    selectedSpecificLocation = location;
    
    // Hide all detail sections
    document.getElementById('lecture-theatre-details').style.display = 'none';
    document.getElementById('academic-block-details').style.display = 'none';
    document.getElementById('office-details').style.display = 'none';
    
    // Reset room fields
    document.getElementById('lecture-room').value = '';
    document.getElementById('academic-room').value = '';
    document.getElementById('office-number').value = '';
    
    if (location === 'lecture-theatre') {
        document.getElementById('lecture-theatre-details').style.display = 'block';
    } else if (location === 'academic-blocks') {
        document.getElementById('academic-block-details').style.display = 'block';
    } else if (location === 'offices') {
        document.getElementById('office-details').style.display = 'block';
    } else if (location) {
        // For simple locations (reception, labs, cafeteria), show summary immediately
        updateLocationSummary();
    }
}

function updateNewLocationDetails() {
    const location = document.getElementById('new-location').value;
    selectedSpecificLocation = location;
    
    // Hide new block details
    document.getElementById('new-block-details').style.display = 'none';
    document.getElementById('new-block-room').value = '';
    
    if (location === 'block-a' || location === 'block-b') {
        document.getElementById('new-block-details').style.display = 'block';
    } else if (location === 'library') {
        // Library doesn't need room number, show summary immediately
        updateLocationSummary();
    }
}

function updateLectureTheatreRoom() {
    const theatre = document.getElementById('lecture-theatre').value;
    if (theatre) {
        document.getElementById('lecture-room-field').style.display = 'block';
    } else {
        document.getElementById('lecture-room-field').style.display = 'none';
        document.getElementById('lecture-room').value = '';
    }
}

function updateAcademicBlockRoom() {
    const block = document.getElementById('academic-block').value;
    if (block) {
        document.getElementById('academic-room-field').style.display = 'block';
    } else {
        document.getElementById('academic-room-field').style.display = 'none';
        document.getElementById('academic-room').value = '';
    }
}

function updateLocationSummary() {
    const summary = document.getElementById('location-summary');
    const summaryText = document.getElementById('selected-location-text');
    
    let locationString = buildLocationString();
    
    if (locationString) {
        summaryText.textContent = locationString;
        summary.style.display = 'block';
    } else {
        summary.style.display = 'none';
    }
}

function buildLocationString() {
    const campus = document.getElementById('campus-select').value;
    const mainLocation = document.getElementById('main-location')?.value || '';
    const newLocation = document.getElementById('new-location')?.value || '';
    const lectureTheatre = document.getElementById('lecture-theatre')?.value || '';
    const lectureRoom = document.getElementById('lecture-room')?.value || '';
    const academicBlock = document.getElementById('academic-block')?.value || '';
    const academicRoom = document.getElementById('academic-room')?.value || '';
    const officeNumber = document.getElementById('office-number')?.value || '';
    const newBlockRoom = document.getElementById('new-block-room')?.value || '';
    const otherLocation = document.getElementById('other-location')?.value || '';
    
    if (otherLocation) {
        return otherLocation;
    }
    
    if (!campus) return '';
    
    let location = campus === 'main' ? 'Main Campus' : 'New Campus';
    
    if (campus === 'main') {
        if (mainLocation === 'reception') location += ' - Reception';
        else if (mainLocation === 'labs') location += ' - Labs 1-12';
        else if (mainLocation === 'cafeteria') location += ' - Cafeteria';
        else if (mainLocation === 'offices') {
            location += ' - Offices';
            if (officeNumber) location += ` (${officeNumber})`;
        }
        else if (mainLocation === 'lecture-theatre') {
            if (lectureTheatre) {
                location += ` - ${lectureTheatre}`;
                if (lectureRoom) location += ` (Room ${lectureRoom})`;
            }
        }
        else if (mainLocation === 'academic-blocks') {
            if (academicBlock) {
                location += ` - Block ${academicBlock}`;
                if (academicRoom) location += ` (Room ${academicRoom})`;
            }
        }
    } else if (campus === 'new') {
        if (newLocation === 'library') location += ' - Library';
        else if (newLocation === 'block-a') {
            location += ' - Block A';
            if (newBlockRoom) location += ` (Room ${newBlockRoom})`;
        }
        else if (newLocation === 'block-b') {
            location += ' - Block B';
            if (newBlockRoom) location += ` (Room ${newBlockRoom})`;
        }
    }
    
    return location;
}

// Confirm delivery
function confirmDelivery() {
    const locationString = buildLocationString();
    
    if (!locationString || locationString === 'Main Campus' || locationString === 'New Campus') {
        alert('Please select a complete delivery location (campus and specific location)');
        return;
    }
    
    deliveryLocation = locationString;
    closeLocationPopup();
    completeOrder();
}

function closeLocationPopup() {
    const popup = document.getElementById('location-popup');
    if (popup) {
        popup.style.display = 'none';
    }
    
    // Reset all fields
    resetLocationFields();
    
    // Hide all sections
    const sections = [
        'main-campus-locations', 'new-campus-locations', 'lecture-theatre-details',
        'academic-block-details', 'office-details', 'new-block-details',
        'lecture-room-field', 'academic-room-field', 'location-summary'
    ];
    
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    
    // Reset campus select
    const campusSelect = document.getElementById('campus-select');
    if (campusSelect) campusSelect.value = '';
    
    selectedCampus = '';
    selectedSpecificLocation = '';
    selectedRoom = '';
}

// Add event listeners to update summary when any field changes
document.addEventListener('DOMContentLoaded', function() {
    const fields = [
        'campus-select', 'main-location', 'new-location', 'lecture-theatre',
        'academic-block', 'lecture-room', 'academic-room', 'office-number',
        'new-block-room', 'other-location'
    ];
    
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', updateLocationSummary);
            el.addEventListener('keyup', updateLocationSummary);
        }
    });
});
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
    if (currentRating === 0) {
        alert('Please select a rating');
        return;
    }
    
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
    if (!list) return;
    
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
                <small>Total: P ${order.total.toFixed(2)}</small>
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
    if (!list) return;
    
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
                <small>Total: P ${order.total.toFixed(2)}</small>
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
        showNotification('Order marked as completed');
    }
}

function loadAllRatings() {
    const ratings = JSON.parse(localStorage.getItem('ratings') || '[]');
    
    const list = document.getElementById('all-ratings-list');
    if (!list) return;
    
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
    if (!list) return;
    
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
    if (!list) return;
    
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

function logoutAdmin() {
    currentAdmin = null;
    document.getElementById('admin-dashboard').style.display = 'none';
    showNotification('Logged out successfully');
}

function closeAdminDashboard() {
    document.getElementById('admin-dashboard').style.display = 'none';
}

// Close popups when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('popup')) {
        event.target.style.display = 'none';
    }
}

// Load user role from localStorage on page load
document.addEventListener('DOMContentLoaded', function() {
    const savedRole = localStorage.getItem('userRole');
    if (savedRole) {
        userRole = savedRole;
    }
    
    // Add click handlers to coffee items
    document.querySelectorAll('.coffee-item').forEach(item => {
        const addBtn = item.querySelector('.add-btn');
        if (addBtn) {
            addBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                // The onclick on the parent div will handle the size selection
            });
        }
    });
});

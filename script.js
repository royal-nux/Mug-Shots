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

// Size selection variables
let currentCoffeeName = '';
let currentCoffeeType = '';
let currentSizes = [];

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
    const dropdown = document.getElementById('size-dropdown');
    const priceDisplay = document.getElementById('selected-size-price');
    const addBtn = document.getElementById('add-size-btn');
    
    currentCoffeeName = name;
    currentCoffeeType = type;
    
    title.textContent = `Select Size - ${name}`;
    
    // Clear dropdown
    dropdown.innerHTML = '<option value="">-- Select Size --</option>';
    
    // Define sizes based on coffee type
    if (type === 'latte') {
        currentSizes = [
            { size: 'Short (Small)', price: 18.00 },
            { size: 'Tall (Large)', price: 23.00 }
        ];
    } else if (type === 'milo') {
        currentSizes = [
            { size: 'Short (Small)', price: 23.00 },
            { size: 'Tall (Large)', price: 27.00 }
        ];
    } else if (type === 'milkshake') {
        currentSizes = [
            { size: 'Regular', price: 26.00 }
        ];
    } else if (type === 'single') {
        currentSizes = [
            { size: 'Single Espresso', price: 15.00 }
        ];
    } else if (type === 'double') {
        currentSizes = [
            { size: 'Double Espresso', price: 18.00 }
        ];
    } else {
        currentSizes = [
            { size: 'Regular', price: price }
        ];
    }
    
    // Populate dropdown
    currentSizes.forEach(item => {
        const option = document.createElement('option');
        option.value = item.price;
        option.textContent = `${item.size} - P ${item.price.toFixed(2)}`;
        dropdown.appendChild(option);
    });
    
    // Reset display
    priceDisplay.textContent = 'P 0.00';
    addBtn.disabled = true;
    
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
    showSizeOptions(flavor, 26.00, 'milkshake');
}

function updateSizePrice() {
    const dropdown = document.getElementById('size-dropdown');
    const priceDisplay = document.getElementById('selected-size-price');
    const addBtn = document.getElementById('add-size-btn');
    const selectedPrice = dropdown.value;
    
    if (selectedPrice) {
        priceDisplay.textContent = `P ${parseFloat(selectedPrice).toFixed(2)}`;
        addBtn.disabled = false;
    } else {
        priceDisplay.textContent = 'P 0.00';
        addBtn.disabled = true;
    }
}

function addToOrderWithSize() {
    const dropdown = document.getElementById('size-dropdown');
    const selectedIndex = dropdown.selectedIndex;
    const selectedPrice = parseFloat(dropdown.value);
    
    if (!selectedPrice) {
        alert('Please select a size');
        return;
    }
    
    // Get the selected size text
    const selectedOption = dropdown.options[selectedIndex];
    const sizeText = selectedOption.text.split(' - ')[0];
    
    // Construct full coffee name with size
    let coffeeName = '';
    
    if (currentCoffeeType === 'latte') {
        coffeeName = `Cafe Latte (${sizeText})`;
    } else if (currentCoffeeType === 'milo') {
        coffeeName = `Milo (${sizeText})`;
    } else if (currentCoffeeType === 'milkshake') {
        coffeeName = `${currentCoffeeName} Milkshake`;
    } else {
        coffeeName = currentCoffeeName;
    }
    
    // Add to order
    addToOrder(coffeeName, selectedPrice);
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
        // For collection, no location needed
        deliveryLocation = 'Collection (counter pick-up)';
        completeOrder();
    } else if (method === 'delivery') {
        // For delivery, show location popup
        document.getElementById('location-popup').style.display = 'flex';
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
    
    // Hide all sections
    document.getElementById('main-campus-locations').style.display = 'none';
    document.getElementById('new-campus-locations').style.display = 'none';
    document.getElementById('lab-numbers').style.display = 'none';
    document.getElementById('academic-block-select').style.display = 'none';
    document.getElementById('lecture-theatre-details').style.display = 'none';
    document.getElementById('office-details').style.display = 'none';
    document.getElementById('new-block-details').style.display = 'none';
    document.getElementById('academic-room-field').style.display = 'none';
    document.getElementById('lecture-room-field').style.display = 'none';
    
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
    const selects = [
        'main-location', 'new-location', 'lab-number', 'academic-block-letter',
        'lecture-theatre', 'academic-room', 'lecture-room', 'office-number',
        'new-block-room', 'other-location'
    ];
    
    selects.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (el.tagName === 'SELECT') {
                el.value = '';
            } else {
                el.value = '';
            }
        }
    });
}

function updateMainLocationDetails() {
    const location = document.getElementById('main-location').value;
    
    // Hide all detail sections
    document.getElementById('lab-numbers').style.display = 'none';
    document.getElementById('academic-block-select').style.display = 'none';
    document.getElementById('lecture-theatre-details').style.display = 'none';
    document.getElementById('office-details').style.display = 'none';
    document.getElementById('academic-room-field').style.display = 'none';
    document.getElementById('lecture-room-field').style.display = 'none';
    
    // Reset relevant fields
    document.getElementById('lab-number').value = '';
    document.getElementById('academic-block-letter').value = '';
    document.getElementById('academic-room').value = '';
    document.getElementById('lecture-theatre').value = '';
    document.getElementById('lecture-room').value = '';
    document.getElementById('office-number').value = '';
    
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

function updateAcademicBlockRoom() {
    const block = document.getElementById('academic-block-letter').value;
    if (block) {
        document.getElementById('academic-room-field').style.display = 'block';
    } else {
        document.getElementById('academic-room-field').style.display = 'none';
        document.getElementById('academic-room').value = '';
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

function updateNewLocationDetails() {
    const location = document.getElementById('new-location').value;
    
    document.getElementById('new-block-details').style.display = 'none';
    document.getElementById('new-block-room').value = '';
    
    if (location === 'block-a' || location === 'block-b') {
        document.getElementById('new-block-details').style.display = 'block';
    }
}

function updateLocationSummary() {
    const campus = document.getElementById('campus-select').value;
    const mainLocation = document.getElementById('main-location')?.value;
    const newLocation = document.getElementById('new-location')?.value;
    const labNumber = document.getElementById('lab-number')?.value;
    const academicBlock = document.getElementById('academic-block-letter')?.value;
    const academicRoom = document.getElementById('academic-room')?.value;
    const lectureTheatre = document.getElementById('lecture-theatre')?.value;
    const lectureRoom = document.getElementById('lecture-room')?.value;
    const officeNumber = document.getElementById('office-number')?.value;
    const newBlockRoom = document.getElementById('new-block-room')?.value;
    const otherLocation = document.getElementById('other-location')?.value;
    
    let locationString = '';
    
    if (otherLocation && otherLocation.trim() !== '') {
        locationString = otherLocation.trim();
    } else if (campus === 'main') {
        if (mainLocation === 'reception') {
            locationString = 'Main Campus - Reception';
        } else if (mainLocation === 'cafeteria') {
            locationString = 'Main Campus - Cafeteria';
        } else if (mainLocation === 'labs' && labNumber) {
            locationString = `Main Campus - Lab ${labNumber}`;
        } else if (mainLocation === 'offices' && officeNumber) {
            locationString = `Main Campus - Offices (${officeNumber})`;
        } else if (mainLocation === 'lecture-theatre' && lectureTheatre) {
            locationString = `Main Campus - ${lectureTheatre}`;
            if (lectureRoom) locationString += ` (Room ${lectureRoom})`;
        } else if (mainLocation === 'academic-blocks' && academicBlock) {
            locationString = `Main Campus - Block ${academicBlock}`;
            if (academicRoom) locationString += ` (Room ${academicRoom})`;
        }
    } else if (campus === 'new') {
        if (newLocation === 'library') {
            locationString = 'New Campus - Library';
        } else if (newLocation === 'block-a' && newBlockRoom) {
            locationString = `New Campus - Block A (Room ${newBlockRoom})`;
        } else if (newLocation === 'block-b' && newBlockRoom) {
            locationString = `New Campus - Block B (Room ${newBlockRoom})`;
        }
    }
    
    const summary = document.getElementById('location-summary');
    const summaryText = document.getElementById('selected-location-text');
    
    if (locationString && summary && summaryText) {
        summaryText.textContent = locationString;
        summary.style.display = 'block';
    } else if (summary) {
        summary.style.display = 'none';
    }
}

// Confirm delivery
function confirmDelivery() {
    // Get all values
    const campus = document.getElementById('campus-select').value;
    const mainLocation = document.getElementById('main-location')?.value;
    const newLocation = document.getElementById('new-location')?.value;
    const labNumber = document.getElementById('lab-number')?.value;
    const academicBlock = document.getElementById('academic-block-letter')?.value;
    const academicRoom = document.getElementById('academic-room')?.value;
    const lectureTheatre = document.getElementById('lecture-theatre')?.value;
    const lectureRoom = document.getElementById('lecture-room')?.value;
    const officeNumber = document.getElementById('office-number')?.value;
    const newBlockRoom = document.getElementById('new-block-room')?.value;
    const otherLocation = document.getElementById('other-location')?.value;
    
    let location = '';
    
    // Check if other location is specified
    if (otherLocation && otherLocation.trim() !== '') {
        location = otherLocation.trim();
    }
    // Handle main campus
    else if (campus === 'main') {
        if (!mainLocation) {
            alert('Please select a main campus location');
            return;
        }
        
        if (mainLocation === 'reception') {
            location = 'Main Campus - Reception';
        }
        else if (mainLocation === 'cafeteria') {
            location = 'Main Campus - Cafeteria';
        }
        else if (mainLocation === 'labs') {
            if (!labNumber) {
                alert('Please select a lab number');
                return;
            }
            location = `Main Campus - Lab ${labNumber} (No eating/drinking)`;
        }
        else if (mainLocation === 'offices') {
            if (!officeNumber) {
                alert('Please enter office number');
                return;
            }
            location = `Main Campus - Offices (${officeNumber})`;
        }
        else if (mainLocation === 'lecture-theatre') {
            if (!lectureTheatre) {
                alert('Please select a lecture theatre');
                return;
            }
            location = `Main Campus - ${lectureTheatre}`;
            if (lectureRoom) {
                location += ` (Room ${lectureRoom})`;
            }
        }
        else if (mainLocation === 'academic-blocks') {
            if (!academicBlock) {
                alert('Please select an academic block');
                return;
            }
            location = `Main Campus - Block ${academicBlock}`;
            if (academicRoom) {
                location += ` (Room ${academicRoom})`;
            }
        }
    }
    // Handle new campus
    else if (campus === 'new') {
        if (!newLocation) {
            alert('Please select a new campus location');
            return;
        }
        
        if (newLocation === 'library') {
            location = 'New Campus - Library';
        }
        else if (newLocation === 'block-a') {
            if (!newBlockRoom) {
                alert('Please enter room number');
                return;
            }
            location = `New Campus - Block A (Room ${newBlockRoom})`;
        }
        else if (newLocation === 'block-b') {
            if (!newBlockRoom) {
                alert('Please enter room number');
                return;
            }
            location = `New Campus - Block B (Room ${newBlockRoom})`;
        }
    }
    
    if (!location) {
        alert('Please select a complete delivery location');
        return;
    }
    
    deliveryLocation = location;
    closeLocationPopup();
    completeOrder();
}

// Close location popup
function closeLocationPopup() {
    document.getElementById('location-popup').style.display = 'none';
    
    // Reset all fields
    resetLocationFields();
    
    // Hide all sections
    const sections = [
        'main-campus-locations', 'new-campus-locations', 'lab-numbers',
        'academic-block-select', 'lecture-theatre-details', 'office-details',
        'new-block-details', 'academic-room-field', 'lecture-room-field'
    ];
    
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    
    // Reset campus select
    document.getElementById('campus-select').value = '';
    
    // Hide summary
    const summary = document.getElementById('location-summary');
    if (summary) summary.style.display = 'none';
}

// Complete order function
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
        location: deliveryLocation || 'Collection (counter pick-up)',
        status: 'pending'
    };
    
    // Save to localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(orderData);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Show confirmation
    const message = document.getElementById('confirmation-message');
    const studentCallSection = document.getElementById('student-call-section');
    const staffMessage = document.getElementById('staff-message');
    
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
        <strong>Total: P ${total.toFixed(2)}</strong>
    `;
    
    // Show different options based on user role
    if (userRole === 'student') {
        if (studentCallSection) studentCallSection.style.display = 'block';
        if (staffMessage) staffMessage.style.display = 'none';
    } else {
        if (studentCallSection) studentCallSection.style.display = 'none';
        if (staffMessage) staffMessage.style.display = 'block';
    }
    
    document.getElementById('confirmation-popup').style.display = 'flex';
    
    // Clear order
    order = [];
    updateOrderDisplay();
    document.getElementById('checkout-btn').disabled = true;
    
    // Show rating popup after 30 seconds
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
    
    // Add location summary update to all relevant fields
    const locationFields = [
        'campus-select', 'main-location', 'new-location', 'lab-number',
        'academic-block-letter', 'academic-room', 'lecture-theatre',
        'lecture-room', 'office-number', 'new-block-room', 'other-location'
    ];
    
    locationFields.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', updateLocationSummary);
            el.addEventListener('keyup', updateLocationSummary);
        }
    });
    
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

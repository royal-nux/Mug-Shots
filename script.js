let currentOrder = [];
let selectedRole = null;
let userRole = null;
let currentItem = null;
let lactoseTolerant = true;
let selectedMilk = null;
let selectedExtras = [];
let deliveryMethod = null;
let deliveryLocation = null;
let currentRating = 0;

let orders = JSON.parse(localStorage.getItem('orders')) || [];
let ratings = JSON.parse(localStorage.getItem('ratings')) || [];
let milkAlerts = JSON.parse(localStorage.getItem('milkAlerts')) || [];

const DISCOUNT_RATES = {
    'student': 0.05,
    'lecturer': 0,
    'staff': 0
};

function toggleCategory(categoryId) {
    const category = document.getElementById(categoryId);
    const toggle = category.previousElementSibling.querySelector('.category-toggle');
    
    if (category.classList.contains('active')) {
        category.classList.remove('active');
        toggle.style.transform = 'rotate(-90deg)';
    } else {
        category.classList.add('active');
        toggle.style.transform = 'rotate(0deg)';
    }
}

document.getElementById('menuToggle').addEventListener('click', function() {
    const menu = document.getElementById('mainMenu');
    const main = document.querySelector('main');
    menu.classList.toggle('show');
    main.classList.toggle('menu-hidden');
    
    const icon = this.querySelector('i');
    if (menu.classList.contains('show')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
});

document.addEventListener('click', function(event) {
    const menu = document.getElementById('mainMenu');
    const toggle = document.getElementById('menuToggle');
    
    if (window.innerWidth <= 1024) {
        if (!menu.contains(event.target) && !toggle.contains(event.target) && menu.classList.contains('show')) {
            menu.classList.remove('show');
            const icon = toggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    }
});

window.addEventListener('resize', function() {
    if (window.innerWidth > 1024) {
        const menu = document.getElementById('mainMenu');
        const toggle = document.getElementById('menuToggle');
        menu.classList.remove('show');
        const icon = toggle.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        document.getElementById('role-popup').style.display = 'flex';
    }, 500);
});

function selectRole(role) {
    userRole = role;
    selectedRole = role;
    document.getElementById('role-popup').style.display = 'none';
    
    if (role === 'student') {
        showNotification('Student discount applied! 5% off your order.');
    }
}

function showAdminLogin() {
    document.getElementById('admin-login-popup').style.display = 'flex';
}

function closeAdminLogin() {
    document.getElementById('admin-login-popup').style.display = 'none';
}

function adminLogin() {
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    
    if (username === 'Orefilejakes' && password === 'Dijeje@blo') {
        closeAdminLogin();
        loadAdminDashboard();
        document.getElementById('admin-dashboard').style.display = 'flex';
    } else {
        alert('Invalid credentials');
    }
}

function closeAdminDashboard() {
    document.getElementById('admin-dashboard').style.display = 'none';
}

function logoutAdmin() {
    closeAdminDashboard();
}

function switchAdminTab(tab) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(`admin-${tab}-tab`).classList.add('active');
    
    if (tab === 'orders') loadOrdersTab();
    if (tab === 'ratings') loadRatingsTab();
    if (tab === 'stats') loadStatsTab();
}

function loadAdminDashboard() {
    loadOrdersTab();
    loadRatingsTab();
    loadStatsTab();
}

function loadOrdersTab() {
    const pendingList = document.getElementById('pending-orders-list');
    const completedList = document.getElementById('completed-orders-list');
    const alertsList = document.getElementById('milk-alerts-list');
    
    const pendingOrders = orders.filter(o => !o.completed);
    const completedOrders = orders.filter(o => o.completed);
    
    pendingList.innerHTML = pendingOrders.length ? 
        pendingOrders.map(order => `
            <div class="order-item">
                <div class="order-item-details">
                    <div class="order-item-name">Order #${order.id}</div>
                    <div class="order-item-price">P ${order.total.toFixed(2)}</div>
                    <div style="font-size:0.8em; color:#999;">${new Date(order.timestamp).toLocaleString()}</div>
                </div>
                <button onclick="completeOrder('${order.id}')" class="add-btn" style="background:#27ae60;">
                    <i class="fas fa-check"></i>
                </button>
            </div>
        `).join('') : '<p style="color:#999; padding:10px;">No pending orders</p>';
    
    completedList.innerHTML = completedOrders.length ?
        completedOrders.map(order => `
            <div class="order-item">
                <div class="order-item-details">
                    <div class="order-item-name">Order #${order.id}</div>
                    <div class="order-item-price">P ${order.total.toFixed(2)}</div>
                    <div style="font-size:0.8em; color:#999;">${new Date(order.timestamp).toLocaleString()}</div>
                </div>
            </div>
        `).join('') : '<p style="color:#999; padding:10px;">No completed orders</p>';
    
    alertsList.innerHTML = milkAlerts.length ?
        milkAlerts.map(alert => `
            <div class="order-item" style="border-left:4px solid #e74c3c;">
                <div class="order-item-details">
                    <div class="order-item-name">Order #${alert.orderId} - ${alert.milk} Milk</div>
                    <div class="order-item-price">Use ${alert.milk} milk alternatives</div>
                    <div style="font-size:0.8em; color:#999;">${new Date(alert.timestamp).toLocaleString()}</div>
                </div>
            </div>
        `).join('') : '<p style="color:#999; padding:10px;">No milk alternative alerts</p>';
}

function completeOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.completed = true;
        localStorage.setItem('orders', JSON.stringify(orders));
        loadOrdersTab();
    }
}

function loadRatingsTab() {
    const ratingsList = document.getElementById('all-ratings-list');
    const avgRating = document.getElementById('avg-rating');
    const totalReviews = document.getElementById('total-reviews');
    
    ratingsList.innerHTML = ratings.length ?
        ratings.map(r => `
            <div class="order-item">
                <div class="order-item-details">
                    <div class="order-item-name">Rating: ${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
                    <div style="color:#e6d5b8;">${r.review || 'No review'}</div>
                    <div style="font-size:0.8em; color:#999;">${new Date(r.timestamp).toLocaleString()}</div>
                </div>
            </div>
        `).join('') : '<p style="color:#999; padding:10px;">No ratings yet</p>';
    
    const average = ratings.length ? 
        (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1) : 0;
    avgRating.textContent = average;
    totalReviews.textContent = ratings.length;
}

function loadStatsTab() {
    document.getElementById('total-orders').textContent = orders.length;
    document.getElementById('total-revenue').textContent = 'P ' + orders.reduce((sum, o) => sum + o.total, 0).toFixed(2);
    document.getElementById('total-deliveries').textContent = orders.filter(o => o.deliveryMethod === 'delivery').length;
    document.getElementById('milk-alternative-count').textContent = milkAlerts.length;
}

function showSizePopup(button) {
    const item = button.closest('.coffee-item');
    currentItem = {
        name: item.dataset.name,
        basePrice: parseFloat(item.dataset.price),
        type: item.dataset.type,
        dairy: item.dataset.dairy === 'true'
    };
    
    const popup = document.getElementById('size-popup');
    const sizeOptions = document.getElementById('size-options');
    
    let sizes = [];
    if (currentItem.type === 'latte' || currentItem.type === 'milo' || currentItem.type === 'freezo') {
        sizes = [
            { name: 'Regular', price: currentItem.basePrice },
            { name: 'Large', price: currentItem.basePrice + 4 }
        ];
    } else {
        sizes = [{ name: 'Regular', price: currentItem.basePrice }];
    }
    
    sizeOptions.innerHTML = sizes.map(size => `
        <button class="size-btn" onclick="addToOrder('${size.name}', ${size.price})">
            <span>${size.name}</span>
            <span class="size-price">P ${size.price.toFixed(2)}</span>
        </button>
    `).join('');
    
    popup.style.display = 'flex';
}

function closeSizePopup() {
    document.getElementById('size-popup').style.display = 'none';
    currentItem = null;
}

function addToOrder(size, price) {
    const orderItem = {
        id: Date.now() + Math.random(),
        name: currentItem.name,
        size: size,
        price: price,
        dairy: currentItem.dairy
    };
    
    currentOrder.push(orderItem);
    closeSizePopup();
    updateOrderDisplay();
    enableCheckout();
}

function updateOrderDisplay() {
    const orderContainer = document.getElementById('order-items');
    
    orderContainer.innerHTML = currentOrder.map((item, index) => `
        <div class="order-item">
            <div class="order-item-details">
                <div class="order-item-name">${item.name} ${item.size !== 'Regular' ? '(' + item.size + ')' : ''}</div>
                <div class="order-item-price">P ${item.price.toFixed(2)}</div>
            </div>
            <button onclick="removeFromOrder(${index})" class="order-item-remove">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
    
    if (selectedExtras.length > 0) {
        orderContainer.innerHTML += '<div style="margin-top:10px; padding:10px; background:rgba(196,154,108,0.1); border-radius:8px;"><strong>Extras:</strong></div>';
        selectedExtras.forEach(extra => {
            orderContainer.innerHTML += `
                <div class="order-item">
                    <div class="order-item-details">
                        <div class="order-item-name">${extra.name}</div>
                        <div class="order-item-price">P ${extra.price.toFixed(2)}</div>
                    </div>
                </div>
            `;
        });
    }
    
    updateTotals();
}

function removeFromOrder(index) {
    currentOrder.splice(index, 1);
    updateOrderDisplay();
    if (currentOrder.length === 0) {
        disableCheckout();
    }
}

function updateTotals() {
    const coffeeSubtotal = currentOrder.reduce((sum, item) => sum + item.price, 0);
    const extrasSubtotal = selectedExtras.reduce((sum, item) => sum + item.price, 0);
    const subtotal = coffeeSubtotal + extrasSubtotal;
    
    let discount = 0;
    if (selectedRole === 'student') {
        discount = subtotal * 0.05;
    }
    
    const total = subtotal - discount;
    
    document.getElementById('subtotal').textContent = subtotal.toFixed(2);
    document.getElementById('discount-amount').textContent = discount.toFixed(2);
    document.getElementById('total').textContent = total.toFixed(2);
}

function enableCheckout() {
    document.getElementById('checkout-btn').disabled = false;
}

function disableCheckout() {
    document.getElementById('checkout-btn').disabled = true;
}

function startCheckout() {
    if (currentOrder.length === 0) return;
    
    const hasDairy = currentOrder.some(item => item.dairy);
    if (hasDairy) {
        showLactosePopup();
    } else {
        showExtrasPopup();
    }
}

function showLactosePopup() {
    document.getElementById('lactose-popup').style.display = 'flex';
    document.getElementById('milk-alternatives').style.display = 'none';
    document.getElementById('lactose-cancel').style.display = 'block';
    lactoseTolerant = true;
    selectedMilk = null;
}

function closeLactosePopup() {
    document.getElementById('lactose-popup').style.display = 'none';
    document.getElementById('milk-alternatives').style.display = 'none';
}

function handleLactoseTolerant(isTolerant) {
    lactoseTolerant = isTolerant;
    
    if (isTolerant) {
        showExtrasPopup();
        closeLactosePopup();
    } else {
        document.getElementById('milk-alternatives').style.display = 'block';
        document.getElementById('lactose-cancel').style.display = 'none';
    }
}

function selectMilkAlternative(milkType) {
    selectedMilk = milkType === 'soya' ? 'Soya' : 'Almond';
    
    const alert = {
        orderId: 'Temp-' + Date.now(),
        milk: selectedMilk,
        timestamp: new Date().toISOString(),
        items: currentOrder.map(i => i.name)
    };
    milkAlerts.push(alert);
    localStorage.setItem('milkAlerts', JSON.stringify(milkAlerts));
    
    closeLactosePopup();
    showExtrasPopup();
}

function showExtrasPopup() {
    document.getElementById('extras-popup').style.display = 'flex';
    updateExtrasDisplay();
}

function closeExtrasPopup() {
    document.getElementById('extras-popup').style.display = 'none';
}

function toggleExtra(extraElement) {
    const name = extraElement.dataset.name;
    const price = parseFloat(extraElement.dataset.price);
    const icon = extraElement.querySelector('.add-extra');
    
    const existingIndex = selectedExtras.findIndex(e => e.name === name);
    
    if (existingIndex >= 0) {
        selectedExtras.splice(existingIndex, 1);
        extraElement.classList.remove('selected');
        icon.classList.remove('fa-minus-circle');
        icon.classList.add('fa-plus-circle');
    } else {
        selectedExtras.push({ name, price });
        extraElement.classList.add('selected');
        icon.classList.remove('fa-plus-circle');
        icon.classList.add('fa-minus-circle');
    }
    
    updateExtrasDisplay();
    updateOrderDisplay();
}

function updateExtrasDisplay() {
    const extrasList = document.getElementById('extras-list');
    
    if (selectedExtras.length === 0) {
        extrasList.innerHTML = '<p style="color:#999;">No treats selected</p>';
    } else {
        extrasList.innerHTML = selectedExtras.map(extra => `
            <div class="extra-summary-item">
                <span>${extra.name}</span>
                <span>P ${extra.price.toFixed(2)}</span>
            </div>
        `).join('');
    }
}

function skipExtras() {
    closeExtrasPopup();
    showDeliveryPopup();
}

function proceedToDelivery() {
    closeExtrasPopup();
    showDeliveryPopup();
}

function showDeliveryPopup() {
    document.getElementById('delivery-popup').style.display = 'flex';
}

function closeDeliveryPopup() {
    document.getElementById('delivery-popup').style.display = 'none';
}

function selectDelivery(method) {
    deliveryMethod = method;
    closeDeliveryPopup();
    
    if (method === 'delivery') {
        showDeliveryLocation();
    } else {
        confirmOrder();
    }
}

function showDeliveryLocation() {
    document.getElementById('location-popup').style.display = 'flex';
}

function closeLocationPopup() {
    document.getElementById('location-popup').style.display = 'none';
}

function updateCampusLocation() {
    const campus = document.getElementById('campus-select').value;
    
    document.getElementById('main-campus-locations').style.display = campus === 'main' ? 'block' : 'none';
    document.getElementById('new-campus-locations').style.display = campus === 'new' ? 'block' : 'none';
    
    document.getElementById('lab-numbers').style.display = 'none';
    document.getElementById('academic-block-select').style.display = 'none';
    document.getElementById('lecture-theatre-details').style.display = 'none';
    document.getElementById('office-details').style.display = 'none';
    document.getElementById('new-block-details').style.display = 'none';
}

function updateMainLocationDetails() {
    const location = document.getElementById('main-location').value;
    
    document.getElementById('lab-numbers').style.display = location === 'labs' ? 'block' : 'none';
    document.getElementById('academic-block-select').style.display = location === 'academic-blocks' ? 'block' : 'none';
    document.getElementById('lecture-theatre-details').style.display = location === 'lecture-theatre' ? 'block' : 'none';
    document.getElementById('office-details').style.display = location === 'offices' ? 'block' : 'none';
}

function updateNewLocationDetails() {
    const location = document.getElementById('new-location').value;
    document.getElementById('new-block-details').style.display = location === 'block-a' || location === 'block-b' ? 'block' : 'none';
}

function confirmDelivery() {
    const campus = document.getElementById('campus-select').value;
    let location = '';
    
    if (campus === 'main') {
        const mainLocation = document.getElementById('main-location').value;
        if (mainLocation === 'labs') {
            const lab = document.getElementById('lab-number').value;
            location = `Main Campus, Lab ${lab}`;
        } else if (mainLocation === 'academic-blocks') {
            const block = document.getElementById('academic-block-letter').value;
            location = `Main Campus, Block ${block}`;
        } else if (mainLocation === 'lecture-theatre') {
            const theatre = document.getElementById('lecture-theatre').value;
            location = `Main Campus, ${theatre}`;
        } else if (mainLocation === 'offices') {
            const office = document.getElementById('office-number').value;
            location = `Main Campus, ${office}`;
        } else {
            location = `Main Campus, ${mainLocation}`;
        }
    } else if (campus === 'new') {
        const newLocation = document.getElementById('new-location').value;
        if (newLocation === 'block-a' || newLocation === 'block-b') {
            const room = document.getElementById('new-block-room').value;
            location = `New Campus, ${newLocation === 'block-a' ? 'Block A' : 'Block B'}, Room ${room}`;
        } else {
            location = `New Campus, ${newLocation}`;
        }
    }
    
    const otherLocation = document.getElementById('other-location').value;
    if (otherLocation) {
        location = otherLocation;
    }
    
    deliveryLocation = location;
    closeLocationPopup();
    confirmOrder();
}

function confirmOrder() {
    const orderId = 'ORD-' + Date.now().toString().slice(-8);
    const coffeeSubtotal = currentOrder.reduce((sum, item) => sum + item.price, 0);
    const extrasSubtotal = selectedExtras.reduce((sum, item) => sum + item.price, 0);
    const subtotal = coffeeSubtotal + extrasSubtotal;
    
    let discount = 0;
    if (selectedRole === 'student') {
        discount = subtotal * 0.05;
    }
    
    const total = subtotal - discount;
    
    const order = {
        id: orderId,
        items: [...currentOrder],
        extras: [...selectedExtras],
        subtotal: subtotal,
        discount: discount,
        total: total,
        role: selectedRole,
        lactoseTolerant: lactoseTolerant,
        selectedMilk: selectedMilk,
        deliveryMethod: deliveryMethod,
        deliveryLocation: deliveryLocation,
        timestamp: new Date().toISOString(),
        completed: false
    };
    
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    let message = `<strong>Order #${orderId}</strong><br>`;
    message += `Items:<br>`;
    currentOrder.forEach(item => {
        message += `• ${item.name} ${item.size !== 'Regular' ? '(' + item.size + ')' : ''} - P ${item.price.toFixed(2)}<br>`;
    });
    
    if (selectedExtras.length > 0) {
        message += `<br><strong>Treats:</strong><br>`;
        selectedExtras.forEach(extra => {
            message += `• ${extra.name} - P ${extra.price.toFixed(2)}<br>`;
        });
    }
    
    message += `<br>Subtotal: P ${subtotal.toFixed(2)}<br>`;
    if (discount > 0) {
        message += `Student Discount: -P ${discount.toFixed(2)}<br>`;
    }
    message += `<strong>Total: P ${total.toFixed(2)}</strong><br><br>`;
    
    if (deliveryMethod === 'delivery') {
        message += ` Delivery to: ${deliveryLocation}`;
    } else {
        message += ` Collection at counter`;
    }
    
    if (selectedMilk) {
        document.getElementById('milk-note').style.display = 'block';
        document.getElementById('selected-milk').textContent = selectedMilk;
    } else {
        document.getElementById('milk-note').style.display = 'none';
    }
    
    document.getElementById('confirmation-message').innerHTML = message;
    
    if (selectedRole === 'student') {
        document.getElementById('student-call-section').style.display = 'block';
        document.getElementById('staff-message').style.display = 'none';
    } else {
        document.getElementById('student-call-section').style.display = 'none';
        document.getElementById('staff-message').style.display = 'block';
    }
    
    document.getElementById('confirmation-popup').style.display = 'flex';
    
    // Reset order and return to main menu
    currentOrder = [];
    selectedExtras = [];
    selectedMilk = null;
    lactoseTolerant = true;
    deliveryMethod = null;
    deliveryLocation = null;
    updateOrderDisplay();
    disableCheckout();
    
    // Reset menu to show categories
    document.querySelectorAll('.category-items').forEach(category => {
        category.classList.add('active');
    });
    document.querySelectorAll('.category-toggle').forEach(toggle => {
        toggle.style.transform = 'rotate(0deg)';
    });
    
    // If on mobile, close the menu overlay
    const menu = document.getElementById('mainMenu');
    const toggle = document.getElementById('menuToggle');
    if (window.innerWidth <= 1024 && menu.classList.contains('show')) {
        menu.classList.remove('show');
        const icon = toggle.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
    
    setTimeout(() => {
        showRatingPopup();
    }, 2000);
}
function closeConfirmation() {
    document.getElementById('confirmation-popup').style.display = 'none';
}

function showRatingPopup() {
    document.getElementById('rating-popup').style.display = 'flex';
}

function closeRatingPopup() {
    document.getElementById('rating-popup').style.display = 'none';
}

function setRating(rating) {
    currentRating = rating;
    document.querySelectorAll('.rating-stars span').forEach((star, index) => {
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
    
    const rating = {
        rating: currentRating,
        review: review,
        timestamp: new Date().toISOString()
    };
    
    ratings.push(rating);
    localStorage.setItem('ratings', JSON.stringify(ratings));
    
    closeRatingPopup();
    showNotification('Thank you for your feedback!');
    
    currentRating = 0;
    document.getElementById('review-text').value = '';
    document.querySelectorAll('.rating-stars span').forEach(star => {
        star.classList.remove('active');
    });
    document.getElementById('selected-rating').textContent = '';
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #c49a6c;
        color: #2c1810;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        z-index: 2000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

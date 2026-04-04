// Helper: format numbers
function formatPrice(number) {
    const num = Number(number.toString().replace(/,/g, ''));
    if (isNaN(num)) return number;
    return num.toLocaleString();
}

// Data
let userListings = [];
const currentUser = {
    id: 'user-guest',
    name: 'Guest User',
    role: 'Buyer and Seller',
    accountType: 'Seller Profile',
    location: 'Set your trading location',
    phone: '+256 700 000000',
    email: 'guest@farmyard.app',
    verified: true,
    communityRating: 4.7,
    ratingCount: 18,
    security: {
        passwordUpdated: '30 days ago',
        twoFactorEnabled: false,
        activeSessions: 1,
        loginAlerts: true,
    },
    verificationPlan: {
        subscribed: false,
        price: 10,
        billing: 'monthly',
        renewalDate: null,
    },
};
const profiles = {
    'user-guest': {
        id: 'user-guest',
        name: 'Guest User',
        type: 'Seller Profile',
        about: 'Active on FarmYard for agriculture products, raw materials, finished goods, and services.',
        verified: true,
        verificationPlan: { subscribed: false, price: 10, billing: 'monthly', renewalDate: null },
        rating: 4.7,
        ratingCount: 18,
        completedDeals: 12,
        fields: {
            location: { label: 'Location', value: 'Set your trading location', visible: true },
            phone: { label: 'Phone', value: '+256 700 000000', visible: false },
            email: { label: 'Email', value: 'guest@farmyard.app', visible: false },
            businessHours: { label: 'Business Hours', value: 'Mon-Sat, 8:00 AM - 6:00 PM', visible: true },
        },
    },
    'seller-amina': {
        id: 'seller-amina',
        name: 'Amina Farm Supplies',
        type: 'Company Profile',
        about: 'Bulk produce supplier focused on maize, grains, and consistent farm-to-buyer fulfillment.',
        verified: true,
        verificationPlan: { subscribed: true, price: 10, billing: 'monthly', renewalDate: '2026-05-01' },
        rating: 4.8,
        ratingCount: 26,
        completedDeals: 41,
        fields: {
            location: { label: 'Location', value: 'Farm A', visible: true },
            phone: { label: 'Phone', value: '+256 701 224466', visible: false },
            email: { label: 'Email', value: 'sales@aminafarmsupplies.example', visible: true },
            delivery: { label: 'Delivery', value: 'Regional delivery available', visible: true },
        },
    },
    'seller-kato': {
        id: 'seller-kato',
        name: 'Kato Mechanics',
        type: 'Service Provider',
        about: 'Farm mechanization team offering ploughing, harrowing, and field preparation services.',
        verified: true,
        verificationPlan: { subscribed: true, price: 10, billing: 'monthly', renewalDate: '2026-05-10' },
        rating: 4.5,
        ratingCount: 14,
        completedDeals: 19,
        fields: {
            location: { label: 'Location', value: 'Farm B', visible: true },
            phone: { label: 'Phone', value: '+256 703 112233', visible: true },
            email: { label: 'Email', value: 'bookings@katomechanics.example', visible: false },
            equipment: { label: 'Equipment', value: '2 tractors and implements', visible: true },
        },
    },
    'seller-manure': {
        id: 'seller-manure',
        name: 'Green Soil Inputs',
        type: 'Seller Profile',
        about: 'Organic input supplier serving small and medium-sized farms.',
        verified: false,
        verificationPlan: { subscribed: false, price: 10, billing: 'monthly', renewalDate: null },
        rating: 4.1,
        ratingCount: 7,
        completedDeals: 8,
        fields: {
            location: { label: 'Location', value: 'Farm C', visible: true },
            phone: { label: 'Phone', value: '+256 704 445566', visible: false },
            email: { label: 'Email', value: 'greensoil@example.com', visible: false },
            sourcing: { label: 'Sourcing', value: 'Locally produced organic manure', visible: true },
        },
    },
    'seller-feed': {
        id: 'seller-feed',
        name: 'LayerPro Feed Mill',
        type: 'Company Profile',
        about: 'Finished agricultural feed producer supplying poultry operations across the region.',
        verified: true,
        verificationPlan: { subscribed: true, price: 10, billing: 'monthly', renewalDate: '2026-05-08' },
        rating: 4.9,
        ratingCount: 33,
        completedDeals: 52,
        fields: {
            location: { label: 'Location', value: 'Farm D', visible: true },
            phone: { label: 'Phone', value: '+256 705 778899', visible: true },
            email: { label: 'Email', value: 'orders@layerpro.example', visible: true },
            certification: { label: 'Certification', value: 'Feed quality tested', visible: true },
        },
    },
};
let savedListings = [];
let orderRequests = [];
let reportedListings = [];
let ratingsGiven = [];
let userReports = [];
let currentDetailListing = null;
let currentProfileId = null;
let activeFeedbackMode = 'rate';
const counterpartyProfiles = {
    'Amina Farm Supplies': { rating: 4.8, ratingCount: 26, reports: 0 },
    'Kato Mechanics': { rating: 4.5, ratingCount: 14, reports: 1 },
};
let conversations = [
    {
        id: 'conv-1',
        listingTitle: 'Maize Grain',
        contact: 'Amina Farm Supplies',
        role: 'Seller',
        location: 'Farm A',
        lastUpdated: 'Today, 10:24',
        messages: [
            { author: 'Amina Farm Supplies', text: 'Fresh maize grain is available this week.', time: '10:12', mine: false },
            { author: 'You', text: 'Can you supply 100kg by Friday?', time: '10:24', mine: true },
        ],
    },
    {
        id: 'conv-2',
        listingTitle: 'Tractor Ploughing',
        contact: 'Kato Mechanics',
        role: 'Service Provider',
        location: 'Farm B',
        lastUpdated: 'Yesterday',
        messages: [
            { author: 'Kato Mechanics', text: 'We cover ploughing and harrowing in nearby districts.', time: '17:45', mine: false },
        ],
    },
];
let activeConversationId = 'conv-1';
let mobileMessagesView = 'inbox';
let returnTabAfterAuth = 'home';
let tabHistory = [];
let isEditingProfile = false;

const app = document.getElementById('app');

// Main tabs
const tabs = {
    home: document.getElementById('home-tab'),
    post: document.getElementById('post-tab'),
    messages: document.getElementById('messages-tab'),
    account: document.getElementById('account-tab'),
    detail: document.getElementById('card-detail'),
    profile: document.getElementById('profile-tab'),
    legal: document.getElementById('legal-tab'),
};
const authScreens = {
    login: document.getElementById('login-screen'),
    register: document.getElementById('register-screen'),
};
const marketplace = document.getElementById('marketplace-grid');
const detailImage = document.getElementById('detail-image');
const detailTitle = document.getElementById('detail-title');
const detailVerification = document.getElementById('detail-verification');
const detailPrice = document.getElementById('detail-price');
const detailMinOrder = document.getElementById('detail-minOrder');
const detailLocation = document.getElementById('detail-location');
const detailNegotiable = document.getElementById('detail-negotiable');
const detailMessage = document.getElementById('detail-message');
const scheduleOrderPanel = document.getElementById('schedule-order-panel');
const scheduleDateInput = document.getElementById('schedule-date');
const scheduleTimeInput = document.getElementById('schedule-time');
const scheduleNoteInput = document.getElementById('schedule-note');
const profileType = document.getElementById('profile-type');
const profileName = document.getElementById('profile-name');
const profileRating = document.getElementById('profile-rating');
const profileAvatar = document.getElementById('profile-avatar');
const profileAbout = document.getElementById('profile-about');
const profileFields = document.getElementById('profile-fields');
const profileVerification = document.getElementById('profile-verification');
const profileStats = document.getElementById('profile-stats');
const conversationList = document.getElementById('conversation-list');
const activeChatTitle = document.getElementById('active-chat-title');
const activeChatMeta = document.getElementById('active-chat-meta');
const messagesEmpty = document.getElementById('messages-empty');
const chatThread = document.getElementById('chat-thread');
const messageInput = document.getElementById('message-input');
const messagesLayout = document.querySelector('.messages-layout');
const chatRateUserBtn = document.getElementById('chat-rate-user');
const chatReportUserBtn = document.getElementById('chat-report-user');
const chatFeedbackPanel = document.getElementById('chat-feedback-panel');
const chatFeedbackTitle = document.getElementById('chat-feedback-title');
const chatRatingInput = document.getElementById('chat-rating');
const chatFeedbackNote = document.getElementById('chat-feedback-note');
const toast = document.getElementById('toast');
const navButtons = {
    home: document.getElementById('nav-home'),
    post: document.getElementById('nav-post'),
    messages: document.getElementById('nav-messages'),
    account: document.getElementById('nav-account'),
};
let toastTimeoutId = null;

// Bottom nav
document.getElementById('nav-home').onclick = () => showTab('home');
document.getElementById('nav-post').onclick = () => showTab('post');
document.getElementById('nav-messages').onclick = () => {
    mobileMessagesView = 'inbox';
    showTab('messages');
};
document.getElementById('nav-account').onclick = () => { showTab('account'); renderUserListings(); };
document.getElementById('open-login').onclick = () => openAuthScreen('login');
document.getElementById('open-register').onclick = () => openAuthScreen('register');
document.getElementById('open-legal').onclick = () => showTab('legal');
document.getElementById('legal-back-home').onclick = () => showTab('home');
document.getElementById('show-register').onclick = () => openAuthScreen('register');
document.getElementById('show-login').onclick = () => openAuthScreen('login');
document.getElementById('login-btn').onclick = () => completeAuth('Welcome back to FarmYard');
document.getElementById('register-btn').onclick = () => completeAuth('Your account is ready');
document.getElementById('close-detail').onclick = () => goBack();
document.getElementById('detail-message').onclick = () => startConversationFromDetail();
document.getElementById('detail-call').onclick = () => showToast('Seller call action opened');
document.getElementById('detail-profile').onclick = () => openCurrentProfile();
document.getElementById('detail-save').onclick = () => saveCurrentListing();
document.getElementById('detail-order').onclick = () => requestCurrentOrder();
document.getElementById('detail-schedule').onclick = () => toggleSchedulePanel(true);
document.getElementById('detail-report').onclick = () => reportCurrentListing();
document.getElementById('schedule-confirm').onclick = () => scheduleCurrentOrder();
document.getElementById('schedule-cancel').onclick = () => toggleSchedulePanel(false);
document.getElementById('message-send').onclick = () => sendMessage();
chatRateUserBtn.onclick = () => openChatFeedback('rate');
chatReportUserBtn.onclick = () => openChatFeedback('report');
document.getElementById('chat-feedback-confirm').onclick = () => submitChatFeedback();
document.getElementById('chat-feedback-cancel').onclick = () => closeChatFeedback();
document.getElementById('messages-back').onclick = () => {
    mobileMessagesView = 'inbox';
    renderMessagesTab();
};
document.getElementById('close-profile').onclick = () => goBack();

// Show tab
function showTab(name, options = {}){
    const { skipHistory = false } = options;
    const activeTab = getActiveTabName();
    if (!skipHistory && activeTab && activeTab !== name) {
        tabHistory.push(activeTab);
    }
    app.style.display = 'block';
    Object.values(authScreens).forEach(screen => screen.style.display = 'none');
    Object.values(tabs).forEach(t => t.style.display = 'none');
    tabs[name].style.display = 'block';
    returnTabAfterAuth = name;
    updateNavState(name);
    if (name === 'messages') {
        renderMessagesTab();
    }
}

function openAuthScreen(name){
    const activeTab = getActiveTabName();
    if (activeTab) {
        returnTabAfterAuth = activeTab;
    }
    app.style.display = 'none';
    Object.values(authScreens).forEach(screen => screen.style.display = 'none');
    authScreens[name].style.display = 'flex';
}

function completeAuth(message){
    const isRegistering = authScreens.register.style.display === 'flex';
    const nameInput = document.getElementById('reg-name').value.trim();
    const emailInput = (isRegistering ? document.getElementById('reg-email') : document.getElementById('login-email')).value.trim();

    if (isRegistering && nameInput) {
        currentUser.name = nameInput;
    }
    if (emailInput) {
        currentUser.email = emailInput;
    }

    Object.values(authScreens).forEach(screen => screen.style.display = 'none');
    app.style.display = 'block';
    showTab(returnTabAfterAuth || 'home', { skipHistory: true });
    showToast(message);
}

function goBack(fallback = 'home'){
    const lastTab = tabHistory.pop();
    showTab(lastTab || fallback, { skipHistory: true });
}

function getActiveTabName(){
    const activeTab = Object.entries(tabs).find(([, element]) => element.style.display === 'block');
    return activeTab ? activeTab[0] : null;
}

// Post listing
document.getElementById('postBtn').onclick = () => {
    const category = document.getElementById('category').value.trim();
    const title = document.getElementById('title').value.trim();
    const price = document.getElementById('price').value.trim();
    const unit = document.getElementById('unit').value.trim();
    const minOrder = document.getElementById('minOrder').value.trim();
    const location = document.getElementById('location').value.trim();
    const description = document.getElementById('description').value.trim();
    const image = document.getElementById('image').files[0] ? URL.createObjectURL(document.getElementById('image').files[0]) : 'https://via.placeholder.com/150';
    const negotiable = document.getElementById('negotiable').checked;

    if (!category || !title || !price || !unit || !location) { alert('Fill all required fields'); return; }
    if (description.length > 220) { alert('Keep the description under 220 characters for now.'); return; }

    userListings.push({
        category,
        title,
        price,
        unit,
        minOrder,
        location,
        description,
        image,
        negotiable,
        slug: title.toLowerCase().replace(/\s+/g,'-'),
        verified: currentUser.verified,
        sellerId: currentUser.id,
    });

    refreshMarketplace();
    clearPostForm();
    showTab('home');
    showToast('Listing posted successfully');
};

function clearPostForm(){
    ['category','title','price','unit','minOrder','location','description','image'].forEach(id => document.getElementById(id).value='');
    document.getElementById('negotiable').checked = false;
}

// Refresh marketplace
function refreshMarketplace(){
    marketplace.innerHTML = '';
    const initialListings = getInitialListings();
    const all = [...initialListings, ...userListings];
    all.forEach((listing)=>{
        const isSaved = savedListings.some(item => item.slug === listing.slug);
        const sellerProfile = profiles[listing.sellerId];
        const verificationLabel = sellerProfile?.verificationPlan?.subscribed
            ? 'Verified Company'
            : (listing.verified ? 'Verified seller' : 'Standard seller');
        const verificationClass = sellerProfile?.verificationPlan?.subscribed ? 'company-badge' : '';
        const card = document.createElement('div');
        card.className='card';
        const verificationText = sellerProfile?.verificationPlan?.subscribed
            ? `<span class="badge-full">Verified Company</span><span class="badge-short">Verified</span>${isSaved ? ' • Saved' : ''}`
            : `${verificationLabel}${isSaved ? ' • Saved' : ''}`;
        card.innerHTML = `
            <img src="${listing.image}">
            <span class="card-category">${listing.category || 'General'}</span>
            <h3>${listing.title}</h3>
            <p class="card-summary ${verificationClass}">${verificationText}</p>
            <p class="card-summary">${listing.negotiable ? 'Price Negotiable' : 'UGX '+formatPrice(listing.price)+'/'+listing.unit}</p>
            <p class="card-summary">${listing.minOrder ? 'Minimum: '+listing.minOrder : 'Tap for full details'}</p>
            <p class="card-summary">📍 ${listing.location}</p>
            <button>Message</button>
            <button>Call</button>
        `;
        marketplace.appendChild(card);
        card.onclick = () => openListingDetail(listing);

        card.querySelector('button:first-of-type').onclick = (event)=>{
            event.stopPropagation();
            startConversation(listing);
        };
        card.querySelector('button:last-of-type').onclick = (event)=>{
            event.stopPropagation();
            showToast(`Calling seller of ${listing.title}`);
        };
    });
}

function getInitialListings(){
    return [
        { category: 'Produce', title: 'Maize Grain', price: '1200', unit: 'kg', minOrder: '50kg', location: 'Farm A', image: 'https://via.placeholder.com/150', negotiable: false, verified: true, slug: 'maize-grain', sellerId: 'seller-amina' },
        { category: 'Produce', title: 'Maize Grain', price: '1200', unit: 'kg', minOrder: '50kg', location: 'Farm A', image: 'https://via.placeholder.com/150', negotiable: false, verified: true, slug: 'maize-grain', sellerId: 'seller-amina' },
        { category: 'Services', title: 'Tractor Ploughing', price: '80000', unit: 'acre', location: 'Farm B', image: 'https://via.placeholder.com/150', negotiable: false, verified: true, slug: 'tractor-ploughing', sellerId: 'seller-kato' },
        { category: 'Raw Materials', title: 'Organic Manure', price: '35000', unit: 'bag', minOrder: '10 bags', location: 'Farm C', image: 'https://via.placeholder.com/150', negotiable: true, verified: false, slug: 'organic-manure', sellerId: 'seller-manure' },
        { category: 'Finished Goods', title: 'Layer Mash Feed', price: '95000', unit: 'bag', minOrder: '5 bags', location: 'Farm D', image: 'https://via.placeholder.com/150', negotiable: false, verified: true, slug: 'layer-mash-feed', sellerId: 'seller-feed' }
    ];
}

function saveCurrentListing(){
    if (!currentDetailListing) return;
    if (!savedListings.some(item => item.slug === currentDetailListing.slug)) {
        savedListings.push(currentDetailListing);
        showToast(`${currentDetailListing.title} saved to your account`);
    } else {
        showToast(`${currentDetailListing.title} is already saved`);
    }
    refreshMarketplace();
    renderUserListings();
}

function requestCurrentOrder(){
    if (!currentDetailListing) return;
    orderRequests.unshift({
        id: `order-${Date.now()}`,
        title: currentDetailListing.title,
        status: 'Pending confirmation',
        location: currentDetailListing.location,
        type: 'Request',
    });
    showToast(`Order request sent for ${currentDetailListing.title}`);
    renderUserListings();
}

function reportCurrentListing(){
    if (!currentDetailListing) return;
    if (!reportedListings.some(item => item.slug === currentDetailListing.slug)) {
        reportedListings.unshift({
            slug: currentDetailListing.slug,
            title: currentDetailListing.title,
            status: 'Under review',
        });
        showToast(`Report submitted for ${currentDetailListing.title}`);
    } else {
        showToast(`A report already exists for ${currentDetailListing.title}`);
    }
    renderUserListings();
}

function toggleSchedulePanel(show){
    if (!scheduleOrderPanel) return;
    scheduleOrderPanel.style.display = show ? 'block' : 'none';
    if (!show) {
        scheduleDateInput.value = '';
        scheduleTimeInput.value = '';
        scheduleNoteInput.value = '';
    }
}

function scheduleCurrentOrder(){
    if (!currentDetailListing) return;
    const date = scheduleDateInput.value;
    const time = scheduleTimeInput.value;
    const note = scheduleNoteInput.value.trim();

    if (!date || !time) {
        showToast('Choose a preferred date and time first.');
        return;
    }

    orderRequests.unshift({
        id: `order-${Date.now()}`,
        title: currentDetailListing.title,
        status: `Scheduled for ${date} at ${time}`,
        location: currentDetailListing.location,
        note,
        type: 'Scheduled',
    });
    toggleSchedulePanel(false);
    showToast(`Order scheduled for ${currentDetailListing.title}`);
    renderUserListings();
}

function openListingDetail(listing){
    currentDetailListing = listing;
    currentProfileId = listing.sellerId || currentUser.id;
    toggleSchedulePanel(false);
    detailMessage.dataset.listing = JSON.stringify({
        title: listing.title,
        location: listing.location,
        category: listing.category,
    });
    detailImage.src = listing.image;
    detailImage.alt = listing.title;
    detailTitle.textContent = listing.title;
    detailVerification.textContent = listing.verified ? 'Verified seller' : 'Standard seller';
    detailPrice.textContent = listing.negotiable ? 'Price: Negotiable' : 'Price: UGX ' + formatPrice(listing.price) + '/' + listing.unit;
    detailMinOrder.textContent = listing.minOrder ? 'Minimum order: ' + listing.minOrder : 'Minimum order: Flexible';
    detailLocation.textContent = 'Location: ' + listing.location;
    detailNegotiable.textContent = (listing.description ? listing.description + ' | ' : '') + 'Category: ' + (listing.category || 'General');
    detailMessage.textContent = 'Message Seller';
    document.getElementById('detail-save').textContent = savedListings.some(item => item.slug === listing.slug) ? 'Saved' : 'Save Listing';
    showTab('detail');
}

function openCurrentProfile(){
    if (!currentProfileId) return;
    openProfile(currentProfileId);
}

function openProfile(profileId){
    const profile = profiles[profileId];
    if (!profile) return;
    currentProfileId = profileId;
    profileType.textContent = profile.type;
    profileName.textContent = profile.name;
    profileRating.textContent = `${profile.rating.toFixed(1)} stars from ${profile.ratingCount} ratings`;
    profileAvatar.textContent = getInitials(profile.name);
    profileAbout.textContent = profile.about;
    profileVerification.textContent = profile.verificationPlan?.subscribed
        ? `Verified Company active • $${profile.verificationPlan.price}/${profile.verificationPlan.billing}${profile.verificationPlan.renewalDate ? ` • renews ${profile.verificationPlan.renewalDate}` : ''}`
        : (profile.verified ? 'Verified FarmYard profile' : 'Verification not yet completed');
    profileVerification.className = profile.verificationPlan?.subscribed ? 'detail-badge company-badge' : 'detail-badge';
    profileStats.textContent = `${profile.completedDeals} completed marketplace interactions`;
    profileFields.innerHTML = '';

    Object.values(profile.fields).forEach(field => {
        const item = document.createElement('div');
        item.className = 'profile-field';
        item.innerHTML = `
            <strong>${field.label}</strong>
            <p>${field.visible ? field.value : 'Hidden by seller'}</p>
        `;
        profileFields.appendChild(item);
    });

    showTab('profile');
}

function startConversationFromDetail(){
    const listing = JSON.parse(detailMessage.dataset.listing || '{}');
    if (!listing.title) return;
    startConversation({
        title: listing.title,
        location: listing.location || 'Marketplace',
    });
}

function startConversation(listing){
    const existingConversation = conversations.find(conversation => conversation.listingTitle === listing.title);
    if (existingConversation) {
        activeConversationId = existingConversation.id;
    } else {
        const newConversation = {
            id: `conv-${Date.now()}`,
            listingTitle: listing.title,
            contact: `${listing.title} Seller`,
            role: listing.category === 'Services' ? 'Service Provider' : 'Seller',
            location: listing.location || 'Marketplace',
            lastUpdated: 'Just now',
            messages: [
                { author: `${listing.title} Seller`, text: `Thanks for your interest in ${listing.title}. How can I help?`, time: 'Now', mine: false },
            ],
        };
        conversations.unshift(newConversation);
        activeConversationId = newConversation.id;
    }
    mobileMessagesView = 'chat';
    showTab('messages');
    showToast(`Opened conversation for ${listing.title}`);
}

function renderMessagesTab(){
    conversationList.innerHTML = '';
    const activeConversation = conversations.find(conversation => conversation.id === activeConversationId) || conversations[0];

    if (!activeConversation && !conversations.length) {
        activeChatTitle.textContent = 'No conversations yet';
        activeChatMeta.textContent = 'Message a seller from any listing to start chatting here.';
        messagesEmpty.style.display = 'block';
        chatThread.innerHTML = '';
        syncMessagesView();
        return;
    }

    if (activeConversation) {
        activeConversationId = activeConversation.id;
    }

    conversations.forEach(conversation => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = `conversation-card${conversation.id === activeConversationId ? ' active' : ''}`;
        card.innerHTML = `
            <strong>${conversation.contact}</strong>
            <p>${conversation.listingTitle}</p>
            <p>${conversation.role} • ${conversation.location}</p>
            <p>${conversation.lastUpdated}</p>
        `;
        card.onclick = () => {
            activeConversationId = conversation.id;
            mobileMessagesView = 'chat';
            renderMessagesTab();
        };
        conversationList.appendChild(card);
    });

    renderActiveConversation();
    syncMessagesView();
}

function renderActiveConversation(){
    const conversation = conversations.find(item => item.id === activeConversationId);
    if (!conversation) return;
    const profile = getCounterpartyProfile(conversation.contact);

    activeChatTitle.textContent = conversation.contact;
    activeChatMeta.textContent = `${conversation.listingTitle} • ${conversation.role} • ${conversation.location} • ${profile.rating.toFixed(1)} stars`;
    messagesEmpty.style.display = 'none';
    chatThread.innerHTML = '';

    conversation.messages.forEach(message => {
        const bubble = document.createElement('div');
        bubble.className = `message-bubble${message.mine ? ' mine' : ''}`;
        bubble.innerHTML = `
            <p>${message.text}</p>
            <span class="message-meta">${message.author} • ${message.time}</span>
        `;
        chatThread.appendChild(bubble);
    });
}

function sendMessage(){
    const text = messageInput.value.trim();
    const conversation = conversations.find(item => item.id === activeConversationId);
    if (!text || !conversation) return;

    conversation.messages.push({
        author: 'You',
        text,
        time: 'Now',
        mine: true,
    });
    conversation.lastUpdated = 'Just now';
    messageInput.value = '';
    renderMessagesTab();
    showToast('Message sent');
}

function syncMessagesView(){
    if (!messagesLayout) return;
    messagesLayout.dataset.mobileView = mobileMessagesView;
}

function showToast(message){
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    if (toastTimeoutId) {
        clearTimeout(toastTimeoutId);
    }
    toastTimeoutId = setTimeout(() => {
        toast.classList.remove('show');
    }, 2200);
}

function updateNavState(activeTab){
    Object.entries(navButtons).forEach(([key, button]) => {
        if (!button) return;
        button.classList.toggle('is-active', key === activeTab);
    });
}

function openChatFeedback(mode){
    const conversation = conversations.find(item => item.id === activeConversationId);
    if (!conversation) return;
    activeFeedbackMode = mode;
    chatFeedbackPanel.style.display = 'block';
    chatFeedbackTitle.textContent = mode === 'rate' ? `Rate ${conversation.contact}` : `Report ${conversation.contact}`;
    chatRatingInput.style.display = mode === 'rate' ? 'block' : 'none';
    document.querySelector('label[for="chat-rating"]').style.display = mode === 'rate' ? 'block' : 'none';
    chatFeedbackNote.placeholder = mode === 'rate' ? 'Share a short rating note' : 'Describe the problem briefly';
}

function closeChatFeedback(){
    chatFeedbackPanel.style.display = 'none';
    chatRatingInput.value = '';
    chatFeedbackNote.value = '';
}

function submitChatFeedback(){
    const conversation = conversations.find(item => item.id === activeConversationId);
    if (!conversation) return;
    const note = chatFeedbackNote.value.trim();
    const profile = getCounterpartyProfile(conversation.contact);

    if (activeFeedbackMode === 'rate') {
        const rating = Number(chatRatingInput.value);
        if (!rating) {
            showToast('Select a rating first');
            return;
        }
        profile.rating = ((profile.rating * profile.ratingCount) + rating) / (profile.ratingCount + 1);
        profile.ratingCount += 1;
        ratingsGiven.unshift({ contact: conversation.contact, rating, note: note || 'No note' });
        showToast(`You rated ${conversation.contact}`);
    } else {
        if (!note) {
            showToast('Add a short reason for the report');
            return;
        }
        profile.reports += 1;
        userReports.unshift({ contact: conversation.contact, note, status: 'Submitted' });
        showToast(`Report sent for ${conversation.contact}`);
    }

    closeChatFeedback();
    renderMessagesTab();
    renderUserListings();
}

function getCounterpartyProfile(contact){
    if (!counterpartyProfiles[contact]) {
        counterpartyProfiles[contact] = { rating: 5, ratingCount: 1, reports: 0 };
    }
    return counterpartyProfiles[contact];
}

// Render account listings
function renderUserListings(){
    const acc = tabs.account;
    const negotiableCount = userListings.filter(listing => listing.negotiable).length;
    const categories = new Set(userListings.map(listing => listing.category)).size;
    const savedCount = savedListings.length;
    const ordersCount = orderRequests.length;
    const reportsCount = reportedListings.length;
    const ratingsGivenCount = ratingsGiven.length;
    const userReportsCount = userReports.length;

    acc.innerHTML = `
        <section class="account-section account-hero">
            <div>
                <p class="account-kicker">Account</p>
                <h2>${currentUser.name}</h2>
                <p>${currentUser.role}</p>
                <p>${currentUser.location}</p>
                <p>${currentUser.verified ? 'Verified FarmYard member' : 'Verification pending'}</p>
                <p>${currentUser.communityRating.toFixed(1)} stars from ${currentUser.ratingCount} ratings</p>
            </div>
            <div class="account-avatar">${getInitials(currentUser.name)}</div>
        </section>

        <section class="account-section account-grid">
            <div class="account-card stat-card">
                <span class="stat-number">${userListings.length}</span>
                <p>Active listings</p>
            </div>
            <div class="account-card stat-card">
                <span class="stat-number">${categories}</span>
                <p>Categories used</p>
            </div>
            <div class="account-card stat-card">
                <span class="stat-number">${negotiableCount}</span>
                <p>Negotiable listings</p>
            </div>
            <div class="account-card stat-card">
                <span class="stat-number">${savedCount}</span>
                <p>Saved listings</p>
            </div>
            <div class="account-card stat-card">
                <span class="stat-number">${ordersCount}</span>
                <p>Order requests</p>
            </div>
            <div class="account-card stat-card">
                <span class="stat-number">${reportsCount}</span>
                <p>Reports made</p>
            </div>
            <div class="account-card stat-card">
                <span class="stat-number">${ratingsGivenCount}</span>
                <p>Ratings given</p>
            </div>
            <div class="account-card stat-card">
                <span class="stat-number">${userReportsCount}</span>
                <p>User reports filed</p>
            </div>
        </section>

        <section class="account-section account-card">
            <h3>Profile Details</h3>
            <p><strong>Email:</strong> ${currentUser.email}</p>
            <p><strong>Phone:</strong> ${currentUser.phone}</p>
            <p><strong>Verification:</strong> ${currentUser.verified ? 'Verified account' : 'Verification required'}</p>
            <p><strong>Account type:</strong> ${currentUser.accountType}</p>
            <p><strong>Community rating:</strong> ${currentUser.communityRating.toFixed(1)} / 5</p>
            <p><strong>Trading focus:</strong> Agriculture products, raw materials, finished goods, and services</p>
            <div class="profile-summary-actions">
                <button id="open-profile-editor" type="button">${isEditingProfile ? 'Close Editor' : 'Edit Profile'}</button>
                <button id="view-profile-btn" type="button">View Public Profile</button>
            </div>
        </section>

        <section class="account-section account-card">
            <h3>Verified Company</h3>
            <p><strong>Plan:</strong> $${currentUser.verificationPlan.price}/${currentUser.verificationPlan.billing}</p>
            <p><strong>Status:</strong> ${currentUser.verificationPlan.subscribed ? 'Active subscription' : 'Not subscribed'}</p>
            <p><strong>Renewal date:</strong> ${currentUser.verificationPlan.renewalDate || 'No renewal date set'}</p>
            <p>Verified Company is designed for businesses that want a stronger trust badge and clearer visibility as a company on FarmYard.</p>
            <div class="security-actions">
                <button id="subscribe-verification-btn" type="button">${currentUser.verificationPlan.subscribed ? 'Manage Verified Company' : 'Get Verified Company'}</button>
                <button id="view-verification-term-btn" type="button">View Verification Term</button>
            </div>
        </section>

        <section class="account-section account-card profile-editor ${isEditingProfile ? 'is-visible' : ''}">
            <h3>Edit Profile</h3>
            <div class="profile-edit-grid">
                <div>
                    <label for="edit-name">Display name</label>
                    <input id="edit-name" type="text" value="${currentUser.name}">
                </div>
                <div>
                    <label for="edit-role">Role</label>
                    <input id="edit-role" type="text" value="${currentUser.role}">
                </div>
                <div>
                    <label for="edit-location">Location</label>
                    <input id="edit-location" type="text" value="${profiles[currentUser.id].fields.location.value}">
                </div>
                <div>
                    <label for="edit-phone">Phone</label>
                    <input id="edit-phone" type="text" value="${currentUser.phone}">
                </div>
                <div>
                    <label for="edit-email">Email</label>
                    <input id="edit-email" type="email" value="${currentUser.email}">
                </div>
                <div>
                    <label for="edit-hours">Business hours</label>
                    <input id="edit-hours" type="text" value="${profiles[currentUser.id].fields.businessHours?.value || ''}">
                </div>
            </div>
            <label for="edit-about">About</label>
            <textarea id="edit-about" rows="4">${profiles[currentUser.id].about}</textarea>
            <div class="profile-edit-actions">
                <button id="save-profile-btn" type="button">Save Profile</button>
                <button id="cancel-profile-edit" type="button">Cancel</button>
            </div>
        </section>

        <section class="account-section account-card">
            <h3>Profile Privacy</h3>
            <p>Choose what buyers and other sellers can see on your public profile.</p>
            <div class="privacy-controls">
                <button id="toggle-location-visibility" type="button">${profiles[currentUser.id].fields.location.visible ? 'Hide' : 'Show'} Location</button>
                <button id="toggle-phone-visibility" type="button">${profiles[currentUser.id].fields.phone.visible ? 'Hide' : 'Show'} Phone</button>
                <button id="toggle-email-visibility" type="button">${profiles[currentUser.id].fields.email.visible ? 'Hide' : 'Show'} Email</button>
            </div>
        </section>

        <section class="account-section account-card">
            <h3>Account Security</h3>
            <p><strong>Password updated:</strong> ${currentUser.security.passwordUpdated}</p>
            <p><strong>Two-factor authentication:</strong> ${currentUser.security.twoFactorEnabled ? 'Enabled' : 'Not enabled'}</p>
            <p><strong>Active sessions:</strong> ${currentUser.security.activeSessions}</p>
            <p><strong>Login alerts:</strong> ${currentUser.security.loginAlerts ? 'Enabled' : 'Disabled'}</p>
            <div class="security-actions">
                <button id="change-password-btn" type="button">Change Password</button>
                <button id="toggle-2fa-btn" type="button">${currentUser.security.twoFactorEnabled ? 'Disable' : 'Enable'} 2FA</button>
                <button id="toggle-alerts-btn" type="button">${currentUser.security.loginAlerts ? 'Disable' : 'Enable'} Alerts</button>
                <button id="signout-sessions-btn" type="button">Sign Out Other Sessions</button>
            </div>
        </section>

        <section class="account-section account-card">
            <h3>Quick Actions</h3>
            <div class="account-actions">
                <button id="account-post-btn" type="button">Post New Listing</button>
                <button id="account-home-btn" type="button">View Marketplace</button>
                <button id="account-legal-btn" type="button">Privacy & Terms</button>
            </div>
        </section>

        <section class="account-section">
            <div class="account-listings-header">
                <h3>My Listings</h3>
                <p>Manage the listings buyers can currently see.</p>
            </div>
            <div id="account-listings-grid" class="account-listings-grid"></div>
        </section>

        <section class="account-section account-grid">
            <div class="account-card">
                <h3>Saved Listings</h3>
                <div id="saved-listings"></div>
            </div>
            <div class="account-card">
                <h3>Order Requests</h3>
                <div id="order-requests"></div>
            </div>
        </section>

        <section class="account-section account-grid">
            <div class="account-card">
                <h3>Ratings Given</h3>
                <div id="ratings-given"></div>
            </div>
            <div class="account-card">
                <h3>User Reports</h3>
                <div id="user-reports"></div>
            </div>
        </section>

        <section class="account-section account-card">
            <h3>Reports and Moderation</h3>
            <div id="moderation-items"></div>
        </section>
    `;

    document.getElementById('account-post-btn').onclick = () => showTab('post');
    document.getElementById('account-home-btn').onclick = () => showTab('home');
    document.getElementById('account-legal-btn').onclick = () => showTab('legal');
    document.getElementById('open-profile-editor').onclick = () => toggleProfileEditor();
    document.getElementById('save-profile-btn').onclick = () => saveProfileEdits();
    document.getElementById('view-profile-btn').onclick = () => openProfile(currentUser.id);
    document.getElementById('subscribe-verification-btn').onclick = () => toggleCompanyVerification();
    document.getElementById('view-verification-term-btn').onclick = () => showTab('legal');
    document.getElementById('cancel-profile-edit').onclick = () => toggleProfileEditor(false);
    document.getElementById('toggle-location-visibility').onclick = () => toggleProfileVisibility('location');
    document.getElementById('toggle-phone-visibility').onclick = () => toggleProfileVisibility('phone');
    document.getElementById('toggle-email-visibility').onclick = () => toggleProfileVisibility('email');
    document.getElementById('change-password-btn').onclick = () => changePassword();
    document.getElementById('toggle-2fa-btn').onclick = () => toggleTwoFactor();
    document.getElementById('toggle-alerts-btn').onclick = () => toggleLoginAlerts();
    document.getElementById('signout-sessions-btn').onclick = () => signOutOtherSessions();
    renderAccountExtras();

    const listingsGrid = document.getElementById('account-listings-grid');
    if(!userListings.length){
        listingsGrid.innerHTML = `
            <div class="account-card empty-state">
                <h3>No listings yet</h3>
                <p>Your produce, raw materials, finished goods, and farm services will appear here once posted.</p>
                <button id="empty-post-btn" type="button">Create First Listing</button>
            </div>
        `;
        document.getElementById('empty-post-btn').onclick = () => showTab('post');
        return;
    }

    userListings.forEach((l,i)=>{
        const card = document.createElement('div');
        card.className='card account-listing-card';
        card.innerHTML = `
            <img src="${l.image}">
            <span class="card-category">${l.category || 'General'}</span>
            <h3>${l.title}</h3>
            <p>${l.negotiable ? 'Price Negotiable' : 'UGX '+formatPrice(l.price)+'/'+l.unit}</p>
            ${l.minOrder?`<p>Minimum: ${l.minOrder}</p>`:''}
            <p>📍 ${l.location}</p>
            ${l.description ? `<p class="card-summary">${l.description}</p>` : ''}
            <button class="edit-btn" data-index="${i}">Edit</button>
            <button class="delete-btn" data-index="${i}">Delete</button>
        `;
        listingsGrid.appendChild(card);
        card.querySelector('.delete-btn').onclick = ()=>{ userListings.splice(i,1); renderUserListings(); refreshMarketplace(); };
        card.querySelector('.edit-btn').onclick = ()=>{
            document.getElementById('category').value=l.category || '';
            document.getElementById('title').value=l.title;
            document.getElementById('price').value=l.price;
            document.getElementById('unit').value=l.unit;
            document.getElementById('minOrder').value=l.minOrder;
            document.getElementById('location').value=l.location;
            document.getElementById('description').value=l.description || '';
            document.getElementById('negotiable').checked=l.negotiable;
            showTab('post');
        };
    });
}

function renderAccountExtras(){
    const savedContainer = document.getElementById('saved-listings');
    const ordersContainer = document.getElementById('order-requests');
    const moderationContainer = document.getElementById('moderation-items');
    const ratingsContainer = document.getElementById('ratings-given');
    const userReportsContainer = document.getElementById('user-reports');

    savedContainer.innerHTML = savedListings.length
        ? savedListings.map(item => `<p>${item.title} • ${item.location}</p>`).join('')
        : '<p class="card-summary">No saved listings yet.</p>';

    ordersContainer.innerHTML = orderRequests.length
        ? orderRequests.map(item => `<p>${item.title} • ${item.type}: ${item.status}${item.note ? ` • ${item.note}` : ''}</p>`).join('')
        : '<p class="card-summary">No order requests yet.</p>';

    moderationContainer.innerHTML = reportedListings.length
        ? reportedListings.map(item => `<p>${item.title} • ${item.status}</p>`).join('')
        : '<p class="card-summary">No moderation cases yet.</p>';

    ratingsContainer.innerHTML = ratingsGiven.length
        ? ratingsGiven.map(item => `<p>${item.contact} • ${item.rating}/5${item.note ? ` • ${item.note}` : ''}</p>`).join('')
        : '<p class="card-summary">No user ratings submitted yet.</p>';

    userReportsContainer.innerHTML = userReports.length
        ? userReports.map(item => `<p>${item.contact} • ${item.status} • ${item.note}</p>`).join('')
        : '<p class="card-summary">No user reports filed yet.</p>';
}

function toggleProfileVisibility(fieldKey){
    const profile = profiles[currentUser.id];
    if (!profile?.fields[fieldKey]) return;
    profile.fields[fieldKey].visible = !profile.fields[fieldKey].visible;
    showToast(`${profile.fields[fieldKey].label} visibility updated`);
    renderUserListings();
}

function saveProfileEdits(){
    const profile = profiles[currentUser.id];
    if (!profile) return;

    const name = document.getElementById('edit-name').value.trim();
    const role = document.getElementById('edit-role').value.trim();
    const location = document.getElementById('edit-location').value.trim();
    const phone = document.getElementById('edit-phone').value.trim();
    const email = document.getElementById('edit-email').value.trim();
    const hours = document.getElementById('edit-hours').value.trim();
    const about = document.getElementById('edit-about').value.trim();

    if (!name || !role || !location || !phone || !email) {
        showToast('Fill in the main profile details first');
        return;
    }

    currentUser.name = name;
    currentUser.role = role;
    currentUser.location = location;
    currentUser.phone = phone;
    currentUser.email = email;

    profile.name = name;
    profile.about = about || profile.about;
    profile.fields.location.value = location;
    profile.fields.phone.value = phone;
    profile.fields.email.value = email;
    if (profile.fields.businessHours) {
        profile.fields.businessHours.value = hours || profile.fields.businessHours.value;
    } else if (hours) {
        profile.fields.businessHours = { label: 'Business Hours', value: hours, visible: true };
    }

    showToast('Profile updated successfully');
    isEditingProfile = false;
    renderUserListings();
}

function toggleProfileEditor(forceState){
    isEditingProfile = typeof forceState === 'boolean' ? forceState : !isEditingProfile;
    renderUserListings();
}

function toggleCompanyVerification(){
    const plan = currentUser.verificationPlan;
    const profile = profiles[currentUser.id];

    if (!plan.subscribed) {
        plan.subscribed = true;
        plan.renewalDate = '2026-05-04';
        currentUser.accountType = 'Company Profile';
        currentUser.verified = true;
        profile.type = 'Company Profile';
        profile.verified = true;
        profile.verificationPlan = { ...plan };
        showToast('Verified Company subscription activated for $10/month');
    } else {
        showToast('Verified Company is active. Cancel before renewal to stop the next monthly charge.');
    }

    renderUserListings();
}

function changePassword(){
    currentUser.security.passwordUpdated = 'Just now';
    showToast('Password update started');
    renderUserListings();
}

function toggleTwoFactor(){
    currentUser.security.twoFactorEnabled = !currentUser.security.twoFactorEnabled;
    showToast(`Two-factor authentication ${currentUser.security.twoFactorEnabled ? 'enabled' : 'disabled'}`);
    renderUserListings();
}

function toggleLoginAlerts(){
    currentUser.security.loginAlerts = !currentUser.security.loginAlerts;
    showToast(`Login alerts ${currentUser.security.loginAlerts ? 'enabled' : 'disabled'}`);
    renderUserListings();
}

function signOutOtherSessions(){
    currentUser.security.activeSessions = 1;
    showToast('Other sessions signed out');
    renderUserListings();
}

function getInitials(name){
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0].toUpperCase())
        .join('') || 'GU';
}

// Initial
showTab('home');
refreshMarketplace();
renderMessagesTab();

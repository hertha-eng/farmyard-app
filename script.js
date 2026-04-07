// Helper: format numbers
function formatPrice(number) {
    const num = Number(number.toString().replace(/,/g, ''));
    if (isNaN(num)) return number;
    return num.toLocaleString();
}

const SUPABASE_URL = 'https://gekjlypawswkjmaamwme.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_mOsnuYtcElQ0Qj9HzqV5rA_dItzoREq';
const supabaseClient = window.supabase?.createClient
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
        },
    })
    : null;
const SUPABASE_TABLES = {
    profiles: 'profiles',
    listings: 'listings',
    conversations: 'conversations',
    messages: 'messages',
};
const LOCAL_STATE_KEY = 'farmyard-local-state-v1';
const LAST_ACTIVE_TAB_KEY = 'farmyard-last-active-tab';
const AGRICULTURE_KEYWORDS = [
    'agriculture', 'agricultural', 'farm', 'farming', 'farmer', 'crop', 'crops', 'harvest',
    'produce', 'grain', 'grains', 'maize', 'corn', 'beans', 'rice', 'cassava', 'banana',
    'plantain', 'coffee', 'tea', 'sorghum', 'millet', 'groundnut', 'peanut', 'soy', 'soybean',
    'tomato', 'onion', 'cabbage', 'pepper', 'okra', 'carrot', 'potato', 'avocado', 'mango',
    'fruit', 'vegetable', 'vegetables', 'seed', 'seeds', 'seedling', 'seedlings', 'nursery',
    'fertilizer', 'manure', 'compost', 'pesticide', 'herbicide', 'feed', 'hay', 'silage',
    'livestock', 'poultry', 'chicken', 'broiler', 'layer', 'goat', 'goats', 'cow', 'cattle',
    'dairy', 'milk', 'egg', 'eggs', 'pig', 'pigs', 'fish', 'fingerling', 'beekeeping', 'honey',
    'tractor', 'plough', 'ploughing', 'harrow', 'irrigation', 'greenhouse', 'acre', 'hectare',
    'farm input', 'farm inputs', 'feed mill'
];
const NON_AGRICULTURE_KEYWORDS = [
    'iphone', 'smartphone', 'phone', 'android phone', 'laptop', 'macbook', 'tablet', 'airpods',
    'television', 'tv', 'speaker', 'headphones', 'fridge', 'microwave', 'sofa', 'mattress',
    'handbag', 'shoes', 'sneakers', 'dress', 'watch', 'jewelry', 'perfume', 'makeup',
    'playstation', 'ps5', 'xbox', 'gaming', 'crypto', 'forex'
];

const DEFAULT_SECURITY = {
    passwordUpdated: '30 days ago',
    twoFactorEnabled: false,
    activeSessions: 1,
    loginAlerts: true,
};

const DEFAULT_VERIFICATION_PLAN = {
    subscribed: false,
    price: 10,
    billing: 'monthly',
    renewalDate: null,
};

// Data
let userListings = [];
let marketplaceListings = [];
const currentUser = {
    id: 'user-guest',
    name: 'Guest User',
    avatarUrl: '',
    role: 'Sales Representative',
    accountType: 'Individual Profile',
    location: 'Kampala',
    phone: '+256 700 000000',
    email: 'guest@farmyard.app',
    verified: false,
    communityRating: 4.7,
    ratingCount: 18,
    companyId: 'company-farmyard-traders',
    companyRole: 'Admin',
    accessStatus: 'Active company access',
    permissions: {
        canPostForCompany: true,
        canManageCompany: true,
        canApproveInvites: true,
    },
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
        avatarUrl: '',
        type: 'Individual Profile',
        about: 'Agricultural sales representative handling listings and buyer communication on behalf of a registered company.',
        verified: false,
        verificationPlan: { subscribed: false, price: 10, billing: 'monthly', renewalDate: null },
        rating: 4.7,
        ratingCount: 18,
        completedDeals: 12,
        fields: {
            location: { label: 'Location', value: 'Kampala', visible: true },
            phone: { label: 'Phone', value: '+256 700 000000', visible: false },
            email: { label: 'Email', value: 'guest@farmyard.app', visible: false },
            companyRole: { label: 'Company Role', value: 'Admin sales representative', visible: true },
            companyName: { label: 'Selling For', value: 'FarmYard Traders Ltd', visible: true },
        },
    },
    'company-farmyard-traders': {
        id: 'company-farmyard-traders',
        name: 'FarmYard Traders Ltd',
        avatarUrl: '',
        type: 'Company Profile',
        about: 'Registered agricultural trading company supplying produce and farm inputs through a managed sales team.',
        verified: false,
        verificationPlan: { subscribed: false, price: 10, billing: 'monthly', renewalDate: null },
        rating: 4.8,
        ratingCount: 23,
        completedDeals: 36,
        fields: {
            location: { label: 'Head Office', value: 'Kampala Industrial Area', visible: true },
            phone: { label: 'Company Phone', value: '+256 709 000111', visible: true },
            email: { label: 'Company Email', value: 'sales@farmyardtraders.example', visible: true },
            registration: { label: 'Registration', value: 'FTL-AGR-2026', visible: true },
            certification: { label: 'Permits or Certifications', value: '', visible: true },
            team: { label: 'Sales Team', value: '3 active representatives', visible: true },
        },
    },
    'seller-amina': {
        id: 'seller-amina',
        name: 'Amina Farm Supplies',
        avatarUrl: '',
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
        avatarUrl: '',
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
        avatarUrl: '',
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
        avatarUrl: '',
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
const companyAccounts = {
    'company-farmyard-traders': {
        id: 'company-farmyard-traders',
        name: 'FarmYard Traders Ltd',
        maxSalesMembers: 4,
        members: [
            { id: 'user-guest', name: 'Guest User', email: 'guest@farmyard.app', phone: '+256 700 000000', nationalId: 'UG-000111', role: 'Admin', status: 'Active', joinedAt: '2026-04-01' },
            { id: 'rep-1', name: 'Sarah Namusoke', email: 'sarah@farmyardtraders.example', phone: '+256 711 222444', nationalId: 'UG-222444', role: 'Sales Representative', status: 'Active', joinedAt: '2026-04-02' },
            { id: 'rep-2', name: 'Joel Kato', email: 'joel@farmyardtraders.example', phone: '+256 712 333555', nationalId: 'UG-333555', role: 'Sales Representative', status: 'Active', joinedAt: '2026-04-03' },
        ],
        pendingInvites: [
            {
                id: 'invite-1',
                name: 'Mercy Atuhairwe',
                email: 'mercy@farmyardtraders.example',
                phone: '+256 710 222333',
                nationalId: 'CM-448211',
                inviteCode: 'FY-TRADERS-4821',
                role: 'Sales Representative',
                status: 'Sent',
                linkedUserId: null,
                claimedAt: null,
                createdAt: '2026-04-05',
                expiresOn: '2026-04-19',
            },
        ],
        verificationRequirements: {
            businessRegistration: true,
            companyEmail: true,
            companyPhone: true,
            businessLocation: true,
            completeProfile: true,
            goodStanding: true,
            permits: false,
        },
    },
};
const userAccounts = {
    'guest@farmyard.app': {
        id: 'user-guest',
        name: 'Guest User',
        avatarUrl: '',
        role: 'Sales Representative',
        accountType: 'Individual Profile',
        location: 'Kampala',
        phone: '+256 700 000000',
        email: 'guest@farmyard.app',
        verified: false,
        communityRating: 4.7,
        ratingCount: 18,
        companyId: 'company-farmyard-traders',
        companyRole: 'Admin',
        accessStatus: 'Active company access',
        permissions: {
            canPostForCompany: true,
            canManageCompany: true,
            canApproveInvites: true,
        },
        security: { ...DEFAULT_SECURITY },
        verificationPlan: { ...DEFAULT_VERIFICATION_PLAN },
    },
};

loadLocalAppState();

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
const fallbackConversations = [
    {
        id: 'conv-1',
        listingTitle: 'Maize Grain',
        contact: 'Amina Farm Supplies',
        sellerId: 'seller-amina',
        role: 'Seller',
        location: 'Farm A',
        online: true,
        lastSeen: 'now',
        lastUpdated: 'Today, 10:24',
        messages: [
            { author: 'Amina Farm Supplies', text: 'Fresh maize grain is available this week.', time: '10:12', sentAt: '2026-04-06T10:12:00', mine: false },
            { author: 'You', text: 'Can you supply 100kg by Friday?', time: '10:24', sentAt: '2026-04-06T10:24:00', mine: true },
        ],
    },
    {
        id: 'conv-2',
        listingTitle: 'Tractor Ploughing',
        contact: 'Kato Mechanics',
        sellerId: 'seller-kato',
        role: 'Service Provider',
        location: 'Farm B',
        online: false,
        lastSeen: '2 hours ago',
        lastUpdated: 'Yesterday',
        messages: [
            { author: 'Kato Mechanics', text: 'We cover ploughing and harrowing in nearby districts.', time: '17:45', sentAt: '2026-04-05T17:45:00', mine: false },
        ],
    },
];
let conversations = [...fallbackConversations];
let activeConversationId = 'conv-1';
let mobileMessagesView = 'inbox';
let returnTabAfterAuth = 'home';
let tabHistory = [];
let isEditingProfile = false;
let isEditingCompanyProfile = false;
let isCreatingCompanyProfile = false;
let isEditingOwnProfilePhoto = false;
let isInvitingSalesRep = false;
let showCompanyTeamMembers = false;
let showCompanyPendingInvites = false;
let editingListingIndex = null;
let hasWarnedAboutPersistenceSetup = false;
let marketQuery = '';
let selectedMessageMedia = [];
let activeCallConversationId = null;
let activeCallStream = null;
let activeCallStartedAt = null;
let activeCallTimerId = null;
let isCallMuted = false;
let isSpeakerMode = false;
let messagesRealtimeChannel = null;
let messagesRealtimeRefreshPromise = null;
let messagesRealtimeRefreshQueued = false;

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
const marketSearchInput = document.getElementById('market-search');
const marketResultsCopy = document.getElementById('market-results-copy');
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
const profileAdminTools = document.getElementById('profile-admin-tools');
const profileAboutCard = profileAbout?.closest('.profile-card');
const profileFieldsCard = profileFields?.closest('.profile-card');
const profileTrustCard = profileVerification?.closest('.profile-card');
const conversationList = document.getElementById('conversation-list');
const activeChatAvatar = document.getElementById('active-chat-avatar');
const activeChatTitle = document.getElementById('active-chat-title');
const activeChatMeta = document.getElementById('active-chat-meta');
const messagesEmpty = document.getElementById('messages-empty');
const chatThread = document.getElementById('chat-thread');
const messageInput = document.getElementById('message-input');
const messageMediaInput = document.getElementById('message-media-input');
const messageMediaPreview = document.getElementById('message-media-preview');
const messageAttachButton = document.getElementById('message-attach');
const chatCallButton = document.getElementById('chat-call-btn');
const chatOptionsButton = document.getElementById('chat-options-btn');
const chatOptionsMenu = document.getElementById('chat-options-menu');
const chatOptionProfileButton = document.getElementById('chat-option-profile');
const chatOptionCallButton = document.getElementById('chat-option-call');
const chatOptionRateButton = document.getElementById('chat-option-rate');
const chatOptionReportButton = document.getElementById('chat-option-report');
const chatOptionDeleteButton = document.getElementById('chat-option-delete');
const callScreen = document.getElementById('call-screen');
const callAvatar = document.getElementById('call-avatar');
const callName = document.getElementById('call-name');
const callStatus = document.getElementById('call-status');
const callDuration = document.getElementById('call-duration');
const callMuteButton = document.getElementById('call-mute-btn');
const callSpeakerButton = document.getElementById('call-speaker-btn');
const callEndButton = document.getElementById('call-end-btn');
const messagesLayout = document.querySelector('.messages-layout');
const chatRateUserBtn = document.getElementById('chat-rate-user');
const chatReportUserBtn = document.getElementById('chat-report-user');
const chatFeedbackPanel = document.getElementById('chat-feedback-panel');
const chatFeedbackTitle = document.getElementById('chat-feedback-title');
const chatRatingInput = document.getElementById('chat-rating');
const chatFeedbackNote = document.getElementById('chat-feedback-note');
const toast = document.getElementById('toast');
const listingModerationFeedback = document.getElementById('listing-moderation-feedback');
const openLoginBtn = document.getElementById('open-login');
const openRegisterBtn = document.getElementById('open-register');
const navButtons = {
    home: document.getElementById('nav-home'),
    post: document.getElementById('nav-post'),
    messages: document.getElementById('nav-messages'),
    account: document.getElementById('nav-account'),
};
let toastTimeoutId = null;

function setElementVisibility(element, isVisible, displayMode = 'block'){
    if (!element) return;
    element.hidden = !isVisible;
    element.style.display = isVisible ? displayMode : 'none';
}

function warnPersistenceSetup(message = 'Create the Supabase tables to enable saved profile and listing persistence.'){
    if (hasWarnedAboutPersistenceSetup) return;
    hasWarnedAboutPersistenceSetup = true;
    showToast(message);
}

function getAuthRedirectUrl(){
    return `${window.location.origin}${window.location.pathname}`;
}

async function restoreOAuthSessionFromUrl(){
    if (!supabaseClient) return null;
    const url = new URL(window.location.href);
    if (!url.searchParams.has('code')) return null;

    const { data, error } = await supabaseClient.auth.exchangeCodeForSession(window.location.href);
    if (error) {
        console.error('Failed to restore OAuth session', error);
        showToast(error.message);
        return null;
    }

    window.history.replaceState({}, document.title, getAuthRedirectUrl());
    return data.session || null;
}

function isMissingSupabaseTableError(error){
    return error?.code === '42P01' || /relation .* does not exist/i.test(error?.message || '');
}

function isMissingSupabaseColumnError(error){
    return error?.code === 'PGRST204' || /column .* does not exist/i.test(error?.message || '');
}

function isListingModerationError(error){
    return error?.code === '23514' || /FarmYard only accepts agriculture-related listings/i.test(error?.message || '');
}

function generateListingId(){
    return window.crypto?.randomUUID?.() || `listing-${Date.now()}`;
}

function normalizeModerationText(value){
    return (value || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function getMatchedModerationTerms(text, keywords){
    return keywords.filter(keyword => text.includes(keyword.toLowerCase()));
}

function setListingModerationFeedback(message = ''){
    if (!listingModerationFeedback) return;
    listingModerationFeedback.textContent = message;
    listingModerationFeedback.hidden = !message;
}

function evaluateAgricultureListing(listing){
    const combinedText = normalizeModerationText([
        listing.title,
        listing.description,
        listing.unit,
    ].join(' '));
    const agricultureMatches = getMatchedModerationTerms(combinedText, AGRICULTURE_KEYWORDS);
    const blockedMatches = getMatchedModerationTerms(combinedText, NON_AGRICULTURE_KEYWORDS);
    const hasStrongAgricultureSignal = agricultureMatches.length > 0;
    const hasStrongBlockedSignal = blockedMatches.length > 0;

    if (hasStrongBlockedSignal && !hasStrongAgricultureSignal) {
        return {
            accepted: false,
            reason: `This post was rejected because it looks unrelated to agriculture: ${blockedMatches.slice(0, 3).join(', ')}.`,
        };
    }

    if (!hasStrongAgricultureSignal) {
        return {
            accepted: false,
            reason: 'This post was rejected because the title and description do not clearly mention a farm product, input, livestock item, or agricultural service.',
        };
    }

    return { accepted: true, reason: '' };
}

function readFileAsDataUrl(file){
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error || new Error('Could not read the selected image'));
        reader.readAsDataURL(file);
    });
}

function getInitials(name){
    return (name || 'FarmYard User')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0].toUpperCase())
        .join('');
}

function createGeneratedAvatar(name){
    const initials = getInitials(name);
    const palette = [
        ['#2f6b3b', '#7cad63'],
        ['#8d5a22', '#d2a05f'],
        ['#365c68', '#7fb4bf'],
        ['#5d4d7a', '#a894d1'],
    ];
    const index = (name || '').split('').reduce((sum, character) => sum + character.charCodeAt(0), 0) % palette.length;
    const [start, end] = palette[index];
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
            <defs>
                <linearGradient id="avatarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="${start}" />
                    <stop offset="100%" stop-color="${end}" />
                </linearGradient>
            </defs>
            <rect width="160" height="160" rx="80" fill="url(#avatarGradient)" />
            <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="56" font-weight="700">${initials}</text>
        </svg>
    `;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function loadLocalAppState(){
    try {
        const parsed = JSON.parse(localStorage.getItem(LOCAL_STATE_KEY) || '{}');
        if (parsed.profiles && typeof parsed.profiles === 'object') {
            Object.assign(profiles, parsed.profiles);
        }
        if (parsed.companyAccounts && typeof parsed.companyAccounts === 'object') {
            Object.assign(companyAccounts, parsed.companyAccounts);
        }
        if (parsed.userAccounts && typeof parsed.userAccounts === 'object') {
            Object.assign(userAccounts, parsed.userAccounts);
        }
    } catch (error) {
        console.warn('Failed to load local state', error);
    }
}

function persistLocalAppState(){
    try {
        localStorage.setItem(LOCAL_STATE_KEY, JSON.stringify({
            profiles,
            companyAccounts,
            userAccounts,
        }));
    } catch (error) {
        console.warn('Failed to persist local state', error);
    }
}

function getAvatarUrl(profileId){
    return profiles[profileId]?.avatarUrl || createGeneratedAvatar(profiles[profileId]?.name || 'FarmYard User');
}

function renderAvatarMarkup({ name, avatarUrl, imageClassName = 'avatar-image', fallbackClassName = 'avatar-fallback' }){
    const resolvedAvatarUrl = avatarUrl || createGeneratedAvatar(name);
    if (resolvedAvatarUrl) {
        return `<img class="${imageClassName}" src="${resolvedAvatarUrl}" alt="${name} profile photo">`;
    }
    return `<span class="${fallbackClassName}">${getInitials(name)}</span>`;
}

function setPreviewImage(imageElement, imageUrl, altText){
    if (!imageElement) return;
    if (imageUrl) {
        imageElement.src = imageUrl;
        imageElement.alt = altText;
        imageElement.hidden = false;
        return;
    }
    imageElement.src = '';
    imageElement.hidden = true;
}

async function previewSelectedImage(inputElement, previewElement, fallbackUrl = '', altText = 'Selected image preview'){
    const file = inputElement?.files?.[0];
    if (file) {
        const previewUrl = await readFileAsDataUrl(file);
        setPreviewImage(previewElement, previewUrl, altText);
        return previewUrl;
    }
    setPreviewImage(previewElement, fallbackUrl, altText);
    return fallbackUrl;
}

function getConversationProfile(conversation){
    const bySellerId = profiles[conversation.sellerId];
    if (bySellerId) return bySellerId;
    return Object.values(profiles).find(profile => profile.name === conversation.contact) || null;
}

function getCurrentTimeLabel(){
    return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function formatMessageTimestamp(sentAt, fallbackTime = ''){
    if (!sentAt) return fallbackTime;
    const parsedDate = new Date(sentAt);
    if (Number.isNaN(parsedDate.getTime())) return fallbackTime;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const messageDay = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
    const timeLabel = parsedDate.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
    });

    if (messageDay.getTime() === today.getTime()) {
        return `Today, ${timeLabel}`;
    }

    if (messageDay.getTime() === yesterday.getTime()) {
        return `Yesterday, ${timeLabel}`;
    }

    return parsedDate.toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

function renderMessageMediaPreview(){
    if (!messageMediaPreview) return;
    if (!selectedMessageMedia.length) {
        messageMediaPreview.innerHTML = '';
        messageMediaPreview.hidden = true;
        return;
    }

    messageMediaPreview.hidden = false;
    messageMediaPreview.innerHTML = selectedMessageMedia.map((file, index) => `
        <div class="message-media-chip">
            ${file.type.startsWith('video/')
                ? `<video src="${file.dataUrl}" muted playsinline></video>`
                : `<img src="${file.dataUrl}" alt="${file.name}">`}
            <button type="button" class="message-media-remove" data-index="${index}" aria-label="Remove ${file.name}">Remove</button>
        </div>
    `).join('');

    messageMediaPreview.querySelectorAll('.message-media-remove').forEach(button => {
        button.onclick = () => {
            selectedMessageMedia.splice(Number(button.dataset.index), 1);
            renderMessageMediaPreview();
        };
    });
}

function clearMessageComposer(){
    messageInput.value = '';
    selectedMessageMedia = [];
    if (messageMediaInput) {
        messageMediaInput.value = '';
    }
    renderMessageMediaPreview();
}

async function handleMessageMediaSelection(){
    const files = Array.from(messageMediaInput?.files || []);
    if (!files.length) return;
    const availableSlots = Math.max(0, 5 - selectedMessageMedia.length);

    if (!availableSlots) {
        showToast('You can attach a maximum of 5 images or videos at once');
        messageMediaInput.value = '';
        return;
    }

    const acceptedFiles = files.filter(file => file.type.startsWith('image/') || file.type.startsWith('video/'));
    const filesToAdd = acceptedFiles.slice(0, availableSlots);
    const loadedFiles = await Promise.all(filesToAdd.map(async (file) => ({
        name: file.name,
        type: file.type,
        dataUrl: await readFileAsDataUrl(file),
    })));

    selectedMessageMedia = [...selectedMessageMedia, ...loadedFiles].slice(0, 5);
    renderMessageMediaPreview();

    if (acceptedFiles.length < files.length || files.length > filesToAdd.length) {
        showToast('Only image and video files are allowed, with a limit of 5 attachments');
    }

    messageMediaInput.value = '';
}

function buildProfileFieldsPayload(profile){
    return {
        ...Object.fromEntries(
            Object.entries(profile.fields || {}).map(([key, value]) => [key, { ...value }])
        ),
        _avatar_url: profile?.avatarUrl || '',
    };
}

function buildPersistedProfileRow(){
    const profile = profiles[currentUser.id];
    return {
        id: currentUser.id,
        email: currentUser.email,
        full_name: currentUser.name,
        role: currentUser.role,
        account_type: currentUser.accountType,
        location: currentUser.location,
        phone: currentUser.phone,
        verified: currentUser.verified,
        community_rating: currentUser.communityRating,
        rating_count: currentUser.ratingCount,
        company_id: currentUser.companyId,
        company_role: currentUser.companyRole,
        access_status: currentUser.accessStatus,
        about: profile?.about || '',
        profile_fields: buildProfileFieldsPayload(profile),
        security: { ...currentUser.security, profile_photo: currentUser.avatarUrl || '' },
        verification_plan: { ...currentUser.verificationPlan },
    };
}

function applyPersistedProfileRow(profileRow){
    if (!profileRow) return;
    currentUser.name = profileRow.full_name || currentUser.name;
    currentUser.role = profileRow.role || currentUser.role;
    currentUser.accountType = profileRow.account_type || currentUser.accountType;
    currentUser.location = profileRow.location || currentUser.location;
    currentUser.phone = profileRow.phone || currentUser.phone;
    currentUser.email = profileRow.email || currentUser.email;
    currentUser.verified = typeof profileRow.verified === 'boolean' ? profileRow.verified : currentUser.verified;
    currentUser.communityRating = Number(profileRow.community_rating ?? currentUser.communityRating);
    currentUser.ratingCount = Number(profileRow.rating_count ?? currentUser.ratingCount);
    currentUser.companyId = profileRow.company_id || currentUser.companyId;
    currentUser.companyRole = profileRow.company_role || currentUser.companyRole;
    currentUser.accessStatus = profileRow.access_status || currentUser.accessStatus;
    currentUser.security = profileRow.security ? { ...currentUser.security, ...profileRow.security } : { ...currentUser.security };
    currentUser.avatarUrl = profileRow.security?.profile_photo || currentUser.avatarUrl || '';
    currentUser.verificationPlan = profileRow.verification_plan
        ? { ...currentUser.verificationPlan, ...profileRow.verification_plan }
        : { ...currentUser.verificationPlan };
    ensureProfileForAccount(currentUser);
    const profile = profiles[currentUser.id];
    profile.name = currentUser.name;
    profile.about = profileRow.about || profile.about;
    profile.verified = currentUser.verified;
    profile.rating = currentUser.communityRating;
    profile.ratingCount = currentUser.ratingCount;
    profile.avatarUrl = profileRow.profile_fields?._avatar_url || currentUser.avatarUrl || profile.avatarUrl || '';
    profile.verificationPlan = { ...currentUser.verificationPlan };
    if (profileRow.profile_fields && typeof profileRow.profile_fields === 'object') {
        Object.entries(profileRow.profile_fields).forEach(([key, value]) => {
            if (key === '_avatar_url') return;
            profile.fields[key] = {
                label: value?.label || profile.fields[key]?.label || key,
                value: value?.value ?? profile.fields[key]?.value ?? '',
                visible: typeof value?.visible === 'boolean' ? value.visible : (profile.fields[key]?.visible ?? true),
            };
        });
    }
    persistCurrentUserAccount();
}

function buildPersistedListingRow(listing){
    return {
        id: listing.id,
        user_id: currentUser.id,
        seller_id: listing.sellerId,
        category: listing.category,
        title: listing.title,
        price: String(listing.price),
        unit: listing.unit,
        min_order: listing.minOrder || '',
        location: listing.location,
        description: listing.description || '',
        image_url: listing.image,
        negotiable: Boolean(listing.negotiable),
        slug: listing.slug,
        verified: Boolean(listing.verified),
        posted_by_name: listing.postedByName || '',
    };
}

function mapPersistedListingRow(row){
    return {
        id: row.id,
        category: row.category,
        title: row.title,
        price: row.price,
        unit: row.unit,
        minOrder: row.min_order || '',
        location: row.location,
        description: row.description || '',
        image: row.image_url || 'https://via.placeholder.com/150',
        negotiable: Boolean(row.negotiable),
        slug: row.slug,
        verified: Boolean(row.verified),
        sellerId: row.seller_id || currentUser.id,
        postedByName: row.posted_by_name || currentUser.name,
        userId: row.user_id || '',
    };
}

function applyPersistedListings(rows){
    userListings = (rows || []).map(mapPersistedListingRow);
}

function applyMarketplaceListings(rows){
    marketplaceListings = (rows || []).map(mapPersistedListingRow);
}

async function loadPersistedProfile(){
    if (!supabaseClient || !currentUser.id) return;
    const { data, error } = await supabaseClient
        .from(SUPABASE_TABLES.profiles)
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

    if (error) {
        if (isMissingSupabaseTableError(error) || isMissingSupabaseColumnError(error)) {
            warnPersistenceSetup();
            return;
        }
        console.error('Failed to load profile', error);
        showToast(error.message);
        return;
    }

    if (data) {
        applyPersistedProfileRow(data);
    }
}

async function savePersistedProfile(){
    if (!supabaseClient || !currentUser.id) return true;
    const { error } = await supabaseClient
        .from(SUPABASE_TABLES.profiles)
        .upsert(buildPersistedProfileRow(), { onConflict: 'id' });

    if (error) {
        if (isMissingSupabaseTableError(error) || isMissingSupabaseColumnError(error)) {
            warnPersistenceSetup();
            return false;
        }
        console.error('Failed to save profile', error);
        showToast(error.message);
        return false;
    }

    return true;
}

async function loadPersistedListings(){
    if (!supabaseClient || !currentUser.id) return;
    const { data, error } = await supabaseClient
        .from(SUPABASE_TABLES.listings)
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

    if (error) {
        if (isMissingSupabaseTableError(error) || isMissingSupabaseColumnError(error)) {
            warnPersistenceSetup();
            userListings = [];
            return;
        }
        console.error('Failed to load listings', error);
        showToast(error.message);
        return;
    }

    applyPersistedListings(data);
}

async function loadMarketplaceListings(){
    if (!supabaseClient) return;
    const { data, error } = await supabaseClient
        .from(SUPABASE_TABLES.listings)
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        if (isMissingSupabaseTableError(error) || isMissingSupabaseColumnError(error)) {
            warnPersistenceSetup();
            marketplaceListings = [];
            return;
        }
        console.error('Failed to load marketplace listings', error);
        showToast(error.message);
        return;
    }

    applyMarketplaceListings(data);
}

async function savePersistedListing(listing){
    if (!supabaseClient || !currentUser.id) return true;
    const { error } = await supabaseClient
        .from(SUPABASE_TABLES.listings)
        .upsert(buildPersistedListingRow(listing), { onConflict: 'id' });

    if (error) {
        if (isListingModerationError(error)) {
            setListingModerationFeedback(error.message);
            showToast('Listing rejected by server-side moderation');
            return false;
        }
        if (isMissingSupabaseTableError(error) || isMissingSupabaseColumnError(error)) {
            warnPersistenceSetup();
            return false;
        }
        console.error('Failed to save listing', error);
        showToast(error.message);
        return false;
    }

    return true;
}

function syncMarketplaceListing(listing){
    const nextListing = { ...listing, userId: currentUser.id };
    const existingIndex = marketplaceListings.findIndex(item => item.id === listing.id);
    if (existingIndex === -1) {
        marketplaceListings.unshift(nextListing);
        return;
    }
    marketplaceListings[existingIndex] = nextListing;
}

function removeMarketplaceListing(listingId){
    marketplaceListings = marketplaceListings.filter(item => item.id !== listingId);
}

async function deletePersistedListing(listingId){
    if (!supabaseClient || !listingId) return true;
    const { error } = await supabaseClient
        .from(SUPABASE_TABLES.listings)
        .delete()
        .eq('id', listingId)
        .eq('user_id', currentUser.id);

    if (error) {
        if (isMissingSupabaseTableError(error) || isMissingSupabaseColumnError(error)) {
            warnPersistenceSetup();
            return false;
        }
        console.error('Failed to delete listing', error);
        showToast(error.message);
        return false;
    }

    return true;
}

async function loadPersistedAccountData(){
    await loadPersistedProfile();
    await loadPersistedListings();
    await loadMarketplaceListings();
    await loadPersistedConversations();
    refreshMarketplace();
    renderUserListings();
    if (getActiveTabName() === 'messages') {
        renderMessagesTab();
    }
}

function formatConversationUpdatedLabel(dateString){
    if (!dateString) return 'Recently';
    const parsedDate = new Date(dateString);
    if (Number.isNaN(parsedDate.getTime())) return 'Recently';
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDay = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
    if (messageDay.getTime() === today.getTime()) {
        return `Today, ${parsedDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    }
    return parsedDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function getConversationContactNameFromRow(row){
    return row.owner_user_id === currentUser.id ? row.buyer_name : row.owner_name;
}

function mapPersistedConversationRow(row){
    return {
        id: row.id,
        listingId: row.listing_id || null,
        listingTitle: row.listing_title || 'Marketplace',
        contact: getConversationContactNameFromRow(row),
        sellerId: row.seller_id || null,
        role: 'Marketplace Contact',
        location: row.location || 'Marketplace',
        online: false,
        lastSeen: 'recently',
        lastUpdated: formatConversationUpdatedLabel(row.updated_at),
        updatedAt: row.updated_at || row.created_at || null,
        ownerUserId: row.owner_user_id,
        buyerUserId: row.buyer_user_id,
        messages: [],
        persisted: true,
    };
}

function mapPersistedMessageRow(row){
    return {
        id: row.id,
        author: row.sender_name || 'User',
        text: row.body || '',
        time: new Date(row.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        sentAt: row.created_at,
        mine: row.sender_user_id === currentUser.id,
        attachments: Array.isArray(row.attachments) ? row.attachments : [],
    };
}

async function loadPersistedConversations(){
    if (!supabaseClient || !currentUser.id) return;
    const { data: conversationRows, error: conversationError } = await supabaseClient
        .from(SUPABASE_TABLES.conversations)
        .select('*')
        .or(`owner_user_id.eq.${currentUser.id},buyer_user_id.eq.${currentUser.id}`)
        .order('updated_at', { ascending: false });

    if (conversationError) {
        if (isMissingSupabaseTableError(conversationError) || isMissingSupabaseColumnError(conversationError)) {
            warnPersistenceSetup('Create the Supabase conversation tables to enable shared messaging.');
            conversations = [...fallbackConversations];
            return;
        }
        console.error('Failed to load conversations', conversationError);
        showToast(conversationError.message);
        return;
    }

    const mappedConversations = (conversationRows || []).map(mapPersistedConversationRow);
    const conversationIds = mappedConversations.map(conversation => conversation.id);

    let mappedMessagesByConversation = new Map();
    if (conversationIds.length) {
        const { data: messageRows, error: messageError } = await supabaseClient
            .from(SUPABASE_TABLES.messages)
            .select('*')
            .in('conversation_id', conversationIds)
            .order('created_at', { ascending: true });

        if (messageError) {
            if (isMissingSupabaseTableError(messageError) || isMissingSupabaseColumnError(messageError)) {
                warnPersistenceSetup('Create the Supabase message tables to enable shared messaging.');
                conversations = [...fallbackConversations];
                return;
            }
            console.error('Failed to load messages', messageError);
            showToast(messageError.message);
            return;
        }

        mappedMessagesByConversation = (messageRows || []).reduce((map, row) => {
            const existingMessages = map.get(row.conversation_id) || [];
            existingMessages.push(mapPersistedMessageRow(row));
            map.set(row.conversation_id, existingMessages);
            return map;
        }, new Map());
    }

    conversations = mappedConversations.map(conversation => ({
        ...conversation,
        messages: mappedMessagesByConversation.get(conversation.id) || [],
    }));

    if (!conversations.length) {
        activeConversationId = null;
        return;
    }

    if (!conversations.some(conversation => conversation.id === activeConversationId)) {
        activeConversationId = conversations[0].id;
    }
}

async function ensurePersistedConversationForListing(listing){
    if (!supabaseClient || !currentUser.id || !listing?.userId || listing.userId === currentUser.id) {
        return null;
    }

    const { data: existingConversation, error: lookupError } = await supabaseClient
        .from(SUPABASE_TABLES.conversations)
        .select('*')
        .eq('listing_id', listing.id)
        .eq('owner_user_id', listing.userId)
        .eq('buyer_user_id', currentUser.id)
        .maybeSingle();

    if (lookupError) {
        console.error('Failed to look up conversation', lookupError);
        showToast(lookupError.message);
        return null;
    }

    if (existingConversation) {
        return existingConversation;
    }

    const ownerName = listing.postedByName || profiles[listing.sellerId]?.name || 'Seller';
    const { data: createdConversation, error: createError } = await supabaseClient
        .from(SUPABASE_TABLES.conversations)
        .insert({
            listing_id: listing.id || null,
            listing_title: listing.title || 'Marketplace',
            seller_id: listing.sellerId || null,
            owner_user_id: listing.userId,
            owner_name: ownerName,
            buyer_user_id: currentUser.id,
            buyer_name: currentUser.name,
            location: listing.location || 'Marketplace',
        })
        .select()
        .single();

    if (createError) {
        console.error('Failed to create conversation', createError);
        showToast(createError.message);
        return null;
    }

    return createdConversation;
}

async function savePersistedMessage(conversationId, payload){
    if (!supabaseClient || !currentUser.id || !conversationId) return false;
    const { error } = await supabaseClient
        .from(SUPABASE_TABLES.messages)
        .insert({
            conversation_id: conversationId,
            sender_user_id: currentUser.id,
            sender_name: currentUser.name,
            body: payload.text || '',
            attachments: payload.attachments || [],
        });

    if (error) {
        if (isMissingSupabaseTableError(error) || isMissingSupabaseColumnError(error)) {
            warnPersistenceSetup('Create the Supabase message tables to enable shared messaging.');
            return false;
        }
        console.error('Failed to save message', error);
        showToast(error.message);
        return false;
    }

    await supabaseClient
        .from(SUPABASE_TABLES.conversations)
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

    return true;
}

async function refreshRealtimeMessagesView(){
    await loadPersistedConversations();
    if (getActiveTabName() === 'messages') {
        renderMessagesTab();
    }
}

function queueRealtimeMessagesRefresh(){
    if (!supabaseClient || !currentUser.id) return;
    if (messagesRealtimeRefreshPromise) {
        messagesRealtimeRefreshQueued = true;
        return;
    }

    messagesRealtimeRefreshPromise = refreshRealtimeMessagesView()
        .catch(error => {
            console.error('Failed to refresh realtime messages', error);
        })
        .finally(() => {
            messagesRealtimeRefreshPromise = null;
            if (messagesRealtimeRefreshQueued) {
                messagesRealtimeRefreshQueued = false;
                queueRealtimeMessagesRefresh();
            }
        });
}

function isConversationRelevantToCurrentUser(payload = {}){
    const row = payload.new || payload.old;
    if (!row || !currentUser.id) return false;
    return row.owner_user_id === currentUser.id || row.buyer_user_id === currentUser.id;
}

function isMessageRelevantToCurrentUser(payload = {}){
    const row = payload.new || payload.old;
    if (!row || !currentUser.id) return false;
    const activeConversation = conversations.find(item => item.id === row.conversation_id);
    if (activeConversation) {
        return true;
    }
    return conversations.some(item => item.id === row.conversation_id);
}

function stopMessagesRealtime(){
    if (!supabaseClient || !messagesRealtimeChannel) return;
    supabaseClient.removeChannel(messagesRealtimeChannel);
    messagesRealtimeChannel = null;
}

function startMessagesRealtime(){
    if (!supabaseClient || !currentUser.id || messagesRealtimeChannel) return;

    messagesRealtimeChannel = supabaseClient
        .channel(`farmyard-messages-${currentUser.id}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: SUPABASE_TABLES.conversations,
            },
            payload => {
                if (!isConversationRelevantToCurrentUser(payload)) return;
                queueRealtimeMessagesRefresh();
            }
        )
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: SUPABASE_TABLES.messages,
            },
            payload => {
                if (!isMessageRelevantToCurrentUser(payload)) return;
                queueRealtimeMessagesRefresh();
            }
        )
        .subscribe((status) => {
            if (status === 'CHANNEL_ERROR') {
                console.error('Supabase realtime channel error for messages');
            }
        });
}

// Bottom nav
document.getElementById('nav-home').onclick = () => showTab('home');
document.getElementById('nav-post').onclick = () => showTab('post');
document.getElementById('nav-messages').onclick = () => {
    mobileMessagesView = 'inbox';
    showTab('messages');
};
document.getElementById('nav-account').onclick = () => { showTab('account'); renderUserListings(); };
openLoginBtn.onclick = () => openAuthScreen('login');
openRegisterBtn.onclick = () => openAuthScreen('register');
document.getElementById('open-legal').onclick = () => showTab('legal');
document.getElementById('legal-back-home').onclick = () => showTab('home');
document.getElementById('show-register').onclick = () => openAuthScreen('register');
document.getElementById('show-login').onclick = () => openAuthScreen('login');
document.getElementById('login-btn').onclick = () => signInWithEmail();
document.getElementById('register-btn').onclick = () => signUpWithEmail();
document.getElementById('login-google-btn').onclick = () => signInWithGoogle();
document.getElementById('register-google-btn').onclick = () => signInWithGoogle();
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
document.getElementById('image').onchange = async () => {
    try {
        await previewSelectedImage(
            document.getElementById('image'),
            document.getElementById('listing-image-preview'),
            '',
            'Listing photo preview'
        );
    } catch (error) {
        showToast(error.message || 'Could not preview the selected image');
    }
};
['category', 'title', 'description', 'unit'].forEach(id => {
    const field = document.getElementById(id);
    if (field) {
        field.addEventListener('input', () => setListingModerationFeedback(''));
        field.addEventListener('change', () => setListingModerationFeedback(''));
    }
});
document.getElementById('message-send').onclick = () => sendMessage();
messageAttachButton.onclick = () => messageMediaInput?.click();
messageMediaInput.onchange = async () => {
    try {
        await handleMessageMediaSelection();
    } catch (error) {
        showToast(error.message || 'Could not attach the selected media');
    }
};
messageInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});
if (chatRateUserBtn) {
    chatRateUserBtn.onclick = () => openChatFeedback('rate');
}
if (chatReportUserBtn) {
    chatReportUserBtn.onclick = () => openChatFeedback('report');
}
if (chatCallButton) {
    chatCallButton.onclick = () => callActiveConversation();
}
if (chatOptionsButton) {
    chatOptionsButton.onclick = (event) => {
        event.stopPropagation();
        toggleChatOptionsMenu();
    };
}
if (chatOptionProfileButton) {
    chatOptionProfileButton.onclick = () => {
        closeChatOptionsMenu();
        openActiveConversationProfile();
    };
}
if (chatOptionCallButton) {
    chatOptionCallButton.onclick = () => {
        closeChatOptionsMenu();
        callActiveConversation();
    };
}
if (chatOptionRateButton) {
    chatOptionRateButton.onclick = () => {
        closeChatOptionsMenu();
        openChatFeedback('rate');
    };
}
if (chatOptionReportButton) {
    chatOptionReportButton.onclick = () => {
        closeChatOptionsMenu();
        openChatFeedback('report');
    };
}
if (chatOptionDeleteButton) {
    chatOptionDeleteButton.onclick = () => {
        const conversation = conversations.find(item => item.id === activeConversationId);
        closeChatOptionsMenu();
        if (conversation) {
            deleteConversation(conversation.id);
        }
    };
}
if (callMuteButton) {
    callMuteButton.onclick = () => toggleCallMute();
}
if (callSpeakerButton) {
    callSpeakerButton.onclick = () => toggleSpeakerMode();
}
if (callEndButton) {
    callEndButton.onclick = () => endActiveCall(true);
}
document.getElementById('chat-feedback-confirm').onclick = () => submitChatFeedback();
document.getElementById('chat-feedback-cancel').onclick = () => closeChatFeedback();
const messagesBackButton = document.getElementById('messages-back');
if (messagesBackButton) {
    messagesBackButton.onclick = () => {
        mobileMessagesView = 'inbox';
        renderMessagesTab();
    };
}
document.getElementById('close-profile').onclick = () => goBack();

// Show tab
function showTab(name, options = {}){
    const { skipHistory = false } = options;
    const activeTab = getActiveTabName();
    if (!skipHistory && activeTab && activeTab !== name) {
        tabHistory.push(activeTab);
    }
    setElementVisibility(app, true);
    Object.values(authScreens).forEach(screen => setElementVisibility(screen, false));
    Object.values(tabs).forEach(t => setElementVisibility(t, false));
    setElementVisibility(tabs[name], true);
    returnTabAfterAuth = name;
    localStorage.setItem(LAST_ACTIVE_TAB_KEY, name);
    updateNavState(name);
    if (name === 'messages') {
        renderMessagesTab();
    } else {
        closeChatOptionsMenu();
    }
}

function openAuthScreen(name){
    const activeTab = getActiveTabName();
    if (activeTab) {
        returnTabAfterAuth = activeTab;
        localStorage.setItem('farmyard-return-tab', activeTab);
    }
    setElementVisibility(app, false);
    Object.values(authScreens).forEach(screen => setElementVisibility(screen, false, 'flex'));
    setElementVisibility(authScreens[name], true, 'flex');
}

async function signInWithEmail(){
    if (!supabaseClient) {
        handleSignedInSession(null, 'Auth service unavailable right now. Opened the app in local mode.');
        return;
    }
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value.trim();
    const inviteCode = document.getElementById('login-invite-code').value.trim().toUpperCase();

    if (!email || !password) {
        showToast('Enter your email and password');
        return;
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
        showToast(error.message);
        return;
    }

    handleSignedInSession(data.session, inviteCode ? 'Welcome back. Company invite checked.' : 'Welcome back to FarmYard', { inviteCode });
}

async function signUpWithEmail(){
    if (!supabaseClient) {
        handleSignedInSession(null, 'Auth service unavailable right now. Opened the app in local mode.');
        return;
    }
    const fullName = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim().toLowerCase();
    const password = document.getElementById('reg-password').value.trim();
    const inviteCode = document.getElementById('reg-invite-code').value.trim().toUpperCase();

    if (!fullName || !email || !password) {
        showToast('Fill in name, email, and password');
        return;
    }

    const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: fullName },
        },
    });
    if (error) {
        showToast(error.message);
        return;
    }

    if (data.session) {
        handleSignedInSession(data.session, inviteCode ? 'Your account is ready. Company invite checked.' : 'Your account is ready', { inviteCode });
    } else {
        showToast('Check your email to confirm your account');
    }
}

async function signInWithGoogle(){
    if (!supabaseClient) {
        showToast('Google sign-in is unavailable right now');
        return;
    }
    localStorage.setItem('farmyard-return-tab', returnTabAfterAuth || getActiveTabName() || 'home');
    const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: getAuthRedirectUrl(),
        },
    });
    if (error) {
        showToast(error.message);
    }
}

async function signOutUser(){
    if (!supabaseClient) {
        hydrateCurrentUser(userAccounts['guest@farmyard.app']);
        ensureProfileForAccount(userAccounts['guest@farmyard.app']);
        updateAuthButtons(false);
        userListings = [];
        marketplaceListings = [];
        conversations = [...fallbackConversations];
        activeConversationId = conversations[0]?.id || null;
        stopMessagesRealtime();
        refreshMarketplace();
        renderUserListings();
        renderMessagesTab();
        showToast('Signed out successfully');
        return;
    }
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
        showToast(error.message);
        return;
    }

    hydrateCurrentUser(userAccounts['guest@farmyard.app']);
    ensureProfileForAccount(userAccounts['guest@farmyard.app']);
    updateAuthButtons(false);
    userListings = [];
    marketplaceListings = [];
    conversations = [...fallbackConversations];
    activeConversationId = conversations[0]?.id || null;
    stopMessagesRealtime();
    refreshMarketplace();
    renderUserListings();
    renderMessagesTab();
    showToast('Signed out successfully');
}

function goBack(fallback = 'home'){
    const lastTab = tabHistory.pop();
    showTab(lastTab || fallback, { skipHistory: true });
}

function getActiveTabName(){
    const activeTab = Object.entries(tabs).find(([, element]) => !element.hidden);
    return activeTab ? activeTab[0] : null;
}

// Post listing
document.getElementById('postBtn').onclick = async () => {
    const canPostForLinkedCompany = currentUser.companyId && currentUser.permissions?.canPostForCompany;
    const existingListing = editingListingIndex !== null ? userListings[editingListingIndex] : null;
    const category = document.getElementById('category').value.trim();
    const title = document.getElementById('title').value.trim();
    const price = document.getElementById('price').value.trim();
    const unit = document.getElementById('unit').value.trim();
    const minOrder = document.getElementById('minOrder').value.trim();
    const location = document.getElementById('location').value.trim();
    const description = document.getElementById('description').value.trim();
    const selectedImage = document.getElementById('image').files[0];
    const negotiable = document.getElementById('negotiable').checked;
    const isEditingListing = editingListingIndex !== null;

    if (!category || !title || !price || !unit || !location) { alert('Fill all required fields'); return; }
    if (description.length > 220) { alert('Keep the description under 220 characters for now.'); return; }

    const moderationResult = evaluateAgricultureListing({ category, title, description, unit });
    if (!moderationResult.accepted) {
        setListingModerationFeedback(moderationResult.reason);
        showToast('Listing rejected by the agriculture-only filter');
        return;
    }

    let image = existingListing?.image || 'https://via.placeholder.com/150';
    if (selectedImage) {
        try {
            image = await readFileAsDataUrl(selectedImage);
        } catch (error) {
            showToast(error.message || 'Could not read the selected image');
            return;
        }
    }

    const listingPayload = {
        id: existingListing?.id || generateListingId(),
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
        verified: false,
        sellerId: canPostForLinkedCompany ? currentUser.companyId : currentUser.id,
        postedByName: currentUser.name,
    };

    if (isEditingListing) {
        userListings[editingListingIndex] = listingPayload;
    } else {
        userListings.push(listingPayload);
    }

    const saveSucceeded = await savePersistedListing(listingPayload);
    if (!saveSucceeded) {
        if (isEditingListing) {
            userListings[editingListingIndex] = existingListing;
        } else {
            userListings.pop();
        }
        refreshMarketplace();
        renderUserListings();
        return;
    }

    syncMarketplaceListing(listingPayload);

    refreshMarketplace();
    clearPostForm();
    showTab('home');
    showToast(isEditingListing ? 'Listing updated successfully' : 'Listing posted successfully');
};

function clearPostForm(){
    ['category','title','price','unit','minOrder','location','description','image'].forEach(id => document.getElementById(id).value='');
    document.getElementById('negotiable').checked = false;
    setPreviewImage(document.getElementById('listing-image-preview'), '', 'Listing photo preview');
    setListingModerationFeedback('');
    editingListingIndex = null;
}

function getSearchableProfiles(){
    return Object.values(profiles).filter(profile => profile?.name);
}

function getProfileSearchSummary(profile){
    const visibleFields = Object.values(profile.fields || {})
        .filter(field => field?.visible && field?.value)
        .map(field => field.value);
    return [
        profile.type,
        profile.about,
        ...visibleFields,
    ].filter(Boolean).join(' • ');
}

// Refresh marketplace
function refreshMarketplace(){
    marketplace.innerHTML = '';
    const initialListings = getInitialListings();
    const all = [...initialListings, ...marketplaceListings];
    const normalizedQuery = marketQuery.trim().toLowerCase();
    const filteredProfiles = normalizedQuery
        ? getSearchableProfiles().filter(profile => [
            profile.name,
            profile.type,
            profile.about,
            ...Object.values(profile.fields || {}).map(field => field?.value),
        ].filter(Boolean).some(value => value.toLowerCase().includes(normalizedQuery)))
        : [];
    const filteredListings = normalizedQuery
        ? all.filter(listing => [
            listing.title,
            listing.category,
            listing.location,
            listing.description,
            listing.unit,
            listing.minOrder,
            listing.postedByName,
            profiles[listing.sellerId]?.name,
        ].filter(Boolean).some(value => value.toLowerCase().includes(normalizedQuery)))
        : all;

    if (marketResultsCopy) {
        marketResultsCopy.textContent = normalizedQuery
            ? `${filteredProfiles.length + filteredListings.length} result${filteredProfiles.length + filteredListings.length === 1 ? '' : 's'} for "${marketQuery.trim()}".`
            : 'Browse current produce, goods, and service listings.';
    }

    if (!filteredProfiles.length && !filteredListings.length) {
        marketplace.innerHTML = `
            <div class="market-empty-state">
                <strong>No results match that search yet.</strong>
                <p>Try another product, service, seller, company, or location.</p>
            </div>
        `;
        return;
    }

    filteredProfiles.forEach((profile) => {
        const profileCard = document.createElement('div');
        profileCard.className = 'card profile-search-card';
        profileCard.innerHTML = `
            <div class="profile-search-avatar">${renderAvatarMarkup({
                name: profile.name,
                avatarUrl: profile.avatarUrl || '',
                imageClassName: 'avatar-image',
                fallbackClassName: 'avatar-fallback',
            })}</div>
            <span class="card-category">${profile.type || 'Profile'}</span>
            <h3>${profile.name}</h3>
            <p class="card-summary">${getProfileSearchSummary(profile)}</p>
            <button type="button">View Profile</button>
        `;
        profileCard.onclick = () => openProfile(profile.id);
        profileCard.querySelector('button').onclick = (event) => {
            event.stopPropagation();
            openProfile(profile.id);
        };
        marketplace.appendChild(profileCard);
    });

    filteredListings.forEach((listing)=>{
        const isSaved = savedListings.some(item => item.slug === listing.slug);
        const sellerProfile = profiles[listing.sellerId];
        const isVerifiedCompany = sellerProfile?.type === 'Company Profile' && sellerProfile?.verificationPlan?.subscribed;
        const verificationLabel = isVerifiedCompany
            ? 'Verified Company'
            : (sellerProfile?.type === 'Company Profile' ? 'Company profile' : 'Individual profile');
        const verificationClass = isVerifiedCompany ? 'company-badge' : '';
        const card = document.createElement('div');
        card.className='card';
        const verificationText = isVerifiedCompany
            ? `<span class="badge-full">Verified Company</span><span class="badge-short">Verified</span>${isSaved ? ' • Saved' : ''}`
            : `${verificationLabel}${isSaved ? ' • Saved' : ''}${listing.postedByName ? ` • Posted by ${listing.postedByName}` : ''}`;
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

if (marketSearchInput) {
    marketSearchInput.addEventListener('input', (event) => {
        marketQuery = event.target.value;
        refreshMarketplace();
    });
}

function getInitialListings(){
    return [
        { category: 'Produce', title: 'Maize Grain', price: '1200', unit: 'kg', minOrder: '50kg', location: 'Farm A', image: 'https://via.placeholder.com/150', negotiable: false, verified: true, slug: 'maize-grain', sellerId: 'seller-amina', postedByName: 'Amina Sales Desk' },
        { category: 'Services', title: 'Tractor Ploughing', price: '80000', unit: 'acre', location: 'Farm B', image: 'https://via.placeholder.com/150', negotiable: false, verified: true, slug: 'tractor-ploughing', sellerId: 'seller-kato', postedByName: 'Kato Mechanics Team' },
        { category: 'Raw Materials', title: 'Organic Manure', price: '35000', unit: 'bag', minOrder: '10 bags', location: 'Farm C', image: 'https://via.placeholder.com/150', negotiable: true, verified: false, slug: 'organic-manure', sellerId: 'seller-manure' },
        { category: 'Finished Goods', title: 'Layer Mash Feed', price: '95000', unit: 'bag', minOrder: '5 bags', location: 'Farm D', image: 'https://via.placeholder.com/150', negotiable: false, verified: true, slug: 'layer-mash-feed', sellerId: 'seller-feed', postedByName: 'LayerPro Team' }
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
    showToast(`Order request sent for ${currentDetailListing.title}. FarmYard does not handle payments.`);
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
    showToast(`Order scheduled for ${currentDetailListing.title}. Payments happen outside FarmYard.`);
    renderUserListings();
}

function openListingDetail(listing){
    currentDetailListing = listing;
    currentProfileId = listing.sellerId || currentUser.id;
    const sellerProfile = profiles[currentProfileId];
    const sellerName = sellerProfile?.name || `${listing.title} Seller`;
    const isVerifiedCompany = sellerProfile?.type === 'Company Profile' && sellerProfile?.verificationPlan?.subscribed;
    const verificationLabel = isVerifiedCompany
        ? 'Verified Company'
        : (sellerProfile?.type === 'Company Profile' ? 'Company profile' : 'Individual profile');
    toggleSchedulePanel(false);
    detailMessage.dataset.listing = JSON.stringify({
        title: listing.title,
        location: listing.location,
        category: listing.category,
        sellerId: currentProfileId,
        contact: sellerName,
    });
    detailImage.src = listing.image;
    detailImage.alt = listing.title;
    detailTitle.textContent = listing.title;
    detailVerification.textContent = verificationLabel;
    detailVerification.className = isVerifiedCompany ? 'detail-badge company-badge' : 'detail-badge';
    detailPrice.textContent = listing.negotiable ? 'Price: Negotiable' : 'Price: UGX ' + formatPrice(listing.price) + '/' + listing.unit;
    detailMinOrder.textContent = listing.minOrder ? 'Minimum order: ' + listing.minOrder : 'Minimum order: Flexible';
    detailLocation.textContent = 'Location: ' + listing.location;
    detailNegotiable.textContent = `${listing.description ? `${listing.description} | ` : ''}Category: ${listing.category || 'General'} | Seller: ${sellerName}${listing.postedByName ? ` | Posted by: ${listing.postedByName}` : ''}`;
    detailMessage.textContent = `Message ${sellerName}`;
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
    const isCurrentUsersCompany = profileId === currentUser.companyId;
    const isCurrentUsersProfile = profileId === currentUser.id;
    const canManageCompanyProfile = isCurrentUsersCompany && currentUser.companyRole === 'Admin';
    const showCompanyEditorOnly = canManageCompanyProfile && isEditingCompanyProfile;
    if (!isCurrentUsersProfile) {
        isEditingOwnProfilePhoto = false;
    }
    currentProfileId = profileId;
    profileType.textContent = showCompanyEditorOnly ? 'Company Profile Editor' : profile.type;
    profileName.textContent = showCompanyEditorOnly ? `Edit ${profile.name}` : profile.name;
    profileRating.textContent = showCompanyEditorOnly
        ? 'Update the public company profile and trust details.'
        : `${profile.rating.toFixed(1)} stars from ${profile.ratingCount} ratings`;
    profileAvatar.innerHTML = renderAvatarMarkup({
        name: profile.name,
        avatarUrl: profile.avatarUrl || '',
        className: 'profile-avatar',
        imageClassName: 'avatar-image',
        fallbackClassName: 'avatar-fallback',
    });
    profileAbout.textContent = profile.about;
    profileVerification.textContent = profile.type === 'Company Profile'
        ? (profile.verificationPlan?.subscribed
            ? `Verified Company approved • $${profile.verificationPlan.price}/${profile.verificationPlan.billing}${profile.verificationPlan.renewalDate ? ` • renews ${profile.verificationPlan.renewalDate}` : ''}`
            : 'Company profile pending verification review')
        : 'Individual profiles can sell personally or represent a company, but only company profiles receive the Verified Company badge.';
    profileVerification.className = profile.type === 'Company Profile' && profile.verificationPlan?.subscribed ? 'detail-badge company-badge' : 'detail-badge';
    profileStats.textContent = `${profile.completedDeals} completed marketplace interactions`;
    profileFields.innerHTML = '';
    profileAdminTools.innerHTML = '';
    if (profileAboutCard) {
        profileAboutCard.hidden = showCompanyEditorOnly;
    }
    if (profileTrustCard) {
        profileTrustCard.hidden = showCompanyEditorOnly;
    }
    if (profileFieldsCard) {
        profileFieldsCard.classList.toggle('company-edit-only-card', showCompanyEditorOnly);
    }

    if (showCompanyEditorOnly) {
        profileFieldsCard?.querySelector('h3')?.replaceChildren(document.createTextNode('Company Profile Form'));
    } else {
        profileFieldsCard?.querySelector('h3')?.replaceChildren(document.createTextNode('Public Details'));
    }

    if (!showCompanyEditorOnly) {
        Object.values(profile.fields).forEach(field => {
            const item = document.createElement('div');
            item.className = 'profile-field';
            item.innerHTML = `
                <strong>${field.label}</strong>
                <p>${field.visible ? field.value : 'Hidden by seller'}</p>
            `;
            profileFields.appendChild(item);
        });
    }

    if (canManageCompanyProfile) {
        const manageButton = document.createElement('button');
        manageButton.type = 'button';
        manageButton.textContent = isEditingCompanyProfile ? 'Close Company Editor' : 'Edit Company Profile';
        manageButton.onclick = () => toggleCompanyProfileEditor();
        if (!showCompanyEditorOnly) {
            profileAdminTools.appendChild(manageButton);
        }

        if (isEditingCompanyProfile) {
            const editor = document.createElement('div');
            editor.className = 'profile-field company-profile-editor';
            editor.innerHTML = `
                <div class="company-form-intro">
                    <p class="section-eyebrow">Company Editor</p>
                    <h4>Update company profile</h4>
                    <p>Edit the public business information buyers and team members rely on.</p>
                </div>
                <label for="company-name-edit"><strong>Company name</strong></label>
                <input id="company-name-edit" type="text" value="${profile.name}">
                <label for="company-location-edit"><strong>Head office</strong></label>
                <input id="company-location-edit" type="text" value="${profile.fields.location?.value || ''}">
                <label for="company-phone-edit"><strong>Company phone</strong></label>
                <input id="company-phone-edit" type="text" value="${profile.fields.phone?.value || ''}">
                <label for="company-email-edit"><strong>Company email</strong></label>
                <input id="company-email-edit" type="email" value="${profile.fields.email?.value || ''}">
                <label for="company-registration-edit"><strong>Registration</strong></label>
                <input id="company-registration-edit" type="text" value="${profile.fields.registration?.value || ''}">
                <label for="company-certification-edit"><strong>Permits or certifications</strong></label>
                <input id="company-certification-edit" type="text" value="${profile.fields.certification?.value || ''}">
                <label for="company-about-edit"><strong>About company</strong></label>
                <textarea id="company-about-edit" rows="4">${profile.about}</textarea>
                <label for="company-photo-edit"><strong>Company photo or logo</strong></label>
                <input id="company-photo-edit" type="file" accept="image/*">
                <img id="company-photo-preview" class="upload-preview inline-upload-preview" alt="Company photo preview" ${profile.avatarUrl ? '' : 'hidden'}>
                <div class="company-verification-editor">
                    <strong>Verification checklist</strong>
                    <p class="card-summary">${countCompletedRequirements(companyAccounts[currentUser.companyId].verificationRequirements)} of ${Object.keys(companyAccounts[currentUser.companyId].verificationRequirements).length} requirements completed.</p>
                    ${Object.entries(companyAccounts[currentUser.companyId].verificationRequirements).map(([key, complete]) => `
                        <label class="verification-item">
                            <input type="checkbox" class="verification-toggle" data-requirement="${key}" ${key === 'goodStanding' ? '' : 'disabled'} ${complete ? 'checked' : ''}>
                            <span>${formatRequirementLabel(key)}</span>
                            <strong>${complete ? 'Complete' : 'Pending'}</strong>
                        </label>
                        <p class="card-summary verification-source">${getRequirementSourceLabel(key)}</p>
                    `).join('')}
                </div>
                <div class="profile-edit-actions">
                    <button id="save-company-profile-btn" type="button">Save Company Profile</button>
                    <button id="cancel-company-profile-btn" type="button">Cancel</button>
                </div>
            `;
            profileFields.appendChild(editor);
        }
    }

    if (isCurrentUsersProfile) {
        const photoButton = document.createElement('button');
        photoButton.type = 'button';
        photoButton.textContent = isEditingOwnProfilePhoto ? 'Close Photo Form' : 'Update Profile Photo';
        photoButton.onclick = () => toggleOwnProfilePhotoEditor();
        profileAdminTools.appendChild(photoButton);

        if (isEditingOwnProfilePhoto) {
            const photoEditor = document.createElement('div');
            photoEditor.className = 'profile-admin-panel';
            photoEditor.innerHTML = `
                <div class="company-form-intro">
                    <p class="section-eyebrow">Profile Photo</p>
                    <h4>Upload a profile photo</h4>
                    <p>Choose a clear photo that buyers and sellers can recognize easily.</p>
                </div>
                <label for="profile-photo-tab-input"><strong>Profile photo</strong></label>
                <input id="profile-photo-tab-input" type="file" accept="image/*">
                <img id="profile-photo-tab-preview" class="upload-preview inline-upload-preview" alt="Profile photo preview" ${currentUser.avatarUrl ? '' : 'hidden'}>
                <div class="profile-edit-actions">
                    <button id="save-profile-photo-tab-btn" type="button">Save Photo</button>
                    <button id="cancel-profile-photo-tab-btn" type="button">Cancel</button>
                </div>
            `;
            profileAdminTools.appendChild(photoEditor);
        }
    }

    showTab('profile');

    if (canManageCompanyProfile && isEditingCompanyProfile) {
        document.getElementById('save-company-profile-btn').onclick = () => saveCompanyProfileEdits();
        document.getElementById('cancel-company-profile-btn').onclick = () => toggleCompanyProfileEditor(false);
        setPreviewImage(document.getElementById('company-photo-preview'), profile.avatarUrl || '', 'Company photo preview');
        document.getElementById('company-photo-edit').onchange = async () => {
            try {
                await previewSelectedImage(
                    document.getElementById('company-photo-edit'),
                    document.getElementById('company-photo-preview'),
                    profile.avatarUrl || '',
                    'Company photo preview'
                );
            } catch (error) {
                showToast(error.message || 'Could not preview the company photo');
            }
        };
        document.querySelectorAll('.verification-toggle').forEach(toggle => {
            toggle.onchange = (event) => updateVerificationRequirement(event.target.dataset.requirement, event.target.checked, false);
        });
    }

    if (isCurrentUsersProfile && isEditingOwnProfilePhoto) {
        setPreviewImage(document.getElementById('profile-photo-tab-preview'), currentUser.avatarUrl || '', 'Profile photo preview');
        document.getElementById('save-profile-photo-tab-btn').onclick = () => saveOwnProfilePhoto();
        document.getElementById('cancel-profile-photo-tab-btn').onclick = () => toggleOwnProfilePhotoEditor(false);
        document.getElementById('profile-photo-tab-input').onchange = async () => {
            try {
                await previewSelectedImage(
                    document.getElementById('profile-photo-tab-input'),
                    document.getElementById('profile-photo-tab-preview'),
                    currentUser.avatarUrl || '',
                    'Profile photo preview'
                );
            } catch (error) {
                showToast(error.message || 'Could not preview the selected profile photo');
            }
        };
    }
}

function startConversationFromDetail(){
    const listing = JSON.parse(detailMessage.dataset.listing || '{}');
    if (!listing.title) return;
    startConversation({
        id: currentDetailListing?.id || null,
        title: listing.title,
        location: listing.location || 'Marketplace',
        category: listing.category,
        sellerId: listing.sellerId,
        contact: listing.contact,
        userId: currentDetailListing?.userId || null,
        postedByName: currentDetailListing?.postedByName || listing.contact,
    });
}

async function startConversation(listing){
    if (listing.userId && listing.userId === currentUser.id) {
        showToast('You cannot message your own listing');
        return;
    }

    if (supabaseClient && currentUser.id && listing.userId) {
        const persistedConversation = await ensurePersistedConversationForListing(listing);
        if (persistedConversation) {
            await loadPersistedConversations();
            activeConversationId = persistedConversation.id;
            mobileMessagesView = 'chat';
            clearMessageComposer();
            showTab('messages');
            renderMessagesTab();
            showToast(`Opened conversation for ${listing.title}`);
            return;
        }
    }

    const contactName = listing.contact || profiles[listing.sellerId]?.name || `${listing.title} Seller`;
    const sellerProfile = profiles[listing.sellerId];
    const existingConversation = conversations.find(conversation =>
        conversation.listingTitle === listing.title && conversation.contact === contactName
    );
    if (existingConversation) {
        activeConversationId = existingConversation.id;
    } else {
        const newConversation = {
            id: `conv-${Date.now()}`,
            listingId: listing.id || null,
            listingTitle: listing.title,
            contact: contactName,
            sellerId: listing.sellerId || null,
            role: sellerProfile?.type || (listing.category === 'Services' ? 'Service Provider' : 'Seller'),
            location: listing.location || 'Marketplace',
            lastUpdated: 'Just now',
            messages: [
                { author: contactName, text: `Thanks for your interest in ${listing.title}. How can I help?`, time: 'Now', mine: false },
            ],
        };
        conversations.unshift(newConversation);
        activeConversationId = newConversation.id;
    }
    mobileMessagesView = 'chat';
    clearMessageComposer();
    showTab('messages');
    showToast(`Opened conversation for ${listing.title}`);
}

function renderMessagesTab(){
    conversationList.innerHTML = '';
    const activeConversation = conversations.find(conversation => conversation.id === activeConversationId) || conversations[0];

    if (!activeConversation && !conversations.length) {
        if (activeChatAvatar) {
            activeChatAvatar.innerHTML = '';
        }
        activeChatTitle.textContent = 'No conversations';
        activeChatMeta.textContent = 'Start from a listing.';
        messagesEmpty.style.display = 'block';
        chatThread.innerHTML = '';
        clearMessageComposer();
        syncMessagesView();
        return;
    }

    if (activeConversation) {
        activeConversationId = activeConversation.id;
    }

    conversations.forEach(conversation => {
        const conversationProfile = getConversationProfile(conversation);
        const conversationAvatar = renderAvatarMarkup({
            name: conversation.contact,
            avatarUrl: conversationProfile?.avatarUrl || '',
            imageClassName: 'avatar-image',
            fallbackClassName: 'avatar-fallback',
        });
        const card = document.createElement('div');
        card.className = `conversation-card${conversation.id === activeConversationId ? ' active' : ''}`;
        const lastMessage = [...conversation.messages].reverse().find(message => message.text?.trim() || message.attachments?.length);
        const conversationPreview = lastMessage?.text?.trim()
            || (lastMessage?.attachments?.length ? 'Media attachment' : getConversationPresenceLabel(conversation));
        card.innerHTML = `
            <span class="conversation-avatar">${conversationAvatar}</span>
            <span class="conversation-content">
                <strong>${conversation.contact}</strong>
                <p class="conversation-subtitle">${conversationPreview}</p>
            </span>
        `;
        card.onclick = () => {
            activeConversationId = conversation.id;
            mobileMessagesView = 'chat';
            clearMessageComposer();
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
    const conversationProfile = getConversationProfile(conversation);
    currentProfileId = conversation.sellerId || null;

    if (activeChatAvatar) {
        activeChatAvatar.innerHTML = renderAvatarMarkup({
            name: conversation.contact,
            avatarUrl: conversationProfile?.avatarUrl || '',
            imageClassName: 'avatar-image',
            fallbackClassName: 'avatar-fallback',
        });
    }
    activeChatTitle.textContent = conversation.contact;
    activeChatMeta.textContent = getConversationPresenceLabel(conversation);
    messagesEmpty.style.display = 'none';
    chatThread.innerHTML = '';

    conversation.messages.forEach(message => {
        const bubble = document.createElement('div');
        bubble.className = `message-row${message.mine ? ' mine' : ''}`;
        const authorAvatar = message.mine
            ? renderAvatarMarkup({
                name: currentUser.name,
                avatarUrl: currentUser.avatarUrl || '',
                imageClassName: 'avatar-image',
                fallbackClassName: 'avatar-fallback',
            })
            : renderAvatarMarkup({
                name: conversation.contact,
                avatarUrl: conversationProfile?.avatarUrl || '',
                imageClassName: 'avatar-image',
                fallbackClassName: 'avatar-fallback',
            });
        bubble.innerHTML = `
            <span class="message-author-avatar">${authorAvatar}</span>
            <div class="message-bubble${message.mine ? ' mine' : ''}">
                ${message.text ? `<p>${message.text}</p>` : ''}
                ${message.attachments?.length ? `
                    <div class="message-attachments">
                        ${message.attachments.map((attachment, index) => attachment.type.startsWith('video/')
                            ? `<video controls preload="metadata" src="${attachment.dataUrl}" aria-label="Video attachment ${index + 1}"></video>`
                            : `<img src="${attachment.dataUrl}" alt="${attachment.name || `Image attachment ${index + 1}`}">`
                        ).join('')}
                    </div>
                ` : ''}
                <span class="message-meta">${message.author} • ${formatMessageTimestamp(message.sentAt, message.time)}</span>
            </div>
        `;
        chatThread.appendChild(bubble);
    });

    chatThread.scrollTop = chatThread.scrollHeight;
}

function getConversationPresenceLabel(conversation){
    if (conversation.online) {
        return 'Online';
    }
    if (conversation.lastSeen) {
        return `Last seen ${conversation.lastSeen}`;
    }
    return 'Offline';
}

async function sendMessage(){
    const text = messageInput.value.trim();
    const conversation = conversations.find(item => item.id === activeConversationId);
    if ((!text && !selectedMessageMedia.length) || !conversation) return;

    const messagePayload = {
        author: 'You',
        text,
        time: getCurrentTimeLabel(),
        sentAt: new Date().toISOString(),
        mine: true,
        attachments: selectedMessageMedia.map(file => ({ ...file })),
    };

    if (conversation.persisted) {
        const saveSucceeded = await savePersistedMessage(conversation.id, messagePayload);
        if (!saveSucceeded) {
            return;
        }
        await refreshRealtimeMessagesView();
        clearMessageComposer();
        showToast('Message sent');
        return;
    }

    conversation.messages.push(messagePayload);
    conversation.lastUpdated = 'Just now';
    clearMessageComposer();
    renderMessagesTab();
    showToast('Message sent');
}

function deleteConversation(conversationId){
    const targetConversation = conversations.find(item => item.id === conversationId);
    if (!targetConversation) return;
    conversations = conversations.filter(item => item.id !== conversationId);

    if (activeConversationId === conversationId) {
        activeConversationId = conversations[0]?.id || null;
        if (!conversations.length) {
            mobileMessagesView = 'inbox';
        }
    }

    clearMessageComposer();
    renderMessagesTab();
    showToast(`Deleted chat with ${targetConversation.contact} from your inbox`);
}

function callActiveConversation(){
    const conversation = conversations.find(item => item.id === activeConversationId);
    if (!conversation) return;
    openInAppCall(conversation);
}

function openActiveConversationProfile(){
    const conversation = conversations.find(item => item.id === activeConversationId);
    if (!conversation?.sellerId) return;
    openProfile(conversation.sellerId);
}

function toggleChatOptionsMenu(){
    if (!chatOptionsMenu) return;
    chatOptionsMenu.hidden = !chatOptionsMenu.hidden;
}

function closeChatOptionsMenu(){
    if (!chatOptionsMenu) return;
    chatOptionsMenu.hidden = true;
}

async function openInAppCall(conversation){
    if (!conversation || !callScreen) return;
    closeChatOptionsMenu();
    activeCallConversationId = conversation.id;
    isCallMuted = false;
    isSpeakerMode = false;
    updateCallControlState();
    callName.textContent = conversation.contact;
    callStatus.textContent = 'Calling...';
    callDuration.hidden = true;
    callDuration.textContent = '00:00';

    const conversationProfile = getConversationProfile(conversation);
    if (callAvatar) {
        callAvatar.innerHTML = renderAvatarMarkup({
            name: conversation.contact,
            avatarUrl: conversationProfile?.avatarUrl || '',
            imageClassName: 'avatar-image',
            fallbackClassName: 'avatar-fallback',
        });
    }

    callScreen.hidden = false;

    if (!navigator.mediaDevices?.getUserMedia) {
        callStatus.textContent = 'Audio calling is not supported on this device';
        return;
    }

    try {
        activeCallStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        activeCallStartedAt = Date.now();
        callStatus.textContent = 'Connected';
        callDuration.hidden = false;
        startCallTimer();
        showToast(`Call started with ${conversation.contact}`);
    } catch (error) {
        console.error('Failed to start call', error);
        callStatus.textContent = 'Microphone permission needed';
    }
}

function startCallTimer(){
    stopCallTimer();
    updateCallDuration();
    activeCallTimerId = window.setInterval(() => {
        updateCallDuration();
    }, 1000);
}

function stopCallTimer(){
    if (!activeCallTimerId) return;
    window.clearInterval(activeCallTimerId);
    activeCallTimerId = null;
}

function updateCallDuration(){
    if (!activeCallStartedAt || !callDuration) return;
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - activeCallStartedAt) / 1000));
    const minutes = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
    const seconds = String(elapsedSeconds % 60).padStart(2, '0');
    callDuration.textContent = `${minutes}:${seconds}`;
}

function toggleCallMute(){
    if (!activeCallStream) return;
    isCallMuted = !isCallMuted;
    activeCallStream.getAudioTracks().forEach(track => {
        track.enabled = !isCallMuted;
    });
    updateCallControlState();
}

function toggleSpeakerMode(){
    isSpeakerMode = !isSpeakerMode;
    updateCallControlState();
    showToast(isSpeakerMode ? 'Speaker enabled' : 'Speaker disabled');
}

function updateCallControlState(){
    if (callMuteButton) {
        callMuteButton.classList.toggle('is-active', isCallMuted);
        callMuteButton.textContent = isCallMuted ? 'Muted' : 'Mute';
    }
    if (callSpeakerButton) {
        callSpeakerButton.classList.toggle('is-active', isSpeakerMode);
        callSpeakerButton.textContent = isSpeakerMode ? 'Speaker On' : 'Speaker';
    }
}

function endActiveCall(showEndedToast = false){
    if (activeCallStream) {
        activeCallStream.getTracks().forEach(track => track.stop());
        activeCallStream = null;
    }
    stopCallTimer();
    activeCallStartedAt = null;
    activeCallConversationId = null;
    isCallMuted = false;
    isSpeakerMode = false;
    updateCallControlState();
    if (callScreen) {
        callScreen.hidden = true;
    }
    if (showEndedToast) {
        showToast('Call ended');
    }
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

function handleSignedInSession(session, message, options = {}){
    const authContextMessage = syncCurrentUserFromSession(session, options);
    const savedReturnTab = localStorage.getItem('farmyard-return-tab');
    const destination = savedReturnTab || returnTabAfterAuth || 'home';
    localStorage.removeItem('farmyard-return-tab');
    Object.values(authScreens).forEach(screen => setElementVisibility(screen, false, 'flex'));
    setElementVisibility(app, true);
    updateAuthButtons(true);
    showTab(destination, { skipHistory: true });
    showToast(authContextMessage || message);
    loadPersistedAccountData();
}

function syncCurrentUserFromSession(session, options = {}){
    const user = session?.user;
    if (!user) {
        hydrateCurrentUser(userAccounts['guest@farmyard.app']);
        ensureProfileForAccount(userAccounts['guest@farmyard.app']);
        return '';
    }
    const normalizedEmail = normalizeEmail(user.email || currentUser.email);
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name || currentUser.name;
    const inviteCode = (options.inviteCode || '').trim().toUpperCase();
    let contextMessage = '';

    if (inviteCode) {
        contextMessage = claimCompanyInvite(normalizedEmail, inviteCode, fullName, user.id) || '';
    }

    const account = getOrCreateUserAccount(normalizedEmail, fullName, user.id);
    hydrateCurrentUser(account);
    ensureProfileForAccount(account);
    profiles[currentUser.id].name = currentUser.name;
    profiles[currentUser.id].fields.email.value = currentUser.email;
    if (!contextMessage) {
        const pendingInvite = findPendingInviteByEmail(normalizedEmail);
        if (pendingInvite && currentUser.accessStatus === 'Independent account') {
            contextMessage = 'A company invite exists for this email. Enter the invite code to claim company access.';
        } else if (currentUser.accessStatus === 'Invite claimed - awaiting admin activation') {
            contextMessage = 'Your company invite is claimed and waiting for admin activation.';
        }
    }
    return contextMessage;
}

function normalizeEmail(email){
    return (email || '').trim().toLowerCase();
}

function slugifyValue(value){
    return (value || 'user')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'user';
}

function buildSecurityState(){
    return { ...DEFAULT_SECURITY };
}

function buildVerificationPlanState(){
    return { ...DEFAULT_VERIFICATION_PLAN };
}

function buildIndividualProfile(account){
    const companyName = account.companyId && companyAccounts[account.companyId]
        ? companyAccounts[account.companyId].name
        : 'Independent';
    return {
        id: account.id,
        name: account.name,
        avatarUrl: account.avatarUrl || '',
        type: 'Individual Profile',
        about: 'FarmYard member account used for agricultural trading and marketplace communication.',
        verified: false,
        verificationPlan: buildVerificationPlanState(),
        rating: account.communityRating || 5,
        ratingCount: account.ratingCount || 1,
        completedDeals: 0,
        fields: {
            location: { label: 'Location', value: account.location || 'Not set', visible: true },
            phone: { label: 'Phone', value: account.phone || 'Not set', visible: false },
            email: { label: 'Email', value: account.email, visible: false },
            companyRole: { label: 'Company Role', value: account.companyRole || 'Independent seller', visible: true },
            companyName: { label: 'Selling For', value: companyName, visible: true },
        },
    };
}

function ensureProfileForAccount(account){
    if (!profiles[account.id]) {
        profiles[account.id] = buildIndividualProfile(account);
    }
    profiles[account.id].name = account.name;
    profiles[account.id].avatarUrl = account.avatarUrl || profiles[account.id].avatarUrl || '';
    profiles[account.id].fields.location.value = account.location;
    profiles[account.id].fields.phone.value = account.phone;
    profiles[account.id].fields.email.value = account.email;
    profiles[account.id].fields.companyRole.value = account.companyRole || 'Independent seller';
    profiles[account.id].fields.companyName.value = account.companyId && companyAccounts[account.companyId]
        ? companyAccounts[account.companyId].name
        : 'Independent';
}

function buildBaseUserAccount(email, fullName, userId){
    return {
        id: userId || `user-${slugifyValue(email)}`,
        name: fullName || 'FarmYard User',
        avatarUrl: '',
        role: 'Buyer and Seller',
        accountType: 'Individual Profile',
        location: 'Set your trading location',
        phone: 'Add your phone number',
        email,
        verified: false,
        communityRating: 5,
        ratingCount: 1,
        companyId: null,
        companyRole: null,
        accessStatus: 'Independent account',
        permissions: {
            canPostForCompany: false,
            canManageCompany: false,
            canApproveInvites: false,
        },
        security: buildSecurityState(),
        verificationPlan: buildVerificationPlanState(),
    };
}

function getOrCreateUserAccount(email, fullName, userId){
    const normalizedEmail = normalizeEmail(email);
    if (!userAccounts[normalizedEmail]) {
        userAccounts[normalizedEmail] = buildBaseUserAccount(normalizedEmail, fullName, userId);
    }
    const account = userAccounts[normalizedEmail];
    account.email = normalizedEmail;
    account.name = fullName || account.name;
    account.id = userId || account.id;
    account.avatarUrl = account.avatarUrl || '';
    return account;
}

function hydrateCurrentUser(account){
    currentUser.id = account.id;
    currentUser.name = account.name;
    currentUser.avatarUrl = account.avatarUrl || '';
    currentUser.role = account.role;
    currentUser.accountType = account.accountType;
    currentUser.location = account.location;
    currentUser.phone = account.phone;
    currentUser.email = account.email;
    currentUser.verified = account.verified;
    currentUser.communityRating = account.communityRating;
    currentUser.ratingCount = account.ratingCount;
    currentUser.companyId = account.companyId;
    currentUser.companyRole = account.companyRole;
    currentUser.accessStatus = account.accessStatus;
    currentUser.permissions = { ...account.permissions };
    currentUser.security = { ...account.security };
    currentUser.verificationPlan = { ...account.verificationPlan };
}

function persistCurrentUserAccount(previousEmail = currentUser.email){
    const normalizedPreviousEmail = normalizeEmail(previousEmail);
    const normalizedCurrentEmail = normalizeEmail(currentUser.email);
    if (normalizedPreviousEmail && normalizedPreviousEmail !== normalizedCurrentEmail) {
        delete userAccounts[normalizedPreviousEmail];
    }
    userAccounts[normalizedCurrentEmail] = {
        id: currentUser.id,
        name: currentUser.name,
        avatarUrl: currentUser.avatarUrl || '',
        role: currentUser.role,
        accountType: currentUser.accountType,
        location: currentUser.location,
        phone: currentUser.phone,
        email: normalizedCurrentEmail,
        verified: currentUser.verified,
        communityRating: currentUser.communityRating,
        ratingCount: currentUser.ratingCount,
        companyId: currentUser.companyId,
        companyRole: currentUser.companyRole,
        accessStatus: currentUser.accessStatus,
        permissions: { ...currentUser.permissions },
        security: { ...currentUser.security },
        verificationPlan: { ...currentUser.verificationPlan },
    };
    persistLocalAppState();
}

function findPendingInviteByEmail(email){
    const normalizedEmail = normalizeEmail(email);
    return Object.values(companyAccounts).flatMap(company =>
        company.pendingInvites.map(invite => ({ company, invite }))
    ).find(({ invite }) => normalizeEmail(invite.email) === normalizedEmail);
}

function findCompanyMembershipByEmail(email){
    const normalizedEmail = normalizeEmail(email);
    return Object.values(companyAccounts).find(company =>
        company.members.some(member => normalizeEmail(member.email) === normalizedEmail)
    ) || null;
}

function claimCompanyInvite(email, inviteCode, fullName, userId){
    const normalizedEmail = normalizeEmail(email);
    const existingAccount = userAccounts[normalizedEmail];
    if (existingAccount?.companyId) {
        const existingCompany = companyAccounts[existingAccount.companyId];
        return `This user is already assigned to ${existingCompany?.name || 'another company'} and cannot join a second sales team`;
    }
    const match = Object.values(companyAccounts).flatMap(company =>
        company.pendingInvites.map(invite => ({ company, invite }))
    ).find(({ invite }) =>
        normalizeEmail(invite.email) === normalizedEmail
        && invite.inviteCode === inviteCode
        && invite.status !== 'Revoked'
    );

    if (!match) {
        return 'No valid company invite matched that email and code';
    }

    const { company, invite } = match;
    if (invite.expiresOn && invite.expiresOn < '2026-04-05') {
        return 'This company invite has expired';
    }

    invite.status = 'Claimed by user';
    invite.claimedAt = '2026-04-05';
    invite.linkedUserId = userId;
    invite.name = fullName || invite.name;

    const account = getOrCreateUserAccount(normalizedEmail, fullName || invite.name, userId);
    account.role = invite.role;
    account.location = profiles[company.id]?.fields.location?.value || account.location;
    account.phone = invite.phone || account.phone;
    account.companyId = company.id;
    account.companyRole = invite.role;
    account.accessStatus = 'Invite claimed - awaiting admin activation';
    account.permissions = {
        canPostForCompany: false,
        canManageCompany: false,
        canApproveInvites: false,
    };
    ensureProfileForAccount(account);
    return `Invite claimed for ${company.name}. Access will be active after admin approval.`;
}

function updateAuthButtons(isAuthenticated){
    openLoginBtn.style.display = isAuthenticated ? 'none' : 'inline-flex';
    openRegisterBtn.style.display = isAuthenticated ? 'none' : 'inline-flex';
}

async function initializeAuth(){
    updateAuthButtons(false);
    if (!supabaseClient) {
        hydrateCurrentUser(userAccounts['guest@farmyard.app']);
        ensureProfileForAccount(userAccounts['guest@farmyard.app']);
        conversations = [...fallbackConversations];
        activeConversationId = conversations[0]?.id || null;
        refreshMarketplace();
        renderUserListings();
        return;
    }
    const restoredSession = await restoreOAuthSessionFromUrl();
    const { data, error } = restoredSession
        ? { data: { session: restoredSession }, error: null }
        : await supabaseClient.auth.getSession();
    if (error) {
        showToast(error.message);
        return;
    }

    if (data.session) {
        syncCurrentUserFromSession(data.session);
        updateAuthButtons(true);
        await loadPersistedAccountData();
        startMessagesRealtime();
        const savedReturnTab = localStorage.getItem('farmyard-return-tab');
        if (savedReturnTab) {
            localStorage.removeItem('farmyard-return-tab');
            showTab(savedReturnTab, { skipHistory: true });
        }
    }
    if (!data.session) {
        hydrateCurrentUser(userAccounts['guest@farmyard.app']);
        ensureProfileForAccount(userAccounts['guest@farmyard.app']);
        conversations = [...fallbackConversations];
        activeConversationId = conversations[0]?.id || null;
        refreshMarketplace();
        renderUserListings();
    }

    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
            syncCurrentUserFromSession(session);
            updateAuthButtons(true);
            loadPersistedAccountData().then(() => {
                stopMessagesRealtime();
                startMessagesRealtime();
                if (getActiveTabName() === 'messages') {
                    renderMessagesTab();
                }
            });
        }
        if (event === 'SIGNED_OUT') {
            hydrateCurrentUser(userAccounts['guest@farmyard.app']);
            ensureProfileForAccount(userAccounts['guest@farmyard.app']);
            updateAuthButtons(false);
            userListings = [];
            marketplaceListings = [];
            conversations = [...fallbackConversations];
            activeConversationId = conversations[0]?.id || null;
            stopMessagesRealtime();
            refreshMarketplace();
            renderUserListings();
            renderMessagesTab();
        }
    });
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
    closeChatOptionsMenu();
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

document.addEventListener('click', (event) => {
    if (!chatOptionsMenu || chatOptionsMenu.hidden) return;
    if (chatOptionsMenu.contains(event.target) || chatOptionsButton?.contains(event.target)) return;
    closeChatOptionsMenu();
});

window.addEventListener('beforeunload', () => {
    endActiveCall(false);
});

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
    const companyAccount = currentUser.companyId ? companyAccounts[currentUser.companyId] : null;
    const companyProfile = currentUser.companyId ? profiles[currentUser.companyId] : null;
    if (companyAccount && companyProfile) {
        syncVerificationRequirementsFromCompanyProfile(companyProfile, companyAccount);
    }
    const negotiableCount = userListings.filter(listing => listing.negotiable).length;
    const categories = new Set(userListings.map(listing => listing.category)).size;
    const savedCount = savedListings.length;
    const ordersCount = orderRequests.length;
    const reportsCount = reportedListings.length;
    const ratingsGivenCount = ratingsGiven.length;
    const userReportsCount = userReports.length;
    const isCompanyAdmin = currentUser.companyRole === 'Admin';
    const accountRelationship = currentUser.companyId && companyAccount
        ? `Selling on behalf of ${companyAccount.name}`
        : 'Independent seller account';
    const accountAccessLine = currentUser.companyId && companyAccount
        ? (isCompanyAdmin
            ? `You are the admin for ${companyAccount.name}`
            : `You are a sales representative for ${companyAccount.name}`)
        : 'You manage your own listings, profile, and buyer conversations.';
    const verificationStatus = companyProfile?.verificationPlan?.subscribed
        ? 'Verified Company approved'
        : (companyProfile ? 'Pending verification review' : 'No company linked');
    const seatUsage = companyAccount ? `${companyAccount.members.length + companyAccount.pendingInvites.length} / ${companyAccount.maxSalesMembers}` : '0 / 0';
    const savedMarkup = savedListings.length
        ? savedListings.map(item => `<p>${item.title} • ${item.location}</p>`).join('')
        : '<div class="mini-empty-state"><strong>No saved listings yet</strong><p>Saved produce, goods, and services will appear here.</p></div>';
    const ordersMarkup = orderRequests.length
        ? orderRequests.map(item => `<p>${item.title} • ${item.type}: ${item.status}${item.note ? ` • ${item.note}` : ''}</p>`).join('')
        : '<div class="mini-empty-state"><strong>No order requests yet</strong><p>Incoming requests and schedules will appear here.</p></div>';
    const ratingsMarkup = ratingsGiven.length
        ? ratingsGiven.map(item => `<p>${item.contact} • ${item.rating}/5${item.note ? ` • ${item.note}` : ''}</p>`).join('')
        : '<div class="mini-empty-state"><strong>No ratings submitted</strong><p>Ratings you leave for buyers or sellers will show here.</p></div>';
    const userReportsMarkup = userReports.length
        ? userReports.map(item => `<p>${item.contact} • ${item.status} • ${item.note}</p>`).join('')
        : '<div class="mini-empty-state"><strong>No user reports filed</strong><p>Any safety or conduct reports will be listed here.</p></div>';
    const moderationMarkup = reportedListings.length
        ? reportedListings.map(item => `<p>${item.title} • ${item.status}</p>`).join('')
        : '<div class="mini-empty-state"><strong>No moderation items</strong><p>Reported listings and moderation updates will appear here.</p></div>';
    const teamMarkup = companyAccount
        ? companyAccount.members.map(member => `
            <div class="team-invite-item">
                <p><strong>${member.name}</strong> • ${member.role}</p>
                <p>${member.email || 'No email on file'} • ${member.phone || 'No phone on file'}</p>
                <p>${member.status}${member.nationalId ? ` • ID: ${member.nationalId}` : ''}</p>
                ${(isCompanyAdmin && member.role !== 'Admin') || (member.id === currentUser.id && currentUser.companyRole !== 'Admin')
                    ? `<div class="security-actions">
                        ${isCompanyAdmin && member.role !== 'Admin'
                            ? `<button class="btn btn-danger remove-member-btn" type="button" data-member-id="${member.id}">Remove Access</button>`
                            : ''}
                        ${member.id === currentUser.id && currentUser.companyRole !== 'Admin'
                            ? `<button class="btn btn-secondary leave-team-btn" type="button">Leave Company Team</button>`
                            : ''}
                    </div>`
                    : ''}
            </div>
        `).join('')
        : '<p class="card-summary">No company sales team assigned.</p>';
    const inviteMarkup = companyAccount?.pendingInvites?.length
        ? companyAccount.pendingInvites.map(invite => `
            <div class="team-invite-item">
                <p><strong>${invite.name}</strong> • ${invite.role}</p>
                <p>${invite.email} • ${invite.phone}</p>
                <p>ID: ${invite.nationalId} • ${invite.status}</p>
                <p>Invite code: ${invite.inviteCode} • Expires ${invite.expiresOn}</p>
                ${isCompanyAdmin ? `<div class="security-actions">
                    ${invite.status === 'Claimed by user'
                        ? `<button class="btn btn-primary approve-invite-btn" type="button" data-invite-id="${invite.id}">Activate Access</button>`
                        : `<button class="btn btn-secondary resend-invite-btn" type="button" data-invite-id="${invite.id}">Resend Details</button>`}
                    <button class="btn btn-danger remove-invite-btn" type="button" data-invite-id="${invite.id}">Revoke Invite</button>
                </div>` : ''}
            </div>
        `).join('')
        : '<p class="card-summary">No pending rep invitations.</p>';
    const companyCreationMarkup = companyProfile
        ? ''
        : `
        <section class="account-section account-card">
            <div class="section-heading">
                <p class="section-eyebrow">Company</p>
                <h3>Create Company Profile</h3>
            </div>
            <div class="security-actions">
                <button id="open-company-creation-btn" class="btn btn-primary" type="button">${isCreatingCompanyProfile ? 'Close Company Form' : 'Create Company Profile'}</button>
            </div>
            <div class="team-invite-form company-form-card ${isCreatingCompanyProfile ? 'is-visible' : ''}">
                <div class="company-form-intro">
                    <p class="section-eyebrow">Business Setup</p>
                    <h4>Set up your company profile</h4>
                    <p>Add the core details buyers, verification review, and your sales team will rely on.</p>
                </div>
                <label for="create-company-name">Company name</label>
                <input id="create-company-name" type="text" placeholder="FarmYard Traders Ltd">
                <label for="create-company-location">Head office</label>
                <input id="create-company-location" type="text" placeholder="Town, district, or industrial area">
                <label for="create-company-phone">Company phone</label>
                <input id="create-company-phone" type="text" placeholder="+256...">
                <label for="create-company-email">Company email</label>
                <input id="create-company-email" type="email" placeholder="sales@company.com">
                <label for="create-company-registration">Registration</label>
                <input id="create-company-registration" type="text" placeholder="Registration number">
                <label for="create-company-certification">Permits or certifications</label>
                <input id="create-company-certification" type="text" placeholder="Optional permits or quality marks">
                <label for="create-company-about">About company</label>
                <textarea id="create-company-about" rows="4" placeholder="Describe what your company sells and where it operates."></textarea>
                <label for="create-company-photo">Company photo or logo</label>
                <input id="create-company-photo" type="file" accept="image/*">
                <img id="create-company-photo-preview" class="upload-preview inline-upload-preview" alt="Company photo preview" hidden>
                <div class="profile-edit-actions">
                    <button id="submit-company-creation-btn" class="btn btn-primary" type="button">Create Company</button>
                    <button id="cancel-company-creation-btn" class="btn btn-secondary" type="button">Cancel</button>
                </div>
            </div>
        </section>
        `;
    const profileEditorMarkup = isEditingProfile
        ? `
                <div class="inline-form-panel">
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
                            <label for="edit-company-role">Company role</label>
                            <input id="edit-company-role" type="text" value="${profiles[currentUser.id].fields.companyRole?.value || ''}">
                        </div>
                    </div>
                    <label for="edit-about">About</label>
                    <textarea id="edit-about" rows="4">${profiles[currentUser.id].about}</textarea>
                    <label for="edit-profile-photo">Profile photo</label>
                    <input id="edit-profile-photo" type="file" accept="image/*">
                    <img id="edit-profile-photo-preview" class="upload-preview inline-upload-preview" alt="Profile photo preview" ${currentUser.avatarUrl ? '' : 'hidden'}>
                    <div class="profile-edit-actions">
                        <button id="save-profile-btn" class="btn btn-primary" type="button">Save Profile</button>
                        <button id="cancel-profile-edit" class="btn btn-secondary" type="button">Cancel</button>
                    </div>
                    <div class="section-divider"></div>
                    <div class="section-heading compact">
                        <h3>Profile Privacy</h3>
                        <p>Choose what buyers and other sellers can see on your public profile.</p>
                    </div>
                    <div class="privacy-controls">
                        <button id="toggle-location-visibility" class="btn btn-secondary" type="button">${profiles[currentUser.id].fields.location.visible ? 'Hide' : 'Show'} Location</button>
                        <button id="toggle-phone-visibility" class="btn btn-secondary" type="button">${profiles[currentUser.id].fields.phone.visible ? 'Hide' : 'Show'} Phone</button>
                        <button id="toggle-email-visibility" class="btn btn-secondary" type="button">${profiles[currentUser.id].fields.email.visible ? 'Hide' : 'Show'} Email</button>
                    </div>
                    <div class="section-divider"></div>
                    <div class="section-heading compact">
                        <h3>Account Security</h3>
                        <p>Keep your seller access secure across shared devices and team logins.</p>
                    </div>
                    <div class="detail-list">
                        <p><strong>Password updated</strong><span>${currentUser.security.passwordUpdated}</span></p>
                        <p><strong>Two-factor authentication</strong><span>${currentUser.security.twoFactorEnabled ? 'Enabled' : 'Not enabled'}</span></p>
                        <p><strong>Active sessions</strong><span>${currentUser.security.activeSessions}</span></p>
                        <p><strong>Login alerts</strong><span>${currentUser.security.loginAlerts ? 'Enabled' : 'Disabled'}</span></p>
                    </div>
                    <div class="security-actions">
                        <button id="change-password-btn" class="btn btn-primary" type="button">Change Password</button>
                        <button id="toggle-2fa-btn" class="btn btn-secondary" type="button">${currentUser.security.twoFactorEnabled ? 'Disable' : 'Enable'} 2FA</button>
                        <button id="toggle-alerts-btn" class="btn btn-secondary" type="button">${currentUser.security.loginAlerts ? 'Disable' : 'Enable'} Alerts</button>
                        <button id="signout-sessions-btn" class="btn btn-secondary" type="button">Sign Out Other Sessions</button>
                    </div>
                </div>
            `
        : '';

    acc.innerHTML = `
        <section class="account-section account-hero">
            <div class="account-hero-copy">
                <p class="account-kicker">Individual Account</p>
                <h2>${currentUser.name}</h2>
                <p class="account-hero-subtitle">${currentUser.role} • ${currentUser.location}</p>
                <p class="account-hero-meta">${accountRelationship}</p>
                <p class="account-hero-meta">${accountAccessLine}</p>
                <div class="account-pill-row">
                    <span class="account-pill">${currentUser.accessStatus || 'Independent account'}</span>
                    <span class="account-pill">${currentUser.communityRating.toFixed(1)} stars</span>
                    <span class="account-pill">${userListings.length} active listings</span>
                </div>
                <div class="account-actions hero-actions">
                    <button id="account-post-btn" class="btn btn-primary" type="button">Post New Listing</button>
                    <button id="account-home-btn" class="btn btn-secondary" type="button">View Marketplace</button>
                    <button id="view-profile-btn" class="btn btn-secondary" type="button">View Public Profile</button>
                </div>
            </div>
            <div class="account-avatar">${renderAvatarMarkup({ name: currentUser.name, avatarUrl: currentUser.avatarUrl || '', className: 'account-avatar', imageClassName: 'avatar-image', fallbackClassName: 'avatar-fallback' })}</div>
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

        <section class="account-section account-grid account-overview-grid">
            <div class="account-card">
                <div class="section-heading">
                    <p class="section-eyebrow">Profile</p>
                    <h3>Profile Details</h3>
                </div>
                <div class="detail-list">
                    <p><strong>Email</strong><span>${currentUser.email}</span></p>
                    <p><strong>Phone</strong><span>${currentUser.phone}</span></p>
                    <p><strong>Verification</strong><span>${currentUser.verified ? 'Verified account' : 'Verification required'}</span></p>
                    <p><strong>Account type</strong><span>${currentUser.accountType}</span></p>
                    <p><strong>Trading focus</strong><span>Agriculture products, raw materials, finished goods, and services</span></p>
                </div>
                <div class="profile-summary-actions">
                    <button id="open-profile-editor" class="btn btn-primary" type="button">${isEditingProfile ? 'Close Profile Form' : 'Edit Profile'}</button>
                    <button id="view-company-profile-btn" class="btn btn-secondary" type="button">${companyProfile ? (isCompanyAdmin ? 'Edit Company Profile' : 'View Company Profile') : 'Create Company Profile'}</button>
                </div>
                ${profileEditorMarkup}
            </div>

            <div class="account-card">
                <div class="section-heading">
                    <p class="section-eyebrow">Trust</p>
                    <h3>Company Verification</h3>
                </div>
                <div class="detail-list">
                    <p><strong>Company</strong><span>${companyProfile?.name || 'No company linked'}</span></p>
                    <p><strong>Status</strong><span>${verificationStatus}</span></p>
                    <p><strong>Subscription</strong><span>$${currentUser.verificationPlan.price}/${currentUser.verificationPlan.billing}</span></p>
                    <p><strong>Renewal</strong><span>${companyProfile?.verificationPlan?.renewalDate || 'No renewal date set'}</span></p>
                </div>
                <div class="security-actions">
                    <button id="subscribe-verification-btn" class="btn btn-primary" type="button">${companyProfile?.verificationPlan?.subscribed ? 'Review Verification' : 'Apply For Verification'}</button>
                    <button id="view-verification-term-btn" class="btn btn-secondary" type="button">View Verification Rules</button>
                </div>
            </div>
        </section>

        ${companyCreationMarkup}

        <details class="account-section account-card account-accordion"${showCompanyTeamMembers || showCompanyPendingInvites || isInvitingSalesRep ? ' open' : ''}>
            <summary>
                <div class="section-heading">
                    <p class="section-eyebrow">Access</p>
                    <h3>Company Team</h3>
                </div>
                <span class="accordion-meta">${seatUsage} seats used</span>
            </summary>
            <p class="account-card-note"><strong>Company access:</strong> ${currentUser.companyRole || 'No company role assigned'}</p>
            <div class="security-actions">
                <button id="toggle-team-members-btn" class="btn btn-secondary" type="button">${showCompanyTeamMembers ? 'Hide Team Members' : 'Show Team Members'}</button>
                <button id="toggle-pending-invites-btn" class="btn btn-secondary" type="button">${showCompanyPendingInvites ? 'Hide Pending Invites' : 'Show Pending Invites'}</button>
                ${isCompanyAdmin ? `<button id="open-sales-invite-btn" class="btn btn-primary" type="button">${isInvitingSalesRep ? 'Close Invite Form' : 'Invite Sales Rep'}</button>` : ''}
            </div>
            <div id="company-team-members" class="${showCompanyTeamMembers ? '' : 'is-hidden'}">${teamMarkup}</div>
            <div class="team-invite-list ${showCompanyPendingInvites ? '' : 'is-hidden'}">
                <h4>Pending Invitations</h4>
                <div id="company-pending-invites">${inviteMarkup}</div>
            </div>
            ${isCompanyAdmin ? `
            <div class="team-invite-form ${isInvitingSalesRep ? 'is-visible' : ''}">
                <label for="invite-rep-name">Full name</label>
                <input id="invite-rep-name" type="text" placeholder="Sales representative full name">
                <label for="invite-rep-email">Work email</label>
                <input id="invite-rep-email" type="email" placeholder="rep@company.com">
                <label for="invite-rep-phone">Phone</label>
                <input id="invite-rep-phone" type="text" placeholder="+256...">
                <label for="invite-rep-id">National ID or staff ID</label>
                <input id="invite-rep-id" type="text" placeholder="ID reference">
                <label for="invite-rep-role">Role</label>
                <input id="invite-rep-role" type="text" value="Sales Representative">
                <div class="profile-edit-actions">
                    <button id="submit-sales-invite-btn" class="btn btn-primary" type="button">Send Invite</button>
                    <button id="cancel-sales-invite-btn" class="btn btn-secondary" type="button">Cancel</button>
                </div>
            </div>
            ` : ''}
        </details>

        <section class="account-section account-card">
            <div class="section-heading">
                <p class="section-eyebrow">Shortcuts</p>
                <h3>Quick Actions</h3>
            </div>
            <div class="account-actions">
                <button id="account-legal-btn" class="btn btn-secondary" type="button">Privacy & Terms</button>
                <button id="account-signout-btn" class="btn btn-danger" type="button">Sign Out</button>
            </div>
        </section>

        <section class="account-section">
            <div class="account-listings-header section-heading">
                <p class="section-eyebrow">Listings</p>
                <h3>My Listings</h3>
                <p>Manage the listings buyers can currently see.</p>
            </div>
            <div id="account-listings-grid" class="account-listings-grid"></div>
        </section>

        <details class="account-section account-card account-accordion">
            <summary>
                <div class="section-heading">
                    <p class="section-eyebrow">History</p>
                    <h3>Saved Listings and Orders</h3>
                </div>
                <span class="accordion-meta">${savedCount + ordersCount} items</span>
            </summary>
            <div class="account-grid">
                <div class="account-card nested-card">
                    <h3>Saved Listings</h3>
                    <div id="saved-listings">${savedMarkup}</div>
                </div>
                <div class="account-card nested-card">
                    <h3>Order Requests</h3>
                    <div id="order-requests">${ordersMarkup}</div>
                </div>
            </div>
        </details>

        <details class="account-section account-card account-accordion">
            <summary>
                <div class="section-heading">
                    <p class="section-eyebrow">Safety</p>
                    <h3>Ratings, Reports, and Moderation</h3>
                </div>
                <span class="accordion-meta">${ratingsGivenCount + userReportsCount + reportsCount} items</span>
            </summary>
            <div class="account-grid">
                <div class="account-card nested-card">
                    <h3>Ratings Given</h3>
                    <div id="ratings-given">${ratingsMarkup}</div>
                </div>
                <div class="account-card nested-card">
                    <h3>User Reports</h3>
                    <div id="user-reports">${userReportsMarkup}</div>
                </div>
            </div>
            <div class="account-card nested-card nested-card-full">
                <h3>Reports and Moderation</h3>
                <div id="moderation-items">${moderationMarkup}</div>
            </div>
        </details>
    `;

    document.getElementById('account-post-btn').onclick = () => showTab('post');
    document.getElementById('account-home-btn').onclick = () => showTab('home');
    document.getElementById('account-legal-btn').onclick = () => showTab('legal');
    document.getElementById('account-signout-btn').onclick = () => signOutUser();
    document.getElementById('open-profile-editor').onclick = () => toggleProfileEditor();
    document.getElementById('view-profile-btn').onclick = () => openProfile(currentUser.id);
    document.getElementById('view-company-profile-btn').onclick = () => {
        if (currentUser.companyId) {
            if (isCompanyAdmin) {
                isEditingCompanyProfile = true;
            }
            openProfile(currentUser.companyId);
            return;
        }
        toggleCompanyCreationForm(true);
    };
    document.getElementById('subscribe-verification-btn').onclick = () => toggleCompanyVerification();
    document.getElementById('view-verification-term-btn').onclick = () => showTab('legal');
    if (document.getElementById('open-company-creation-btn')) {
        document.getElementById('open-company-creation-btn').onclick = () => toggleCompanyCreationForm();
        document.getElementById('submit-company-creation-btn').onclick = () => createCompanyProfile();
        document.getElementById('cancel-company-creation-btn').onclick = () => toggleCompanyCreationForm(false);
        document.getElementById('create-company-photo').onchange = async () => {
            try {
                await previewSelectedImage(
                    document.getElementById('create-company-photo'),
                    document.getElementById('create-company-photo-preview'),
                    '',
                    'Company photo preview'
                );
            } catch (error) {
                showToast(error.message || 'Could not preview the company photo');
            }
        };
    }
    document.getElementById('toggle-team-members-btn')?.addEventListener('click', () => toggleCompanyTeamSection('members'));
    document.getElementById('toggle-pending-invites-btn')?.addEventListener('click', () => toggleCompanyTeamSection('invites'));
    if (isCompanyAdmin) {
        document.getElementById('open-sales-invite-btn').onclick = () => toggleSalesInviteForm();
        document.getElementById('submit-sales-invite-btn').onclick = () => inviteSalesRep();
        document.getElementById('cancel-sales-invite-btn').onclick = () => toggleSalesInviteForm(false);
        document.querySelectorAll('.approve-invite-btn').forEach(button => {
            button.onclick = () => approveSalesInvite(button.dataset.inviteId);
        });
        document.querySelectorAll('.resend-invite-btn').forEach(button => {
            button.onclick = () => resendSalesInvite(button.dataset.inviteId);
        });
        document.querySelectorAll('.remove-invite-btn').forEach(button => {
            button.onclick = () => revokeSalesInvite(button.dataset.inviteId);
        });
        document.querySelectorAll('.remove-member-btn').forEach(button => {
            button.onclick = () => removeSalesMember(button.dataset.memberId);
        });
    }
    document.querySelectorAll('.leave-team-btn').forEach(button => {
        button.onclick = () => leaveCompanyTeam();
    });
    if (isEditingProfile) {
        document.getElementById('save-profile-btn').onclick = () => saveProfileEdits();
        document.getElementById('cancel-profile-edit').onclick = () => toggleProfileEditor(false);
        setPreviewImage(document.getElementById('edit-profile-photo-preview'), currentUser.avatarUrl || '', 'Profile photo preview');
        document.getElementById('edit-profile-photo').onchange = async () => {
            try {
                await previewSelectedImage(
                    document.getElementById('edit-profile-photo'),
                    document.getElementById('edit-profile-photo-preview'),
                    currentUser.avatarUrl || '',
                    'Profile photo preview'
                );
            } catch (error) {
                showToast(error.message || 'Could not preview the selected profile photo');
            }
        };
        document.getElementById('toggle-location-visibility').onclick = () => toggleProfileVisibility('location');
        document.getElementById('toggle-phone-visibility').onclick = () => toggleProfileVisibility('phone');
        document.getElementById('toggle-email-visibility').onclick = () => toggleProfileVisibility('email');
        document.getElementById('change-password-btn').onclick = () => changePassword();
        document.getElementById('toggle-2fa-btn').onclick = () => toggleTwoFactor();
        document.getElementById('toggle-alerts-btn').onclick = () => toggleLoginAlerts();
        document.getElementById('signout-sessions-btn').onclick = () => signOutOtherSessions();
    }
    renderAccountExtras();

    const listingsGrid = document.getElementById('account-listings-grid');
    if(!userListings.length){
        listingsGrid.innerHTML = `
            <div class="account-card empty-state">
                <h3>No listings yet</h3>
                <p>Your produce, raw materials, finished goods, and farm services will appear here once posted.</p>
                <button id="empty-post-btn" class="btn btn-primary" type="button">Create First Listing</button>
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
            <button class="btn btn-primary edit-btn" data-index="${i}">Edit</button>
            <button class="btn btn-danger delete-btn" data-index="${i}">Delete</button>
        `;
        listingsGrid.appendChild(card);
        card.querySelector('.delete-btn').onclick = async ()=>{
            const [removedListing] = userListings.splice(i,1);
        const deleteSucceeded = await deletePersistedListing(removedListing?.id);
        if (!deleteSucceeded) {
            userListings.splice(i, 0, removedListing);
            renderUserListings();
            refreshMarketplace();
            return;
        }
        removeMarketplaceListing(removedListing?.id);
        renderUserListings();
        refreshMarketplace();
        };
        card.querySelector('.edit-btn').onclick = ()=>{
            editingListingIndex = i;
            document.getElementById('category').value=l.category || '';
            document.getElementById('title').value=l.title;
            document.getElementById('price').value=l.price;
            document.getElementById('unit').value=l.unit;
            document.getElementById('minOrder').value=l.minOrder;
            document.getElementById('location').value=l.location;
            document.getElementById('description').value=l.description || '';
            document.getElementById('negotiable').checked=l.negotiable;
            setPreviewImage(document.getElementById('listing-image-preview'), l.image || '', 'Listing photo preview');
            showTab('post');
            showToast(`Editing ${l.title}`);
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
        : '<div class="mini-empty-state"><strong>No saved listings yet</strong><p>Saved produce, goods, and services will appear here.</p></div>';

    ordersContainer.innerHTML = orderRequests.length
        ? orderRequests.map(item => `<p>${item.title} • ${item.type}: ${item.status}${item.note ? ` • ${item.note}` : ''}</p>`).join('')
        : '<div class="mini-empty-state"><strong>No order requests yet</strong><p>Incoming requests and schedules will appear here.</p></div>';

    moderationContainer.innerHTML = reportedListings.length
        ? reportedListings.map(item => `<p>${item.title} • ${item.status}</p>`).join('')
        : '<div class="mini-empty-state"><strong>No moderation items</strong><p>Reported listings and moderation updates will appear here.</p></div>';

    ratingsContainer.innerHTML = ratingsGiven.length
        ? ratingsGiven.map(item => `<p>${item.contact} • ${item.rating}/5${item.note ? ` • ${item.note}` : ''}</p>`).join('')
        : '<div class="mini-empty-state"><strong>No ratings submitted</strong><p>Ratings you leave for buyers or sellers will show here.</p></div>';

    userReportsContainer.innerHTML = userReports.length
        ? userReports.map(item => `<p>${item.contact} • ${item.status} • ${item.note}</p>`).join('')
        : '<div class="mini-empty-state"><strong>No user reports filed</strong><p>Any safety or conduct reports will be listed here.</p></div>';
}

function toggleProfileVisibility(fieldKey){
    const profile = profiles[currentUser.id];
    if (!profile?.fields[fieldKey]) return;
    profile.fields[fieldKey].visible = !profile.fields[fieldKey].visible;
    showToast(`${profile.fields[fieldKey].label} visibility updated`);
    renderUserListings();
}

async function saveProfileEdits(){
    const profile = profiles[currentUser.id];
    if (!profile) return;
    const previousEmail = currentUser.email;

    const name = document.getElementById('edit-name').value.trim();
    const role = document.getElementById('edit-role').value.trim();
    const location = document.getElementById('edit-location').value.trim();
    const phone = document.getElementById('edit-phone').value.trim();
    const email = document.getElementById('edit-email').value.trim();
    const companyRole = document.getElementById('edit-company-role').value.trim();
    const about = document.getElementById('edit-about').value.trim();
    const profilePhotoInput = document.getElementById('edit-profile-photo');

    if (!name || !role || !location || !phone || !email) {
        showToast('Fill in the main profile details first');
        return;
    }

    currentUser.name = name;
    currentUser.role = role;
    currentUser.location = location;
    currentUser.phone = phone;
    currentUser.email = email;
    if (profilePhotoInput?.files?.[0]) {
        currentUser.avatarUrl = await readFileAsDataUrl(profilePhotoInput.files[0]);
    }

    profile.name = name;
    profile.about = about || profile.about;
    profile.avatarUrl = currentUser.avatarUrl || profile.avatarUrl || '';
    profile.fields.location.value = location;
    profile.fields.phone.value = phone;
    profile.fields.email.value = email;
    currentUser.companyRole = companyRole || currentUser.companyRole;
    if (profile.fields.companyRole) {
        profile.fields.companyRole.value = companyRole || profile.fields.companyRole.value;
    } else if (companyRole) {
        profile.fields.companyRole = { label: 'Company Role', value: companyRole, visible: true };
    }
    if (profile.fields.companyName && currentUser.companyId && companyAccounts[currentUser.companyId]) {
        profile.fields.companyName.value = companyAccounts[currentUser.companyId].name;
    }

    persistCurrentUserAccount(previousEmail);
    const saveSucceeded = await savePersistedProfile();
    if (!saveSucceeded) {
        return;
    }
    isEditingProfile = false;
    showToast('Profile updated successfully');
    renderUserListings();
}

function toggleProfileEditor(forceState){
    isEditingProfile = typeof forceState === 'boolean' ? forceState : !isEditingProfile;
    renderUserListings();
}

function toggleCompanyCreationForm(forceState){
    isCreatingCompanyProfile = typeof forceState === 'boolean' ? forceState : !isCreatingCompanyProfile;
    renderUserListings();
}

function toggleCompanyProfileEditor(forceState){
    isEditingCompanyProfile = typeof forceState === 'boolean' ? forceState : !isEditingCompanyProfile;
    openProfile(currentUser.companyId || currentUser.id);
}

function toggleOwnProfilePhotoEditor(forceState){
    isEditingOwnProfilePhoto = typeof forceState === 'boolean' ? forceState : !isEditingOwnProfilePhoto;
    openProfile(currentUser.id);
}

async function createCompanyProfile(){
    if (currentUser.companyId) {
        showToast('You can only belong to one company sales team at a time');
        return;
    }

    const companyName = document.getElementById('create-company-name').value.trim();
    const companyLocation = document.getElementById('create-company-location').value.trim();
    const companyPhone = document.getElementById('create-company-phone').value.trim();
    const companyEmail = document.getElementById('create-company-email').value.trim();
    const companyRegistration = document.getElementById('create-company-registration').value.trim();
    const companyCertification = document.getElementById('create-company-certification').value.trim();
    const companyAbout = document.getElementById('create-company-about').value.trim();
    const companyPhotoInput = document.getElementById('create-company-photo');

    if (!companyName || !companyLocation || !companyPhone || !companyEmail) {
        showToast('Fill in the main company details first');
        return;
    }

    const companyId = `company-${slugifyValue(companyName)}`;
    const companyAvatarUrl = companyPhotoInput?.files?.[0]
        ? await readFileAsDataUrl(companyPhotoInput.files[0])
        : '';

    companyAccounts[companyId] = {
        id: companyId,
        name: companyName,
        maxSalesMembers: 4,
        members: [
            {
                id: currentUser.id,
                name: currentUser.name,
                email: currentUser.email,
                phone: currentUser.phone,
                nationalId: '',
                role: 'Admin',
                status: 'Active',
                joinedAt: '2026-04-06',
            },
        ],
        pendingInvites: [],
        verificationRequirements: {
            businessRegistration: Boolean(companyRegistration),
            companyEmail: Boolean(companyEmail),
            companyPhone: Boolean(companyPhone),
            businessLocation: Boolean(companyLocation),
            completeProfile: Boolean(companyName && companyAbout && companyEmail && companyPhone && companyLocation),
            goodStanding: true,
            permits: Boolean(companyCertification),
        },
    };

    profiles[companyId] = {
        id: companyId,
        name: companyName,
        avatarUrl: companyAvatarUrl,
        type: 'Company Profile',
        about: companyAbout || 'New company profile on FarmYard.',
        verified: false,
        verificationPlan: { subscribed: false, price: 10, billing: 'monthly', renewalDate: null },
        rating: 5,
        ratingCount: 1,
        completedDeals: 0,
        fields: {
            location: { label: 'Head Office', value: companyLocation, visible: true },
            phone: { label: 'Company Phone', value: companyPhone, visible: true },
            email: { label: 'Company Email', value: companyEmail, visible: true },
            registration: { label: 'Registration', value: companyRegistration || 'Pending', visible: true },
            certification: { label: 'Permits or Certifications', value: companyCertification || '', visible: true },
            team: { label: 'Sales Team', value: '1 active representative', visible: true },
        },
    };

    currentUser.companyId = companyId;
    currentUser.companyRole = 'Admin';
    currentUser.accessStatus = 'Active company access';
    currentUser.permissions = {
        canPostForCompany: true,
        canManageCompany: true,
        canApproveInvites: true,
    };
    profiles[currentUser.id].fields.companyName.value = companyName;
    profiles[currentUser.id].fields.companyRole.value = 'Admin';
    persistCurrentUserAccount();
    persistLocalAppState();

    isCreatingCompanyProfile = false;
    showCompanyTeamMembers = false;
    showCompanyPendingInvites = false;
    showToast(`${companyName} is ready for company selling`);
    renderUserListings();
}

async function saveCompanyProfileEdits(){
    const companyProfile = currentUser.companyId ? profiles[currentUser.companyId] : null;
    if (!companyProfile || currentUser.companyRole !== 'Admin') {
        showToast('Only the company admin can edit this profile');
        return;
    }

    const companyName = document.getElementById('company-name-edit').value.trim();
    const companyLocation = document.getElementById('company-location-edit').value.trim();
    const companyPhone = document.getElementById('company-phone-edit').value.trim();
    const companyEmail = document.getElementById('company-email-edit').value.trim();
    const companyRegistration = document.getElementById('company-registration-edit').value.trim();
    const companyCertification = document.getElementById('company-certification-edit').value.trim();
    const companyAbout = document.getElementById('company-about-edit').value.trim();
    const companyPhotoInput = document.getElementById('company-photo-edit');

    if (!companyName || !companyLocation || !companyPhone || !companyEmail) {
        showToast('Fill in the main company details first');
        return;
    }

    companyProfile.name = companyName;
    companyProfile.about = companyAbout || companyProfile.about;
    if (companyPhotoInput?.files?.[0]) {
        companyProfile.avatarUrl = await readFileAsDataUrl(companyPhotoInput.files[0]);
    }
    companyProfile.fields.location.value = companyLocation;
    companyProfile.fields.phone.value = companyPhone;
    companyProfile.fields.email.value = companyEmail;
    if (companyProfile.fields.registration) {
        companyProfile.fields.registration.value = companyRegistration || companyProfile.fields.registration.value;
    }
    if (companyProfile.fields.certification) {
        companyProfile.fields.certification.value = companyCertification;
    } else {
        companyProfile.fields.certification = { label: 'Permits or Certifications', value: companyCertification, visible: true };
    }
    companyAccounts[currentUser.companyId].name = companyName;
    profiles[currentUser.id].fields.companyName.value = companyName;
    syncVerificationRequirementsFromCompanyProfile(companyProfile, companyAccounts[currentUser.companyId]);
    persistLocalAppState();

    isEditingCompanyProfile = false;
    showToast('Company profile updated successfully');
    openProfile(currentUser.companyId);
    renderUserListings();
}

async function saveOwnProfilePhoto(){
    const profile = profiles[currentUser.id];
    const profilePhotoInput = document.getElementById('profile-photo-tab-input');
    const selectedFile = profilePhotoInput?.files?.[0];

    if (!profile || !selectedFile) {
        showToast('Select a profile photo first');
        return;
    }

    currentUser.avatarUrl = await readFileAsDataUrl(selectedFile);
    profile.avatarUrl = currentUser.avatarUrl;

    persistCurrentUserAccount();
    const saveSucceeded = await savePersistedProfile();
    if (!saveSucceeded) {
        return;
    }

    isEditingOwnProfilePhoto = false;
    showToast('Profile photo updated successfully');
    renderUserListings();
    openProfile(currentUser.id);
}

function toggleCompanyVerification(){
    const companyAccount = currentUser.companyId ? companyAccounts[currentUser.companyId] : null;
    const companyProfile = currentUser.companyId ? profiles[currentUser.companyId] : null;
    if (!companyAccount || !companyProfile) {
        showToast('Link an account to a company profile first');
        return;
    }
    if (currentUser.companyRole !== 'Admin') {
        showToast('Only the company admin can apply for verification');
        return;
    }
    syncVerificationRequirementsFromCompanyProfile(companyProfile, companyAccount);
    const missingItems = Object.entries(companyAccount.verificationRequirements).filter(([, complete]) => !complete);
    if (missingItems.length) {
        showToast(`Verification still needs: ${formatRequirementLabel(missingItems[0][0])}`);
        isEditingCompanyProfile = true;
        openProfile(currentUser.companyId);
        return;
    }
    if (!companyProfile.verificationPlan.subscribed) {
        companyProfile.verificationPlan.subscribed = true;
        companyProfile.verificationPlan.renewalDate = '2026-05-04';
        companyProfile.verified = true;
        currentUser.verificationPlan.subscribed = true;
        currentUser.verificationPlan.renewalDate = '2026-05-04';
        showToast('Company verification approved and subscription activated');
    } else {
        showToast('Verified Company is already active for this company profile');
    }
    persistCurrentUserAccount();
    persistLocalAppState();
    renderUserListings();
    openProfile(currentUser.companyId);
}

function toggleSalesInviteForm(forceState){
    isInvitingSalesRep = typeof forceState === 'boolean' ? forceState : !isInvitingSalesRep;
    renderUserListings();
}

function toggleCompanyTeamSection(section){
    if (section === 'members') {
        showCompanyTeamMembers = !showCompanyTeamMembers;
    }
    if (section === 'invites') {
        showCompanyPendingInvites = !showCompanyPendingInvites;
    }
    renderUserListings();
}

function inviteSalesRep(){
    const companyAccount = currentUser.companyId ? companyAccounts[currentUser.companyId] : null;
    if (!companyAccount) return;
    if (currentUser.companyRole !== 'Admin') {
        showToast('Only the company admin can appoint sales reps');
        return;
    }
    if ((companyAccount.members.length + companyAccount.pendingInvites.length) >= companyAccount.maxSalesMembers) {
        showToast('No seat available. Approve, decline, or remove a rep first');
        return;
    }
    const name = document.getElementById('invite-rep-name').value.trim();
    const email = document.getElementById('invite-rep-email').value.trim().toLowerCase();
    const phone = document.getElementById('invite-rep-phone').value.trim();
    const nationalId = document.getElementById('invite-rep-id').value.trim();
    const role = document.getElementById('invite-rep-role').value.trim() || 'Sales Representative';

    if (!name || !email || !phone || !nationalId) {
        showToast('Fill in name, email, phone, and ID before sending an invite');
        return;
    }

    const emailExists = companyAccount.members.some(member => member.email === email)
        || companyAccount.pendingInvites.some(invite => invite.email === email);
    const idExists = companyAccount.members.some(member => member.nationalId === nationalId)
        || companyAccount.pendingInvites.some(invite => invite.nationalId === nationalId);
    if (emailExists || idExists) {
        showToast('That rep already exists or already has a pending invite');
        return;
    }
    const existingTeam = findCompanyMembershipByEmail(email);
    if (existingTeam && existingTeam.id !== currentUser.companyId) {
        showToast(`That user is already in ${existingTeam.name} and cannot join a second sales team`);
        return;
    }
    const existingAccount = userAccounts[normalizeEmail(email)];
    if (existingAccount?.companyId && existingAccount.companyId !== currentUser.companyId) {
        const linkedCompany = companyAccounts[existingAccount.companyId];
        showToast(`That user is already linked to ${linkedCompany?.name || 'another company'}`);
        return;
    }

    companyAccount.pendingInvites.unshift({
        id: `invite-${Date.now()}`,
        name,
        email,
        phone,
        nationalId,
        inviteCode: generateInviteCode(companyAccount.name),
        role,
        status: 'Sent',
        linkedUserId: null,
        claimedAt: null,
        createdAt: '2026-04-05',
        expiresOn: '2026-04-19',
    });
    clearSalesInviteForm();
    isInvitingSalesRep = false;
    showCompanyPendingInvites = true;
    showToast('Sales rep invite created. Share the email and invite code with the rep');
    renderUserListings();
}

function clearSalesInviteForm(){
    ['invite-rep-name', 'invite-rep-email', 'invite-rep-phone', 'invite-rep-id', 'invite-rep-role'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.value = id === 'invite-rep-role' ? 'Sales Representative' : '';
        }
    });
}

function approveSalesInvite(inviteId){
    const companyAccount = currentUser.companyId ? companyAccounts[currentUser.companyId] : null;
    if (!companyAccount) return;
    if (currentUser.companyRole !== 'Admin') {
        showToast('Only the company admin can approve invites');
        return;
    }
    if (companyAccount.members.length >= companyAccount.maxSalesMembers) {
        showToast('This company already has the maximum 4 active reps');
        return;
    }
    const inviteIndex = companyAccount.pendingInvites.findIndex(invite => invite.id === inviteId);
    if (inviteIndex === -1) return;
    const invite = companyAccount.pendingInvites.splice(inviteIndex, 1)[0];
    if (invite.status !== 'Claimed by user' || !invite.linkedUserId) {
        companyAccount.pendingInvites.splice(inviteIndex === -1 ? 0 : inviteIndex, 0, invite);
        showToast('The invited user must claim the invite before access can be activated');
        return;
    }
    const account = userAccounts[normalizeEmail(invite.email)];
    if (account?.companyId && account.companyId !== currentUser.companyId) {
        companyAccount.pendingInvites.splice(inviteIndex === -1 ? 0 : inviteIndex, 0, invite);
        const linkedCompany = companyAccounts[account.companyId];
        showToast(`This user already belongs to ${linkedCompany?.name || 'another company'}`);
        return;
    }
    const existingTeam = findCompanyMembershipByEmail(invite.email);
    if (existingTeam && existingTeam.id !== currentUser.companyId) {
        companyAccount.pendingInvites.splice(inviteIndex === -1 ? 0 : inviteIndex, 0, invite);
        showToast(`This user is already active in ${existingTeam.name}`);
        return;
    }
    companyAccount.members.push({
        id: invite.linkedUserId,
        name: invite.name,
        email: invite.email,
        phone: invite.phone,
        nationalId: invite.nationalId,
        role: invite.role,
        status: 'Active',
        joinedAt: invite.createdAt || '2026-04-05',
    });
    if (account) {
        account.companyId = currentUser.companyId;
        account.companyRole = invite.role;
        account.role = invite.role;
        account.accessStatus = 'Active company access';
        account.permissions = {
            canPostForCompany: true,
            canManageCompany: false,
            canApproveInvites: false,
        };
        ensureProfileForAccount(account);
    }
    profiles[currentUser.companyId].fields.team.value = `${companyAccount.members.length} active representatives`;
    persistLocalAppState();
    showToast(`${invite.name} is now an active sales rep`);
    renderUserListings();
}

function resendSalesInvite(inviteId){
    const companyAccount = currentUser.companyId ? companyAccounts[currentUser.companyId] : null;
    if (!companyAccount) return;
    const invite = companyAccount.pendingInvites.find(item => item.id === inviteId);
    if (!invite) return;
    showToast(`Invite code for ${invite.name}: ${invite.inviteCode}`);
}

function revokeSalesInvite(inviteId){
    const companyAccount = currentUser.companyId ? companyAccounts[currentUser.companyId] : null;
    if (!companyAccount) return;
    if (currentUser.companyRole !== 'Admin') {
        showToast('Only the company admin can revoke invites');
        return;
    }
    const inviteIndex = companyAccount.pendingInvites.findIndex(invite => invite.id === inviteId);
    if (inviteIndex === -1) return;
    const invite = companyAccount.pendingInvites.splice(inviteIndex, 1)[0];
    const account = userAccounts[normalizeEmail(invite.email)];
    if (account && account.accessStatus === 'Invite claimed - awaiting admin activation') {
        account.companyId = null;
        account.companyRole = null;
        account.role = 'Buyer and Seller';
        account.accessStatus = 'Independent account';
        account.permissions = {
            canPostForCompany: false,
            canManageCompany: false,
            canApproveInvites: false,
        };
        ensureProfileForAccount(account);
    }
    persistLocalAppState();
    showToast(`Invite revoked for ${invite.name}`);
    renderUserListings();
}

function removeSalesMember(memberId){
    const companyAccount = currentUser.companyId ? companyAccounts[currentUser.companyId] : null;
    if (!companyAccount) return;
    if (currentUser.companyRole !== 'Admin') {
        showToast('Only the company admin can remove sales reps');
        return;
    }
    if (companyAccount.members.length <= 1) {
        showToast('A company should keep at least one assigned user');
        return;
    }
    const memberIndex = companyAccount.members.findIndex(member => member.id === memberId);
    if (memberIndex === -1) return;
    const member = companyAccount.members[memberIndex];
    if (member.role === 'Admin') {
        showToast('The company admin cannot be removed here');
        return;
    }
    companyAccount.members.splice(memberIndex, 1);
    const account = userAccounts[normalizeEmail(member.email)];
    if (account) {
        account.companyId = null;
        account.companyRole = null;
        account.role = 'Buyer and Seller';
        account.accessStatus = 'Independent account';
        account.permissions = {
            canPostForCompany: false,
            canManageCompany: false,
            canApproveInvites: false,
        };
        ensureProfileForAccount(account);
    }
    profiles[currentUser.companyId].fields.team.value = `${companyAccount.members.length} active representatives`;
    persistLocalAppState();
    showToast(`${member.name} removed from company access`);
    renderUserListings();
}

function leaveCompanyTeam(){
    const companyId = currentUser.companyId;
    const companyAccount = companyId ? companyAccounts[companyId] : null;
    if (!companyAccount) return;

    const memberIndex = companyAccount.members.findIndex(member => member.id === currentUser.id);
    if (memberIndex === -1) return;
    const [member] = companyAccount.members.splice(memberIndex, 1);

    if (member.role === 'Admin') {
        const nextAdmin = [...companyAccount.members]
            .sort((a, b) => String(a.joinedAt || '').localeCompare(String(b.joinedAt || '')))[0];
        if (!nextAdmin) {
            companyAccount.members.splice(memberIndex, 0, member);
            showToast('Add or assign another team member before the admin can leave');
            return;
        }
        nextAdmin.role = 'Admin';
        const promotedAccount = userAccounts[normalizeEmail(nextAdmin.email)];
        if (promotedAccount) {
            promotedAccount.companyRole = 'Admin';
            promotedAccount.role = 'Admin';
            promotedAccount.permissions = {
                canPostForCompany: true,
                canManageCompany: true,
                canApproveInvites: true,
            };
            ensureProfileForAccount(promotedAccount);
            if (profiles[promotedAccount.id]?.fields?.companyRole) {
                profiles[promotedAccount.id].fields.companyRole.value = 'Admin';
            }
        }
    }

    currentUser.companyId = null;
    currentUser.companyRole = null;
    currentUser.role = 'Buyer and Seller';
    currentUser.accessStatus = 'Independent account';
    currentUser.permissions = {
        canPostForCompany: false,
        canManageCompany: false,
        canApproveInvites: false,
    };
    profiles[currentUser.id].fields.companyName.value = 'Independent';
    profiles[currentUser.id].fields.companyRole.value = 'Independent seller';

    const account = userAccounts[normalizeEmail(currentUser.email)];
    if (account) {
        account.companyId = null;
        account.companyRole = null;
        account.role = 'Buyer and Seller';
        account.accessStatus = 'Independent account';
        account.permissions = {
            canPostForCompany: false,
            canManageCompany: false,
            canApproveInvites: false,
        };
        ensureProfileForAccount(account);
    }

    if (profiles[companyId]?.fields?.team) {
        profiles[companyId].fields.team.value = `${companyAccount.members.length} active representatives`;
    }

    showCompanyTeamMembers = false;
    showCompanyPendingInvites = false;
    persistCurrentUserAccount();
    persistLocalAppState();
    showToast(member.role === 'Admin'
        ? `${member.name} left the company team. Admin rights moved to the earliest hired member`
        : `${member.name} left the company team`);
    renderUserListings();
}

function updateVerificationRequirement(requirementKey, isComplete, rerenderProfile = true){
    const companyAccount = currentUser.companyId ? companyAccounts[currentUser.companyId] : null;
    const companyProfile = currentUser.companyId ? profiles[currentUser.companyId] : null;
    if (!companyAccount || !companyProfile) return;
    if (requirementKey !== 'goodStanding') {
        showToast('That requirement is updated from the company profile fields');
        if (rerenderProfile && currentProfileId === currentUser.companyId && isEditingCompanyProfile) {
            openProfile(currentUser.companyId);
        }
        return;
    }
    companyAccount.verificationRequirements[requirementKey] = isComplete;

    const missingItems = Object.entries(companyAccount.verificationRequirements).filter(([, complete]) => !complete);
    if (missingItems.length) {
        companyProfile.verificationPlan.subscribed = false;
        companyProfile.verificationPlan.renewalDate = null;
        companyProfile.verified = false;
        currentUser.verificationPlan.subscribed = false;
        currentUser.verificationPlan.renewalDate = null;
    }

    showToast(`${formatRequirementLabel(requirementKey)} marked as ${isComplete ? 'complete' : 'pending'}`);
    persistLocalAppState();
    renderUserListings();
    if (rerenderProfile && currentProfileId === currentUser.companyId && isEditingCompanyProfile) {
        openProfile(currentUser.companyId);
    }
}

function changePassword(){
    currentUser.security.passwordUpdated = 'Just now';
    persistCurrentUserAccount();
    showToast('Password update started');
    renderUserListings();
}

function toggleTwoFactor(){
    currentUser.security.twoFactorEnabled = !currentUser.security.twoFactorEnabled;
    persistCurrentUserAccount();
    showToast(`Two-factor authentication ${currentUser.security.twoFactorEnabled ? 'enabled' : 'disabled'}`);
    renderUserListings();
}

function toggleLoginAlerts(){
    currentUser.security.loginAlerts = !currentUser.security.loginAlerts;
    persistCurrentUserAccount();
    showToast(`Login alerts ${currentUser.security.loginAlerts ? 'enabled' : 'disabled'}`);
    renderUserListings();
}

function signOutOtherSessions(){
    currentUser.security.activeSessions = 1;
    persistCurrentUserAccount();
    showToast('Other sessions signed out');
    renderUserListings();
}

function formatRequirementLabel(key){
    const labels = {
        businessRegistration: 'business registration documents',
        companyEmail: 'verified company email',
        companyPhone: 'verified company phone',
        businessLocation: 'confirmed business location',
        completeProfile: 'complete company profile',
        goodStanding: 'good standing with no serious reports',
        permits: 'required permits or certifications',
    };
    return labels[key] || key;
}

function getRequirementSourceLabel(key){
    const sources = {
        businessRegistration: 'Add this in Company Registration',
        companyEmail: 'Add this in Company Email',
        companyPhone: 'Add this in Company Phone',
        businessLocation: 'Add this in Head Office',
        completeProfile: 'Complete Company Name, About, Email, Phone, and Head Office',
        goodStanding: 'Reviewed internally by FarmYard after moderation checks',
        permits: 'Add this in Permits or Certifications',
    };
    return sources[key] || 'Update the company profile';
}

function syncVerificationRequirementsFromCompanyProfile(companyProfile, companyAccount){
    if (!companyProfile || !companyAccount) return;
    const location = companyProfile.fields.location?.value?.trim();
    const phone = companyProfile.fields.phone?.value?.trim();
    const email = companyProfile.fields.email?.value?.trim();
    const registration = companyProfile.fields.registration?.value?.trim();
    const certification = companyProfile.fields.certification?.value?.trim();
    const about = companyProfile.about?.trim();
    const name = companyProfile.name?.trim();

    companyAccount.verificationRequirements.businessRegistration = Boolean(registration);
    companyAccount.verificationRequirements.companyEmail = Boolean(email);
    companyAccount.verificationRequirements.companyPhone = Boolean(phone);
    companyAccount.verificationRequirements.businessLocation = Boolean(location);
    companyAccount.verificationRequirements.completeProfile = Boolean(name && about && email && phone && location);
    companyAccount.verificationRequirements.permits = Boolean(certification);
}

function countCompletedRequirements(requirements){
    return Object.values(requirements).filter(Boolean).length;
}

function generateInviteCode(companyName){
    const companyKey = slugifyValue(companyName).split('-').slice(0, 2).join('-').toUpperCase() || 'FARMYARD';
    const randomDigits = `${Math.floor(1000 + Math.random() * 9000)}`;
    return `${companyKey}-${randomDigits}`;
}

// Initial
showTab(localStorage.getItem(LAST_ACTIVE_TAB_KEY) || 'home');
refreshMarketplace();
renderMessagesTab();
initializeAuth();

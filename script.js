// Helper: format numbers
function formatPrice(number) {
    const num = Number(number.toString().replace(/,/g, ''));
    if (isNaN(num)) return number;
    return num.toLocaleString();
}

const COUNTRY_CONFIGS = [
    { code: 'UG', label: 'Uganda', dialCode: '+256', currencyCode: 'UGX', currencySign: 'UGX' },
    { code: 'KE', label: 'Kenya', dialCode: '+254', currencyCode: 'KES', currencySign: 'KSh' },
    { code: 'TZ', label: 'Tanzania', dialCode: '+255', currencyCode: 'TZS', currencySign: 'TSh' },
    { code: 'RW', label: 'Rwanda', dialCode: '+250', currencyCode: 'RWF', currencySign: 'RWF' },
    { code: 'NG', label: 'Nigeria', dialCode: '+234', currencyCode: 'NGN', currencySign: '₦' },
    { code: 'GH', label: 'Ghana', dialCode: '+233', currencyCode: 'GHS', currencySign: 'GH₵' },
    { code: 'ZA', label: 'South Africa', dialCode: '+27', currencyCode: 'ZAR', currencySign: 'R' },
    { code: 'US', label: 'United States', dialCode: '+1', currencyCode: 'USD', currencySign: '$' },
    { code: 'GB', label: 'United Kingdom', dialCode: '+44', currencyCode: 'GBP', currencySign: '£' },
];
const DEFAULT_COUNTRY_CONFIG = COUNTRY_CONFIGS[0];

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
    callSessions: 'call_sessions',
    callIceCandidates: 'call_ice_candidates',
};
const WEBRTC_ICE_SERVERS = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
];
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
const DEFAULT_LISTING_IMAGE = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420">
        <defs>
            <linearGradient id="farmyardListingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#eef5df" />
                <stop offset="100%" stop-color="#d7e7c1" />
            </linearGradient>
        </defs>
        <rect width="640" height="420" rx="28" fill="url(#farmyardListingGradient)" />
        <circle cx="144" cy="126" r="44" fill="#f5d98a" />
        <path d="M0 320 C110 248 198 248 296 320 S490 392 640 286 V420 H0 Z" fill="#a7c97f" />
        <path d="M0 356 C134 292 244 304 368 360 S518 402 640 336 V420 H0 Z" fill="#6f9b58" opacity="0.92" />
        <rect x="228" y="154" width="184" height="112" rx="20" fill="#fffdf6" opacity="0.96" />
        <text x="320" y="204" text-anchor="middle" fill="#2f6b3b" font-family="Segoe UI, Arial, sans-serif" font-size="30" font-weight="700">FarmYard</text>
        <text x="320" y="238" text-anchor="middle" fill="#617067" font-family="Segoe UI, Arial, sans-serif" font-size="18">Listing photo</text>
    </svg>
`)}`;

// Data
let userListings = [];
let marketplaceListings = [];
const currentUser = {
    id: '',
    name: 'Not Signed In',
    avatarUrl: '',
    role: 'Browse Only',
    accountType: 'Signed-out Visitor',
    location: 'Set your location after sign in',
    phone: '',
    phoneCountryCode: DEFAULT_COUNTRY_CONFIG.dialCode,
    email: '',
    currencyPreference: 'auto',
    verified: false,
    communityRating: 0,
    ratingCount: 0,
    companyId: null,
    companyRole: null,
    accessStatus: 'Not signed in',
    permissions: {
        canPostForCompany: false,
        canManageCompany: false,
        canApproveInvites: false,
    },
    security: { ...DEFAULT_SECURITY },
    verificationPlan: { ...DEFAULT_VERIFICATION_PLAN },
};
const profiles = {
};
const companyAccounts = {};
const userAccounts = {};

let savedListings = [];
let orderRequests = [];
let reportedListings = [];
let ratingsGiven = [];
let userReports = [];
let currentDetailListing = null;
let currentProfileId = null;
let activeFeedbackMode = 'rate';
const counterpartyProfiles = {};
let conversations = [];
let activeConversationId = null;
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
let timelineMode = 'for-you';
let selectedTimelineInterest = 'all';
let selectedMessageMedia = [];
let activeCallConversationId = null;
let activeCallStream = null;
let activeCallStartedAt = null;
let activeCallTimerId = null;
let isCallMuted = false;
let isSpeakerMode = false;
let runtimePlatform = 'web';
let activeCallSessionId = null;
let activeCallPeerConnection = null;
let activeCallRole = null;
let activeCallTargetProfileId = null;
let activeIncomingCallSession = null;
let pendingLocalCallCandidates = [];
let pendingRemoteCallCandidates = [];
let callsRealtimeChannel = null;
let messagesRealtimeChannel = null;
let messagesRealtimeRefreshPromise = null;
let messagesRealtimeRefreshQueued = false;
const seenIncomingMessageIds = new Set();
const seenCallIceCandidateIds = new Set();
let userBlocks = [];
let selectedMessageId = null;
let selectedMessageConversationId = null;
let audioContext = null;
let hasUnlockedAudio = false;

loadLocalAppState();

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
const runtimePlatformBadge = document.getElementById('runtime-platform-badge');
const platformAccessNote = document.getElementById('platform-access-note');
const timelineModeInput = document.getElementById('timeline-mode');
const timelineInterestChips = document.getElementById('timeline-interest-chips');
const timelineFeedCopy = document.getElementById('timeline-feed-copy');
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
const chatOptionBlockButton = document.getElementById('chat-option-block');
const chatOptionRateButton = document.getElementById('chat-option-rate');
const chatOptionReportButton = document.getElementById('chat-option-report');
const chatOptionDeleteButton = document.getElementById('chat-option-delete');
const messageActionBar = document.getElementById('message-action-bar');
const messageCopyButton = document.getElementById('message-copy-btn');
const messageDeleteButton = document.getElementById('message-delete-btn');
const messageActionsCloseButton = document.getElementById('message-actions-close-btn');
const chatBlockedBanner = document.getElementById('chat-blocked-banner');
const callScreen = document.getElementById('call-screen');
const callAvatar = document.getElementById('call-avatar');
const callName = document.getElementById('call-name');
const callStatus = document.getElementById('call-status');
const callPlatformNote = document.getElementById('call-platform-note');
const callDuration = document.getElementById('call-duration');
const callAnswerButton = document.getElementById('call-answer-btn');
const callMuteButton = document.getElementById('call-mute-btn');
const callSpeakerButton = document.getElementById('call-speaker-btn');
const callEndButton = document.getElementById('call-end-btn');
const callRemoteAudio = document.getElementById('call-remote-audio');
const messagesLayout = document.querySelector('.messages-layout');
const chatRateUserBtn = document.getElementById('chat-rate-user');
const chatReportUserBtn = document.getElementById('chat-report-user');
const chatFeedbackPanel = document.getElementById('chat-feedback-panel');
const chatFeedbackTitle = document.getElementById('chat-feedback-title');
const chatRatingInput = document.getElementById('chat-rating');
const chatFeedbackNote = document.getElementById('chat-feedback-note');
const enableMessageNotificationsButton = document.getElementById('enable-message-notifications');
const navMessagesBadge = document.getElementById('nav-messages-badge');
const photoViewer = document.getElementById('photo-viewer');
const photoViewerImage = document.getElementById('photo-viewer-image');
const photoViewerName = document.getElementById('photo-viewer-name');
const photoViewerClose = document.getElementById('photo-viewer-close');
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
        if (Array.isArray(parsed.reportedListings)) {
            reportedListings = parsed.reportedListings;
        }
        if (Array.isArray(parsed.ratingsGiven)) {
            ratingsGiven = parsed.ratingsGiven;
        }
        if (Array.isArray(parsed.userReports)) {
            userReports = parsed.userReports;
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
            reportedListings,
            ratingsGiven,
            userReports,
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

function isUuidLike(value){
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value || '');
}

function resolveListingProfileId(listing){
    if (!listing) return currentUser.id;
    if (listing.sellerId && profiles[listing.sellerId]) return listing.sellerId;
    if (listing.userId && profiles[listing.userId]) return listing.userId;
    return listing.sellerId || listing.userId || currentUser.id;
}

function formatActivityDateLabel(dateString){
    const parsedDate = new Date(dateString || Date.now());
    if (Number.isNaN(parsedDate.getTime())) return 'Just now';
    return parsedDate.toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

function buildSignedOutAccount(){
    return {
        id: '',
        name: 'Not Signed In',
        avatarUrl: '',
        role: 'Browse Only',
        accountType: 'Signed-out Visitor',
        location: 'Set your location after sign in',
        phone: '',
        phoneCountryCode: DEFAULT_COUNTRY_CONFIG.dialCode,
        email: '',
        currencyPreference: 'auto',
        verified: false,
        communityRating: 0,
        ratingCount: 0,
        companyId: null,
        companyRole: null,
        accessStatus: 'Not signed in',
        permissions: {
            canPostForCompany: false,
            canManageCompany: false,
            canApproveInvites: false,
        },
        security: buildSecurityState(),
        verificationPlan: buildVerificationPlanState(),
    };
}

function isAuthenticatedUser(){
    return Boolean(currentUser.id && currentUser.email);
}

function promptForAuth(message = 'Sign in to continue'){
    localStorage.setItem('farmyard-return-tab', getActiveTabName() || 'home');
    showToast(message);
    openAuthScreen('login');
}

function formatFeedbackEntry(entry, kind){
    const when = entry?.createdAt ? formatActivityDateLabel(entry.createdAt) : 'Just now';
    if (kind === 'rating') {
        return `${entry.contact} • ${entry.rating}/5${entry.note ? ` • ${entry.note}` : ''} • ${when}`;
    }
    if (kind === 'userReport') {
        return `${entry.contact} • ${entry.status} • ${entry.note} • ${when}`;
    }
    return `${entry.title} • ${entry.status} • ${when}`;
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

function getNotificationPermissionState(){
    return typeof Notification === 'undefined' ? 'unsupported' : Notification.permission;
}

function updateNotificationButton(){
    if (!enableMessageNotificationsButton) return;
    const permission = getNotificationPermissionState();
    if (permission === 'unsupported') {
        enableMessageNotificationsButton.hidden = true;
        return;
    }
    enableMessageNotificationsButton.hidden = permission === 'granted';
    enableMessageNotificationsButton.textContent = permission === 'denied'
        ? 'Notifications Blocked'
        : 'Enable Notifications';
    enableMessageNotificationsButton.disabled = permission === 'denied';
}

async function requestMessageNotifications(){
    if (typeof Notification === 'undefined') {
        showToast('Browser notifications are not supported on this device');
        return;
    }
    if (Notification.permission === 'granted') {
        updateNotificationButton();
        showToast('Notifications are already enabled');
        return;
    }
    const permission = await Notification.requestPermission();
    updateNotificationButton();
    if (permission === 'granted') {
        showToast('Notifications enabled');
    } else {
        showToast('Notifications were not enabled');
    }
}

function unlockIncomingAudio(){
    if (hasUnlockedAudio) return;
    try {
        audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        hasUnlockedAudio = true;
    } catch (error) {
        console.warn('Audio notifications unavailable', error);
    }
}

function playIncomingMessageSound(){
    if (!hasUnlockedAudio || !audioContext) return;
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(660, audioContext.currentTime + 0.18);
        gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.08, audioContext.currentTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.24);
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.24);
    } catch (error) {
        console.warn('Could not play incoming message sound', error);
    }
}

function getCurrentUserBlockRows(){
    return userBlocks.filter(row => row.blockerUserId === currentUser.id || row.blockedUserId === currentUser.id);
}

function isBlockedByCurrentUser(profileId){
    return getCurrentUserBlockRows().some(row => row.blockerUserId === currentUser.id && row.blockedUserId === profileId);
}

function hasBlockedCurrentUser(profileId){
    return getCurrentUserBlockRows().some(row => row.blockerUserId === profileId && row.blockedUserId === currentUser.id);
}

function getBlockStateForProfile(profileId){
    return {
        blockedByMe: isBlockedByCurrentUser(profileId),
        blockedMe: hasBlockedCurrentUser(profileId),
    };
}

function canInteractWithProfile(profileId){
    const state = getBlockStateForProfile(profileId);
    return !state.blockedByMe && !state.blockedMe;
}

function getConversationTargetProfileId(conversation){
    return conversation?.contactProfileId || conversation?.sellerId || null;
}

function getConversationBlockMessage(conversation){
    const profileId = getConversationTargetProfileId(conversation);
    if (!profileId) return '';
    if (isBlockedByCurrentUser(profileId)) return 'You blocked this user. Unblock them to send messages.';
    if (hasBlockedCurrentUser(profileId)) return 'This user blocked you. Messaging is unavailable.';
    return '';
}

function openPhotoViewer({ imageUrl, name }){
    if (!photoViewer || !photoViewerImage || !photoViewerName || !imageUrl) return;
    photoViewerImage.src = imageUrl;
    photoViewerName.textContent = name || 'Profile photo';
    photoViewer.hidden = false;
}

function closePhotoViewer(){
    if (!photoViewer) return;
    photoViewer.hidden = true;
}

function viewListingsForProfile(profileId){
    marketQuery = profiles[profileId]?.name || '';
    if (marketSearchInput) {
        marketSearchInput.value = marketQuery;
    }
    refreshMarketplace();
    showTab('home');
    showToast(`Showing listings for ${profiles[profileId]?.name || 'this user'}`);
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
    const bySellerId = profiles[conversation.contactProfileId || conversation.sellerId];
    if (bySellerId) return bySellerId;
    return Object.values(profiles).find(profile => profile.name === conversation.contact) || null;
}

function buildCountryOptionMarkup(selectedDialCode = DEFAULT_COUNTRY_CONFIG.dialCode, includeAuto = false){
    const options = includeAuto
        ? [`<option value="auto"${selectedDialCode === 'auto' ? ' selected' : ''}>Auto by location</option>`]
        : [];
    return `${options.join('')}${COUNTRY_CONFIGS.map(country => `
        <option value="${country.dialCode}"${country.dialCode === selectedDialCode ? ' selected' : ''}>${country.label} (${country.dialCode})</option>
    `).join('')}`;
}

function buildCurrencyOptionMarkup(selectedCurrency = 'auto'){
    return `
        <option value="auto"${selectedCurrency === 'auto' ? ' selected' : ''}>Auto by location</option>
        ${COUNTRY_CONFIGS.map(country => `
            <option value="${country.currencyCode}"${country.currencyCode === selectedCurrency ? ' selected' : ''}>${country.label} (${country.currencySign})</option>
        `).join('')}
    `;
}

function findCountryConfigByDialCode(dialCode){
    return COUNTRY_CONFIGS.find(country => country.dialCode === dialCode) || null;
}

function findCountryConfigByCurrency(currencyCode){
    return COUNTRY_CONFIGS.find(country => country.currencyCode === currencyCode) || null;
}

function inferCountryConfigFromLocation(location){
    const normalizedLocation = String(location || '').toLowerCase();
    if (!normalizedLocation) return DEFAULT_COUNTRY_CONFIG;
    return COUNTRY_CONFIGS.find(country => normalizedLocation.includes(country.label.toLowerCase()))
        || COUNTRY_CONFIGS.find(country => normalizedLocation.includes(country.code.toLowerCase()))
        || DEFAULT_COUNTRY_CONFIG;
}

function getPhoneCountryDialCode(preferredDialCode = currentUser.phoneCountryCode, location = currentUser.location){
    if (preferredDialCode && preferredDialCode !== 'auto') {
        return findCountryConfigByDialCode(preferredDialCode)?.dialCode || preferredDialCode;
    }
    return inferCountryConfigFromLocation(location).dialCode;
}

function normalizePhoneNumberForStorage(phoneNumber, { dialCode = currentUser.phoneCountryCode, location = currentUser.location } = {}){
    const rawValue = String(phoneNumber || '').trim();
    if (!rawValue || /add your phone number|not set/i.test(rawValue)) {
        return '';
    }

    const sanitizedValue = rawValue.replace(/[^\d+]/g, '');
    if (!sanitizedValue) return '';

    if (sanitizedValue.startsWith('+')) {
        const digitsOnly = sanitizedValue.slice(1).replace(/\D/g, '');
        return digitsOnly ? `+${digitsOnly}` : '';
    }

    const resolvedDialCode = getPhoneCountryDialCode(dialCode, location).replace(/[^\d+]/g, '');
    const localNumber = sanitizedValue.replace(/\D/g, '').replace(/^0+/, '');
    if (!localNumber || !resolvedDialCode) return '';
    return `${resolvedDialCode}${localNumber}`;
}

function getPreferredCurrencyCode(user = currentUser, fallbackLocation = currentUser.location){
    if (user?.currencyPreference && user.currencyPreference !== 'auto') {
        return user.currencyPreference;
    }
    return inferCountryConfigFromLocation(fallbackLocation).currencyCode;
}

function getCurrencyConfig(currencyCode, fallbackLocation = currentUser.location){
    return findCountryConfigByCurrency(currencyCode) || inferCountryConfigFromLocation(fallbackLocation) || DEFAULT_COUNTRY_CONFIG;
}

function formatCurrencyAmount(amount, { currencyCode, location = currentUser.location } = {}){
    const currencyConfig = getCurrencyConfig(currencyCode, location);
    const spacer = /^[A-Za-z]/.test(currencyConfig.currencySign) ? ' ' : '';
    return `${currencyConfig.currencySign}${spacer}${formatPrice(amount)}`;
}

function formatListingPrice(listing){
    if (!listing) return '';
    const currencyCode = listing.currencyCode || getPreferredCurrencyCode(currentUser, listing.location);
    return `${formatCurrencyAmount(listing.price, { currencyCode, location: listing.location })}/${listing.unit}`;
}

function detectMobileOperatingSystem(){
    const userAgent = navigator.userAgent || navigator.vendor || '';
    if (/android/i.test(userAgent)) return 'android';
    if (/iphone|ipad|ipod/i.test(userAgent)) return 'ios';
    return 'web';
}

function detectRuntimePlatform(){
    const capacitorPlatform = window.Capacitor?.getPlatform?.();
    if (window.Capacitor?.isNativePlatform?.()) {
        if (capacitorPlatform === 'android') return 'android';
        if (capacitorPlatform === 'ios') return 'ios';
    }

    const standaloneMatch = window.matchMedia?.('(display-mode: standalone)')?.matches;
    if (window.navigator.standalone === true || standaloneMatch) {
        return detectMobileOperatingSystem();
    }

    return 'web';
}

function getRuntimePlatformLabel(platform = runtimePlatform){
    if (platform === 'android') return 'Android App';
    if (platform === 'ios') return 'iPhone App';
    return 'Web App';
}

function isAppRuntime(){
    return runtimePlatform === 'android' || runtimePlatform === 'ios';
}

function updatePlatformExperience(){
    runtimePlatform = detectRuntimePlatform();

    if (runtimePlatformBadge) {
        runtimePlatformBadge.textContent = getRuntimePlatformLabel();
    }

    if (platformAccessNote) {
        platformAccessNote.textContent = isAuthenticatedUser()
            ? `Signed in once, you can keep the same FarmYard data, chats, and listings on web, Android, and iPhone.`
            : `Use one FarmYard login across web, Android, and iPhone with the same account history.`;
    }

    if (callPlatformNote) {
        callPlatformNote.textContent = isAppRuntime()
            ? 'This app build can place in-app audio calls when both users are signed in.'
            : 'Web users open the phone dialer. Install FarmYard on Android or iPhone for in-app audio calls.';
    }
}

function normalizeDialablePhoneNumber(phoneNumber){
    return normalizePhoneNumberForStorage(phoneNumber);
}

function openPhoneDialer(phoneNumber){
    const dialableNumber = normalizeDialablePhoneNumber(phoneNumber);
    if (!dialableNumber) return false;
    window.location.href = `tel:${dialableNumber}`;
    return true;
}

function hasRequiredPhoneNumber(phoneNumber = currentUser.phone){
    return Boolean(normalizePhoneNumberForStorage(phoneNumber, {
        dialCode: currentUser.phoneCountryCode,
        location: currentUser.location,
    }));
}

function isPhoneVisibleForWebCalls(profile){
    if (!profile?.fields?.phone) return true;
    return profile.fields.phone.visible !== false;
}

function enforceRequiredPhoneSetup(message = 'Add your phone number to finish setting up your account'){
    if (!isAuthenticatedUser() || hasRequiredPhoneNumber()) return false;
    isEditingProfile = true;
    showTab('account', { skipHistory: true });
    renderUserListings();
    showToast(message);
    return true;
}

async function placeCallToProfile(profileId, fallbackName = 'Contact', fallbackPhone = ''){
    const profile = profileId ? profiles[profileId] : null;
    const displayName = profile?.name || fallbackName;
    const profilePhone = profile?.fields?.phone?.value || fallbackPhone || '';

    if (isAppRuntime() && !isAuthenticatedUser()) {
        promptForAuth('Sign in to place in-app calls');
        return;
    }

    if (
        isAppRuntime()
        && supabaseClient
        && isUuidLike(currentUser.id)
        && isUuidLike(profileId)
        && profileId !== currentUser.id
    ) {
        await startInAppCall(profileId, displayName);
        return;
    }

    if (profile && !isPhoneVisibleForWebCalls(profile)) {
        showToast(`${displayName} accepts calls only through the FarmYard app`);
        return;
    }

    if (openPhoneDialer(profilePhone)) {
        showToast(`Opening call for ${displayName}`);
        return;
    }

    showToast(`${displayName} has not added a phone number yet`);
}

async function callListingSeller(){
    const listing = currentDetailListing;
    if (!listing) return;
    const sellerProfile = profiles[resolveListingProfileId(listing)] || profiles[listing.sellerId] || null;
    const sellerName = sellerProfile?.name || listing.contact || listing.postedByName || 'this seller';
    const sellerPhone = sellerProfile?.fields?.phone?.value || '';
    await placeCallToProfile(sellerProfile?.id || listing.sellerId || '', sellerName, sellerPhone);
}

async function callProfileById(profileId){
    const profile = profiles[profileId];
    if (!profile) return;
    await placeCallToProfile(profileId, profile.name, profile.fields?.phone?.value || '');
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

function formatMessageStatus(message){
    if (!message?.mine) return '';
    if (message.status === 'sending') return 'Sending';
    if (message.status === 'failed') return 'Failed';
    return 'Sent';
}

function getConversationLastReadAtFromRow(row){
    return row.owner_user_id === currentUser.id ? row.owner_last_read_at : row.buyer_last_read_at;
}

function getConversationReadColumn(conversation){
    return conversation.ownerUserId === currentUser.id ? 'owner_last_read_at' : 'buyer_last_read_at';
}

function getConversationLatestActivityAt(conversation){
    const lastMessage = conversation.messages?.[conversation.messages.length - 1];
    return lastMessage?.sentAt || conversation.updatedAt || null;
}

function getConversationUnreadCount(conversation){
    const lastReadAt = conversation?.lastReadAt ? new Date(conversation.lastReadAt).getTime() : 0;
    return (conversation?.messages || []).filter(message => {
        const messageTime = message.sentAt ? new Date(message.sentAt).getTime() : 0;
        return !message.mine && messageTime > lastReadAt;
    }).length;
}

function sortConversationsByRecent(){
    conversations.sort((left, right) => {
        const leftTime = new Date(getConversationLatestActivityAt(left) || 0).getTime();
        const rightTime = new Date(getConversationLatestActivityAt(right) || 0).getTime();
        return rightTime - leftTime;
    });
}

function updateMessagesNavBadge(){
    const unreadTotal = conversations.reduce((total, conversation) => total + (conversation.unreadCount || 0), 0);
    if (navMessagesBadge) {
        navMessagesBadge.hidden = unreadTotal === 0;
        navMessagesBadge.textContent = unreadTotal > 99 ? '99+' : String(unreadTotal);
    }
    document.title = unreadTotal > 0 ? `(${unreadTotal}) FarmYard - Marketplace` : 'FarmYard - Marketplace';
}

function getConversationPreviewText(conversation){
    const lastMessage = [...(conversation.messages || [])].reverse().find(message => message.text?.trim() || message.attachments?.length);
    if (!lastMessage) return conversation.listingTitle || 'No messages yet';
    if (lastMessage.text?.trim()) {
        return lastMessage.mine ? `You: ${lastMessage.text.trim()}` : lastMessage.text.trim();
    }
    return lastMessage.mine ? 'You sent media' : 'Media attachment';
}

function setComposerEnabled(isEnabled){
    if (!messageInput || !messageAttachButton) return;
    messageInput.disabled = !isEnabled;
    messageAttachButton.disabled = !isEnabled;
    const sendButton = document.getElementById('message-send');
    if (sendButton) {
        sendButton.disabled = !isEnabled;
    }
    document.querySelector('.chat-composer')?.classList.toggle('is-disabled', !isEnabled);
    messageInput.placeholder = isEnabled ? 'Type a message' : 'Select a conversation';
}

function markConversationAsReadLocally(conversationId, readAt = new Date().toISOString()){
    const conversation = conversations.find(item => item.id === conversationId);
    if (!conversation) return;
    conversation.lastReadAt = readAt;
    conversation.unreadCount = 0;
    updateMessagesNavBadge();
}

async function markConversationAsRead(conversationId){
    const conversation = conversations.find(item => item.id === conversationId);
    if (!conversation) return;
    const latestIncoming = [...conversation.messages].reverse().find(message => !message.mine)?.sentAt;
    const nextReadAt = latestIncoming || new Date().toISOString();
    if (conversation.lastReadAt && new Date(conversation.lastReadAt).getTime() >= new Date(nextReadAt).getTime()) {
        return;
    }
    markConversationAsReadLocally(conversationId, nextReadAt);
    if (!conversation.persisted || !supabaseClient) return;
    const readColumn = getConversationReadColumn(conversation);
    await supabaseClient
        .from(SUPABASE_TABLES.conversations)
        .update({ [readColumn]: nextReadAt })
        .eq('id', conversationId);
}

function maybeNotifyIncomingMessage(conversation, message){
    if (!message || message.mine || typeof Notification === 'undefined') return;
    playIncomingMessageSound();
    if (Notification.permission !== 'granted' || !document.hidden) return;
    if (message.id && seenIncomingMessageIds.has(message.id)) return;
    if (message.id) {
        seenIncomingMessageIds.add(message.id);
    }
    const body = message.text?.trim() || 'Sent an attachment';
    new Notification(conversation.contact, { body });
}

function upsertMessageInConversation(conversationId, message){
    const conversation = conversations.find(item => item.id === conversationId);
    if (!conversation) return null;
    const existingIndex = conversation.messages.findIndex(item => item.id && message.id && item.id === message.id);
    if (existingIndex >= 0) {
        conversation.messages[existingIndex] = { ...conversation.messages[existingIndex], ...message };
    } else {
        conversation.messages.push(message);
    }
    conversation.updatedAt = message.sentAt || new Date().toISOString();
    conversation.lastUpdated = formatConversationUpdatedLabel(conversation.updatedAt);
    conversation.unreadCount = getConversationUnreadCount(conversation);
    sortConversationsByRecent();
    updateMessagesNavBadge();
    return conversation;
}

function getSelectedMessageContext(){
    const conversation = conversations.find(item => item.id === selectedMessageConversationId);
    const message = conversation?.messages.find(item => item.id === selectedMessageId) || null;
    return { conversation, message };
}

function clearSelectedMessage(){
    selectedMessageId = null;
    selectedMessageConversationId = null;
    if (messageActionBar) {
        messageActionBar.hidden = true;
    }
}

function selectMessage(conversationId, messageId){
    if (selectedMessageId === messageId && selectedMessageConversationId === conversationId) {
        clearSelectedMessage();
        renderMessagesTab();
        return;
    }
    selectedMessageConversationId = conversationId;
    selectedMessageId = messageId;
    if (messageActionBar) {
        messageActionBar.hidden = false;
    }
    renderMessagesTab();
}

function getReactionSummary(reactions = {}){
    return Object.entries(reactions)
        .filter(([, users]) => Array.isArray(users) && users.length)
        .map(([emoji, users]) => ({ emoji, count: users.length }));
}

async function reactToSelectedMessage(reaction){
    const { conversation, message } = getSelectedMessageContext();
    if (!conversation || !message || message.deletedAt) return;
    const currentUsers = Array.isArray(message.reactions?.[reaction]) ? [...message.reactions[reaction]] : [];
    const nextUsers = currentUsers.includes(currentUser.id)
        ? currentUsers.filter(id => id !== currentUser.id)
        : [...currentUsers, currentUser.id];
    const nextReactions = {
        ...(message.reactions || {}),
        [reaction]: nextUsers,
    };
    if (!nextUsers.length) {
        delete nextReactions[reaction];
    }
    message.reactions = nextReactions;
    renderMessagesTab();

    if (conversation.persisted && message.id && !String(message.id).startsWith('temp-')) {
        const saveSucceeded = await updatePersistedMessage(conversation.id, message.id, { reactions: nextReactions });
        if (!saveSucceeded) return;
    }
}

async function deleteSelectedMessage(){
    const { conversation, message } = getSelectedMessageContext();
    if (!conversation || !message || !message.mine || message.deletedAt) return;
    message.text = 'Message deleted';
    message.attachments = [];
    message.reactions = {};
    message.deletedAt = new Date().toISOString();
    message.deletedByUserId = currentUser.id;
    clearSelectedMessage();
    renderMessagesTab();

    if (conversation.persisted && message.id && !String(message.id).startsWith('temp-')) {
        await updatePersistedMessage(conversation.id, message.id, {
            body: '',
            attachments: [],
            reactions: {},
            deleted_at: message.deletedAt,
            deleted_by_user_id: currentUser.id,
        });
    }
}

async function copySelectedMessage(){
    const { message } = getSelectedMessageContext();
    if (!message?.text || message.deletedAt) return;
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(message.text);
            showToast('Message copied');
        }
    } catch (error) {
        console.error('Could not copy message', error);
    }
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

function syncProfileRecord(profileRow){
    if (!profileRow?.id) return;
    const baseAccount = buildBaseUserAccount(
        normalizeEmail(profileRow.email || `${profileRow.id}@farmyard.local`),
        profileRow.full_name || 'FarmYard User',
        profileRow.id
    );

    if (!profiles[profileRow.id]) {
        profiles[profileRow.id] = buildIndividualProfile(baseAccount);
    }

    const profile = profiles[profileRow.id];
    profile.name = profileRow.full_name || profile.name;
    profile.avatarUrl = profileRow.profile_fields?._avatar_url || profileRow.security?.profile_photo || profile.avatarUrl || '';
    profile.type = profileRow.account_type || profile.type;
    profile.about = profileRow.about || profile.about;
    profile.verified = typeof profileRow.verified === 'boolean' ? profileRow.verified : profile.verified;
    profile.rating = Number(profileRow.community_rating ?? profile.rating ?? 5);
    profile.ratingCount = Number(profileRow.rating_count ?? profile.ratingCount ?? 1);
    profile.verificationPlan = profileRow.verification_plan
        ? { ...buildVerificationPlanState(), ...profileRow.verification_plan }
        : { ...profile.verificationPlan };

    const nextFields = {
        ...profile.fields,
        location: {
            label: 'Location',
            value: profileRow.location || profile.fields?.location?.value || 'Not set',
            visible: profile.fields?.location?.visible ?? true,
        },
        phone: {
            label: 'Phone',
            value: profileRow.phone || profile.fields?.phone?.value || 'Not set',
            visible: profile.fields?.phone?.visible ?? false,
        },
        phoneCountryCode: {
            label: 'Phone Country Code',
            value: profile.fields?.phoneCountryCode?.value || DEFAULT_COUNTRY_CONFIG.dialCode,
            visible: false,
        },
        email: {
            label: 'Email',
            value: profileRow.email || profile.fields?.email?.value || '',
            visible: profile.fields?.email?.visible ?? false,
        },
        currencyPreference: {
            label: 'Currency Preference',
            value: profile.fields?.currencyPreference?.value || 'auto',
            visible: false,
        },
        companyRole: {
            label: 'Company Role',
            value: profileRow.company_role || profile.fields?.companyRole?.value || 'Independent seller',
            visible: profile.fields?.companyRole?.visible ?? true,
        },
        companyName: {
            label: 'Selling For',
            value: companyAccounts[profileRow.company_id]?.name || profile.fields?.companyName?.value || 'Independent',
            visible: profile.fields?.companyName?.visible ?? true,
        },
    };

    if (profileRow.profile_fields && typeof profileRow.profile_fields === 'object') {
        Object.entries(profileRow.profile_fields).forEach(([key, value]) => {
            if (key === '_avatar_url') return;
            nextFields[key] = {
                label: value?.label || nextFields[key]?.label || key,
                value: value?.value ?? nextFields[key]?.value ?? '',
                visible: typeof value?.visible === 'boolean' ? value.visible : (nextFields[key]?.visible ?? true),
            };
        });
    }

    profile.fields = nextFields;
}

function applyPersistedProfileRow(profileRow){
    if (!profileRow) return;
    currentUser.name = profileRow.full_name || currentUser.name;
    currentUser.role = profileRow.role || currentUser.role;
    currentUser.accountType = profileRow.account_type || currentUser.accountType;
    currentUser.location = profileRow.location || currentUser.location;
    currentUser.phone = profileRow.phone || currentUser.phone;
    currentUser.phoneCountryCode = profileRow.profile_fields?.phoneCountryCode?.value || currentUser.phoneCountryCode || DEFAULT_COUNTRY_CONFIG.dialCode;
    currentUser.email = profileRow.email || currentUser.email;
    currentUser.currencyPreference = profileRow.profile_fields?.currencyPreference?.value || currentUser.currencyPreference || 'auto';
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

async function loadPublicProfiles(){
    if (!supabaseClient || !currentUser.id) return;
    const { data, error } = await supabaseClient
        .from(SUPABASE_TABLES.profiles)
        .select('*');

    if (error) {
        if (isMissingSupabaseTableError(error) || isMissingSupabaseColumnError(error)) {
            warnPersistenceSetup('Create the Supabase profiles table to enable user discovery and direct messaging.');
            return;
        }
        console.error('Failed to load public profiles', error);
        showToast('Direct messaging needs the updated profiles policy in Supabase');
        return;
    }

    (data || []).forEach(syncProfileRecord);
}

async function loadPersistedBlocks(){
    if (!supabaseClient || !currentUser.id) return;
    const { data, error } = await supabaseClient
        .from('user_blocks')
        .select('*')
        .or(`blocker_user_id.eq.${currentUser.id},blocked_user_id.eq.${currentUser.id}`);

    if (error) {
        if (isMissingSupabaseTableError(error) || isMissingSupabaseColumnError(error)) {
            userBlocks = [];
            return;
        }
        console.error('Failed to load user blocks', error);
        showToast(error.message);
        return;
    }

    userBlocks = (data || []).map(row => ({
        id: row.id,
        blockerUserId: row.blocker_user_id,
        blockedUserId: row.blocked_user_id,
        createdAt: row.created_at,
    }));
}

function buildPersistedListingRow(listing){
    return {
        id: listing.id,
        user_id: currentUser.id,
        seller_id: listing.sellerId,
        category: listing.category,
        title: listing.title,
        price: String(listing.price),
        currency_code: listing.currencyCode || getPreferredCurrencyCode(currentUser, listing.location),
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
        currencyCode: row.currency_code || inferCountryConfigFromLocation(row.location).currencyCode,
        unit: row.unit,
        minOrder: row.min_order || '',
        location: row.location,
        description: row.description || '',
        image: row.image_url || DEFAULT_LISTING_IMAGE,
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
    await loadPublicProfiles();
    await loadPersistedBlocks();
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
    const isBuyer = row.buyer_user_id === currentUser.id;
    const oppositeUserId = isBuyer ? row.owner_user_id : row.buyer_user_id;
    const contactProfileId = row.listing_id
        ? (isBuyer ? (row.seller_id || oppositeUserId) : oppositeUserId)
        : oppositeUserId;
    return {
        id: row.id,
        listingId: row.listing_id || null,
        listingTitle: row.listing_title || 'Marketplace',
        contact: getConversationContactNameFromRow(row),
        contactProfileId,
        sellerId: row.seller_id || null,
        role: 'Marketplace Contact',
        location: row.location || 'Marketplace',
        online: false,
        lastSeen: 'recently',
        lastUpdated: formatConversationUpdatedLabel(row.updated_at),
        updatedAt: row.updated_at || row.created_at || null,
        lastReadAt: getConversationLastReadAtFromRow(row) || null,
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
        text: row.deleted_at ? 'Message deleted' : (row.body || ''),
        time: new Date(row.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        sentAt: row.created_at,
        mine: row.sender_user_id === currentUser.id,
        attachments: row.deleted_at ? [] : (Array.isArray(row.attachments) ? row.attachments : []),
        reactions: row.reactions && typeof row.reactions === 'object' ? row.reactions : {},
        deletedAt: row.deleted_at || null,
        deletedByUserId: row.deleted_by_user_id || null,
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
            conversations = [];
            updateMessagesNavBadge();
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
                conversations = [];
                updateMessagesNavBadge();
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
        unreadCount: 0,
    }));

    conversations.forEach(conversation => {
        conversation.unreadCount = getConversationUnreadCount(conversation);
    });
    sortConversationsByRecent();
    updateMessagesNavBadge();

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
            buyer_last_read_at: new Date().toISOString(),
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

async function ensurePersistedDirectConversation(profileId){
    if (!supabaseClient || !currentUser.id || !profileId || profileId === currentUser.id || !isUuidLike(profileId)) {
        return null;
    }

    const profile = profiles[profileId];
    if (!profile) {
        showToast('That user profile is not available yet');
        return null;
    }

    const conversationMatch = await supabaseClient
        .from(SUPABASE_TABLES.conversations)
        .select('*')
        .or(`and(listing_id.is.null,owner_user_id.eq.${currentUser.id},buyer_user_id.eq.${profileId}),and(listing_id.is.null,owner_user_id.eq.${profileId},buyer_user_id.eq.${currentUser.id})`)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (conversationMatch.error) {
        console.error('Failed to look up direct conversation', conversationMatch.error);
        showToast(conversationMatch.error.message);
        return null;
    }

    if (conversationMatch.data) {
        return conversationMatch.data;
    }

    const { data: createdConversation, error: createError } = await supabaseClient
        .from(SUPABASE_TABLES.conversations)
        .insert({
            listing_id: null,
            listing_title: 'Direct message',
            seller_id: null,
            owner_user_id: profileId,
            owner_name: profile.name,
            buyer_user_id: currentUser.id,
            buyer_name: currentUser.name,
            location: profile.fields?.location?.value || 'FarmYard',
            buyer_last_read_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (createError) {
        console.error('Failed to create direct conversation', createError);
        showToast(createError.message);
        return null;
    }

    return createdConversation;
}

async function blockUser(profileId){
    if (!supabaseClient || !currentUser.id || !profileId || profileId === currentUser.id) return false;
    const { data, error } = await supabaseClient
        .from('user_blocks')
        .insert({
            blocker_user_id: currentUser.id,
            blocked_user_id: profileId,
        })
        .select()
        .single();

    if (error) {
        console.error('Failed to block user', error);
        showToast(error.message);
        return false;
    }

    userBlocks.push({
        id: data.id,
        blockerUserId: data.blocker_user_id,
        blockedUserId: data.blocked_user_id,
        createdAt: data.created_at,
    });
    return true;
}

async function unblockUser(profileId){
    if (!supabaseClient || !currentUser.id || !profileId) return false;
    const existing = userBlocks.find(row => row.blockerUserId === currentUser.id && row.blockedUserId === profileId);
    if (!existing) return true;
    const { error } = await supabaseClient
        .from('user_blocks')
        .delete()
        .eq('id', existing.id)
        .eq('blocker_user_id', currentUser.id);

    if (error) {
        console.error('Failed to unblock user', error);
        showToast(error.message);
        return false;
    }

    userBlocks = userBlocks.filter(row => row.id !== existing.id);
    return true;
}

async function toggleBlockProfile(profileId){
    if (!profileId || profileId === currentUser.id) return;
    const blockedByMe = isBlockedByCurrentUser(profileId);
    const succeeded = blockedByMe ? await unblockUser(profileId) : await blockUser(profileId);
    if (!succeeded) return;
    closeChatOptionsMenu();
    showToast(blockedByMe ? 'User unblocked' : 'User blocked');
    if (currentProfileId === profileId) {
        openProfile(profileId);
    }
    if (getActiveTabName() === 'messages') {
        renderMessagesTab();
    }
}

async function updatePersistedMessage(conversationId, messageId, payload){
    if (!supabaseClient || !conversationId || !messageId) return false;
    const { error } = await supabaseClient
        .from(SUPABASE_TABLES.messages)
        .update(payload)
        .eq('id', messageId)
        .eq('conversation_id', conversationId);

    if (error) {
        console.error('Failed to update message', error);
        showToast(error.message);
        return false;
    }

    return true;
}

async function savePersistedMessage(conversationId, payload){
    if (!supabaseClient || !currentUser.id || !conversationId) return null;
    const sentAt = payload.sentAt || new Date().toISOString();
    const { data, error } = await supabaseClient
        .from(SUPABASE_TABLES.messages)
        .insert({
            conversation_id: conversationId,
            sender_user_id: currentUser.id,
            sender_name: currentUser.name,
            body: payload.text || '',
            attachments: payload.attachments || [],
            created_at: sentAt,
        })
        .select()
        .single();

    if (error) {
        if (isMissingSupabaseTableError(error) || isMissingSupabaseColumnError(error)) {
            warnPersistenceSetup('Create the Supabase message tables to enable shared messaging.');
            return null;
        }
        console.error('Failed to save message', error);
        showToast(error.message);
        return null;
    }

    const conversation = conversations.find(item => item.id === conversationId);
    const readColumn = conversation ? getConversationReadColumn(conversation) : null;
    await supabaseClient
        .from(SUPABASE_TABLES.conversations)
        .update({
            updated_at: sentAt,
            ...(readColumn ? { [readColumn]: sentAt } : {}),
        })
        .eq('id', conversationId);

    return mapPersistedMessageRow(data || {
        id: payload.id,
        sender_name: currentUser.name,
        sender_user_id: currentUser.id,
        body: payload.text || '',
        attachments: payload.attachments || [],
        created_at: sentAt,
    });
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

function handleRealtimeMessageInsert(row){
    if (!row) return;
    const message = mapPersistedMessageRow(row);
    const conversation = upsertMessageInConversation(row.conversation_id, message);
    if (!conversation) {
        queueRealtimeMessagesRefresh();
        return;
    }

    if (!message.mine) {
        maybeNotifyIncomingMessage(conversation, message);
        if (getActiveTabName() === 'messages' && activeConversationId === conversation.id && !document.hidden) {
            markConversationAsRead(conversation.id);
        }
    }

    if (getActiveTabName() === 'messages') {
        renderMessagesTab();
    } else {
        updateMessagesNavBadge();
    }
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
                if (payload.eventType === 'INSERT') {
                    handleRealtimeMessageInsert(payload.new);
                    return;
                }
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
document.getElementById('nav-post').onclick = () => {
    if (!isAuthenticatedUser()) {
        promptForAuth('Sign in to post a listing');
        return;
    }
    showTab('post');
};
document.getElementById('nav-messages').onclick = () => {
    if (!isAuthenticatedUser()) {
        promptForAuth('Sign in to view messages');
        return;
    }
    mobileMessagesView = 'inbox';
    showTab('messages');
};
document.getElementById('nav-account').onclick = () => {
    showTab('account');
    renderUserListings();
};
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
document.getElementById('detail-call').onclick = () => callListingSeller();
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
if (enableMessageNotificationsButton) {
    enableMessageNotificationsButton.onclick = () => requestMessageNotifications();
}
document.querySelectorAll('.message-reaction-btn').forEach(button => {
    button.onclick = () => reactToSelectedMessage(button.dataset.reaction);
});
if (messageCopyButton) {
    messageCopyButton.onclick = () => copySelectedMessage();
}
if (messageDeleteButton) {
    messageDeleteButton.onclick = () => deleteSelectedMessage();
}
if (messageActionsCloseButton) {
    messageActionsCloseButton.onclick = () => {
        clearSelectedMessage();
        renderMessagesTab();
    };
}
if (photoViewerClose) {
    photoViewerClose.onclick = () => closePhotoViewer();
}
if (photoViewer) {
    photoViewer.onclick = (event) => {
        if (event.target === photoViewer) {
            closePhotoViewer();
        }
    };
}
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && getActiveTabName() === 'messages' && activeConversationId) {
        markConversationAsRead(activeConversationId);
    }
});
['click', 'keydown', 'touchstart'].forEach(eventName => {
    document.addEventListener(eventName, () => unlockIncomingAudio(), { once: true });
});
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
if (chatOptionBlockButton) {
    chatOptionBlockButton.onclick = () => {
        const conversation = conversations.find(item => item.id === activeConversationId);
        const profileId = getConversationTargetProfileId(conversation);
        if (!profileId) return;
        toggleBlockProfile(profileId);
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
if (callAnswerButton) {
    callAnswerButton.onclick = () => answerIncomingCall();
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
    const phoneCountryCode = document.getElementById('reg-phone-country').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const password = document.getElementById('reg-password').value.trim();
    const inviteCode = document.getElementById('reg-invite-code').value.trim().toUpperCase();

    if (!fullName || !email || !phone || !password) {
        showToast('Fill in name, email, phone number, and password');
        return;
    }

    const normalizedPhone = normalizePhoneNumberForStorage(phone, { dialCode: phoneCountryCode });
    if (!normalizedPhone) {
        showToast('Enter a valid phone number to continue');
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
        handleSignedInSession(
            data.session,
            inviteCode ? 'Your account is ready. Company invite checked.' : 'Your account is ready',
            { inviteCode, phone: normalizedPhone, phoneCountryCode }
        );
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
        endActiveCall(false, 'Call ended', false);
        hydrateCurrentUser(buildSignedOutAccount());
        updatePlatformExperience();
        updateAuthButtons(false);
        userListings = [];
        marketplaceListings = [];
        conversations = [];
        userBlocks = [];
        activeConversationId = null;
        stopMessagesRealtime();
        stopCallsRealtime();
        await loadMarketplaceListings();
        refreshMarketplace();
        renderUserListings();
        renderMessagesTab();
        updateMessagesNavBadge();
        showToast('Signed out successfully');
        return;
    }
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
        showToast(error.message);
        return;
    }

    endActiveCall(false, 'Call ended', false);
    hydrateCurrentUser(buildSignedOutAccount());
    updatePlatformExperience();
    updateAuthButtons(false);
    userListings = [];
    marketplaceListings = [];
    conversations = [];
    userBlocks = [];
    activeConversationId = null;
    stopMessagesRealtime();
    stopCallsRealtime();
    await loadMarketplaceListings();
    refreshMarketplace();
    renderUserListings();
    renderMessagesTab();
    updateMessagesNavBadge();
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

    let image = existingListing?.image || DEFAULT_LISTING_IMAGE;
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
        currencyCode: getPreferredCurrencyCode(currentUser, location),
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

function getListingsForProfile(profileId){
    const initialListings = getInitialListings();
    const allListings = [...initialListings, ...marketplaceListings];
    return allListings.filter(listing => resolveListingProfileId(listing) === profileId);
}

function getCurrentUserTimelineInterests(){
    const sources = [
        ...savedListings.map(item => item.category),
        ...orderRequests.map(item => item.title),
        ...userListings.map(item => item.category),
    ].filter(Boolean);

    const categoryCounts = sources.reduce((map, value) => {
        map.set(value, (map.get(value) || 0) + 1);
        return map;
    }, new Map());

    return Array.from(categoryCounts.entries())
        .sort((left, right) => right[1] - left[1])
        .slice(0, 4)
        .map(([value]) => value);
}

function getTimelineLocationTokens(){
    return (currentUser.location || '')
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter(token => token.length > 2);
}

function getListingTimelineScore(listing){
    const listingText = [
        listing.title,
        listing.category,
        listing.location,
        listing.description,
        listing.minOrder,
        listing.unit,
        listing.postedByName,
    ].filter(Boolean).join(' ').toLowerCase();
    const interestMatches = getCurrentUserTimelineInterests()
        .filter(interest => listingText.includes(interest.toLowerCase()))
        .length;
    const locationMatches = getTimelineLocationTokens()
        .filter(token => listingText.includes(token))
        .length;
    const isNegotiable = listing.negotiable ? 1 : 0;
    const isVerifiedSeller = profiles[resolveListingProfileId(listing)]?.verificationPlan?.subscribed ? 1 : 0;
    const recencyBoost = listing.userId ? 3 : 1;

    if (timelineMode === 'nearby') {
        return (locationMatches * 10) + (interestMatches * 2) + isVerifiedSeller + isNegotiable;
    }
    if (timelineMode === 'recent') {
        return recencyBoost * 10;
    }
    if (timelineMode === 'interest') {
        return (interestMatches * 10) + (locationMatches * 2) + isVerifiedSeller;
    }
    return (interestMatches * 7) + (locationMatches * 6) + (isVerifiedSeller * 3) + (isNegotiable * 2) + recencyBoost;
}

function getFilteredTimelineListings(listings){
    const normalizedInterest = selectedTimelineInterest.toLowerCase();
    const interestFiltered = normalizedInterest === 'all'
        ? listings
        : listings.filter(listing => [listing.category, listing.title, listing.description]
            .filter(Boolean)
            .some(value => value.toLowerCase().includes(normalizedInterest)));

    return [...interestFiltered].sort((left, right) => {
        const scoreDifference = getListingTimelineScore(right) - getListingTimelineScore(left);
        if (scoreDifference !== 0) return scoreDifference;
        const leftRecent = left.userId ? 1 : 0;
        const rightRecent = right.userId ? 1 : 0;
        return rightRecent - leftRecent;
    });
}

function renderTimelineInterestChips(){
    if (!timelineInterestChips) return;
    const interests = ['All', ...getCurrentUserTimelineInterests()];
    timelineInterestChips.innerHTML = interests.map(interest => `
        <button
            type="button"
            class="timeline-interest-chip${selectedTimelineInterest.toLowerCase() === interest.toLowerCase() ? ' is-active' : ''}"
            data-interest="${interest}"
        >${interest}</button>
    `).join('');

    timelineInterestChips.querySelectorAll('.timeline-interest-chip').forEach(button => {
        button.onclick = () => {
            selectedTimelineInterest = button.dataset.interest || 'All';
            refreshMarketplace();
        };
    });
}

function updateTimelineFeedCopy(listings){
    if (!timelineFeedCopy) return;
    const interests = getCurrentUserTimelineInterests();
    const interestLine = interests.length ? interests.slice(0, 2).join(', ') : 'farm activity';
    const locationLine = currentUser.location || 'your area';
    const modeCopy = {
        'for-you': `Prioritizing listings near ${locationLine} and related to ${interestLine}.`,
        nearby: `Showing listings that look closest to ${locationLine}.`,
        recent: 'Showing the newest marketplace activity first.',
        interest: `Showing listings that match your strongest interests: ${interestLine}.`,
    };
    timelineFeedCopy.textContent = modeCopy[timelineMode] || `Showing ${listings.length} listings for your timeline.`;
}

function getProfileSearchSummary(profile){
    const visibleFields = Object.values(profile.fields || {})
        .filter(field => field?.visible && field?.value)
        .map(field => field.value);
    const profileListings = getListingsForProfile(profile.id);
    const listingTitles = profileListings.slice(0, 3).map(listing => listing.title);
    return [
        profile.type,
        profile.about,
        ...visibleFields,
        ...listingTitles,
    ].filter(Boolean).join(' • ');
}

// Refresh marketplace
function refreshMarketplace(){
    marketplace.innerHTML = '';
    const initialListings = getInitialListings();
    const all = getFilteredTimelineListings([...initialListings, ...marketplaceListings]);
    const normalizedQuery = marketQuery.trim().toLowerCase();
    renderTimelineInterestChips();
    const filteredProfiles = normalizedQuery
        ? getSearchableProfiles().filter(profile => [
            profile.name,
            profile.type,
            profile.about,
            ...Object.values(profile.fields || {}).map(field => field?.value),
            ...getListingsForProfile(profile.id).flatMap(listing => [
                listing.title,
                listing.category,
                listing.location,
                listing.description,
            ]),
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
    updateTimelineFeedCopy(filteredListings);

    if (marketResultsCopy) {
        marketResultsCopy.textContent = normalizedQuery
            ? `${filteredProfiles.length + filteredListings.length} result${filteredProfiles.length + filteredListings.length === 1 ? '' : 's'} for "${marketQuery.trim()}".`
            : `Browse ${filteredListings.length} timeline listing${filteredListings.length === 1 ? '' : 's'} ranked for you.`;
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
        const profileListings = getListingsForProfile(profile.id);
        const listingsLabel = profileListings.length
            ? `${profileListings.length} listing${profileListings.length === 1 ? '' : 's'} available`
            : 'No active listings yet';
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
            <p class="card-summary profile-search-meta">${listingsLabel}</p>
            <div class="profile-search-actions">
                <button type="button" class="profile-search-action">View Profile</button>
                <button type="button" class="profile-search-action">Message</button>
                <button type="button" class="profile-search-action">Call</button>
                <button type="button" class="profile-search-action">Listings</button>
            </div>
        `;
        profileCard.onclick = () => openProfile(profile.id);
        const [viewButton, messageButton, callButton, listingsButton] = profileCard.querySelectorAll('.profile-search-action');
        viewButton.onclick = (event) => {
            event.stopPropagation();
            openProfile(profile.id);
        };
        messageButton.onclick = (event) => {
            event.stopPropagation();
            startDirectConversation(profile.id);
        };
        callButton.onclick = (event) => {
            event.stopPropagation();
            callProfileById(profile.id);
        };
        listingsButton.onclick = (event) => {
            event.stopPropagation();
            viewListingsForProfile(profile.id);
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
            <p class="card-summary">${listing.negotiable ? 'Price Negotiable' : formatListingPrice(listing)}</p>
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

if (timelineModeInput) {
    timelineModeInput.addEventListener('change', (event) => {
        timelineMode = event.target.value || 'for-you';
        refreshMarketplace();
    });
}

function getInitialListings(){
    return [];
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
            createdAt: new Date().toISOString(),
        });
        showToast(`Report submitted for ${currentDetailListing.title}`);
    } else {
        showToast(`A report already exists for ${currentDetailListing.title}`);
    }
    persistLocalAppState();
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
    currentProfileId = resolveListingProfileId(listing);
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
        userId: listing.userId || null,
        contact: sellerName,
    });
    detailImage.src = listing.image;
    detailImage.alt = listing.title;
    detailTitle.textContent = listing.title;
    detailVerification.textContent = verificationLabel;
    detailVerification.className = isVerifiedCompany ? 'detail-badge company-badge' : 'detail-badge';
    detailPrice.textContent = listing.negotiable ? 'Price: Negotiable' : `Price: ${formatListingPrice(listing)}`;
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
    const resolvedProfileId = profiles[profileId]
        ? profileId
        : Object.keys(profiles).find(id => id === profileId)
            || null;
    const profile = profiles[resolvedProfileId || profileId];
    if (!profile) return;
    const activeProfileId = resolvedProfileId || profileId;
    const isCurrentUsersCompany = activeProfileId === currentUser.companyId;
    const isCurrentUsersProfile = activeProfileId === currentUser.id;
    const canManageCompanyProfile = isCurrentUsersCompany && currentUser.companyRole === 'Admin';
    const showCompanyEditorOnly = canManageCompanyProfile && isEditingCompanyProfile;
    if (!isCurrentUsersProfile) {
        isEditingOwnProfilePhoto = false;
    }
    currentProfileId = activeProfileId;
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
    profileAvatar.onclick = () => openPhotoViewer({
        imageUrl: profile.avatarUrl || createGeneratedAvatar(profile.name),
        name: profile.name,
    });
    profileAbout.textContent = profile.about;
    profileVerification.textContent = profile.type === 'Company Profile'
        ? (profile.verificationPlan?.subscribed
            ? `Verified Company approved • ${formatCurrencyAmount(profile.verificationPlan.price, { currencyCode: getPreferredCurrencyCode(currentUser, profile.fields?.location?.value || currentUser.location) })}/${profile.verificationPlan.billing}${profile.verificationPlan.renewalDate ? ` • renews ${profile.verificationPlan.renewalDate}` : ''}`
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

    if (!isCurrentUsersProfile) {
        const blockState = getBlockStateForProfile(activeProfileId);
        const messageButton = document.createElement('button');
        messageButton.type = 'button';
        messageButton.textContent = blockState.blockedMe ? `${profile.name} Blocked You` : `Message ${profile.name}`;
        messageButton.disabled = blockState.blockedByMe || blockState.blockedMe;
        messageButton.onclick = () => startDirectConversation(activeProfileId);
        profileAdminTools.appendChild(messageButton);

        const listingsButton = document.createElement('button');
        listingsButton.type = 'button';
        listingsButton.textContent = `View ${profile.name}'s Listings`;
        listingsButton.onclick = () => viewListingsForProfile(activeProfileId);
        profileAdminTools.appendChild(listingsButton);

        const blockButton = document.createElement('button');
        blockButton.type = 'button';
        blockButton.textContent = blockState.blockedByMe ? `Unblock ${profile.name}` : `Block ${profile.name}`;
        blockButton.onclick = () => toggleBlockProfile(activeProfileId);
        profileAdminTools.appendChild(blockButton);
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
    if (!isAuthenticatedUser()) {
        promptForAuth('Sign in to message sellers');
        return;
    }
    const listing = JSON.parse(detailMessage.dataset.listing || '{}');
    if (!listing.title) return;
    startConversation({
        id: currentDetailListing?.id || null,
        title: listing.title,
        location: listing.location || 'Marketplace',
        category: listing.category,
        sellerId: listing.sellerId,
        userId: currentDetailListing?.userId || listing.userId || null,
        contact: listing.contact,
        postedByName: currentDetailListing?.postedByName || listing.contact,
    });
}

async function startConversation(listing){
    if (!isAuthenticatedUser()) {
        promptForAuth('Sign in to message sellers');
        return;
    }
    if (listing.userId && listing.userId === currentUser.id) {
        showToast('You cannot message your own listing');
        return;
    }
    if (listing.sellerId && !canInteractWithProfile(listing.sellerId)) {
        showToast('Messaging is unavailable for this user');
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
            contactProfileId: listing.sellerId || null,
            sellerId: listing.sellerId || null,
            role: sellerProfile?.type || (listing.category === 'Services' ? 'Service Provider' : 'Seller'),
            location: listing.location || 'Marketplace',
            lastUpdated: 'Just now',
            messages: [],
            unreadCount: 0,
            lastReadAt: null,
        };
        conversations.unshift(newConversation);
        activeConversationId = newConversation.id;
    }
    mobileMessagesView = 'chat';
    clearMessageComposer();
    showTab('messages');
    showToast(`Opened conversation for ${listing.title}`);
}

async function startDirectConversation(profileId){
    if (!isAuthenticatedUser()) {
        promptForAuth('Sign in to message other users');
        return;
    }
    const profile = profiles[profileId];
    if (!profile) {
        showToast('That user profile is not available yet');
        return;
    }
    if (profileId === currentUser.id) {
        showToast('You cannot message yourself');
        return;
    }
    if (!canInteractWithProfile(profileId)) {
        showToast(isBlockedByCurrentUser(profileId) ? 'You blocked this user' : 'This user blocked you');
        return;
    }

    if (supabaseClient && currentUser.id) {
        const persistedConversation = await ensurePersistedDirectConversation(profileId);
        if (persistedConversation) {
            await loadPersistedConversations();
            activeConversationId = persistedConversation.id;
            mobileMessagesView = 'chat';
            clearMessageComposer();
            showTab('messages');
            renderMessagesTab();
            showToast(`Opened chat with ${profile.name}`);
            return;
        }
    }

    const existingConversation = conversations.find(conversation =>
        !conversation.listingId && (conversation.contactProfileId === profileId || conversation.contact === profile.name)
    );

    if (existingConversation) {
        activeConversationId = existingConversation.id;
    } else {
        const newConversation = {
            id: `conv-${Date.now()}`,
            listingId: null,
            listingTitle: 'Direct message',
            contact: profile.name,
            contactProfileId: profileId,
            sellerId: null,
            role: profile.type || 'Marketplace Member',
            location: profile.fields?.location?.value || 'FarmYard',
            lastUpdated: 'Just now',
            messages: [],
            unreadCount: 0,
            lastReadAt: null,
        };
        conversations.unshift(newConversation);
        activeConversationId = newConversation.id;
    }

    mobileMessagesView = 'chat';
    clearMessageComposer();
    showTab('messages');
    renderMessagesTab();
    showToast(`Opened chat with ${profile.name}`);
}

function renderMessagesTab(){
    conversationList.innerHTML = '';
    updateNotificationButton();
    const activeConversation = conversations.find(conversation => conversation.id === activeConversationId) || conversations[0];
    const selectedContext = getSelectedMessageContext();
    if (messageActionBar) {
        messageActionBar.hidden = !selectedContext.message;
    }
    if (messageDeleteButton) {
        messageDeleteButton.hidden = !selectedContext.message?.mine;
    }
    if (messageCopyButton) {
        messageCopyButton.disabled = !selectedContext.message?.text || Boolean(selectedContext.message?.deletedAt);
    }

    if (!activeConversation && !conversations.length) {
        clearSelectedMessage();
        if (activeChatAvatar) {
            activeChatAvatar.innerHTML = '';
        }
        if (chatBlockedBanner) {
            chatBlockedBanner.hidden = true;
            chatBlockedBanner.textContent = '';
        }
        activeChatTitle.textContent = 'No conversations';
        activeChatMeta.textContent = 'Start from a listing or profile.';
        messagesEmpty.style.display = 'block';
        chatThread.innerHTML = '';
        clearMessageComposer();
        setComposerEnabled(false);
        updateMessagesNavBadge();
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
        const conversationPreview = getConversationPreviewText(conversation);
        card.innerHTML = `
            <span class="conversation-avatar">${conversationAvatar}</span>
            <span class="conversation-content">
                <span class="conversation-row-top">
                    <strong>${conversation.contact}</strong>
                    <span class="conversation-updated-at">${conversation.lastUpdated || ''}</span>
                </span>
                <span class="conversation-row-bottom">
                    <p class="conversation-subtitle">${conversationPreview}</p>
                    ${conversation.unreadCount ? `<span class="conversation-unread-badge">${conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}</span>` : ''}
                </span>
            </span>
        `;
        card.onclick = () => {
            activeConversationId = conversation.id;
            mobileMessagesView = 'chat';
            clearMessageComposer();
            clearSelectedMessage();
            renderMessagesTab();
        };
        conversationList.appendChild(card);
    });

    renderActiveConversation();
    updateMessagesNavBadge();
    syncMessagesView();
}

function renderActiveConversation(){
    const conversation = conversations.find(item => item.id === activeConversationId);
    if (!conversation) return;
    const conversationProfile = getConversationProfile(conversation);
    currentProfileId = conversation.contactProfileId || conversation.sellerId || null;
    const blockMessage = getConversationBlockMessage(conversation);

    if (activeChatAvatar) {
        activeChatAvatar.innerHTML = renderAvatarMarkup({
            name: conversation.contact,
            avatarUrl: conversationProfile?.avatarUrl || '',
            imageClassName: 'avatar-image',
            fallbackClassName: 'avatar-fallback',
        });
        activeChatAvatar.onclick = () => openPhotoViewer({
            imageUrl: conversationProfile?.avatarUrl || createGeneratedAvatar(conversation.contact),
            name: conversation.contact,
        });
    }
    activeChatTitle.textContent = conversation.contact;
    activeChatMeta.textContent = conversation.listingTitle === 'Direct message'
        ? getConversationPresenceLabel(conversation)
        : `${conversation.listingTitle} • ${conversation.location}`;
    messagesEmpty.style.display = 'none';
    chatThread.innerHTML = '';
    setComposerEnabled(!blockMessage);
    if (chatBlockedBanner) {
        chatBlockedBanner.hidden = !blockMessage;
        chatBlockedBanner.textContent = blockMessage;
    }
    if (chatOptionBlockButton && currentProfileId) {
        chatOptionBlockButton.textContent = isBlockedByCurrentUser(currentProfileId) ? 'Unblock User' : 'Block User';
    }

    if (!conversation.messages.length) {
        chatThread.innerHTML = `
            <div class="message-thread-empty">
                <p>No messages yet. Send the first message.</p>
            </div>
        `;
    }

    conversation.messages.forEach(message => {
        const bubble = document.createElement('div');
        bubble.className = `message-row${message.mine ? ' mine' : ''}`;
        const reactionSummary = getReactionSummary(message.reactions);
        bubble.innerHTML = `
            <div class="message-bubble${message.mine ? ' mine' : ''}${selectedMessageId === message.id && selectedMessageConversationId === conversation.id ? ' is-selected' : ''}" data-message-id="${message.id}">
                ${message.text ? `<p>${message.text}</p>` : ''}
                ${message.attachments?.length ? `
                    <div class="message-attachments">
                        ${message.attachments.map((attachment, index) => attachment.type.startsWith('video/')
                            ? `<video controls preload="metadata" src="${attachment.dataUrl}" aria-label="Video attachment ${index + 1}"></video>`
                            : `<img src="${attachment.dataUrl}" alt="${attachment.name || `Image attachment ${index + 1}`}">`
                        ).join('')}
                    </div>
                ` : ''}
                ${reactionSummary.length ? `
                    <div class="message-reactions">
                        ${reactionSummary.map(item => `<span class="message-reaction-pill">${item.emoji} ${item.count}</span>`).join('')}
                    </div>
                ` : ''}
                <span class="message-meta">${message.author} • ${formatMessageTimestamp(message.sentAt, message.time)}${message.mine ? ` • <span class="message-status">${formatMessageStatus(message)}</span>` : ''}</span>
            </div>
        `;
        bubble.querySelector('.message-bubble')?.addEventListener('click', () => selectMessage(conversation.id, message.id));
        chatThread.appendChild(bubble);
    });

    chatThread.scrollTop = chatThread.scrollHeight;
    if (conversation.unreadCount) {
        markConversationAsRead(conversation.id);
    }
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
    if (!isAuthenticatedUser()) {
        promptForAuth('Sign in to send messages');
        return;
    }
    const text = messageInput.value.trim();
    const conversation = conversations.find(item => item.id === activeConversationId);
    if ((!text && !selectedMessageMedia.length) || !conversation) return;
    if (getConversationBlockMessage(conversation)) {
        showToast('Messaging is unavailable in this conversation');
        return;
    }

    const messagePayload = {
        id: `temp-${Date.now()}`,
        author: 'You',
        text,
        time: getCurrentTimeLabel(),
        sentAt: new Date().toISOString(),
        mine: true,
        attachments: selectedMessageMedia.map(file => ({ ...file })),
        status: 'sending',
    };

    upsertMessageInConversation(conversation.id, messagePayload);
    markConversationAsReadLocally(conversation.id, messagePayload.sentAt);
    clearMessageComposer();
    renderMessagesTab();

    if (conversation.persisted) {
        const savedMessage = await savePersistedMessage(conversation.id, messagePayload);
        if (!savedMessage) {
            const failedMessage = conversations
                .find(item => item.id === conversation.id)
                ?.messages.find(item => item.id === messagePayload.id);
            if (failedMessage) {
                failedMessage.status = 'failed';
                renderMessagesTab();
            }
            showToast('Message failed to send');
            return;
        }
        const currentConversation = conversations.find(item => item.id === conversation.id);
        const optimisticMessageIndex = currentConversation?.messages.findIndex(item => item.id === messagePayload.id);
        if (typeof optimisticMessageIndex === 'number' && optimisticMessageIndex >= 0) {
            currentConversation.messages[optimisticMessageIndex] = { ...savedMessage, status: 'sent' };
        }
        if (currentConversation) {
            currentConversation.messages = currentConversation.messages.filter((message, index, allMessages) =>
                allMessages.findIndex(item => item.id === message.id) === index
            );
        }
        if (currentConversation) {
            currentConversation.lastReadAt = savedMessage.sentAt;
            currentConversation.unreadCount = 0;
        }
        sortConversationsByRecent();
        renderMessagesTab();
        showToast('Message sent');
        return;
    }

    const localConversation = conversations.find(item => item.id === conversation.id);
    const optimisticMessageIndex = localConversation?.messages.findIndex(item => item.id === messagePayload.id);
    if (typeof optimisticMessageIndex === 'number' && optimisticMessageIndex >= 0) {
        localConversation.messages[optimisticMessageIndex].status = 'sent';
    }
    if (localConversation) {
        localConversation.lastUpdated = formatConversationUpdatedLabel(messagePayload.sentAt);
    }
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
    clearSelectedMessage();
    renderMessagesTab();
    showToast(`Deleted chat with ${targetConversation.contact} from your inbox`);
}

async function callActiveConversation(){
    const conversation = conversations.find(item => item.id === activeConversationId);
    if (!conversation) return;
    const conversationProfile = getConversationProfile(conversation);
    activeCallConversationId = conversation.id;
    await placeCallToProfile(
        conversationProfile?.id || conversation.contactProfileId || conversation.sellerId || '',
        conversation.contact,
        conversationProfile?.fields?.phone?.value || ''
    );
}

function openActiveConversationProfile(){
    const conversation = conversations.find(item => item.id === activeConversationId);
    const profileId = conversation?.contactProfileId || conversation?.sellerId;
    if (!profileId) return;
    openProfile(profileId);
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
    if (!conversation) return;
    await callActiveConversation();
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

function updateCallControlAvailability({
    canAnswer = false,
    canMute = false,
    canSpeaker = false,
    endLabel = 'End',
} = {}){
    if (callAnswerButton) {
        callAnswerButton.hidden = !canAnswer;
        callAnswerButton.disabled = !canAnswer;
    }
    if (callMuteButton) {
        callMuteButton.disabled = !canMute;
    }
    if (callSpeakerButton) {
        callSpeakerButton.disabled = !canSpeaker;
    }
    if (callEndButton) {
        callEndButton.textContent = endLabel;
    }
}

function showCallOverlay({ name, avatarUrl = '', status = 'Calling...', showDuration = false, showAnswer = false, endLabel = 'End' } = {}){
    if (!callScreen) return;
    callName.textContent = name || 'Contact';
    callStatus.textContent = status;
    callDuration.hidden = !showDuration;
    if (!showDuration) {
        callDuration.textContent = '00:00';
    }
    if (callAvatar) {
        callAvatar.innerHTML = renderAvatarMarkup({
            name: name || 'Contact',
            avatarUrl,
            imageClassName: 'avatar-image',
            fallbackClassName: 'avatar-fallback',
        });
    }
    callScreen.hidden = false;
    updateCallControlAvailability({
        canAnswer: showAnswer,
        canMute: Boolean(activeCallStream),
        canSpeaker: Boolean(activeCallStream),
        endLabel,
    });
    updateCallControlState();
}

function resetCallSessionState(){
    activeCallConversationId = null;
    activeCallSessionId = null;
    activeCallRole = null;
    activeCallTargetProfileId = null;
    activeIncomingCallSession = null;
    activeCallStartedAt = null;
    pendingLocalCallCandidates = [];
    pendingRemoteCallCandidates = [];
    seenCallIceCandidateIds.clear();
}

function closeLocalCallMedia(){
    if (activeCallPeerConnection) {
        activeCallPeerConnection.ontrack = null;
        activeCallPeerConnection.onicecandidate = null;
        activeCallPeerConnection.onconnectionstatechange = null;
        activeCallPeerConnection.close();
        activeCallPeerConnection = null;
    }
    if (activeCallStream) {
        activeCallStream.getTracks().forEach(track => track.stop());
        activeCallStream = null;
    }
    if (callRemoteAudio) {
        callRemoteAudio.srcObject = null;
    }
    stopCallTimer();
    isCallMuted = false;
    isSpeakerMode = false;
    updateCallControlState();
}

function markCallConnected(statusLabel = 'Connected'){
    if (!activeCallStartedAt) {
        activeCallStartedAt = Date.now();
        startCallTimer();
    }
    showCallOverlay({
        name: callName?.textContent || 'Contact',
        avatarUrl: profiles[activeCallTargetProfileId]?.avatarUrl || '',
        status: statusLabel,
        showDuration: true,
        showAnswer: false,
        endLabel: 'End',
    });
}

async function saveCallIceCandidate(candidate){
    if (!supabaseClient || !activeCallSessionId || !currentUser.id || !candidate) return;
    const { error } = await supabaseClient
        .from(SUPABASE_TABLES.callIceCandidates)
        .insert({
            session_id: activeCallSessionId,
            sender_user_id: currentUser.id,
            candidate,
        });

    if (error && !isMissingSupabaseTableError(error)) {
        console.error('Failed to save call ICE candidate', error);
    }
}

async function flushPendingCallIceCandidates(){
    if (!pendingLocalCallCandidates.length || !activeCallSessionId) return;
    const queuedCandidates = [...pendingLocalCallCandidates];
    pendingLocalCallCandidates = [];
    for (const candidate of queuedCandidates) {
        await saveCallIceCandidate(candidate);
    }
}

async function addRemoteIceCandidate(candidate){
    if (!candidate) return;
    if (!activeCallPeerConnection || !activeCallPeerConnection.remoteDescription) {
        pendingRemoteCallCandidates.push(candidate);
        return;
    }
    try {
        await activeCallPeerConnection.addIceCandidate(candidate);
    } catch (error) {
        console.error('Failed to apply remote ICE candidate', error);
    }
}

async function flushPendingRemoteCallCandidates(){
    if (!pendingRemoteCallCandidates.length) return;
    const queuedCandidates = [...pendingRemoteCallCandidates];
    pendingRemoteCallCandidates = [];
    for (const candidate of queuedCandidates) {
        await addRemoteIceCandidate(candidate);
    }
}

async function createCallPeerConnection(){
    if (!window.RTCPeerConnection || !navigator.mediaDevices?.getUserMedia) {
        throw new Error('In-app audio calling is not supported on this device');
    }

    closeLocalCallMedia();
    pendingLocalCallCandidates = [];
    const peerConnection = new RTCPeerConnection({ iceServers: WEBRTC_ICE_SERVERS });
    activeCallPeerConnection = peerConnection;

    peerConnection.onicecandidate = (event) => {
        if (!event.candidate) return;
        const candidatePayload = event.candidate.toJSON ? event.candidate.toJSON() : event.candidate;
        if (!activeCallSessionId) {
            pendingLocalCallCandidates.push(candidatePayload);
            return;
        }
        saveCallIceCandidate(candidatePayload);
    };

    peerConnection.ontrack = (event) => {
        const [remoteStream] = event.streams;
        if (callRemoteAudio && remoteStream) {
            callRemoteAudio.srcObject = remoteStream;
            callRemoteAudio.play?.().catch(() => {});
        }
    };

    peerConnection.onconnectionstatechange = () => {
        if (!activeCallPeerConnection) return;
        const { connectionState } = activeCallPeerConnection;
        if (connectionState === 'connected') {
            markCallConnected('Connected');
            return;
        }
        if (connectionState === 'failed' || connectionState === 'disconnected' || connectionState === 'closed') {
            if (activeCallSessionId || activeCallStream) {
                endActiveCall(true, 'Call ended', false);
            }
        }
    };

    activeCallStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    activeCallStream.getAudioTracks().forEach(track => {
        peerConnection.addTrack(track, activeCallStream);
    });
    updateCallControlAvailability({
        canAnswer: false,
        canMute: true,
        canSpeaker: true,
        endLabel: activeIncomingCallSession ? 'Decline' : 'End',
    });
    updateCallControlState();
}

function getCallPartnerName(sessionRow){
    if (!sessionRow) return 'Contact';
    return sessionRow.caller_user_id === currentUser.id
        ? (sessionRow.callee_name || profiles[sessionRow.callee_user_id]?.name || 'Contact')
        : (sessionRow.caller_name || profiles[sessionRow.caller_user_id]?.name || 'Contact');
}

function getCallPartnerAvatar(sessionRow){
    if (!sessionRow) return '';
    const partnerId = sessionRow.caller_user_id === currentUser.id ? sessionRow.callee_user_id : sessionRow.caller_user_id;
    return profiles[partnerId]?.avatarUrl || '';
}

async function startInAppCall(profileId, displayName){
    if (!isAppRuntime()) {
        showToast('In-app calling is available from the FarmYard mobile app');
        return;
    }
    if (!isAuthenticatedUser() || !supabaseClient) {
        promptForAuth('Sign in to place in-app calls');
        return;
    }
    if (!isUuidLike(profileId) || profileId === currentUser.id) {
        showToast('This user is not ready for an in-app call yet');
        return;
    }
    if (activeCallSessionId || activeCallPeerConnection || activeCallStream) {
        showToast('Finish the current call before starting another one');
        return;
    }

    closeChatOptionsMenu();
    activeCallRole = 'caller';
    activeCallTargetProfileId = profileId;
    activeIncomingCallSession = null;
    showCallOverlay({
        name: displayName,
        avatarUrl: profiles[profileId]?.avatarUrl || '',
        status: 'Preparing secure in-app audio...',
        showDuration: false,
        showAnswer: false,
        endLabel: 'Cancel',
    });

    try {
        await createCallPeerConnection();
        const offer = await activeCallPeerConnection.createOffer({
            offerToReceiveAudio: true,
        });
        await activeCallPeerConnection.setLocalDescription(offer);

        const { data, error } = await supabaseClient
            .from(SUPABASE_TABLES.callSessions)
            .insert({
                caller_user_id: currentUser.id,
                caller_name: currentUser.name,
                callee_user_id: profileId,
                callee_name: displayName,
                status: 'ringing',
                offer_sdp: activeCallPeerConnection.localDescription?.toJSON?.() || activeCallPeerConnection.localDescription,
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        activeCallSessionId = data.id;
        await flushPendingCallIceCandidates();
        showCallOverlay({
            name: displayName,
            avatarUrl: profiles[profileId]?.avatarUrl || '',
            status: 'Ringing in FarmYard...',
            showDuration: false,
            showAnswer: false,
            endLabel: 'Cancel',
        });
        showToast(`Calling ${displayName} in the app`);
    } catch (error) {
        console.error('Failed to start in-app call', error);
        endActiveCall(false, 'Call ended', false);
        if (isMissingSupabaseTableError(error)) {
            showToast('Run the updated Supabase schema to enable in-app calls');
            return;
        }
        showToast(error.message || 'Could not start the in-app call');
    }
}

async function handleIncomingCallSession(sessionRow){
    if (!sessionRow || sessionRow.callee_user_id !== currentUser.id) return;
    if (!isAppRuntime()) {
        showToast(`${sessionRow.caller_name || 'A FarmYard user'} is calling. Open the FarmYard app to answer in-app audio calls.`);
        return;
    }
    if (activeCallSessionId && activeCallSessionId !== sessionRow.id) {
        showToast('Finish the current call before answering another one');
        return;
    }

    activeIncomingCallSession = sessionRow;
    activeCallSessionId = sessionRow.id;
    activeCallRole = 'callee';
    activeCallTargetProfileId = sessionRow.caller_user_id;
    showCallOverlay({
        name: getCallPartnerName(sessionRow),
        avatarUrl: getCallPartnerAvatar(sessionRow),
        status: 'Incoming FarmYard audio call',
        showDuration: false,
        showAnswer: true,
        endLabel: 'Decline',
    });
    showToast(`${sessionRow.caller_name || 'A FarmYard user'} is calling you`);
}

async function handleCallSessionUpdate(sessionRow){
    if (!sessionRow || (sessionRow.caller_user_id !== currentUser.id && sessionRow.callee_user_id !== currentUser.id)) {
        return;
    }

    if (sessionRow.id === activeCallSessionId) {
        if ((sessionRow.status === 'ended' || sessionRow.status === 'declined' || sessionRow.status === 'cancelled') && callScreen && !callScreen.hidden) {
            const endedMessage = sessionRow.status === 'declined' ? 'Call declined' : 'Call ended';
            endActiveCall(true, endedMessage, false);
            return;
        }

        if (activeCallRole === 'caller' && sessionRow.answer_sdp && activeCallPeerConnection && !activeCallPeerConnection.currentRemoteDescription) {
            try {
                await activeCallPeerConnection.setRemoteDescription(sessionRow.answer_sdp);
                await flushPendingRemoteCallCandidates();
                markCallConnected('Connecting...');
            } catch (error) {
                console.error('Failed to apply call answer', error);
            }
        }
    }
}

async function answerIncomingCall(){
    if (!activeIncomingCallSession || !supabaseClient) return;

    try {
        await createCallPeerConnection();
        await activeCallPeerConnection.setRemoteDescription(activeIncomingCallSession.offer_sdp);
        await flushPendingRemoteCallCandidates();
        const answer = await activeCallPeerConnection.createAnswer();
        await activeCallPeerConnection.setLocalDescription(answer);

        const { error } = await supabaseClient
            .from(SUPABASE_TABLES.callSessions)
            .update({
                status: 'active',
                answer_sdp: activeCallPeerConnection.localDescription?.toJSON?.() || activeCallPeerConnection.localDescription,
                started_at: new Date().toISOString(),
            })
            .eq('id', activeIncomingCallSession.id);

        if (error) {
            throw error;
        }

        await flushPendingCallIceCandidates();
        showCallOverlay({
            name: getCallPartnerName(activeIncomingCallSession),
            avatarUrl: getCallPartnerAvatar(activeIncomingCallSession),
            status: 'Connecting...',
            showDuration: false,
            showAnswer: false,
            endLabel: 'End',
        });
        activeIncomingCallSession = null;
    } catch (error) {
        console.error('Failed to answer in-app call', error);
        endActiveCall(false, 'Call ended', false);
        showToast(error.message || 'Could not answer the call');
    }
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
    if (callRemoteAudio) {
        callRemoteAudio.volume = isSpeakerMode ? 1 : 0.85;
    }
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

function handleCallIceCandidateRealtime(candidateRow){
    if (!candidateRow || candidateRow.session_id !== activeCallSessionId || candidateRow.sender_user_id === currentUser.id) {
        return;
    }
    if (seenCallIceCandidateIds.has(candidateRow.id)) {
        return;
    }
    seenCallIceCandidateIds.add(candidateRow.id);
    addRemoteIceCandidate(candidateRow.candidate);
}

function stopCallsRealtime(){
    if (!supabaseClient || !callsRealtimeChannel) return;
    supabaseClient.removeChannel(callsRealtimeChannel);
    callsRealtimeChannel = null;
}

function startCallsRealtime(){
    if (!supabaseClient || !currentUser.id || callsRealtimeChannel) return;
    callsRealtimeChannel = supabaseClient
        .channel(`farmyard-calls-${currentUser.id}`)
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: SUPABASE_TABLES.callSessions },
            (payload) => {
                const sessionRow = payload.new;
                if (!sessionRow) return;
                if (payload.eventType === 'INSERT') {
                    handleIncomingCallSession(sessionRow);
                    return;
                }
                handleCallSessionUpdate(sessionRow);
            }
        )
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: SUPABASE_TABLES.callIceCandidates },
            (payload) => {
                handleCallIceCandidateRealtime(payload.new);
            }
        )
        .subscribe((status) => {
            if (status === 'CHANNEL_ERROR') {
                console.error('Supabase realtime channel error for calls');
            }
        });
}

async function endActiveCall(showEndedToast = false, toastMessage = 'Call ended', persistSession = true){
    const sessionId = activeCallSessionId;
    const nextStatus = activeIncomingCallSession ? 'declined' : (activeCallStartedAt ? 'ended' : 'cancelled');

    if (persistSession && supabaseClient && sessionId) {
        const { error } = await supabaseClient
            .from(SUPABASE_TABLES.callSessions)
            .update({
                status: nextStatus,
                ended_at: new Date().toISOString(),
            })
            .eq('id', sessionId);

        if (error && !isMissingSupabaseTableError(error)) {
            console.error('Failed to end call session', error);
        }
    }

    closeLocalCallMedia();
    resetCallSessionState();
    updateCallControlAvailability({
        canAnswer: false,
        canMute: false,
        canSpeaker: false,
        endLabel: 'End',
    });
    if (callScreen) {
        callScreen.hidden = true;
    }
    if (showEndedToast) {
        showToast(toastMessage);
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
    updatePlatformExperience();
    const requiresPhoneNumber = isAuthenticatedUser() && !hasRequiredPhoneNumber();
    const savedReturnTab = localStorage.getItem('farmyard-return-tab');
    const destination = requiresPhoneNumber ? 'account' : (savedReturnTab || returnTabAfterAuth || 'home');
    localStorage.removeItem('farmyard-return-tab');
    Object.values(authScreens).forEach(screen => setElementVisibility(screen, false, 'flex'));
    setElementVisibility(app, true);
    updateAuthButtons(true);
    if (requiresPhoneNumber) {
        isEditingProfile = true;
    }
    showTab(destination, { skipHistory: true });
    showToast(authContextMessage || (requiresPhoneNumber ? 'Add your phone number to finish setting up your account' : message));
    if (requiresPhoneNumber && destination === 'account') {
        renderUserListings();
    }
    if (options.phone && hasRequiredPhoneNumber(options.phone)) {
        savePersistedProfile();
    }
    loadPersistedAccountData();
}

function syncCurrentUserFromSession(session, options = {}){
    const user = session?.user;
    if (!user) {
        hydrateCurrentUser(buildSignedOutAccount());
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
    if (options.phoneCountryCode) {
        account.phoneCountryCode = options.phoneCountryCode;
    }
    if (options.phone) {
        const normalizedPhone = normalizePhoneNumberForStorage(options.phone, {
            dialCode: options.phoneCountryCode || account.phoneCountryCode,
            location: account.location,
        });
        if (normalizedPhone) {
            account.phone = normalizedPhone;
        }
    }
    hydrateCurrentUser(account);
    ensureProfileForAccount(account);
    profiles[currentUser.id].name = currentUser.name;
    profiles[currentUser.id].fields.email.value = currentUser.email;
    persistCurrentUserAccount();
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
            phoneCountryCode: { label: 'Phone Country Code', value: account.phoneCountryCode || DEFAULT_COUNTRY_CONFIG.dialCode, visible: false },
            email: { label: 'Email', value: account.email, visible: false },
            currencyPreference: { label: 'Currency Preference', value: account.currencyPreference || 'auto', visible: false },
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
    profiles[account.id].fields.phoneCountryCode.value = account.phoneCountryCode || DEFAULT_COUNTRY_CONFIG.dialCode;
    profiles[account.id].fields.email.value = account.email;
    profiles[account.id].fields.currencyPreference.value = account.currencyPreference || 'auto';
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
        phoneCountryCode: DEFAULT_COUNTRY_CONFIG.dialCode,
        email,
        currencyPreference: 'auto',
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
    currentUser.phoneCountryCode = account.phoneCountryCode || DEFAULT_COUNTRY_CONFIG.dialCode;
    currentUser.email = account.email;
    currentUser.currencyPreference = account.currencyPreference || 'auto';
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
        phoneCountryCode: currentUser.phoneCountryCode || DEFAULT_COUNTRY_CONFIG.dialCode,
        email: normalizedCurrentEmail,
        currencyPreference: currentUser.currencyPreference || 'auto',
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
    updatePlatformExperience();
    updateAuthButtons(false);
    updateNotificationButton();
    if (!supabaseClient) {
        hydrateCurrentUser(buildSignedOutAccount());
        conversations = [];
        userBlocks = [];
        activeConversationId = null;
        stopCallsRealtime();
        updateMessagesNavBadge();
        await loadMarketplaceListings();
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
        updatePlatformExperience();
        updateAuthButtons(true);
        await loadPersistedAccountData();
        const blockedForPhoneSetup = enforceRequiredPhoneSetup();
        startMessagesRealtime();
        startCallsRealtime();
        const savedReturnTab = localStorage.getItem('farmyard-return-tab');
        if (savedReturnTab && !blockedForPhoneSetup) {
            localStorage.removeItem('farmyard-return-tab');
            showTab(savedReturnTab, { skipHistory: true });
        }
    }
    if (!data.session) {
        hydrateCurrentUser(buildSignedOutAccount());
        conversations = [];
        userBlocks = [];
        activeConversationId = null;
        stopCallsRealtime();
        updatePlatformExperience();
        updateMessagesNavBadge();
        await loadMarketplaceListings();
        refreshMarketplace();
        renderUserListings();
    }

    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
            syncCurrentUserFromSession(session);
            updatePlatformExperience();
            updateAuthButtons(true);
            loadPersistedAccountData().then(() => {
                enforceRequiredPhoneSetup();
                stopMessagesRealtime();
                stopCallsRealtime();
                startMessagesRealtime();
                startCallsRealtime();
                if (getActiveTabName() === 'messages') {
                    renderMessagesTab();
                }
            });
        }
        if (event === 'SIGNED_OUT') {
            endActiveCall(false, 'Call ended', false);
            hydrateCurrentUser(buildSignedOutAccount());
            updatePlatformExperience();
            updateAuthButtons(false);
            userListings = [];
            marketplaceListings = [];
            conversations = [];
            userBlocks = [];
            activeConversationId = null;
            stopMessagesRealtime();
            stopCallsRealtime();
            loadMarketplaceListings().then(() => {
                refreshMarketplace();
                renderUserListings();
                renderMessagesTab();
                updateMessagesNavBadge();
            });
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
        ratingsGiven.unshift({
            contact: conversation.contact,
            rating,
            note: note || 'No note',
            createdAt: new Date().toISOString(),
        });
        showToast(`You rated ${conversation.contact}`);
    } else {
        if (!note) {
            showToast('Add a short reason for the report');
            return;
        }
        profile.reports += 1;
        userReports.unshift({
            contact: conversation.contact,
            note,
            status: 'Submitted',
            createdAt: new Date().toISOString(),
        });
        showToast(`Report sent for ${conversation.contact}`);
    }

    closeChatFeedback();
    persistLocalAppState();
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
    if (!isAuthenticatedUser()) {
        acc.innerHTML = `
            <section class="account-shell">
                <div class="account-hero-card">
                    <div class="section-heading">
                        <p class="section-eyebrow">Account</p>
                        <h2>Sign in to manage your FarmYard account</h2>
                        <p>You can browse the marketplace without an account, but posting, messaging, saved activity, and account tools require sign-in.</p>
                    </div>
                    <div class="account-actions">
                        <button id="account-login-btn" class="btn btn-primary" type="button">Login</button>
                        <button id="account-register-btn" class="btn btn-secondary" type="button">Register</button>
                    </div>
                </div>
            </section>
        `;
        document.getElementById('account-login-btn').onclick = () => openAuthScreen('login');
        document.getElementById('account-register-btn').onclick = () => openAuthScreen('register');
        return;
    }
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
        ? ratingsGiven.map(item => `<p>${formatFeedbackEntry(item, 'rating')}</p>`).join('')
        : '<div class="mini-empty-state"><strong>No ratings submitted</strong><p>Ratings you leave for buyers or sellers will show here.</p></div>';
    const userReportsMarkup = userReports.length
        ? userReports.map(item => `<p>${formatFeedbackEntry(item, 'userReport')}</p>`).join('')
        : '<div class="mini-empty-state"><strong>No user reports filed</strong><p>Any safety or conduct reports will be listed here.</p></div>';
    const moderationMarkup = reportedListings.length
        ? reportedListings.map(item => `<p>${formatFeedbackEntry(item, 'moderation')}</p>`).join('')
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
                <input id="create-company-name" type="text" placeholder="Your company name">
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
                            <label for="edit-phone-country-code">Phone country code</label>
                            <select id="edit-phone-country-code">${buildCountryOptionMarkup(currentUser.phoneCountryCode || DEFAULT_COUNTRY_CONFIG.dialCode)}</select>
                        </div>
                        <div>
                            <label for="edit-email">Email</label>
                            <input id="edit-email" type="email" value="${currentUser.email}">
                        </div>
                        <div>
                            <label for="edit-currency-preference">Currency preference</label>
                            <select id="edit-currency-preference">${buildCurrencyOptionMarkup(currentUser.currencyPreference || 'auto')}</select>
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
                    <p><strong>Currency</strong><span>${getCurrencyConfig(getPreferredCurrencyCode(currentUser)).currencyCode}</span></p>
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
                    <p><strong>Subscription</strong><span>${formatCurrencyAmount(currentUser.verificationPlan.price, { currencyCode: getPreferredCurrencyCode(currentUser) })}/${currentUser.verificationPlan.billing}</span></p>
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
            <p>${l.negotiable ? 'Price Negotiable' : formatListingPrice(l)}</p>
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
        ? reportedListings.map(item => `<p>${formatFeedbackEntry(item, 'moderation')}</p>`).join('')
        : '<div class="mini-empty-state"><strong>No moderation items</strong><p>Reported listings and moderation updates will appear here.</p></div>';

    ratingsContainer.innerHTML = ratingsGiven.length
        ? ratingsGiven.map(item => `<p>${formatFeedbackEntry(item, 'rating')}</p>`).join('')
        : '<div class="mini-empty-state"><strong>No ratings submitted</strong><p>Ratings you leave for buyers or sellers will show here.</p></div>';

    userReportsContainer.innerHTML = userReports.length
        ? userReports.map(item => `<p>${formatFeedbackEntry(item, 'userReport')}</p>`).join('')
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
    const rawPhone = document.getElementById('edit-phone').value.trim();
    const phoneCountryCode = document.getElementById('edit-phone-country-code').value.trim();
    const email = document.getElementById('edit-email').value.trim();
    const currencyPreference = document.getElementById('edit-currency-preference').value.trim();
    const companyRole = document.getElementById('edit-company-role').value.trim();
    const about = document.getElementById('edit-about').value.trim();
    const profilePhotoInput = document.getElementById('edit-profile-photo');
    const phone = normalizePhoneNumberForStorage(rawPhone, { dialCode: phoneCountryCode, location });

    if (!name || !role || !location || !phone || !email) {
        showToast('Fill in the main profile details first');
        return;
    }

    currentUser.name = name;
    currentUser.role = role;
    currentUser.location = location;
    currentUser.phone = phone;
    currentUser.phoneCountryCode = phoneCountryCode;
    currentUser.email = email;
    currentUser.currencyPreference = currencyPreference || 'auto';
    if (profilePhotoInput?.files?.[0]) {
        currentUser.avatarUrl = await readFileAsDataUrl(profilePhotoInput.files[0]);
    }

    profile.name = name;
    profile.about = about || profile.about;
    profile.avatarUrl = currentUser.avatarUrl || profile.avatarUrl || '';
    profile.fields.location.value = location;
    profile.fields.phone.value = phone;
    profile.fields.phoneCountryCode.value = phoneCountryCode;
    profile.fields.email.value = email;
    profile.fields.currencyPreference.value = currentUser.currencyPreference;
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
    const companyPhone = normalizePhoneNumberForStorage(document.getElementById('create-company-phone').value.trim(), {
        location: companyLocation,
    });
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
    const companyPhone = normalizePhoneNumberForStorage(document.getElementById('company-phone-edit').value.trim(), {
        location: companyLocation,
    });
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
    const phone = normalizePhoneNumberForStorage(document.getElementById('invite-rep-phone').value.trim(), {
        location: profiles[currentUser.companyId]?.fields?.location?.value || currentUser.location,
    });
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

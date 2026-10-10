/**
 * Internationalization (i18n) definitions for Live TV Streaming App
 * Supports: English (en), Bangla (bn), Hindi (hi), Urdu (ur)
 */

const translations = {
  en: {
    appTitle: "MAG Tv",
    appSubtitle: "HD Streaming • Bangladesh, India & Pakistan",
    qualitySelector: "Resolution",
    autoQuality: "Auto (Adaptive)",
    allChannels: "All Channels",
    sports: "Sports",
    news: "News",
    religious: "Religious",
    entertainment: "Entertainment",
    others: "Others",
    allCountries: "All Regions",
    bangladesh: "Bangladesh",
    india: "India",
    pakistan: "Pakistan",
    searchPlaceholder: "Search channels by name, genre... (Press '/' to search)",
    nowPlaying: "Now Playing",
    live: "LIVE",
    viewers: "viewers",
    directStream: "Direct Stream",
    proxyStream: "Proxy Mode",
    proxyTooltip: "Bypass CORS if stream does not load directly",
    favorite: "Favorite",
    unfavorite: "Favorited",
    reload: "Reload",
    pip: "PiP",
    theater: "Theater",
    fullscreen: "Fullscreen",
    streamErrorTitle: "Stream Temporarily Unavailable",
    streamErrorDesc: "This broadcaster stream could not be loaded directly (may have CORS restriction or regional lock).",
    tryProxyBtn: "Try CORS Proxy",
    tryTestStream: "Play Test Stream",
    retryBtn: "Retry Stream",
    favoritesTitle: "Your Favorites",
    recentlyWatched: "Recently Watched",
    clearRecent: "Clear",
    noFavorites: "No favorites yet. Click the heart icon on any channel card to bookmark it!",
    noChannelsFound: "No channels found matching your filters.",
    resetFilters: "Reset Filters",
    showingChannels: "Showing {count} channels",
    dayMode: "Light Mode",
    nightMode: "Dark Mode",
    addCustom: "Custom M3U8",
    customModalTitle: "Play Custom Stream URL",
    customModalDesc: "Paste any public HLS (.m3u8) live stream link to play directly:",
    channelNameLabel: "Channel Name",
    channelUrlLabel: "M3U8 Stream URL",
    playCustomBtn: "Play Now",
    cancelBtn: "Cancel",
    keyboardHelp: "Shortcuts",
    shortcutsTitle: "Keyboard Controls",
    shortcutSpace: "Play / Pause",
    shortcutMute: "Mute / Unmute",
    shortcutFull: "Toggle Fullscreen",
    shortcutTheater: "Toggle Theater Mode",
    shortcutSearch: "Quick Search",
    shortcutEsc: "Close modals / Exit Fullscreen",
    featuredChannels: "Featured Live Streams",
    filterByCountry: "Filter by Country",
    filterByCategory: "Categories",
    statusOnline: "Online",
    statusConnecting: "Connecting...",
    statusBuffering: "Buffering...",
    statusError: "Offline"
  },
  bn: {
    appTitle: "MAG Tv",
    appSubtitle: "এইচডি স্ট্রিমিং • বাংলাদেশ, ভারত ও পাকিস্তান",
    qualitySelector: "রেজোলিউশন",
    autoQuality: "অটো (অ্যাডাপটিভ)",
    allChannels: "সব চ্যানেল",
    sports: "খেলাধুলা",
    news: "সংবাদ",
    religious: "ধর্মীয়",
    entertainment: "বিনোদন",
    others: "অন্যান্য",
    allCountries: "সকল অঞ্চল",
    bangladesh: "বাংলাদেশ",
    india: "ভারত",
    pakistan: "পাকিস্তান",
    searchPlaceholder: "চ্যানেল খুঁজুন নাম বা ধরন দিয়ে... ('/' চাপুন)",
    nowPlaying: "এখন সম্প্রচারিত হচ্ছে",
    live: "লাইভ",
    viewers: "দর্শক",
    directStream: "সরাসরি স্ট্রিম",
    proxyStream: "প্রক্সি মোড",
    proxyTooltip: "সরাসরি না চললে প্রক্সি মোড ব্যবহার করুন",
    favorite: "পছন্দ",
    unfavorite: "পছন্দ তালিকাভুক্ত",
    reload: "রিলোড",
    pip: "পিপ মোড",
    theater: "সিনেমা মোড",
    fullscreen: "ফুলস্ক্রিন",
    streamErrorTitle: "স্ট্রিমটি সাময়িকভাবে উপলব্ধ নয়",
    streamErrorDesc: "ব্রডকাস্টারের সার্ভার বা সিওআরএস বিধিনিষেধের কারণে এটি সরাসরি লোড করা যাচ্ছে না।",
    tryProxyBtn: "প্রক্সি মোড চেষ্টা করুন",
    tryTestStream: "টেস্ট স্ট্রিম চালান",
    retryBtn: "পুনরায় চেষ্টা",
    favoritesTitle: "আপনার পছন্দের চ্যানেল",
    recentlyWatched: "সম্প্রতি দেখা চ্যানেল",
    clearRecent: "মুছুন",
    noFavorites: "কোন পছন্দের চ্যানেল নেই। প্রিয় চ্যানেলে হার্ট আইকনে ক্লিক করে সংরক্ষণ করুন!",
    noChannelsFound: "কোন চ্যানেল খুঁজে পাওয়া যায়নি।",
    resetFilters: "ফিল্টার মুছুন",
    showingChannels: "{count}টি চ্যানেল প্রদর্শিত হচ্ছে",
    dayMode: "লাইট মোড",
    nightMode: "ডার্ক মোড",
    addCustom: "কাস্টম লিংক",
    customModalTitle: "কাস্টম M3U8 লিংক চালান",
    customModalDesc: "যেকোনো লাইভ HLS (.m3u8) স্ট্রিম লিংক পেস্ট করে সাথে সাথে দেখুন:",
    channelNameLabel: "চ্যানেলের নাম",
    channelUrlLabel: "M3U8 স্ট্রিম লিংক",
    playCustomBtn: "চালান",
    cancelBtn: "বাতিল",
    keyboardHelp: "শর্টকাট",
    shortcutsTitle: "কীবোর্ড শর্টকাট",
    shortcutSpace: "চালান / থামান",
    shortcutMute: "শব্দ বন্ধ / চালু",
    shortcutFull: "ফুলস্ক্রিন টগল",
    shortcutTheater: "থিয়েটার মোড",
    shortcutSearch: "দ্রুত অনুসন্ধান",
    shortcutEsc: "বন্ধ করুন",
    featuredChannels: "জনপ্রিয় লাইভ চ্যানেল",
    filterByCountry: "দেশ অনুসারে বাছাই",
    filterByCategory: "বিভাগসমূহ",
    statusOnline: "সক্রিয়",
    statusConnecting: "সংযোগ হচ্ছে...",
    statusBuffering: "বাফারিং হচ্ছে...",
    statusError: "অফলাইন"
  },
  hi: {
    appTitle: "MAG Tv",
    appSubtitle: "एचडी स्ट्रीमिंग • बांग्लादेश, भारत एवं पाकिस्तान",
    qualitySelector: "रिज़ॉल्यूशन",
    autoQuality: "ऑटो (अनुकूली)",
    allChannels: "सभी चैनल",
    sports: "खेल",
    news: "समाचार",
    religious: "धार्मिक",
    entertainment: "मनोरंजन",
    others: "अन्य",
    allCountries: "सभी क्षेत्र",
    bangladesh: "बांग्लादेश",
    india: "भारत",
    pakistan: "पाकिस्तान",
    searchPlaceholder: "चैनल का नाम या श्रेणी खोजें... ('/' दबाएं)",
    nowPlaying: "अभी चल रहा है",
    live: "लाइव",
    viewers: "दर्शक",
    directStream: "डायरेक्ट स्ट्रीम",
    proxyStream: "प्रॉक्सी मोड",
    proxyTooltip: "यदि डायरेक्ट स्ट्रीम न चले तो प्रॉक्सी का उपयोग करें",
    favorite: "पसंदीदा",
    unfavorite: "पसंदीदा में शामिल",
    reload: "रीलोड",
    pip: "पीआईपी",
    theater: "थिएटर मोड",
    fullscreen: "पूर्ण स्क्रीन",
    streamErrorTitle: "स्ट्रीम अस्थायी रूप से अनुपलब्ध है",
    streamErrorDesc: "ब्रॉडकास्टर सर्वर या CORS प्रतिबंध के कारण डायरेक्ट प्ले नहीं हो पा रहा है।",
    tryProxyBtn: "CORS प्रॉक्सी आज़माएं",
    tryTestStream: "टेस्ट स्ट्रीम चलाएं",
    retryBtn: "पुनः प्रयास करें",
    favoritesTitle: "आपके पसंदीदा चैनल",
    recentlyWatched: "हाल ही में देखे गए",
    clearRecent: "हटाएं",
    noFavorites: "कोई पसंदीदा चैनल नहीं। सेव करने के लिए किसी भी चैनल पर दिल के आइकन पर क्लिक करें!",
    noChannelsFound: "आपके फिल्टर से मेल खाने वाला कोई चैनल नहीं मिला।",
    resetFilters: "फ़िल्टर रीसेट करें",
    showingChannels: "{count} चैनल उपलब्ध हैं",
    dayMode: "लाइट मोड",
    nightMode: "डार्क मोड",
    addCustom: "कस्टम M3U8",
    customModalTitle: "कस्टम स्ट्रीम URL चलाएं",
    customModalDesc: "सीधे देखने के लिए कोई भी HLS (.m3u8) लाइव स्ट्रीम लिंक पेस्ट करें:",
    channelNameLabel: "चैनल का नाम",
    channelUrlLabel: "M3U8 स्ट्रीम लिंक",
    playCustomBtn: "अभी चलाएं",
    cancelBtn: "रद्द करें",
    keyboardHelp: "शॉर्टकट",
    shortcutsTitle: "कीबोर्ड शॉर्टकट्स",
    shortcutSpace: "चलाएं / रोकें",
    shortcutMute: "म्यूट / अनम्यूट",
    shortcutFull: "पूर्ण स्क्रीन टॉगल",
    shortcutTheater: "थिएटर मोड",
    shortcutSearch: "त्वरित खोज",
    shortcutEsc: "बंद करें",
    featuredChannels: "विशेष लाइव चैनल",
    filterByCountry: "देश द्वारा फ़िल्टर",
    filterByCategory: "श्रेणियाँ",
    statusOnline: "ऑनलाइन",
    statusConnecting: "कनेक्ट हो रहा है...",
    statusBuffering: "बफरिंग...",
    statusError: "ऑफलाइन"
  },
  ur: {
    appTitle: "MAG Tv",
    appSubtitle: "ایچ ڈی اسٹریمنگ • بنگلہ دیش، بھارت اور پاکستان",
    qualitySelector: "ریزولوشن",
    autoQuality: "آٹو (حسب ضرورت)",
    allChannels: "تمام چینلز",
    sports: "کھیل",
    news: "خبریں",
    religious: "مذہبی",
    entertainment: "تفریح",
    others: "دیگر",
    allCountries: "تمام خطے",
    bangladesh: "بنگلہ دیش",
    india: "بھارت",
    pakistan: "پاکستان",
    searchPlaceholder: "چینل کا نام یا قسم تلاش کریں... ('/' دبائیں)",
    nowPlaying: "اب چل رہا ہے",
    live: "لائیو",
    viewers: "ناظرین",
    directStream: "براہ راست سلسلہ",
    proxyStream: "پراکسی موڈ",
    proxyTooltip: "اگر براہ راست سلسلہ نہ چلے تو پراکسی کا استعمال کریں",
    favorite: "پسندیدہ",
    unfavorite: "پسندیدہ میں محفوظ",
    reload: "دوبارہ لوڈ کریں",
    pip: "پی آئی پی",
    theater: "تھیٹر موڈ",
    fullscreen: "فل سکرین",
    streamErrorTitle: "نشریات عارضی طور پر دستیاب نہیں ہیں",
    streamErrorDesc: "نشریاتی ادارے کے سرور یا براؤزر کی پابندی کے باعث یہ براہ راست نہیں چل رہا۔",
    tryProxyBtn: "پراکسی موڈ آزمائیں",
    tryTestStream: "ٹیسٹ سٹریم چلائیں",
    retryBtn: "دوبارہ کوشش کریں",
    favoritesTitle: "آپ کے پسندیدہ چینلز",
    recentlyWatched: "حال ہی میں دیکھے گئے",
    clearRecent: "صاف کریں",
    noFavorites: "ابھی کوئی پسندیدہ چینل نہیں ہے۔ محفوظ کرنے کے لیے دل کے نشان پر کلک کریں!",
    noChannelsFound: "آپ کی تلاش کے مطابق کوئی چینل نہیں ملا۔",
    resetFilters: "فلٹرز ری سیٹ کریں",
    showingChannels: "{count} چینلز دستیاب ہیں",
    dayMode: "لائٹ موڈ",
    nightMode: "ڈارک موڈ",
    addCustom: "کسٹم M3U8",
    customModalTitle: "اپنی مرضی کا سٹریم لنک چلائیں",
    customModalDesc: "براہ راست دیکھنے کے لیے کوئی بھی لائیو HLS (.m3u8) لنک درج کریں:",
    channelNameLabel: "چینل کا نام",
    channelUrlLabel: "M3U8 سٹریم لنک",
    playCustomBtn: "ابھی چلائیں",
    cancelBtn: "منسوخ کریں",
    keyboardHelp: "شارٹ کٹس",
    shortcutsTitle: "کی بورڈ شارٹ کٹس",
    shortcutSpace: "چلائیں / روکیں",
    shortcutMute: "آواز بند / کھولیں",
    shortcutFull: "فل سکرین موڈ",
    shortcutTheater: "تھیٹر موڈ",
    shortcutSearch: "فوری تلاش",
    shortcutEsc: "بند کریں",
    featuredChannels: "نمایاں لائیو نشریات",
    filterByCountry: "ملک کے لحاظ سے فلٹر",
    filterByCategory: "اقسام",
    statusOnline: "آن لائن",
    statusConnecting: "رابطہ ہو رہا ہے...",
    statusBuffering: "بفرنگ...",
    statusError: "آف لائن"
  }
};

let currentLanguage = localStorage.getItem('liveTvLang') || 'en';

function setLanguage(lang) {
  if (!translations[lang]) return;
  currentLanguage = lang;
  localStorage.setItem('liveTvLang', lang);

  // Set html lang and dir attribute for Urdu
  document.documentElement.lang = lang;
  if (lang === 'ur') {
    document.documentElement.setAttribute('dir', 'rtl');
    document.body.classList.add('rtl-layout');
  } else {
    document.documentElement.setAttribute('dir', 'ltr');
    document.body.classList.remove('rtl-layout');
  }

  // Update all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });

  // Update input placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (translations[lang][key]) {
      el.setAttribute('placeholder', translations[lang][key]);
    }
  });

  // Update title attributes / tooltips
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (translations[lang][key]) {
      el.setAttribute('title', translations[lang][key]);
    }
  });

  // Dispatch language change event for dynamic components
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
}

function t(key, vars = {}) {
  let text = (translations[currentLanguage] && translations[currentLanguage][key]) || translations.en[key] || key;
  for (const [k, v] of Object.entries(vars)) {
    text = text.replace(`{${k}}`, v);
  }
  return text;
}

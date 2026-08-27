export const translations = {
  id: {
    // Menu Sidebar & Header
    ourSpace: "Our Space",
    dashboard: "Dashboard",
    chat: "Obrolan",
    savings: "Tabungan",
    lifestyle: "Lifestyle",
    todo: "To-Do List",
    calendar: "Kalender",
    location: "Lokasi & Baterai",
    haid: "Kalender Haid",
    settings: "Pengaturan",
    profile: "Profil",

    // Pengaturan
    settingsTitle: "Pengaturan",
    settingsSubtitle: "Atur aplikasi sesuai keinginanmu",
    preferences: "Preferensi",
    language: "Bahasa",
    languageDesc: "Pilih bahasa aplikasi",
    appTheme: "Tema Aplikasi",
    appThemeDesc: "Gelap atau Terang",
    notifAndPrivacy: "Notifikasi & Privasi",
    notifications: "Notifikasi",
    notificationsDesc: "Aktifkan push notif",
    privacyMode: "Mode Privasi",
    privacyModeDesc: "Sembunyikan lokasi detail",
    aboutApp: "Tentang Aplikasi",
    logout: "Keluar Akun",
    logoutConfirmTitle: "Keluar Akun?",
    logoutConfirmDesc: "Apakah kamu yakin ingin keluar dari aplikasi Our Space sekarang?",
    cancel: "Batal",
    yesLogout: "Ya, Keluar",
    logoutSuccess: "Berhasil keluar akun! Sampai jumpa..."
  },
  en: {
    // Menu Sidebar & Header
    ourSpace: "Our Space",
    dashboard: "Dashboard",
    chat: "Chat",
    savings: "Savings",
    lifestyle: "Lifestyle",
    todo: "To-Do List",
    calendar: "Calendar",
    location: "Location & Battery",
    haid: "Period Tracker",
    settings: "Settings",
    profile: "Profile",

    // Pengaturan
    settingsTitle: "Settings",
    settingsSubtitle: "Customize the app as you wish",
    preferences: "Preferences",
    language: "Language",
    languageDesc: "Choose app language",
    appTheme: "App Theme",
    appThemeDesc: "Dark or Light",
    notifAndPrivacy: "Notifications & Privacy",
    notifications: "Notifications",
    notificationsDesc: "Enable push notifications",
    privacyMode: "Privacy Mode",
    privacyModeDesc: "Hide exact location details",
    aboutApp: "About Application",
    logout: "Log Out",
    logoutConfirmTitle: "Log Out?",
    logoutConfirmDesc: "Are you sure you want to log out of Our Space now?",
    cancel: "Cancel",
    yesLogout: "Yes, Log Out",
    logoutSuccess: "Successfully logged out! See you soon..."
  }
};

export const getTranslation = (lang = 'id') => {
  return translations[lang] || translations.id;
};
// Planlarım Sayfası JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // DOM elementleri
    const calendarGrid = document.getElementById('calendar-grid');
    const sessionModal = document.getElementById('session-modal');
    const templateModal = document.getElementById('template-modal');
    const sessionForm = document.getElementById('session-form');
    const modalTitle = document.getElementById('modal-title');
    
    // Butonlar
    const quickAddBtn = document.getElementById('quick-add-btn');
    const templateBtn = document.getElementById('template-btn');
    const autoPlanBtn = document.getElementById('auto-plan-btn');
    const prevWeekBtn = document.getElementById('prev-week');
    const nextWeekBtn = document.getElementById('next-week');
    
    // Form elemanları
    const sessionDate = document.getElementById('session-date');
    const sessionSubject = document.getElementById('session-subject');
    const sessionStartTime = document.getElementById('session-start-time');
    const sessionDuration = document.getElementById('session-duration');
    const sessionTopic = document.getElementById('session-topic');
    const sessionNotes = document.getElementById('session-notes');
    
    // Veri deposu
    let studySessions = JSON.parse(localStorage.getItem('studySessions')) || [];
    let currentWeekStart = new Date();
    let editingSessionId = null;
    
    // Günler
    const dayNames = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    const subjectNames = {
        'mathematics': 'Matematik',
        'physics': 'Fizik',
        'chemistry': 'Kimya',
        'biology': 'Biyoloji',
        'turkish': 'Türkçe',
        'history': 'Tarih',
        'geography': 'Coğrafya',
        'philosophy': 'Felsefe'
    };
    
    // Sayfa yüklendiğinde
    init();
    
    function init() {
        setupEventListeners();
        setCurrentWeek();
        renderCalendar();
        updateStats();
        loadUserData();
    }
    
    function loadUserData() {
        const savedUser = sessionStorage.getItem('activeUser');
        if (savedUser) {
            document.getElementById('user-name').textContent = savedUser;
        } else {
            window.location.href = 'index.html';
        }
    }
    
    function setupEventListeners() {
        // Modal açma/kapama
        quickAddBtn.addEventListener('click', () => openSessionModal());
        templateBtn.addEventListener('click', () => openTemplateModal());
        autoPlanBtn.addEventListener('click', generateAutoPlan);
        
        // Hafta navigasyonu
        prevWeekBtn.addEventListener('click', () => navigateWeek(-1));
        nextWeekBtn.addEventListener('click', () => navigateWeek(1));
        
        // Mobile download button
        const mobileDownloadBtn = document.getElementById('mobile-download-btn');
        if (mobileDownloadBtn) {
            mobileDownloadBtn.addEventListener('click', handleMobileDownload);
        }
        
        // Modal kapatma
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', closeModals);
        });
        
        // Modal dışına tıklayınca kapatma
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                closeModals();
            }
        });
        
        // Form gönderimi
        sessionForm.addEventListener('submit', handleSessionSubmit);
        
        // İptal butonu
        document.getElementById('cancel-session').addEventListener('click', closeModals);
        
        // Şablon seçimi
        document.querySelectorAll('.template-item').forEach(item => {
            item.addEventListener('click', () => {
                const template = item.dataset.template;
                applyTemplate(template);
                closeModals();
            });
        });
        
        // Progressive enhancement for animations
        if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
            initializeAnimations();
        }
        
        // Çıkış butonu
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                sessionStorage.removeItem('activeUser');
                window.location.href = 'index.html';
            });
        }
    }
    
    function setCurrentWeek() {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        currentWeekStart = new Date(today.setDate(diff));
        updateWeekDisplay();
    }
    
    function updateWeekDisplay() {
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const startStr = `${currentWeekStart.getDate()} ${getMonthName(currentWeekStart.getMonth())}`;
        const endStr = `${weekEnd.getDate()} ${getMonthName(weekEnd.getMonth())}`;
        
        document.getElementById('current-week').textContent = `${startStr} - ${endStr}`;
    }
    
    function getMonthName(monthIndex) {
        const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
                       'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
        return months[monthIndex];
    }
    
    function navigateWeek(direction) {
        currentWeekStart.setDate(currentWeekStart.getDate() + (direction * 7));
        updateWeekDisplay();
        renderCalendar();
        updateStats();
    }
    
    function renderCalendar() {
        calendarGrid.innerHTML = '';
        
        for (let i = 0; i < 7; i++) {
            const dayDate = new Date(currentWeekStart);
            dayDate.setDate(dayDate.getDate() + i);
            
            const dayColumn = createDayColumn(dayDate, i);
            calendarGrid.appendChild(dayColumn);
        }
    }
    
    function createDayColumn(date, dayIndex) {
        const dayColumn = document.createElement('div');
        dayColumn.className = 'day-column';
        
        // Bugünü vurgula
        const today = new Date();
        if (date.toDateString() === today.toDateString()) {
            dayColumn.classList.add('today');
        }
        
        // Gün başlığı
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.innerHTML = `
            <div class="day-name">${dayNames[dayIndex]}</div>
            <div class="day-date">${date.getDate()} ${getMonthName(date.getMonth())}</div>
        `;
        
        // Ders oturumları
        const studySessionsDiv = document.createElement('div');
        studySessionsDiv.className = 'study-sessions';
        
        // Bu günün oturumlarını getir
        const daySessions = getSessionsForDate(date);
        
        if (daySessions.length === 0) {
            studySessionsDiv.innerHTML = `
                <div class="empty-day">
                    <i class="fas fa-calendar-plus"></i>
                    <p>Henüz ders planlanmamış</p>
                </div>
            `;
        } else {
            daySessions.forEach(session => {
                const sessionCard = createSessionCard(session);
                studySessionsDiv.appendChild(sessionCard);
            });
        }
        
        // Ders ekleme butonu
        const addButton = document.createElement('button');
        addButton.className = 'add-session-btn';
        addButton.innerHTML = '<i class="fas fa-plus"></i> Ders Ekle';
        addButton.addEventListener('click', () => {
            openSessionModal(date);
        });
        
        dayColumn.appendChild(dayHeader);
        dayColumn.appendChild(studySessionsDiv);
        dayColumn.appendChild(addButton);
        
        return dayColumn;
    }
    
    function createSessionCard(session) {
        const sessionCard = document.createElement('div');
        sessionCard.className = `study-session subject-${session.subject}`;
        
        if (session.completed) {
            sessionCard.classList.add('completed');
        } else if (session.inProgress) {
            sessionCard.classList.add('in-progress');
        }
        
        sessionCard.innerHTML = `
            <div class="session-header">
                <div class="session-time">${session.startTime}</div>
                <div class="session-duration">${session.duration}dk</div>
            </div>
            <div class="session-subject">${subjectNames[session.subject]}</div>
            <div class="session-topic">${session.topic}</div>
            <div class="session-status">
                <div class="status-indicator ${session.completed ? 'completed' : session.inProgress ? 'in-progress' : 'pending'}"></div>
                <span>${session.completed ? 'Tamamlandı' : session.inProgress ? 'Devam Ediyor' : 'Bekliyor'}</span>
            </div>
            <div class="session-actions">
                <button class="action-btn edit-btn" title="Düzenle">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" title="Sil">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="action-btn toggle-btn" title="${session.completed ? 'Geri Al' : 'Tamamla'}">
                    <i class="fas fa-${session.completed ? 'undo' : 'check'}"></i>
                </button>
            </div>
        `;
        
        // Event listeners
        sessionCard.querySelector('.edit-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            editSession(session.id);
        });
        
        sessionCard.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteSession(session.id);
        });
        
        sessionCard.querySelector('.toggle-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSessionStatus(session.id);
        });
        
        return sessionCard;
    }
    
    function getSessionsForDate(date) {
        const dateStr = date.toISOString().split('T')[0];
        return studySessions.filter(session => session.date === dateStr)
                           .sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
    
    function openSessionModal(date = null) {
        editingSessionId = null;
        modalTitle.textContent = 'Ders Ekle';
        
        // Form temizle
        sessionForm.reset();
        
        // Eğer tarih verilmişse, form alanını doldur
        if (date) {
            sessionDate.value = date.toISOString().split('T')[0];
        } else {
            sessionDate.value = new Date().toISOString().split('T')[0];
        }
        
        sessionModal.classList.add('show');
    }
    
    function openTemplateModal() {
        templateModal.classList.add('show');
    }
    
    function closeModals() {
        sessionModal.classList.remove('show');
        templateModal.classList.remove('show');
        editingSessionId = null;
    }
    
    function handleSessionSubmit(e) {
        e.preventDefault();
        
        const sessionData = {
            id: editingSessionId || Date.now().toString(),
            date: sessionDate.value,
            subject: sessionSubject.value,
            startTime: sessionStartTime.value,
            duration: parseInt(sessionDuration.value),
            topic: sessionTopic.value,
            notes: sessionNotes.value,
            completed: false,
            inProgress: false,
            createdAt: new Date().toISOString()
        };
        
        if (editingSessionId) {
            // Güncelle
            const index = studySessions.findIndex(s => s.id === editingSessionId);
            if (index !== -1) {
                studySessions[index] = { ...studySessions[index], ...sessionData };
            }
        } else {
            // Yeni ekle
            studySessions.push(sessionData);
        }
        
        saveStudySessions();
        renderCalendar();
        updateStats();
        closeModals();
        
        showNotification('Ders başarıyla kaydedildi!', 'success');
    }
    
    function editSession(sessionId) {
        const session = studySessions.find(s => s.id === sessionId);
        if (!session) return;
        
        editingSessionId = sessionId;
        modalTitle.textContent = 'Ders Düzenle';
        
        // Form alanlarını doldur
        sessionDate.value = session.date;
        sessionSubject.value = session.subject;
        sessionStartTime.value = session.startTime;
        sessionDuration.value = session.duration.toString();
        sessionTopic.value = session.topic;
        sessionNotes.value = session.notes || '';
        
        sessionModal.classList.add('show');
    }
    
    function deleteSession(sessionId) {
        if (confirm('Bu dersi silmek istediğinizden emin misiniz?')) {
            studySessions = studySessions.filter(s => s.id !== sessionId);
            saveStudySessions();
            renderCalendar();
            updateStats();
            showNotification('Ders silindi!', 'info');
        }
    }
    
    function toggleSessionStatus(sessionId) {
        const session = studySessions.find(s => s.id === sessionId);
        if (!session) return;
        
        session.completed = !session.completed;
        session.inProgress = false;
        
        saveStudySessions();
        renderCalendar();
        updateStats();
        
        const message = session.completed ? 'Ders tamamlandı!' : 'Ders durumu geri alındı!';
        showNotification(message, 'success');
    }
    
    function updateStats() {
        const weekSessions = getWeekSessions();
        const totalSessions = weekSessions.length;
        const completedSessions = weekSessions.filter(s => s.completed).length;
        const totalHours = weekSessions.reduce((total, session) => total + session.duration, 0) / 60;
        const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
        
        // Genel istatistikler
        document.getElementById('total-sessions').textContent = totalSessions;
        document.getElementById('completed-sessions').textContent = completedSessions;
        document.getElementById('total-hours').textContent = totalHours.toFixed(1);
        document.getElementById('completion-rate').textContent = completionRate + '%';
        
        // Ders bazında istatistikler
        const subjectStats = {};
        Object.keys(subjectNames).forEach(subject => {
            subjectStats[subject] = weekSessions.filter(s => s.subject === subject).length;
        });
        
        Object.keys(subjectStats).forEach(subject => {
            const element = document.getElementById(`week-${subject.replace('mathematics', 'math')}`);
            if (element) {
                element.textContent = subjectStats[subject];
            }
        });
    }
    
    function getWeekSessions() {
        const weekStart = new Date(currentWeekStart);
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        return studySessions.filter(session => {
            const sessionDate = new Date(session.date);
            return sessionDate >= weekStart && sessionDate <= weekEnd;
        });
    }
    
    function generateAutoPlan() {
        if (confirm('Otomatik plan oluşturulacak. Mevcut planınız etkilenebilir. Devam etmek istiyor musunuz?')) {
            const weekStart = new Date(currentWeekStart);
            const subjects = ['mathematics', 'physics', 'chemistry', 'biology', 'turkish', 'history', 'geography'];
            const times = ['09:00', '11:00', '14:00', '16:00', '19:00'];
            
            // Bu hafta için otomatik plan oluştur
            for (let day = 0; day < 7; day++) {
                const currentDate = new Date(weekStart);
                currentDate.setDate(currentDate.getDate() + day);
                
                // Hafta sonu daha az ders
                const sessionCount = day >= 5 ? 2 : 3;
                
                for (let i = 0; i < sessionCount; i++) {
                    const subject = subjects[Math.floor(Math.random() * subjects.length)];
                    const time = times[i];
                    const topics = {
                        'mathematics': ['Türev', 'İntegral', 'Limit', 'Fonksiyon', 'Geometri'],
                        'physics': ['Mekanik', 'Elektrik', 'Optik', 'Termodinamik', 'Dalga'],
                        'chemistry': ['Atom', 'Bağ', 'Reaksiyon', 'Çözelti', 'Gazlar'],
                        'biology': ['Hücre', 'Genetik', 'Ekoloji', 'Sistem', 'Evrim'],
                        'turkish': ['Dil Bilgisi', 'Anlam', 'Paragraf', 'Yazım', 'Anlatım'],
                        'history': ['Osmanlı', 'Cumhuriyet', 'Dünya Tarihi', 'Atatürk', 'Medeniyet'],
                        'geography': ['Fiziki Coğrafya', 'Beşeri Coğrafya', 'Türkiye', 'Dünya', 'Harita']
                    };
                    
                    const topicList = topics[subject] || ['Genel Tekrar'];
                    const topic = topicList[Math.floor(Math.random() * topicList.length)];
                    
                    const newSession = {
                        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                        date: currentDate.toISOString().split('T')[0],
                        subject: subject,
                        startTime: time,
                        duration: 60,
                        topic: topic,
                        notes: 'Otomatik oluşturulan plan',
                        completed: false,
                        inProgress: false,
                        createdAt: new Date().toISOString()
                    };
                    
                    studySessions.push(newSession);
                }
            }
            
            saveStudySessions();
            renderCalendar();
            updateStats();
            showNotification('Otomatik plan oluşturuldu!', 'success');
        }
    }
    
    function applyTemplate(templateType) {
        const templates = {
            intensive: {
                sessionsPerDay: 5,
                duration: 90,
                subjects: ['mathematics', 'physics', 'chemistry', 'biology', 'turkish', 'history', 'geography'],
                times: ['08:00', '10:30', '14:00', '16:30', '19:00']
            },
            balanced: {
                sessionsPerDay: 3,
                duration: 60,
                subjects: ['mathematics', 'physics', 'chemistry', 'turkish', 'history'],
                times: ['09:00', '14:00', '19:00']
            },
            light: {
                sessionsPerDay: 2,
                duration: 45,
                subjects: ['mathematics', 'turkish', 'history'],
                times: ['14:00', '19:00']
            }
        };
        
        const template = templates[templateType];
        if (!template) return;
        
        // Bu haftanın planlarını temizle
        const weekStart = new Date(currentWeekStart);
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        studySessions = studySessions.filter(session => {
            const sessionDate = new Date(session.date);
            return sessionDate < weekStart || sessionDate > weekEnd;
        });
        
        // Şablona göre plan oluştur
        for (let day = 0; day < 7; day++) {
            const currentDate = new Date(weekStart);
            currentDate.setDate(currentDate.getDate() + day);
            
            // Hafta sonu için ayarlama
            const dailySessions = day >= 5 ? Math.max(1, template.sessionsPerDay - 2) : template.sessionsPerDay;
            
            for (let i = 0; i < dailySessions; i++) {
                const subject = template.subjects[i % template.subjects.length];
                const time = template.times[i];
                
                const newSession = {
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                    date: currentDate.toISOString().split('T')[0],
                    subject: subject,
                    startTime: time,
                    duration: template.duration,
                    topic: `${subjectNames[subject]} Çalışması`,
                    notes: `${templateType.charAt(0).toUpperCase() + templateType.slice(1)} şablonu`,
                    completed: false,
                    inProgress: false,
                    createdAt: new Date().toISOString()
                };
                
                studySessions.push(newSession);
            }
        }
        
        saveStudySessions();
        renderCalendar();
        updateStats();
        showNotification('Şablon uygulandı!', 'success');
    }
    
    function saveStudySessions() {
        localStorage.setItem('studySessions', JSON.stringify(studySessions));
    }
    
    function showNotification(message, type = 'info') {
        // Bildirim sistemi
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            background: ${type === 'success' ? 'var(--success-color)' : type === 'error' ? 'var(--error-color)' : 'var(--info-color)'};
            color: white;
            border-radius: var(--border-radius-md);
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    // Demo veriler ekle (ilk kullanım için)
    if (studySessions.length === 0) {
        addDemoData();
    }
    
    function addDemoData() {
        const today = new Date();
        const demoSessions = [
            {
                id: 'demo1',
                date: today.toISOString().split('T')[0],
                subject: 'mathematics',
                startTime: '09:00',
                duration: 60,
                topic: 'Türev Konusu',
                notes: 'Temel türev kuralları',
                completed: true,
                inProgress: false,
                createdAt: new Date().toISOString()
            },
            {
                id: 'demo2',
                date: today.toISOString().split('T')[0],
                subject: 'physics',
                startTime: '14:00',
                duration: 90,
                topic: 'Kuvvet ve Hareket',
                notes: 'Newton yasaları',
                completed: false,
                inProgress: true,
                createdAt: new Date().toISOString()
            }
        ];
        
        studySessions = demoSessions;
        saveStudySessions();
    }
});

// Mobile Download Functionality
function handleMobileDownload() {
    // PWA özelliklerini kontrol et
    if ('serviceWorker' in navigator) {
        registerServiceWorker();
    }
    
    // Install prompt handling
    if (window.deferredPrompt) {
        window.deferredPrompt.prompt();
        window.deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                showNotification('Uygulama başarıyla yüklendi!', 'success');
            }
            window.deferredPrompt = null;
        });
    } else {
        // Fallback: Kullanıcıya manuel install talimatları göster
        showMobileInstallInstructions();
    }
}

// Service Worker Registration
async function registerServiceWorker() {
    try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully:', registration);
    } catch (error) {
        console.log('Service Worker registration failed:', error);
    }
}

// Mobile Install Instructions Modal
function showMobileInstallInstructions() {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fas fa-mobile-alt"></i> Mobil Uygulama Kurulumu</h2>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="install-instructions">
                    <div class="platform-section">
                        <h3><i class="fab fa-android"></i> Android</h3>
                        <ol>
                            <li>Chrome'da bu sayfayı açın</li>
                            <li>Menü (⋮) butonuna tıklayın</li>
                            <li>"Ana ekrana ekle" seçeneğini seçin</li>
                            <li>"Ekle" butonuna tıklayın</li>
                        </ol>
                    </div>
                    <div class="platform-section">
                        <h3><i class="fab fa-apple"></i> iOS</h3>
                        <ol>
                            <li>Safari'de bu sayfayı açın</li>
                            <li>Paylaş (⤴) butonuna tıklayın</li>
                            <li>"Ana Ekrana Ekle" seçeneğini seçin</li>
                            <li>"Ekle" butonuna tıklayın</li>
                        </ol>
                    </div>
                </div>
                <div class="install-benefits">
                    <h4>Avantajlar:</h4>
                    <ul>
                        <li><i class="fas fa-check"></i> Offline çalışma</li>
                        <li><i class="fas fa-check"></i> Hızlı erişim</li>
                        <li><i class="fas fa-check"></i> Push bildirimleri</li>
                        <li><i class="fas fa-check"></i> Ana ekranda kısayol</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Modal kapatma
    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Advanced Animation System
function initializeAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Staggered animation for multiple elements
                if (entry.target.classList.contains('stagger-parent')) {
                    const children = entry.target.querySelectorAll('.stagger-child');
                    children.forEach((child, index) => {
                        setTimeout(() => {
                            child.classList.add('animate-in');
                        }, index * 100);
                    });
                }
            }
        });
    }, observerOptions);
    
    // Observe elements
    document.querySelectorAll('.stat-card, .day-column, .study-session').forEach(el => {
        observer.observe(el);
    });
    
    // Add stagger animation classes
    const overviewStats = document.querySelector('.overview-stats');
    if (overviewStats) {
        overviewStats.classList.add('stagger-parent');
        overviewStats.querySelectorAll('.stat-card').forEach(card => {
            card.classList.add('stagger-child');
        });
    }
    
    // Parallax effect for page header
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const header = document.querySelector('.page-header');
        if (header) {
            header.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
    
    // Smooth scroll for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Enhanced notification system
function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icon = {
        success: 'fas fa-check-circle',
        error: 'fas fa-times-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    }[type] || 'fas fa-info-circle';
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="${icon}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    // Add to page
    let container = document.querySelector('.notification-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
    }
    
    container.appendChild(notification);
    
    // Animation
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Auto remove
    const removeNotification = () => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    };
    
    setTimeout(removeNotification, duration);
    
    // Manual close
    notification.querySelector('.notification-close').addEventListener('click', removeNotification);
}

// PWA Install Prompt Handler
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.deferredPrompt = e;
    
    // Show download button with pulse animation
    const downloadBtn = document.getElementById('mobile-download-btn');
    if (downloadBtn) {
        downloadBtn.style.display = 'flex';
        downloadBtn.classList.add('pulse-available');
    }
});

// Performance optimization: Lazy loading for session cards
function lazyLoadSessions() {
    const sessionCards = document.querySelectorAll('.study-session[data-lazy="true"]');
    
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const card = entry.target;
                // Load session data
                loadSessionData(card);
                card.removeAttribute('data-lazy');
                cardObserver.unobserve(card);
            }
        });
    });
    
    sessionCards.forEach(card => cardObserver.observe(card));
}

// Sayfa yüklenme animasyonu
document.addEventListener('DOMContentLoaded', function() {
    const mainPage = document.querySelector('.main-page');
    
    setTimeout(() => {
        mainPage.style.opacity = '1';
        mainPage.classList.add('fade-in');
    }, 100);
    
    const cards = document.querySelectorAll('.stat-card, .day-column');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('fade-in');
        }, 200 + (index * 100));
    });
});

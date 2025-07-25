document.addEventListener('DOMContentLoaded', function() {
    // DOM elementleri
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    const togglePassword = document.querySelector('.toggle-password');
    const errorMessage = document.querySelector('.error-message');
    const loginPage = document.querySelector('.login-page');
    const mainPage = document.querySelector('.main-page');
    const userNameDisplay = document.getElementById('user-name');
    const logoutBtn = document.getElementById('logout-btn');
    
    // Önceden tanımlanmış kullanıcı bilgileri (şifre -> kullanıcı adı)
    const credentials = {
        'test123': 'Ahmet'
        // Daha fazla kullanıcı eklemek isterseniz buraya ekleyebilirsiniz
    };
    
    // Şifre görünürlüğünü değiştirme
    togglePassword.addEventListener('click', function() {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            togglePassword.classList.remove('fa-eye');
            togglePassword.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            togglePassword.classList.remove('fa-eye-slash');
            togglePassword.classList.add('fa-eye');
        }
    });
    
    // Giriş fonksiyonu
    function attemptLogin() {
        const password = passwordInput.value.trim();
        
        // Önceki hata mesajını temizle
        errorMessage.textContent = '';
        
        if (!password) {
            errorMessage.textContent = 'Lütfen şifrenizi giriniz';
            shakeElement(document.querySelector('.login-container'));
            return;
        }
        
        // Yükleniyor durumu simülasyonu
        loginBtn.textContent = 'Giriş yapılıyor...';
        loginBtn.disabled = true;
        
        setTimeout(() => {
            const username = credentials[password];
            
            if (username) {
                // Başarılı giriş
                loginSuccess(username);
            } else {
                // Başarısız giriş
                loginFailed();
            }
            
            // Buton resetleme
            loginBtn.textContent = 'Giriş Yap';
            loginBtn.disabled = false;
        }, 1000);
    }
    
    // Başarılı giriş işlemi
    function loginSuccess(username) {
        // Kullanıcı adını göster
        userNameDisplay.textContent = username;
        
        // Login sayfasını gizle, ana sayfayı göster
        loginPage.classList.add('hidden');
        mainPage.classList.remove('hidden');
        
        // Hoş geldin animasyonu
        mainPage.classList.add('fade-in');
        
        // Şifre alanını temizle
        passwordInput.value = '';
        
        // Sayfa başlığını güncelle
        document.title = `YKS Başarı Akademisi - ${username}`;
        
        // Kullanıcı bilgisini session storage'a kaydet (sayfayı yenilediğinde hatırlamak için)
        sessionStorage.setItem('activeUser', username);
        
        // YKS geri sayım zamanlayıcısını başlat
        startCountdown();
        
        // İstatistikleri animasyonla göster
        animateStats();
        
        // Deneme verilerini yükle
        loadRecentExams();
    }
    
    // Başarısız giriş işlemi
    function loginFailed() {
        errorMessage.textContent = 'Geçersiz şifre. Lütfen tekrar deneyin.';
        shakeElement(document.querySelector('.login-container'));
    }
    
    // Elemana sallama animasyonu ekle
    function shakeElement(element) {
        element.classList.add('shake');
        setTimeout(() => {
            element.classList.remove('shake');
        }, 500);
    }
    
    // Çıkış işlemi
    logoutBtn.addEventListener('click', function() {
        // Ana sayfayı gizle, login sayfasını göster
        mainPage.classList.add('hidden');
        loginPage.classList.remove('hidden');
        
        // Session storage'ı temizle
        sessionStorage.removeItem('activeUser');
        
        // Sayfa başlığını resetle
        document.title = 'YKS Başarı Akademisi - Giriş';
    });
    
    // Geri sayım zamanlayıcı
    function startCountdown() {
        // Bu değerleri YKS sınav tarihine göre ayarlayabilirsiniz
        const examDate = new Date("2026-06-20T10:00:00");
        
        function updateTimer() {
            const now = new Date();
            const diff = examDate - now;
            
            if (diff <= 0) {
                document.getElementById('days').textContent = "0";
                document.getElementById('hours').textContent = "0";
                document.getElementById('minutes').textContent = "0";
                return;
            }
            
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            
            document.getElementById('days').textContent = days.toString().padStart(2, '0');
            document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
            document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
        }
        
        updateTimer();
        setInterval(updateTimer, 60000); // Her dakika güncelle
    }
    
    // İstatistiklere animasyon ekle
    function animateStats() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        statNumbers.forEach(statEl => {
            const finalValue = statEl.textContent;
            let startValue = 0;
            
            // Sayı mı yoksa yüzde mi kontrol et
            const isPercentage = finalValue.includes('%');
            const numericValue = parseFloat(finalValue.replace(/[^0-9.-]+/g, ""));
            
            const duration = 1500; // 1.5 saniye
            const interval = 20; // 20ms
            const steps = duration / interval;
            const increment = numericValue / steps;
            
            const counter = setInterval(() => {
                startValue += increment;
                
                if (startValue >= numericValue) {
                    statEl.textContent = finalValue; // Orijinal değeri geri yükle
                    clearInterval(counter);
                } else {
                    if (isPercentage) {
                        statEl.textContent = Math.floor(startValue) + '%';
                    } else if (finalValue.includes('+')) {
                        statEl.textContent = Math.floor(startValue) + '+';
                    } else if (finalValue.includes('.')) {
                        statEl.textContent = startValue.toFixed(2);
                    } else {
                        statEl.textContent = Math.floor(startValue);
                    }
                }
            }, interval);
        });
    }
    
    // Event listeners
    loginBtn.addEventListener('click', attemptLogin);
    
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            attemptLogin();
        }
    });
    
    // Sayfa yüklendiğinde session storage kontrolü
    const savedUser = sessionStorage.getItem('activeUser');
    if (savedUser) {
        // Kullanıcı zaten giriş yapmış
        loginSuccess(savedUser);
    }
    
    // Aktif günü vurgula
    highlightCurrentDay();
    
    function highlightCurrentDay() {
        const days = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
        const today = new Date().getDay();
        
        const dayColumns = document.querySelectorAll('.day-column');
        const todayName = days[today];
        
        // Hafta içi günlerini gösterdiğimiz için Pazar ve Cumartesi günleri için özel durum
        if (today !== 0 && today !== 6) {
            dayColumns.forEach(column => {
                const dayHeader = column.querySelector('.day-header').textContent;
                if (dayHeader === todayName) {
                    column.classList.add('active-day');
                } else {
                    column.classList.remove('active-day');
                }
            });
        }
    }
    
    // Deneme verilerini yükle ve göster
    function loadRecentExams() {
        const exams = JSON.parse(localStorage.getItem('exams')) || [];
        const recentExamsList = document.getElementById('recent-exams-list');
        const totalExamsStat = document.getElementById('total-exams-stat');
        
        // İstatistikleri güncelle
        if (totalExamsStat) {
            totalExamsStat.textContent = exams.length;
        }
        
        if (exams.length === 0) {
            // Eğer deneme yoksa varsayılan mesajı göster
            return;
        }
        
        // Son 3 denemesi al (tarih sırasına göre)
        const recentExams = exams
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3);
        
        // Deneme listesini oluştur
        const examRows = recentExams.map(exam => {
            const totalScore = calculateTotalScore(exam);
            const formattedDate = new Date(exam.date).toLocaleDateString('tr-TR');
            const examTypeText = getExamTypeText(exam.type);
            
            return `
                <div class="exam-table-row">
                    <div class="exam-name">${exam.name}</div>
                    <div class="exam-date">${formattedDate}</div>
                    <div class="exam-score">${totalScore.toFixed(1)}</div>
                    <div class="exam-rank">-</div>
                    <div class="exam-action"><a href="denemeler.html">İncele</a></div>
                </div>
            `;
        }).join('');
        
        recentExamsList.innerHTML = examRows;
    }
    
    // Toplam net hesaplama
    function calculateTotalScore(exam) {
        let total = 0;
        
        if (exam.scores.tyt) {
            total += exam.scores.tyt.turkce + exam.scores.tyt.matematik + 
                    exam.scores.tyt.fen + exam.scores.tyt.sosyal;
        }
        
        if (exam.scores.ayt) {
            Object.values(exam.scores.ayt).forEach(score => total += score);
        }
        
        if (exam.scores.ydt) {
            total += exam.scores.ydt.yabanciDil;
        }
        
        return total;
    }
    
    // Sınav türü metni
    function getExamTypeText(type) {
        const types = {
            'tyt': 'TYT',
            'ayt-sayisal': 'AYT Sayısal',
            'ayt-sozel': 'AYT Sözel',
            'ayt-esit-agirlik': 'AYT Eşit Ağırlık',
            'ydt': 'YDT'
        };
        return types[type] || type;
    }
    
    // Sayfa yüklendiğinde verileri güncelle
    window.addEventListener('storage', function(e) {
        if (e.key === 'exams') {
            loadRecentExams();
        }
    });
});

// Sayfa yüklendiğinde deneme verilerini kontrol et
document.addEventListener('DOMContentLoaded', function() {
    // Eğer kullanıcı giriş yapmışsa deneme verilerini yükle
    setTimeout(() => {
        const activeUser = sessionStorage.getItem('activeUser');
        if (activeUser) {
            loadRecentExams();
        }
    }, 1000);
    
    function loadRecentExams() {
        const exams = JSON.parse(localStorage.getItem('exams')) || [];
        const recentExamsList = document.getElementById('recent-exams-list');
        const totalExamsStat = document.getElementById('total-exams-stat');
        
        // İstatistikleri güncelle
        if (totalExamsStat) {
            totalExamsStat.textContent = exams.length;
        }
        
        if (exams.length === 0 || !recentExamsList) {
            return;
        }
        
        // Son 3 denemesi al
        const recentExams = exams
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3);
        
        // Deneme listesini oluştur
        const examRows = recentExams.map(exam => {
            const totalScore = calculateExamTotalScore(exam);
            const formattedDate = new Date(exam.date).toLocaleDateString('tr-TR');
            const examTypeText = getExamTypeDisplayText(exam.type);
            
            return `
                <div class="exam-table-row">
                    <div class="exam-name">
                        ${exam.name}
                        <span class="exam-type-badge" style="
                            background: var(--primary-light); 
                            color: var(--primary-color); 
                            padding: 2px 8px; 
                            border-radius: 12px; 
                            font-size: 11px; 
                            font-weight: 500; 
                            margin-left: 8px;
                        ">${examTypeText}</span>
                    </div>
                    <div class="exam-date">${formattedDate}</div>
                    <div class="exam-score">${totalScore.toFixed(1)}</div>
                    <div class="exam-rank">-</div>
                    <div class="exam-action"><a href="denemeler.html">İncele</a></div>
                </div>
            `;
        }).join('');
        
        recentExamsList.innerHTML = examRows;
    }
    
    function calculateExamTotalScore(exam) {
        let total = 0;
        
        if (exam.scores.tyt) {
            total += exam.scores.tyt.turkce + exam.scores.tyt.matematik + 
                    exam.scores.tyt.fen + exam.scores.tyt.sosyal;
        }
        
        if (exam.scores.ayt) {
            Object.values(exam.scores.ayt).forEach(score => total += score);
        }
        
        if (exam.scores.ydt) {
            total += exam.scores.ydt.yabanciDil;
        }
        
        return total;
    }
    
    function getExamTypeDisplayText(type) {
        const types = {
            'tyt': 'TYT',
            'ayt-sayisal': 'AYT Sayısal',
            'ayt-sozel': 'AYT Sözel',
            'ayt-esit-agirlik': 'AYT Eşit Ağırlık',
            'ydt': 'YDT'
        };
        return types[type] || type;
    }
    
    // Mobile Download Functionality
    const mobileDownloadBtn = document.getElementById('mobile-download-btn');
    if (mobileDownloadBtn) {
        mobileDownloadBtn.addEventListener('click', handleMobileDownload);
    }
    
    // PWA Install Prompt Handler
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        window.deferredPrompt = e;
        
        // Show download button with pulse animation
        if (mobileDownloadBtn) {
            mobileDownloadBtn.style.display = 'flex';
            mobileDownloadBtn.classList.add('pulse-available');
        }
    });
    
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
        modal.style.zIndex = '10000';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px; margin: 50px auto;">
                <div class="modal-header">
                    <h2><i class="fas fa-mobile-alt"></i> Mobil Uygulama Kurulumu</h2>
                    <button class="close-modal" style="background: none; border: none; font-size: 24px; cursor: pointer; position: absolute; top: 15px; right: 20px;">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="install-instructions">
                        <div class="platform-section" style="margin-bottom: 24px; padding: 16px; background: #f8f9fa; border-radius: 8px;">
                            <h3 style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;"><i class="fab fa-android"></i> Android</h3>
                            <ol style="padding-left: 20px; line-height: 1.6;">
                                <li>Chrome'da bu sayfayı açın</li>
                                <li>Menü (⋮) butonuna tıklayın</li>
                                <li>"Ana ekrana ekle" seçeneğini seçin</li>
                                <li>"Ekle" butonuna tıklayın</li>
                            </ol>
                        </div>
                        <div class="platform-section" style="margin-bottom: 24px; padding: 16px; background: #f8f9fa; border-radius: 8px;">
                            <h3 style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;"><i class="fab fa-apple"></i> iOS</h3>
                            <ol style="padding-left: 20px; line-height: 1.6;">
                                <li>Safari'de bu sayfayı açın</li>
                                <li>Paylaş (⤴) butonuna tıklayın</li>
                                <li>"Ana Ekrana Ekle" seçeneğini seçin</li>
                                <li>"Ekle" butonuna tıklayın</li>
                            </ol>
                        </div>
                    </div>
                    <div class="install-benefits" style="background: linear-gradient(135deg, rgba(67, 97, 238, 0.1), rgba(67, 97, 238, 0.05)); padding: 16px; border-radius: 8px; border-left: 4px solid #4361ee;">
                        <h4 style="margin-bottom: 12px; color: #4361ee;">Avantajlar:</h4>
                        <ul style="list-style: none; padding: 0;">
                            <li style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;"><i class="fas fa-check" style="color: #28a745;"></i> Offline çalışma</li>
                            <li style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;"><i class="fas fa-check" style="color: #28a745;"></i> Hızlı erişim</li>
                            <li style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;"><i class="fas fa-check" style="color: #28a745;"></i> Push bildirimleri</li>
                            <li style="display: flex; align-items: center; gap: 8px;"><i class="fas fa-check" style="color: #28a745;"></i> Ana ekranda kısayol</li>
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
    
    function showNotification(message, type = 'info') {
        // Basit notification gösterimi
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            border-left: 4px solid #4361ee;
            z-index: 10001;
            max-width: 300px;
            animation: slideIn 0.3s ease;
        `;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-check-circle" style="color: #28a745;"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
});
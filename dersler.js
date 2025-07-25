document.addEventListener('DOMContentLoaded', function() {
    // Sayfa açılışında fade-in animasyonu
    var mainPage = document.querySelector('.main-page');
    if (mainPage) {
        mainPage.classList.add('fade-in');
    }
    // Kullanıcı adını üst barda göster ve çıkış butonunu ayarla (tek tanım)
    (function() {
        var userNameDisplay = document.getElementById('user-name');
        var savedUser = sessionStorage.getItem('activeUser');
        if (savedUser && userNameDisplay) {
            userNameDisplay.textContent = savedUser;
        } else {
            window.location.href = 'index.html';
        }
        var logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                sessionStorage.removeItem('activeUser');
                window.location.href = 'index.html';
            });
        }
    })();
    // Kategori sekmeleri için
    const categoryTabs = document.querySelectorAll('.category-tab');
    const categoryContents = document.querySelectorAll('.category-content');
    
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const category = tab.getAttribute('data-category');
            
            // Aktif sekmeyi güncelle
            categoryTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Aktif içeriği güncelle
            categoryContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === category + '-content') {
                    content.classList.add('active');
                }
            });
        });
    });
    
    // Öne çıkan dersin video oynatma butonu
    const playButton = document.querySelector('.play-button');
    if (playButton) {
        playButton.addEventListener('click', function() {
            alert('Video oynatılıyor...');
            // Burada gerçek bir video oynatıcı entegrasyonu yapılabilir
        });
    }
    
    // Akordeon için
    const accordionItems = document.querySelectorAll('.accordion-item');
    
    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        
        header.addEventListener('click', () => {
            // Önce diğer tüm açık öğeleri kapat
            accordionItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Bu öğenin durumunu değiştir
            item.classList.toggle('active');
        });
    });
    
    // İlk akordeon öğesini varsayılan olarak aç
    if (accordionItems.length > 0) {
        accordionItems[0].classList.add('active');
    }
    
    // Mobile Download Functionality
    const mobileDownloadBtn = document.getElementById('mobile-download-btn');
    if (mobileDownloadBtn) {
        mobileDownloadBtn.addEventListener('click', function() {
            // Planlar.js'teki mobile download fonksiyonunu kullan
            if (typeof handleMobileDownload === 'function') {
                handleMobileDownload();
            } else {
                // Basit fallback
                alert('Mobil uygulama özelliği aktif edilecek...');
            }
        });
    }
});
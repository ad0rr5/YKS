// Denemeler Sayfası JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // DOM elementleri
    const addExamBtn = document.getElementById('add-exam-btn');
    const viewAnalysisBtn = document.getElementById('view-analysis-btn');
    const exportDataBtn = document.getElementById('export-data-btn');
    const examModal = document.getElementById('exam-modal');
    const examDetailModal = document.getElementById('exam-detail-modal');
    const analysisModal = document.getElementById('analysis-modal');
    const examForm = document.getElementById('exam-form');
    const examTypeSelect = document.getElementById('exam-type');
    const examList = document.getElementById('exam-list');
    
    // Filter elementleri
    const examTypeFilter = document.getElementById('exam-type-filter');
    const dateFilter = document.getElementById('date-filter');
    const sortFilter = document.getElementById('sort-filter');
    
    // İstatistik elementleri
    const totalExamsEl = document.getElementById('total-exams');
    const averageScoreEl = document.getElementById('average-score');
    const bestScoreEl = document.getElementById('best-score');
    const progressTrendEl = document.getElementById('progress-trend');
    
    // Veri deposu
    let exams = JSON.parse(localStorage.getItem('exams')) || [];
    
    // Sayfa yüklendiğinde
    init();
    
    function init() {
        // Kullanıcı oturum kontrolü ve kullanıcı adını göster
        const savedUser = sessionStorage.getItem('activeUser');
        const userNameDisplay = document.getElementById('user-name');
        
        if (savedUser && userNameDisplay) {
            userNameDisplay.textContent = savedUser;
        } else {
            window.location.href = 'index.html';
            return;
        }
        
        // Çıkış butonu işlevi
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                sessionStorage.removeItem('activeUser');
                window.location.href = 'index.html';
            });
        }
        
        loadExams();
        updateStats();
        setupEventListeners();
        
        // Bugünün tarihini varsayılan olarak ayarla
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('exam-date').value = today;
    }
    
    function setupEventListeners() {
        // Modal açma/kapama
        addExamBtn.addEventListener('click', () => openExamModal());
        viewAnalysisBtn.addEventListener('click', () => openAnalysisModal());
        exportDataBtn.addEventListener('click', exportExamData);
        
        // Modal kapatma
        document.querySelectorAll('.close-modal').forEach(closeBtn => {
            closeBtn.addEventListener('click', closeModals);
        });
        
        // Modal dışına tıklayınca kapatma
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                closeModals();
            }
        });
        
        // Form gönderimi
        examForm.addEventListener('submit', handleExamSubmit);
        
        // Sınav türü değişikliği
        examTypeSelect.addEventListener('change', handleExamTypeChange);
        
        // Filtre değişiklikleri
        examTypeFilter.addEventListener('change', filterExams);
        dateFilter.addEventListener('change', filterExams);
        sortFilter.addEventListener('change', filterExams);
        
        // İptal butonları
        document.getElementById('cancel-exam-btn').addEventListener('click', closeModals);
    }
    
    function openExamModal(exam = null) {
        const modalTitle = document.getElementById('exam-modal-title');
        const saveBtn = document.getElementById('save-exam-btn');
        
        if (exam) {
            modalTitle.textContent = 'Deneme Sınavını Düzenle';
            saveBtn.textContent = 'Güncelle';
            populateExamForm(exam);
        } else {
            modalTitle.textContent = 'Yeni Deneme Sınavı Ekle';
            saveBtn.textContent = 'Kaydet';
            examForm.reset();
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('exam-date').value = today;
        }
        
        examModal.style.display = 'block';
        setTimeout(() => examModal.classList.add('fade-in'), 50);
    }
    
    function openAnalysisModal() {
        if (exams.length === 0) {
            alert('Analiz için en az bir deneme sınavı gereklidir.');
            return;
        }
        
        analysisModal.style.display = 'block';
        setTimeout(() => {
            analysisModal.classList.add('fade-in');
            renderProgressChart();
            renderSubjectAnalysis();
        }, 50);
    }
    
    function closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
            modal.classList.remove('fade-in');
        });
    }
    
    function handleExamTypeChange() {
        const examType = examTypeSelect.value;
        
        // Tüm bölümleri gizle
        document.querySelectorAll('.subject-section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Seçilen türe göre bölümleri göster
        if (examType === 'tyt') {
            document.getElementById('tyt-section').style.display = 'block';
        } else if (examType === 'ayt-sayisal') {
            document.getElementById('tyt-section').style.display = 'block';
            document.getElementById('ayt-sayisal-section').style.display = 'block';
        } else if (examType === 'ayt-sozel') {
            document.getElementById('tyt-section').style.display = 'block';
            document.getElementById('ayt-sozel-section').style.display = 'block';
        } else if (examType === 'ayt-esit-agirlik') {
            document.getElementById('tyt-section').style.display = 'block';
            document.getElementById('ayt-esit-agirlik-section').style.display = 'block';
        } else if (examType === 'ydt') {
            document.getElementById('ydt-section').style.display = 'block';
        }
    }
    
    function handleExamSubmit(e) {
        e.preventDefault();
        
        const examData = {
            id: Date.now(),
            name: document.getElementById('exam-name').value,
            type: document.getElementById('exam-type').value,
            date: document.getElementById('exam-date').value,
            source: document.getElementById('exam-source').value,
            notes: document.getElementById('exam-notes').value,
            scores: getScoresFromForm(),
            createdAt: new Date().toISOString()
        };
        
        // Doğrulama
        if (!examData.name || !examData.type || !examData.date) {
            alert('Lütfen gerekli alanları doldurun.');
            return;
        }
        
        // Sınav ekle
        exams.push(examData);
        saveExams();
        loadExams();
        updateStats();
        closeModals();
        
        // Başarı mesajı
        showNotification('Deneme sınavı başarıyla eklendi!', 'success');
    }
    
    function getScoresFromForm() {
        const scores = {};
        const examType = document.getElementById('exam-type').value;
        
        if (examType.includes('tyt') || examType.startsWith('ayt')) {
            scores.tyt = {
                turkce: parseFloat(document.getElementById('tyt-turkce').value) || 0,
                matematik: parseFloat(document.getElementById('tyt-matematik').value) || 0,
                fen: parseFloat(document.getElementById('tyt-fen').value) || 0,
                sosyal: parseFloat(document.getElementById('tyt-sosyal').value) || 0
            };
        }
        
        if (examType === 'ayt-sayisal') {
            scores.ayt = {
                matematik: parseFloat(document.getElementById('ayt-matematik').value) || 0,
                fizik: parseFloat(document.getElementById('ayt-fizik').value) || 0,
                kimya: parseFloat(document.getElementById('ayt-kimya').value) || 0,
                biyoloji: parseFloat(document.getElementById('ayt-biyoloji').value) || 0
            };
        } else if (examType === 'ayt-sozel') {
            scores.ayt = {
                edebiyat: parseFloat(document.getElementById('ayt-edebiyat').value) || 0,
                tarih1: parseFloat(document.getElementById('ayt-tarih1').value) || 0,
                cografya1: parseFloat(document.getElementById('ayt-cografya1').value) || 0,
                tarih2: parseFloat(document.getElementById('ayt-tarih2').value) || 0,
                cografya2: parseFloat(document.getElementById('ayt-cografya2').value) || 0,
                felsefe: parseFloat(document.getElementById('ayt-felsefe').value) || 0,
                din: parseFloat(document.getElementById('ayt-din').value) || 0
            };
        } else if (examType === 'ayt-esit-agirlik') {
            scores.ayt = {
                matematik: parseFloat(document.getElementById('ayt-matematik-ea').value) || 0,
                edebiyat: parseFloat(document.getElementById('ayt-edebiyat-ea').value) || 0,
                tarih1: parseFloat(document.getElementById('ayt-tarih1-ea').value) || 0,
                cografya1: parseFloat(document.getElementById('ayt-cografya1-ea').value) || 0
            };
        }
        
        if (examType === 'ydt') {
            scores.ydt = {
                yabanciDil: parseFloat(document.getElementById('ydt-yabanci-dil').value) || 0
            };
        }
        
        return scores;
    }
    
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
    
    function loadExams() {
        let filteredExams = [...exams];
        
        // Filtreleme
        const typeFilter = examTypeFilter.value;
        const dateFilterValue = dateFilter.value;
        const sortValue = sortFilter.value;
        
        if (typeFilter !== 'all') {
            filteredExams = filteredExams.filter(exam => exam.type === typeFilter);
        }
        
        if (dateFilterValue !== 'all') {
            const now = new Date();
            const filterDate = new Date();
            
            switch (dateFilterValue) {
                case 'last-week':
                    filterDate.setDate(now.getDate() - 7);
                    break;
                case 'last-month':
                    filterDate.setMonth(now.getMonth() - 1);
                    break;
                case 'last-3months':
                    filterDate.setMonth(now.getMonth() - 3);
                    break;
                case 'last-6months':
                    filterDate.setMonth(now.getMonth() - 6);
                    break;
            }
            
            filteredExams = filteredExams.filter(exam => new Date(exam.date) >= filterDate);
        }
        
        // Sıralama
        filteredExams.sort((a, b) => {
            switch (sortValue) {
                case 'date-desc':
                    return new Date(b.date) - new Date(a.date);
                case 'date-asc':
                    return new Date(a.date) - new Date(b.date);
                case 'score-desc':
                    return calculateTotalScore(b) - calculateTotalScore(a);
                case 'score-asc':
                    return calculateTotalScore(a) - calculateTotalScore(b);
                default:
                    return new Date(b.date) - new Date(a.date);
            }
        });
        
        renderExams(filteredExams);
    }
    
    function renderExams(examsToRender) {
        if (examsToRender.length === 0) {
            examList.innerHTML = `
                <div class="no-exams">
                    <i class="fas fa-clipboard-list"></i>
                    <h3>Deneme sınavı bulunamadı</h3>
                    <p>Seçilen filtrelere uygun deneme sınavı bulunamadı.</p>
                </div>
            `;
            return;
        }
        
        examList.innerHTML = examsToRender.map(exam => createExamCard(exam)).join('');
        
        // Event listener'ları ekle
        document.querySelectorAll('.view-exam-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const examId = parseInt(e.target.dataset.examId);
                const exam = exams.find(ex => ex.id === examId);
                if (exam) openExamDetailModal(exam);
            });
        });
        
        document.querySelectorAll('.edit-exam-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const examId = parseInt(e.target.dataset.examId);
                const exam = exams.find(ex => ex.id === examId);
                if (exam) openExamModal(exam);
            });
        });
        
        document.querySelectorAll('.delete-exam-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const examId = parseInt(e.target.dataset.examId);
                deleteExam(examId);
            });
        });
    }
    
    function createExamCard(exam) {
        const totalScore = calculateTotalScore(exam);
        const formattedDate = new Date(exam.date).toLocaleDateString('tr-TR');
        const examTypeText = getExamTypeText(exam.type);
        
        return `
            <div class="exam-card">
                <div class="exam-card-header">
                    <div class="exam-title">
                        <h3>${exam.name}</h3>
                        <div class="exam-meta">
                            <span class="exam-type">${examTypeText}</span>
                            <span><i class="fas fa-calendar"></i> ${formattedDate}</span>
                            ${exam.source ? `<span><i class="fas fa-book"></i> ${exam.source}</span>` : ''}
                        </div>
                    </div>
                    <div class="exam-actions">
                        <button class="btn-sm btn-secondary view-exam-btn" data-exam-id="${exam.id}">
                            <i class="fas fa-eye"></i> Detay
                        </button>
                        <button class="btn-sm btn-secondary edit-exam-btn" data-exam-id="${exam.id}">
                            <i class="fas fa-edit"></i> Düzenle
                        </button>
                        <button class="btn-sm btn-danger delete-exam-btn" data-exam-id="${exam.id}">
                            <i class="fas fa-trash"></i> Sil
                        </button>
                    </div>
                </div>
                <div class="exam-scores">
                    ${createScoreItems(exam)}
                    <div class="score-item total-score">
                        <div class="score-value">${totalScore.toFixed(2)}</div>
                        <div class="score-label">Toplam Net</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    function createScoreItems(exam) {
        let scoreItems = '';
        
        if (exam.scores.tyt) {
            scoreItems += `
                <div class="score-item">
                    <div class="score-value">${exam.scores.tyt.turkce}</div>
                    <div class="score-label">Türkçe</div>
                </div>
                <div class="score-item">
                    <div class="score-value">${exam.scores.tyt.matematik}</div>
                    <div class="score-label">Matematik</div>
                </div>
                <div class="score-item">
                    <div class="score-value">${exam.scores.tyt.fen}</div>
                    <div class="score-label">Fen</div>
                </div>
                <div class="score-item">
                    <div class="score-value">${exam.scores.tyt.sosyal}</div>
                    <div class="score-label">Sosyal</div>
                </div>
            `;
        }
        
        if (exam.scores.ayt) {
            Object.entries(exam.scores.ayt).forEach(([subject, score]) => {
                const subjectName = getSubjectDisplayName(subject);
                scoreItems += `
                    <div class="score-item">
                        <div class="score-value">${score}</div>
                        <div class="score-label">${subjectName}</div>
                    </div>
                `;
            });
        }
        
        if (exam.scores.ydt) {
            scoreItems += `
                <div class="score-item">
                    <div class="score-value">${exam.scores.ydt.yabanciDil}</div>
                    <div class="score-label">Yabancı Dil</div>
                </div>
            `;
        }
        
        return scoreItems;
    }
    
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
    
    function getSubjectDisplayName(subject) {
        const names = {
            'matematik': 'Matematik',
            'fizik': 'Fizik',
            'kimya': 'Kimya',
            'biyoloji': 'Biyoloji',
            'edebiyat': 'Edebiyat',
            'tarih1': 'Tarih-1',
            'cografya1': 'Coğrafya-1',
            'tarih2': 'Tarih-2',
            'cografya2': 'Coğrafya-2',
            'felsefe': 'Felsefe',
            'din': 'Din Kültürü'
        };
        return names[subject] || subject;
    }
    
    function deleteExam(examId) {
        if (confirm('Bu deneme sınavını silmek istediğinizden emin misiniz?')) {
            exams = exams.filter(exam => exam.id !== examId);
            saveExams();
            loadExams();
            updateStats();
            showNotification('Deneme sınavı silindi.', 'success');
        }
    }
    
    function updateStats() {
        const totalExams = exams.length;
        totalExamsEl.textContent = totalExams;
        
        if (totalExams === 0) {
            averageScoreEl.textContent = '0';
            bestScoreEl.textContent = '0';
            progressTrendEl.textContent = '-';
            return;
        }
        
        // Ortalama hesapla
        const totalScores = exams.map(exam => calculateTotalScore(exam));
        const average = totalScores.reduce((sum, score) => sum + score, 0) / totalScores.length;
        averageScoreEl.textContent = average.toFixed(1);
        
        // En yüksek skor
        const bestScore = Math.max(...totalScores);
        bestScoreEl.textContent = bestScore.toFixed(1);
        
        // İlerleme trendi
        if (totalExams >= 2) {
            const recentExams = exams.slice(-3).map(exam => calculateTotalScore(exam));
            const oldExams = exams.slice(0, -3).map(exam => calculateTotalScore(exam));
            
            if (oldExams.length > 0) {
                const recentAvg = recentExams.reduce((sum, score) => sum + score, 0) / recentExams.length;
                const oldAvg = oldExams.reduce((sum, score) => sum + score, 0) / oldExams.length;
                const trend = recentAvg - oldAvg;
                
                if (trend > 0) {
                    progressTrendEl.innerHTML = `<span style="color: var(--success-color);">↗ +${trend.toFixed(1)}</span>`;
                } else if (trend < 0) {
                    progressTrendEl.innerHTML = `<span style="color: var(--error-color);">↘ ${trend.toFixed(1)}</span>`;
                } else {
                    progressTrendEl.innerHTML = `<span style="color: var(--text-medium);">→ Sabit</span>`;
                }
            }
        }
    }
    
    function filterExams() {
        loadExams();
    }
    
    function renderProgressChart() {
        const ctx = document.getElementById('progress-chart').getContext('2d');
        
        // Son 10 sınavı al
        const recentExams = exams.slice(-10);
        const labels = recentExams.map(exam => new Date(exam.date).toLocaleDateString('tr-TR'));
        const data = recentExams.map(exam => calculateTotalScore(exam));
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Toplam Net',
                    data: data,
                    borderColor: 'rgb(67, 97, 238)',
                    backgroundColor: 'rgba(67, 97, 238, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    function renderSubjectAnalysis() {
        const subjectStatsEl = document.getElementById('subject-stats');
        const subjectAverages = calculateSubjectAverages();
        
        subjectStatsEl.innerHTML = Object.entries(subjectAverages)
            .map(([subject, avg]) => `
                <div class="subject-stat">
                    <h4>${getSubjectDisplayName(subject)}</h4>
                    <div class="avg-score">${avg.toFixed(1)}</div>
                    <small>Ortalama Net</small>
                </div>
            `).join('');
    }
    
    function calculateSubjectAverages() {
        const subjects = {};
        
        exams.forEach(exam => {
            if (exam.scores.tyt) {
                Object.entries(exam.scores.tyt).forEach(([subject, score]) => {
                    if (!subjects[subject]) subjects[subject] = [];
                    subjects[subject].push(score);
                });
            }
            
            if (exam.scores.ayt) {
                Object.entries(exam.scores.ayt).forEach(([subject, score]) => {
                    if (!subjects[subject]) subjects[subject] = [];
                    subjects[subject].push(score);
                });
            }
        });
        
        const averages = {};
        Object.entries(subjects).forEach(([subject, scores]) => {
            averages[subject] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        });
        
        return averages;
    }
    
    function exportExamData() {
        if (exams.length === 0) {
            alert('İndirilecek veri bulunmuyor.');
            return;
        }
        
        const csvContent = createCSVContent();
        downloadCSV(csvContent, 'deneme-sinavlarim.csv');
        showNotification('Veriler başarıyla indirildi!', 'success');
    }
    
    function createCSVContent() {
        const headers = ['Sınav Adı', 'Tür', 'Tarih', 'Kaynak', 'Toplam Net', 'Notlar'];
        const rows = exams.map(exam => [
            exam.name,
            getExamTypeText(exam.type),
            exam.date,
            exam.source || '',
            calculateTotalScore(exam).toFixed(2),
            exam.notes || ''
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\\n');
    }
    
    function downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
    
    function saveExams() {
        localStorage.setItem('exams', JSON.stringify(exams));
    }
    
    function showNotification(message, type = 'info') {
        // Basit bir bildirim sistemi
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? 'var(--success-color)' : 'var(--info-color)'};
            color: white;
            border-radius: 6px;
            box-shadow: var(--shadow-md);
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    // CSS animasyonu ekle
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    // Demo veri ekle (geliştirme amaçlı)
    if (exams.length === 0) {
        addDemoData();
    }
    
    function addDemoData() {
        const demoExams = [
            {
                id: 1,
                name: 'TYT Deneme 8',
                type: 'tyt',
                date: '2025-07-18',
                source: 'YKS Başarı Akademisi',
                notes: 'Matematik konularında daha çok çalışmam gerekiyor.',
                scores: {
                    tyt: {
                        turkce: 32.5,
                        matematik: 28.75,
                        fen: 17.25,
                        sosyal: 16.5
                    }
                },
                createdAt: '2025-07-18T10:00:00.000Z'
            },
            {
                id: 2,
                name: 'AYT Sayısal Deneme 5',
                type: 'ayt-sayisal',
                date: '2025-07-12',
                source: 'Online Platform',
                notes: 'Fizik elektrik konuları zor geldi.',
                scores: {
                    tyt: {
                        turkce: 30.25,
                        matematik: 31.5,
                        fen: 18.75,
                        sosyal: 17.25
                    },
                    ayt: {
                        matematik: 35.5,
                        fizik: 11.25,
                        kimya: 10.75,
                        biyoloji: 12.5
                    }
                },
                createdAt: '2025-07-12T10:00:00.000Z'
            }
        ];
        
        exams = demoExams;
        saveExams();
    }
});

// Sayfa yüklenme animasyonu
document.addEventListener('DOMContentLoaded', function() {
    const mainPage = document.querySelector('.main-page');
    
    setTimeout(() => {
        mainPage.style.opacity = '1';
        mainPage.classList.add('fade-in');
    }, 100);
    
    const cards = document.querySelectorAll('.stat-card, .exam-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('fade-in');
        }, 200 + (index * 100));
    });
});

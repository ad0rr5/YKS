// index.html için: Ders ilerleme kartlarını localStorage'dan alıp gösterir

document.addEventListener('DOMContentLoaded', function() {
    const progressCardsContainer = document.querySelector('.progress-cards');
    if (!progressCardsContainer) return;

    // Eski statik kartları temizle
    progressCardsContainer.innerHTML = '';

    // Ders verilerini localStorage'dan al
    let courses = [];
    try {
        courses = JSON.parse(localStorage.getItem('courses')) || [];
    } catch (e) {
        courses = [];
    }

    // --- İstatistik Barı ---
    // Soru sayısı, video dersi, başarı oranı, deneme sayısı hesapla
    let totalQuestions = 0;
    let totalVideos = 0;
    let totalTopics = 0;
    let completedTopics = 0;
    let totalProgress = 0;
    let totalExams = 24; // Varsayılan/değiştirilebilir

    courses.forEach(course => {
        (course.topics || []).forEach(topic => {
            // Soru sayısı
            if (topic.questionCount && !isNaN(Number(topic.questionCount))) {
                totalQuestions += Number(topic.questionCount);
            }
            // Video dersi
            if (Array.isArray(topic.videoLinks)) {
                totalVideos += topic.videoLinks.length;
            } else if (topic.video) {
                totalVideos += 1;
            }
            // Başarı oranı için tamamlanan konu
            if (topic.videoCompleted && topic.testCompleted) {
                completedTopics++;
            }
            totalTopics++;
        });
        totalProgress += course.progress || 0;
    });

    // Başarı oranı (tüm konuların tamamlanma yüzdesi)
    let successRate = 0;
    if (totalTopics > 0) {
        successRate = Math.round((completedTopics / totalTopics) * 100);
    }

    // Stat barındaki elementleri güncelle
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length >= 4) {
        statNumbers[0].textContent = totalQuestions > 0 ? totalQuestions.toLocaleString('tr-TR') + '+' : '0';
        statNumbers[1].textContent = totalVideos > 0 ? totalVideos + '+' : '0';
        statNumbers[2].textContent = successRate + '%';
        statNumbers[3].textContent = totalExams;
    }

    if (courses.length === 0) {
        progressCardsContainer.innerHTML = `<div class="empty-state"><i class="fas fa-chart-line"></i><p>Henüz ders eklenmemiş. İlerleme durumunuzu görmek için dersler ekleyin.</p></div>`;
        return;
    }

    // En yüksek ilerleme oranına sahip 4 dersi göster
    courses.sort((a, b) => b.progress - a.progress);
    courses.slice(0, 4).forEach(course => {
        const completedTopics = (course.topics || []).filter(t => t.videoCompleted && t.testCompleted).length;
        const totalTopics = (course.topics || []).length;
        const percent = course.progress || 0;
        const icon = course.icon || 'fa-book';
        const color = course.color || '#4361ee';
        const card = document.createElement('div');
        card.className = 'progress-card';
        card.innerHTML = `
            <div class="subject-icon" style="background-color: ${color}"><i class="fas ${icon}"></i></div>
            <h3>${course.name}</h3>
            <div class="progress-bar">
                <div class="progress" style="width: ${percent}%"></div>
            </div>
            <div class="progress-info">
                <span>${percent}% tamamlandı</span>
                <span>${completedTopics}/${totalTopics} konu</span>
            </div>
            <a href="dersler.html" class="continue-btn">Devam Et</a>
        `;
        progressCardsContainer.appendChild(card);
    });
});

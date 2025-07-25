// index.html için: Haftalık çalışma planını localStorage'dan alıp gösterir

document.addEventListener('DOMContentLoaded', function() {
    loadWeeklyStudyPlan();
});

function loadWeeklyStudyPlan() {
    const calendarContainer = document.querySelector('.calendar');
    if (!calendarContainer) return;

    // Eski statik içeriği temizle
    calendarContainer.innerHTML = '';

    // Planlarım sayfasından çalışma verilerini al
    let studySessions = [];
    try {
        studySessions = JSON.parse(localStorage.getItem('studySessions')) || [];
    } catch (e) {
        studySessions = [];
    }

    // Bu haftanın başlangıç tarihini hesapla
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const weekStart = new Date(today.setDate(diff));

    // Hafta içi günler (Pazartesi-Cuma)
    const weekdays = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];
    const todayIndex = new Date().getDay();
    
    // Ders renk kodları
    const subjectColors = {
        'mathematics': '#4361ee',
        'physics': '#f72585',
        'chemistry': '#4cc9f0',
        'biology': '#7209b7',
        'turkish': '#f77f00',
        'history': '#fcbf49',
        'geography': '#06d6a0',
        'philosophy': '#8338ec'
    };

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

    // Her gün için kolon oluştur
    weekdays.forEach((dayName, index) => {
        const dayDate = new Date(weekStart);
        dayDate.setDate(dayDate.getDate() + index);
        
        const dayColumn = document.createElement('div');
        dayColumn.className = 'day-column';
        
        // Bugünü vurgula
        if (index + 1 === todayIndex) {
            dayColumn.classList.add('active-day');
        }

        // Gün başlığı
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.textContent = dayName;

        // Bu günün çalışma oturumlarını getir
        const dateStr = dayDate.toISOString().split('T')[0];
        const daySessions = studySessions.filter(session => session.date === dateStr)
                                        .sort((a, b) => a.startTime.localeCompare(b.startTime));

        dayColumn.appendChild(dayHeader);

        if (daySessions.length === 0) {
            // Boş gün
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'schedule-item empty';
            emptyMessage.style.cssText = `
                text-align: center;
                color: #8d99ae;
                font-style: italic;
                padding: 20px 12px;
                font-size: 13px;
            `;
            emptyMessage.innerHTML = '<i class="fas fa-calendar-plus" style="display: block; margin-bottom: 8px; opacity: 0.5;"></i>Ders planlanmamış';
            dayColumn.appendChild(emptyMessage);
        } else {
            // Bu günün derslerini ekle
            daySessions.forEach(session => {
                const scheduleItem = document.createElement('div');
                scheduleItem.className = `schedule-item ${session.subject}`;
                
                // Ders durumuna göre stil
                let statusClass = '';
                let statusIcon = '';
                if (session.completed) {
                    statusClass = 'completed';
                    statusIcon = '<i class="fas fa-check-circle" style="color: #4caf50; margin-left: 5px;"></i>';
                } else if (session.inProgress) {
                    statusClass = 'in-progress';
                    statusIcon = '<i class="fas fa-play-circle" style="color: #ff9800; margin-left: 5px;"></i>';
                } else {
                    statusClass = 'pending';
                    statusIcon = '<i class="fas fa-clock" style="color: #8d99ae; margin-left: 5px;"></i>';
                }

                scheduleItem.classList.add(statusClass);

                // Özel renkler için CSS değişkeni ayarla
                const subjectColor = subjectColors[session.subject] || '#4361ee';
                scheduleItem.style.setProperty('--subject-color', subjectColor);

                scheduleItem.innerHTML = `
                    <span class="time">${session.startTime} (${session.duration}dk)</span>
                    <span class="subject">${subjectNames[session.subject] || session.subject}${statusIcon}</span>
                    <div class="topic" style="font-size: 12px; color: #8d99ae; margin-top: 2px;">${session.topic}</div>
                `;

                // Tıklama ile planlar sayfasına git
                scheduleItem.style.cursor = 'pointer';
                scheduleItem.addEventListener('click', () => {
                    window.location.href = 'plan.html';
                });

                dayColumn.appendChild(scheduleItem);
            });
        }

        calendarContainer.appendChild(dayColumn);
    });

    // Eğer hiç plan yoksa alternatif mesaj göster
    if (studySessions.length === 0) {
        calendarContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: white; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <i class="fas fa-calendar-plus" style="font-size: 48px; color: #8d99ae; margin-bottom: 20px; opacity: 0.5;"></i>
                <h3 style="color: #2b2d42; margin-bottom: 12px; font-size: 20px;">Henüz çalışma planı oluşturulmamış</h3>
                <p style="color: #8d99ae; margin-bottom: 24px;">Planlarım sayfasından haftalık çalışma programınızı oluşturun</p>
                <a href="plan.html" style="display: inline-block; padding: 12px 24px; background: #4361ee; color: white; border-radius: 10px; text-decoration: none; font-weight: 500; transition: all 0.3s ease;">
                    <i class="fas fa-plus" style="margin-right: 8px;"></i>Plan Oluştur
                </a>
            </div>
        `;
    }
}

// CSS stilleri ekle
const studyPlanStyles = document.createElement('style');
studyPlanStyles.textContent = `
    .schedule-item.completed {
        background: rgba(76, 175, 80, 0.1);
        border-left-color: #4caf50 !important;
    }
    
    .schedule-item.in-progress {
        background: rgba(255, 152, 0, 0.1);
        border-left-color: #ff9800 !important;
    }
    
    .schedule-item.pending {
        background: rgba(141, 153, 174, 0.05);
    }
    
    .schedule-item:hover {
        background: rgba(67, 97, 238, 0.1) !important;
        transform: translateX(2px);
    }
    
    .schedule-item::before {
        width: 4px;
        background: var(--subject-color, #4361ee);
    }
    
    .topic {
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .empty .fas {
        font-size: 16px;
    }
`;
document.head.appendChild(studyPlanStyles);

// Storage değişikliklerini dinle (planlar güncellendiğinde)
window.addEventListener('storage', function(e) {
    if (e.key === 'studySessions') {
        loadWeeklyStudyPlan();
    }
});

// Sayfa odaklandığında güncel verileri yükle
window.addEventListener('focus', function() {
    loadWeeklyStudyPlan();
});

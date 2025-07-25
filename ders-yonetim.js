document.addEventListener('DOMContentLoaded', function() {
    // DOM elementleri

    // Video linkleri ve render fonksiyonu global tanımlanıyor
    let videoLinks = [];
    function renderVideoLinks() {
        const videoLinksList = document.getElementById('video-links-list');
        if (!videoLinksList) return;
        videoLinksList.innerHTML = '';
        videoLinks.forEach((link, idx) => {
            const div = document.createElement('div');
            div.style.display = 'flex';
            div.style.alignItems = 'center';
            div.style.gap = '8px';
            div.innerHTML = `<a href="${link}" target="_blank">${link}</a> <button type="button" data-idx="${idx}" class="remove-video-link-btn btn-danger btn-xs">Kaldır</button>`;
            videoLinksList.appendChild(div);
        });
    }
    const addCourseBtn = document.getElementById('add-course-btn');
    const courseModal = document.getElementById('course-modal');
    const courseDetailModal = document.getElementById('course-detail-modal');
    const topicModal = document.getElementById('topic-modal');
    const topicDetailModal = document.getElementById('topic-detail-modal');
    const confirmModal = document.getElementById('confirm-modal');
    const courseForm = document.getElementById('course-form');
    const topicForm = document.getElementById('topic-form');
    const courseList = document.getElementById('course-list');
    const topicList = document.getElementById('topic-list');
    const courseSearchInput = document.getElementById('course-search');
    const courseFilterSelect = document.getElementById('course-filter');
    const courseSortSelect = document.getElementById('course-sort');
    const courseProgressCards = document.getElementById('course-progress-cards');

    // Modüller
    const CourseManager = {
        courses: [],
        currentCourseId: null,
        currentTopicId: null,

        init() {
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
            
            this.loadCourses();
            this.renderCourses();
            this.renderProgressCards();
            this.updateOverallProgress();
        },

        loadCourses() {
            const savedCourses = localStorage.getItem('courses');
            this.courses = savedCourses ? JSON.parse(savedCourses) : [];
        },

        saveCourses() {
            localStorage.setItem('courses', JSON.stringify(this.courses));
        },

        addCourse(course) {
            course.id = Date.now().toString();
            course.createdAt = new Date().toISOString();
            course.topics = [];
            course.progress = 0;
            this.courses.push(course);
            this.saveCourses();
            this.renderCourses();
            this.renderProgressCards();
            this.updateOverallProgress();
        },

        updateCourse(courseId, updatedCourse) {
            const index = this.courses.findIndex(c => c.id === courseId);
            if (index !== -1) {
                this.courses[index] = { ...this.courses[index], ...updatedCourse };
                this.saveCourses();
                this.renderCourses();
                this.renderProgressCards();
                this.updateOverallProgress();
            }
        },

        deleteCourse(courseId) {
            this.courses = this.courses.filter(c => c.id !== courseId);
            this.saveCourses();
            this.renderCourses();
            this.renderProgressCards();
            this.updateOverallProgress();
        },

        getCourse(courseId) {
            return this.courses.find(c => c.id === courseId);
        },

        addTopic(courseId, topic) {
            const course = this.getCourse(courseId);
            if (course) {
                topic.id = Date.now().toString();
                topic.createdAt = new Date().toISOString();
                topic.videoCompleted = false;
                topic.testCompleted = false;
                course.topics.push(topic);
                this.updateCourseProgress(courseId);
                this.saveCourses();
                return topic;
            }
            return null;
        },

        updateTopic(courseId, topicId, updatedTopic) {
            const course = this.getCourse(courseId);
            if (course) {
                const index = course.topics.findIndex(t => t.id === topicId);
                if (index !== -1) {
                    course.topics[index] = { ...course.topics[index], ...updatedTopic };
                    this.updateCourseProgress(courseId);
                    this.saveCourses();
                    return course.topics[index];
                }
            }
            return null;
        },

        deleteTopic(courseId, topicId) {
            const course = this.getCourse(courseId);
            if (course) {
                course.topics = course.topics.filter(t => t.id !== topicId);
                this.updateCourseProgress(courseId);
                this.saveCourses();
                return true;
            }
            return false;
        },

        getTopic(courseId, topicId) {
            const course = this.getCourse(courseId);
            if (course) {
                return course.topics.find(t => t.id === topicId);
            }
            return null;
        },

        updateTopicProgress(courseId, topicId, field, value) {
            const topic = this.getTopic(courseId, topicId);
            if (topic) {
                topic[field] = value;
                this.updateCourseProgress(courseId);
                this.saveCourses();
            }
        },

        updateCourseProgress(courseId) {
            const course = this.getCourse(courseId);
            if (course && course.topics.length > 0) {
                let completedCount = 0;
                let totalItems = course.topics.length * 2; // Her konu için video ve test

                course.topics.forEach(topic => {
                    if (topic.videoCompleted) completedCount++;
                    if (topic.testCompleted) completedCount++;
                });

                course.progress = Math.round((completedCount / totalItems) * 100);
            } else if (course) {
                course.progress = 0;
            }
            this.saveCourses();
            this.renderProgressCards();
            this.updateOverallProgress();
        },

        updateOverallProgress() {
            let totalProgress = 0;
            
            if (this.courses.length > 0) {
                this.courses.forEach(course => {
                    totalProgress += course.progress;
                });
                totalProgress = Math.round(totalProgress / this.courses.length);
            }
            
            const progressElement = document.querySelector('.progress-percentage');
            if (progressElement) {
                progressElement.textContent = `${totalProgress}%`;
                
                // Dairesel ilerleme çubuğunu güncelle
                const circularProgress = document.querySelector('.circular-progress');
                circularProgress.style.background = `conic-gradient(
                    var(--primary-color) ${totalProgress * 3.6}deg,
                    #f0f3ff ${totalProgress * 3.6}deg
                )`;
            }
        },

        renderCourses() {
            if (!courseList) return;
            
            courseList.innerHTML = '';
            
            // Filtreleme ve sıralama
            let filteredCourses = [...this.courses];
            
            // Kategori filtresi
            const categoryFilter = courseFilterSelect.value;
            if (categoryFilter !== 'all') {
                filteredCourses = filteredCourses.filter(c => c.category === categoryFilter);
            }
            
            // Arama filtresi
            const searchTerm = courseSearchInput.value.toLowerCase();
            if (searchTerm) {
                filteredCourses = filteredCourses.filter(c => 
                    c.name.toLowerCase().includes(searchTerm)
                );
            }
            
            // Sıralama
            const sortBy = courseSortSelect.value;
            if (sortBy === 'name') {
                filteredCourses.sort((a, b) => a.name.localeCompare(b.name));
            } else if (sortBy === 'progress') {
                filteredCourses.sort((a, b) => b.progress - a.progress);
            } else if (sortBy === 'recent') {
                filteredCourses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            }
            
            if (filteredCourses.length === 0) {
                courseList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-search"></i>
                        <p>Ders bulunamadı. Yeni bir ders ekleyebilir veya arama kriterlerinizi değiştirebilirsiniz.</p>
                    </div>
                `;
                return;
            }
            
            filteredCourses.forEach(course => {
                const courseCard = document.createElement('div');
                courseCard.className = 'course-card';
                courseCard.dataset.id = course.id;
                
                courseCard.innerHTML = `
                    <div class="course-icon" style="background-color: ${course.color}">
                        <i class="fas ${course.icon}"></i>
                    </div>
                    <div class="course-info">
                        <h3>${course.name}</h3>
                        <div class="course-meta">
                            <span class="course-category">${getCategoryName(course.category)}</span>
                            <span class="course-topics">${course.topics.length} Konu</span>
                        </div>
                        <div class="course-progress-bar">
                            <div class="progress-bar">
                                <div class="progress" style="width: ${course.progress}%; background-color: ${course.color}"></div>
                            </div>
                            <span class="progress-text">${course.progress}%</span>
                        </div>
                    </div>
                    <div class="course-actions">
                        <button class="view-course-btn" data-id="${course.id}" title="Detayları Görüntüle">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                `;
                
                courseList.appendChild(courseCard);
                
                // Ders detayı butonu için olay dinleyici
                courseCard.querySelector('.view-course-btn').addEventListener('click', () => {
                    UI.openCourseDetail(course.id);
                });
                
                // Ders kartına tıklama
                courseCard.addEventListener('click', function(e) {
                    if (!e.target.closest('.course-actions')) {
                        UI.openCourseDetail(course.id);
                    }
                });
            });
        },
        
        renderTopics(courseId) {
            if (!topicList) return;
            
            topicList.innerHTML = '';
            const course = this.getCourse(courseId);
            
            if (!course || course.topics.length === 0) {
                topicList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-book-open"></i>
                        <p>Bu derse henüz konu eklenmemiş. İlk konuyu eklemek için "Konu Ekle" butonunu kullanabilirsiniz.</p>
                    </div>
                `;
                return;
            }
            
            course.topics.forEach(topic => {
                const topicItem = document.createElement('div');
                topicItem.className = 'topic-item';
                if (topic.videoCompleted && topic.testCompleted) {
                    topicItem.classList.add('completed');
                } else if (topic.videoCompleted || topic.testCompleted) {
                    topicItem.classList.add('in-progress');
                }

                // Soru sayısı etiketi
                let questionCountHtml = '';
                if (topic.questionCount && topic.questionCount !== '') {
                    questionCountHtml = `<span class="question-count-label"><i class='fas fa-question-circle'></i> Çözülen Soru: ${topic.questionCount}</span>`;
                }

                topicItem.innerHTML = `
                    <div class="topic-info">
                        <h4>${topic.name}</h4>
                        <div class="topic-meta">
                            ${topic.video ? '<span><i class="fas fa-video"></i> Video</span>' : ''}
                            ${topic.resource ? '<span><i class="fas fa-file-alt"></i> Test/Kaynak</span>' : ''}
                            ${questionCountHtml}
                        </div>
                    </div>
                    <div class="topic-status">
                        ${getTopicStatusHTML(topic)}
                    </div>
                    <div class="topic-actions">
                        <button class="view-topic-btn" data-id="${topic.id}" title="Detayları Görüntüle">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                `;

                topicList.appendChild(topicItem);

                // Konu detayı butonu için olay dinleyici
                topicItem.querySelector('.view-topic-btn').addEventListener('click', () => {
                    UI.openTopicDetail(courseId, topic.id);
                });

                // Konu kartına tıklama
                topicItem.addEventListener('click', function(e) {
                    if (!e.target.closest('.topic-actions')) {
                        UI.openTopicDetail(courseId, topic.id);
                    }
                });
            });
        },
        
        renderProgressCards() {
            if (!courseProgressCards) return;
            
            courseProgressCards.innerHTML = '';
            
            if (this.courses.length === 0) {
                courseProgressCards.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-chart-line"></i>
                        <p>Henüz ders eklenmemiş. İlerleme durumunuzu görmek için dersler ekleyin.</p>
                    </div>
                `;
                return;
            }
            
            // En yüksek ilerleme oranına sahip 5 dersi gösterelim
            const sortedCourses = [...this.courses].sort((a, b) => b.progress - a.progress).slice(0, 5);
            
            sortedCourses.forEach(course => {
                const progressCard = document.createElement('div');
                progressCard.className = 'progress-card';
                
                progressCard.innerHTML = `
                    <div class="progress-card-header">
                        <div class="subject-icon" style="background-color: ${course.color}">
                            <i class="fas ${course.icon}"></i>
                        </div>
                        <h3>${course.name}</h3>
                    </div>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${course.progress}%; background-color: ${course.color}"></div>
                    </div>
                    <div class="progress-info">
                        <span>${course.progress}% tamamlandı</span>
                        <span>${getCompletedTopicsCount(course)}/${course.topics.length} konu</span>
                    </div>
                `;
                
                courseProgressCards.appendChild(progressCard);
            });
        }
    };

    const UI = {
        init() {
            this.setupEventListeners();
        },

        setupEventListeners() {
            // Modal kapama butonları
            document.querySelectorAll('.close-modal').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.closeAllModals();
                });
            });
            // Çoklu video linki ekleme
            const videoLinksList = document.getElementById('video-links-list');
            const newVideoLinkInput = document.getElementById('new-video-link');
            const addVideoLinkBtn = document.getElementById('add-video-link-btn');

            if (addVideoLinkBtn) {
                addVideoLinkBtn.addEventListener('click', function() {
                    const val = newVideoLinkInput.value.trim();
                    if (val) {
                        videoLinks.push(val);
                        newVideoLinkInput.value = '';
                        renderVideoLinks();
                    }
                });
            }
            if (videoLinksList) {
                videoLinksList.addEventListener('click', function(e) {
                    if (e.target.classList.contains('remove-video-link-btn')) {
                        const idx = parseInt(e.target.getAttribute('data-idx'));
                        videoLinks.splice(idx, 1);
                        renderVideoLinks();
                    }
                });
            }

            // Form açıldığında videoLinks'i sıfırla
            const topicModal = document.getElementById('topic-modal');
            if (topicModal) {
                topicModal.addEventListener('show', function() {
                    videoLinks = [];
                    renderVideoLinks();
                });
            }
            
            // Modals dışına tıklama ile kapatma
            window.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal')) {
                    this.closeAllModals();
                }
            });

            // Yeni ders ekleme butonu
            addCourseBtn.addEventListener('click', () => {
                this.openCourseModal();
            });

            // Arama, filtreleme ve sıralama olayları
            if (courseSearchInput) {
                courseSearchInput.addEventListener('input', () => {
                    CourseManager.renderCourses();
                });
            }

            if (courseFilterSelect) {
                courseFilterSelect.addEventListener('change', () => {
                    CourseManager.renderCourses();
                });
            }

            if (courseSortSelect) {
                courseSortSelect.addEventListener('change', () => {
                    CourseManager.renderCourses();
                });
            }
            
            // Ders formu gönderme
            courseForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveCourse();
            });
            
            // Konu formu gönderme
            topicForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveTopic();
            });
            
            // Ders formunda iptal butonu
            document.getElementById('cancel-course-btn').addEventListener('click', () => {
                this.closeAllModals();
            });
            
            // Konu formunda iptal butonu
            document.getElementById('cancel-topic-btn').addEventListener('click', () => {
                this.closeAllModals();
            });
            
            // İkon seçici
            document.querySelectorAll('.icon-option').forEach(option => {
                option.addEventListener('click', () => {
                    document.querySelectorAll('.icon-option').forEach(o => o.classList.remove('selected'));
                    option.classList.add('selected');
                    document.getElementById('selected-icon').value = option.dataset.icon;
                });
            });
            
            // Renk seçici
            document.querySelectorAll('.color-option').forEach(option => {
                option.addEventListener('click', () => {
                    document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
                    option.classList.add('selected');
                    document.getElementById('selected-color').value = option.dataset.color;
                });
            });
            
            // Kurs detay sayfasında konu ekleme butonu
            document.getElementById('add-topic-btn').addEventListener('click', () => {
                if (!CourseManager.currentCourseId) {
                    alert('Lütfen önce bir ders seçin.');
                    return;
                }
                this.openTopicModal(CourseManager.currentCourseId);
            });
            
            // Kurs detay sayfasında düzenleme butonu
            document.getElementById('edit-course-btn').addEventListener('click', () => {
                this.openCourseModal(CourseManager.currentCourseId);
            });
            
            // Konu detay sayfasında işaretleme kutuları
            document.getElementById('video-completed').addEventListener('change', (e) => {
                CourseManager.updateTopicProgress(
                    CourseManager.currentCourseId, 
                    CourseManager.currentTopicId, 
                    'videoCompleted', 
                    e.target.checked
                );
                this.updateTopicStatus();
            });
            
            document.getElementById('test-completed').addEventListener('change', (e) => {
                CourseManager.updateTopicProgress(
                    CourseManager.currentCourseId, 
                    CourseManager.currentTopicId, 
                    'testCompleted', 
                    e.target.checked
                );
                this.updateTopicStatus();
            });
            
            // Konu detay sayfasında düzenleme butonu
            document.getElementById('edit-topic-btn').addEventListener('click', () => {
                this.openTopicModal(CourseManager.currentCourseId, CourseManager.currentTopicId);
            });
            
            // Konu detay sayfasında silme butonu
            document.getElementById('delete-topic-btn').addEventListener('click', () => {
                this.confirmDeleteTopic(CourseManager.currentCourseId, CourseManager.currentTopicId);
            });
            
            // Onay modalında evet butonu
            document.getElementById('confirm-yes').addEventListener('click', () => {
                if (this.deleteType === 'topic') {
                    CourseManager.deleteTopic(this.deleteId.courseId, this.deleteId.topicId);
                    this.closeAllModals();
                    this.openCourseDetail(this.deleteId.courseId);
                } else if (this.deleteType === 'course') {
                    CourseManager.deleteCourse(this.deleteId);
                    this.closeAllModals();
                }
            });
            
            // Onay modalında hayır butonu
            document.getElementById('confirm-no').addEventListener('click', () => {
                this.closeModal(confirmModal);
            });
        },

        openCourseModal(courseId = null) {
            const modalTitle = document.getElementById('course-modal-title');
            const saveBtn = document.getElementById('save-course-btn');
            
            if (courseId) {
                // Düzenleme modu
                const course = CourseManager.getCourse(courseId);
                if (!course) return;
                
                modalTitle.textContent = 'Dersi Düzenle';
                saveBtn.textContent = 'Güncelle';
                
                document.getElementById('course-name').value = course.name;
                document.getElementById('course-category').value = course.category;
                
                // İkon seçimi
                document.querySelectorAll('.icon-option').forEach(option => {
                    option.classList.remove('selected');
                    if (option.dataset.icon === course.icon) {
                        option.classList.add('selected');
                    }
                });
                document.getElementById('selected-icon').value = course.icon;
                
                // Renk seçimi
                document.querySelectorAll('.color-option').forEach(option => {
                    option.classList.remove('selected');
                    if (option.dataset.color === course.color) {
                        option.classList.add('selected');
                    }
                });
                document.getElementById('selected-color').value = course.color;
                
                courseForm.dataset.id = courseId;
            } else {
                // Ekleme modu
                modalTitle.textContent = 'Yeni Ders Ekle';
                saveBtn.textContent = 'Kaydet';
                courseForm.reset();
                
                // Varsayılan seçimleri ayarla
                document.querySelectorAll('.icon-option').forEach(option => {
                    option.classList.remove('selected');
                    if (option.dataset.icon === 'fa-book') {
                        option.classList.add('selected');
                    }
                });
                document.getElementById('selected-icon').value = 'fa-book';
                
                document.querySelectorAll('.color-option').forEach(option => {
                    option.classList.remove('selected');
                    if (option.dataset.color === '#4361ee') {
                        option.classList.add('selected');
                    }
                });
                document.getElementById('selected-color').value = '#4361ee';
                
                delete courseForm.dataset.id;
            }
            
            this.openModal(courseModal);
        },

        saveCourse() {
            const name = document.getElementById('course-name').value.trim();
            const category = document.getElementById('course-category').value;
            const icon = document.getElementById('selected-icon').value;
            const color = document.getElementById('selected-color').value;
            
            if (!name) return;
            
            const courseData = {
                name,
                category,
                icon,
                color
            };
            
            const courseId = courseForm.dataset.id;
            if (courseId) {
                // Güncelleme
                CourseManager.updateCourse(courseId, courseData);
            } else {
                // Yeni ekleme
                CourseManager.addCourse(courseData);
            }
            
            this.closeAllModals();
        },

        openTopicModal(courseId, topicId = null) {
            const modalTitle = document.getElementById('topic-modal-title');
            const saveBtn = document.getElementById('save-topic-btn');
            
            if (topicId) {
                // Düzenleme modu
                const topic = CourseManager.getTopic(courseId, topicId);
                if (!topic) return;
                modalTitle.textContent = 'Konuyu Düzenle';
                saveBtn.textContent = 'Güncelle';
                document.getElementById('topic-name').value = topic.name;
                videoLinks = Array.isArray(topic.videoLinks) ? [...topic.videoLinks] : (topic.video ? [topic.video] : []);
                renderVideoLinks();
                document.getElementById('topic-resource').value = topic.resource || '';
                document.getElementById('topic-notes').value = topic.notes || '';
                document.getElementById('topic-question-count').value = topic.questionCount || '';
                // PDF yükleme alanı sıfırlanır (güvenlik gereği value atanamaz)
                topicForm.dataset.id = topicId;
            } else {
                // Ekleme modu
                modalTitle.textContent = 'Yeni Konu Ekle';
                saveBtn.textContent = 'Kaydet';
                topicForm.reset();
                videoLinks = [];
                renderVideoLinks();
                delete topicForm.dataset.id;
            }
            topicForm.dataset.courseId = courseId;
            // Modal açıldığında video link inputunu ve listeyi temizle
            if (typeof renderVideoLinks === 'function') renderVideoLinks();
            this.openModal(topicModal);
        },

        saveTopic() {
            const name = document.getElementById('topic-name').value.trim();
            const resource = document.getElementById('topic-resource').value.trim();
            const notes = document.getElementById('topic-notes').value.trim();
            const questionCount = document.getElementById('topic-question-count').value.trim();
            // PDF dosyası
            const pdfInput = document.getElementById('topic-pdf');
            let pdfUrl = '';
            if (pdfInput && pdfInput.files && pdfInput.files[0]) {
                // PDF dosyasını base64 olarak kaydet (küçük dosyalar için uygun, büyükler için önerilmez)
                const file = pdfInput.files[0];
                const reader = new FileReader();
                reader.onload = (e) => {
                    pdfUrl = e.target.result;
                    saveTopicFinal();
                };
                reader.readAsDataURL(file);
                return; // Asenkron, kaydetme işlemi reader.onload ile devam edecek
            }
            saveTopicFinal();

            function saveTopicFinal() {
                if (!name) return;
                const topicData = {
                    name,
                    videoLinks: [...videoLinks],
                    resource,
                    notes,
                    questionCount,
                    pdf: pdfUrl
                };
                const courseId = topicForm.dataset.courseId;
                const topicId = topicForm.dataset.id;
                if (topicId) {
                    // Güncelleme
                    CourseManager.updateTopic(courseId, topicId, topicData);
                    if (CourseManager.currentTopicId === topicId) {
                        UI.updateTopicDetailContent(courseId, topicId);
                    }
                } else {
                    // Yeni ekleme
                    CourseManager.addTopic(courseId, topicData);
                }
                CourseManager.renderTopics(courseId);
                UI.closeAllModals();
            }
        },

        openCourseDetail(courseId) {
            const course = CourseManager.getCourse(courseId);
            if (!course) return;
            
            // Başlıkları ve meta bilgileri güncelle
            document.getElementById('course-detail-title').textContent = "Ders Detayı";
            document.getElementById('detail-course-name').textContent = course.name;
            document.getElementById('detail-course-category').textContent = getCategoryName(course.category);
            document.getElementById('detail-topic-count').textContent = `${course.topics.length} Konu`;
            document.getElementById('detail-course-progress').textContent = `%${course.progress} Tamamlandı`;
            
            // Konu listesini oluştur
            CourseManager.currentCourseId = courseId;
            CourseManager.renderTopics(courseId);
            
            this.openModal(courseDetailModal);
        },

        openTopicDetail(courseId, topicId) {
            const topic = CourseManager.getTopic(courseId, topicId);
            const course = CourseManager.getCourse(courseId);
            
            if (!topic || !course) return;
            
            CourseManager.currentCourseId = courseId;
            CourseManager.currentTopicId = topicId;
            
            document.getElementById('topic-detail-title').textContent = topic.name;
            document.getElementById('detail-topic-name').textContent = topic.name;
            document.getElementById('detail-course-name-display').textContent = course.name;
            
            // İşaretleme kutularını güncelle
            document.getElementById('video-completed').checked = topic.videoCompleted;
            document.getElementById('test-completed').checked = topic.testCompleted;
            
            // Notları göster
            const notesDisplay = document.getElementById('topic-notes-display');
            if (topic.notes) {
                notesDisplay.textContent = topic.notes;
            } else {
                notesDisplay.textContent = "Bu konuya henüz not eklemediniz.";
            }
            
            // Video ve kaynak içeriğini göster
            this.updateTopicDetailContent(courseId, topicId);
            
            // Durum etiketini güncelle
            this.updateTopicStatus();
            
            this.openModal(topicDetailModal);
        },

        updateTopicDetailContent(courseId, topicId) {
            const topic = CourseManager.getTopic(courseId, topicId);
            if (!topic) return;
            
            // Video içeriği
            const videoContainer = document.getElementById('video-container');
            // Çoklu video linki desteği
            if (Array.isArray(topic.videoLinks) && topic.videoLinks.length > 0) {
                let videoEmbeds = '';
                topic.videoLinks.forEach(link => {
                    if (link.includes('youtube.com') || link.includes('youtu.be')) {
                        const videoId = this.extractYouTubeId(link);
                        if (videoId) {
                            videoEmbeds += `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
                        } else {
                            videoEmbeds += `<div class="external-link"><i class="fas fa-external-link-alt"></i> <a href="${link}" target="_blank" rel="noopener noreferrer">Video kaynağını görüntüle</a></div>`;
                        }
                    } else {
                        videoEmbeds += `<div class="external-link"><i class="fas fa-external-link-alt"></i> <a href="${link}" target="_blank" rel="noopener noreferrer">Video kaynağını görüntüle</a></div>`;
                    }
                });
                videoContainer.innerHTML = videoEmbeds;
            } else {
                videoContainer.innerHTML = `<div class="no-content"><i class="fas fa-video-slash"></i><p>Bu konu için video eklenmedi.</p></div>`;
            }
            
            // Kaynak/test içeriği ve PDF
            const resourceContainer = document.getElementById('resource-container');
            let resourceHtml = '';
            if (topic.resource) {
                if (topic.resource.toLowerCase().endsWith('.pdf')) {
                    resourceHtml += `<div class="pdf-preview"><i class="fas fa-file-pdf"></i><a href="${topic.resource}" target="_blank" rel="noopener noreferrer">PDF Dosyasını Görüntüle</a></div>`;
                } else {
                    resourceHtml += `<div class="external-link"><i class="fas fa-external-link-alt"></i><a href="${topic.resource}" target="_blank" rel="noopener noreferrer">Test/Kaynak linkini aç</a></div>`;
                }
            }
            if (topic.pdf) {
                resourceHtml += `<div class="pdf-preview"><i class="fas fa-file-pdf"></i><a href="${topic.pdf}" target="_blank" rel="noopener noreferrer">Yüklenen PDF'yi Görüntüle</a></div>`;
            }
            if (!resourceHtml) {
                resourceHtml = `<div class="no-content"><i class="fas fa-file-alt"></i><p>Bu konu için test/kaynak eklenmedi.</p></div>`;
            }
            resourceContainer.innerHTML = resourceHtml;
            // Soru sayısı gösterimi
            const detailSidebar = document.querySelector('.topic-detail-sidebar .topic-detail-info');
            if (detailSidebar && topic.questionCount) {
                let qCountEl = detailSidebar.querySelector('.question-count-info');
                if (!qCountEl) {
                    qCountEl = document.createElement('div');
                    qCountEl.className = 'question-count-info';
                    detailSidebar.appendChild(qCountEl);
                }
                qCountEl.innerHTML = `<strong>Çözülen Soru:</strong> ${topic.questionCount}`;
            }
        },

        updateTopicStatus() {
            if (!CourseManager.currentTopicId) return;
            
            const topic = CourseManager.getTopic(
                CourseManager.currentCourseId, 
                CourseManager.currentTopicId
            );
            
            if (!topic) return;
            
            const statusElement = document.getElementById('topic-status');
            
            if (topic.videoCompleted && topic.testCompleted) {
                statusElement.textContent = 'Tamamlandı';
                statusElement.className = 'status-complete';
            } else if (topic.videoCompleted || topic.testCompleted) {
                statusElement.textContent = 'Devam Ediyor';
                statusElement.className = 'status-progress';
            } else {
                statusElement.textContent = 'Tamamlanmadı';
                statusElement.className = 'status-pending';
            }
        },

        confirmDeleteTopic(courseId, topicId) {
            const topic = CourseManager.getTopic(courseId, topicId);
            if (!topic) return;
            
            document.getElementById('confirm-title').textContent = 'Konuyu Sil';
            document.getElementById('confirm-message').textContent = 
                `"${topic.name}" konusunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`;
            
            this.deleteType = 'topic';
            this.deleteId = { courseId, topicId };
            
            this.openModal(confirmModal);
        },

        confirmDeleteCourse(courseId) {
            const course = CourseManager.getCourse(courseId);
            if (!course) return;
            
            document.getElementById('confirm-title').textContent = 'Dersi Sil';
            document.getElementById('confirm-message').textContent = 
                `"${course.name}" dersini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm konular silinecektir.`;
            
            this.deleteType = 'course';
            this.deleteId = courseId;
            
            this.openModal(confirmModal);
        },

        openModal(modal) {
            if (modal) {
                modal.style.display = 'flex';
                setTimeout(() => {
                    modal.classList.add('show');
                }, 10);
            }
        },

        closeModal(modal) {
            if (modal) {
                modal.classList.remove('show');
                setTimeout(() => {
                    modal.style.display = 'none';
                }, 300);
            }
        },

        closeAllModals() {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                this.closeModal(modal);
            });
        },

        extractYouTubeId(url) {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
            const match = url.match(regExp);
            return (match && match[2].length === 11) ? match[2] : null;
        }
    };

    // Yardımcı fonksiyonlar
    function getCategoryName(category) {
        const categories = {
            'tyt': 'TYT',
            'ayt': 'AYT',
            'ydt': 'YDT'
        };
        return categories[category] || category;
    }

    function getTopicStatusHTML(topic) {
        if (topic.videoCompleted && topic.testCompleted) {
            return '<span class="status-complete">Tamamlandı</span>';
        } else if (topic.videoCompleted || topic.testCompleted) {
            return '<span class="status-progress">Devam Ediyor</span>';
        } else {
            return '<span class="status-pending">Tamamlanmadı</span>';
        }
    }

    function getCompletedTopicsCount(course) {
        let completedCount = 0;
        
        course.topics.forEach(topic => {
            if (topic.videoCompleted && topic.testCompleted) {
                completedCount++;
            }
        });
        
        return completedCount;
    }

    // İnitialize
    CourseManager.init();
    UI.init();
});
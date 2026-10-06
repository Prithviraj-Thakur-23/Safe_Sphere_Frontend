// =========================================================
// 1. GLOBAL THEME SYNC CONTROLLER
// =========================================================
function changeTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('safeSphereTheme', themeName);
    const dropdowns = document.querySelectorAll('.theme-dropdown');
    dropdowns.forEach(dropdown => dropdown.value = themeName);
}

// =========================================================
// 2. LANGUAGE TRANSLATION CONTROLLER (UPDATED FOR GLOBAL SYNC)
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Restore Theme
    const savedTheme = localStorage.getItem('safeSphereTheme') || 'emerald';
    changeTheme(savedTheme);

    // 2. Restore Language UI Text
    const savedLang = localStorage.getItem('safeSphereLang') || 'en';
    const langMap = { 'en': 'ENG', 'hi': 'HIN', 'mr': 'MAR' };
    const currentLangEl = document.getElementById('currentLang');
    if(currentLangEl) currentLangEl.innerText = langMap[savedLang] || savedLang.toUpperCase();

    // Initialize other modules
    if (document.getElementById('newsTickerTrack')) renderDailyCrimeNews();
    if (document.getElementById('feedbackForm')) initFeedbackSystem();
    if (typeof initFileUploadListeners === 'function') initFileUploadListeners();
});

const langBtn = document.getElementById('langBtn');
const langMenu = document.getElementById('langMenu');

if (langBtn && langMenu) {
    // Open/Close Dropdown
    langBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        langMenu.classList.toggle('show');
    });

    // Handle Language Selection
    const langOptions = langMenu.querySelectorAll('.lang-option');
    langOptions.forEach(option => {
        option.addEventListener('click', (event) => {
            event.stopPropagation();
            
            // Get selected code ('en', 'hi', 'mr')
            const selectedCode = option.getAttribute('data-code').toLowerCase(); 
            
            // Save globally so it persists across pages
            localStorage.setItem('safeSphereLang', selectedCode);
            
            // Update the button text immediately
            const langMap = { 'en': 'ENG', 'hi': 'HIN', 'mr': 'MAR' };
            const currentLangEl = document.getElementById('currentLang');
            if(currentLangEl) currentLangEl.innerText = langMap[selectedCode] || selectedCode.toUpperCase();
            
            // Close the menu
            langMenu.classList.remove('show');
            
            // Trigger Google Translate logic
            const googleSelect = document.querySelector('.goog-te-combo');
            if (googleSelect) {
                googleSelect.value = selectedCode;
                googleSelect.dispatchEvent(new Event('change'));
            }

            // If switching back to English, clear Google's translation cookies and reload to restore original HTML
            if (selectedCode === 'en') {
                document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
                setTimeout(() => location.reload(), 200); 
            }
        });
    });

    // Click outside to close
    window.addEventListener('click', (event) => {
        if (!langMenu.contains(event.target) && !langBtn.contains(event.target)) {
            langMenu.classList.remove('show');
        }
    });
}

// =========================================================
// 3. SIDEBAR CONTROLLER
// =========================================================
const leftSidebar = document.getElementById('leftSidebar');
const overlay = document.getElementById('mobileOverlay');

function toggleSidebar() {
    leftSidebar.classList.toggle('open');
    if (window.innerWidth <= 768) {
        if (leftSidebar.classList.contains('open')) {
            overlay.classList.add('show');
            document.body.style.overflow = 'hidden'; 
        } else {
            overlay.classList.remove('show');
            document.body.style.overflow = ''; 
        }
    }
}

window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        if(overlay) overlay.classList.remove('show');
        document.body.style.overflow = 'hidden'; 
        if(leftSidebar) leftSidebar.classList.remove('open');
    } else if (leftSidebar && !leftSidebar.classList.contains('open')) {
        document.body.style.overflow = ''; 
    }
});

// =========================================================
// 4. AI VIDEOS CAROUSEL CONTROLLER
// =========================================================
const carouselTrack = document.getElementById('aiCarousel');
const carouselCards = document.querySelectorAll('.carousel-card');
let currentIndex = 0;
let autoScrollInterval;

function scrollToCurrentIndex() {
    if (!carouselCards.length) return;
    const cardWidth = carouselCards[0].clientWidth;
    carouselTrack.scrollTo({ left: currentIndex * (cardWidth + 24), behavior: 'smooth' });
}

function startCarousel() {
    autoScrollInterval = setInterval(() => {
        if (!carouselCards.length) return;
        currentIndex++;
        if (currentIndex >= carouselCards.length) currentIndex = 0; 
        scrollToCurrentIndex();
    }, 4000);
}

if (carouselTrack) {
    carouselTrack.addEventListener('mouseenter', () => { clearInterval(autoScrollInterval); carouselTrack.focus(); });
    carouselTrack.addEventListener('mouseleave', () => { carouselTrack.blur(); startCarousel(); });
    carouselTrack.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); currentIndex++; if (currentIndex >= carouselCards.length) currentIndex = 0; scrollToCurrentIndex(); } 
        else if (e.key === 'ArrowLeft') { e.preventDefault(); currentIndex--; if (currentIndex < 0) currentIndex = carouselCards.length - 1; scrollToCurrentIndex(); }
    });
    carouselTrack.addEventListener('touchstart', () => clearInterval(autoScrollInterval), {passive: true});
    carouselTrack.addEventListener('touchend', startCarousel, {passive: true});
    startCarousel();
}

// =========================================================
// 5. MODAL POPUP LOGIC
// =========================================================
const modal = document.getElementById('complaintModal');
function openModal(title, link) {
    if (modal) {
        document.getElementById('modalTitle').innerText = title;
        document.getElementById('modalLink').href = link;
        modal.classList.add('show');
    }
}
function closeModal() { if (modal) modal.classList.remove('show'); }
window.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });

// =========================================================
// 6. FULL-STACK THREAT SCANNER
// =========================================================
window.switchScanTab = function(tabId) {
    document.querySelectorAll('.scan-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.scan-body').forEach(b => b.style.display = 'none');
    document.getElementById('tab-' + tabId).classList.add('active');
    document.getElementById('body-' + tabId).style.display = 'block';
    const resultBox = document.getElementById('scan-result-box');
    if(resultBox) resultBox.style.display = 'none'; 
}

window.runScanner = async function() {
    const activeTabObj = document.querySelector('.scan-tab.active');
    if(!activeTabObj) return;
    const activeTab = activeTabObj.id.replace('tab-', '');
    const progress = document.getElementById('scan-progress');
    const progressBar = document.getElementById('scan-progress-bar');
    const resultBox = document.getElementById('scan-result-box');
    const resultText = document.getElementById('scan-result-text');

    progress.style.display = 'block';
    resultBox.style.display = 'none';
    progressBar.style.width = '30%';

    try {
        if (activeTab === 'email') {
            const emailText = document.getElementById('scan-email-input').value.trim();
            if (emailText === '') {
                alert('Please paste email content or headers to scan.'); 
                progress.style.display = 'none';
                return;
            }

            const response = await fetch('https://safe-sphere-backend-v6sg.onrender.com/api/scan-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emailText: emailText })
            });
            
            progressBar.style.width = '70%';
            const report = await response.json();
            
            progressBar.style.width = '100%';
            setTimeout(() => {
                progress.style.display = 'none';
                resultBox.style.display = 'block';
                resultBox.style.borderLeftColor = report.score >= 40 ? "var(--accent-red)" : "var(--primary-blue)";
                resultText.innerHTML = `<strong>Threat Score: ${report.score}% (${report.riskLevel} Risk)</strong><br><br><strong>Analysis:</strong><br>${report.details}`;
            }, 400);

        } else if (activeTab === 'media' || activeTab === 'voice') {
            const fileInput = document.querySelector(`#body-${activeTab} input[type="file"]`);
            if (!fileInput || !fileInput.files[0]) {
                alert(`Please upload a ${activeTab === 'media' ? 'photo/video' : 'voice'} file to scan.`);
                progress.style.display = 'none';
                return;
            }

            const formData = new FormData();
            formData.append(activeTab === 'media' ? 'mediaFile' : 'voiceFile', fileInput.files[0]);

            const response = await fetch(`https://safe-sphere-backend-v6sg.onrender.com/api/scan-${activeTab}`, {
                method: 'POST',
                body: formData
            });

            progressBar.style.width = '70%';
            const report = await response.json();

            progressBar.style.width = '100%';
            setTimeout(() => {
                progress.style.display = 'none';
                resultBox.style.display = 'block';
                resultBox.style.borderLeftColor = report.score >= 40 ? "var(--accent-red)" : "var(--primary-blue)";
                resultText.innerHTML = `<strong>AI Detection Score: ${report.score}% (${report.riskLevel})</strong><br><br><strong>Analysis:</strong><br>${report.details}`;
            }, 400);
        }
    } catch (error) {
        console.error("Scanner Error:", error);
        alert("Loading Error: Cannot connect to the AI analysis server at this moment.");
        progress.style.display = 'none';
    }
}

function initFileUploadListeners() {
    document.querySelectorAll('.file-drop-area').forEach(area => {
        area.addEventListener('click', () => {
            const fileInput = area.querySelector('input[type="file"]');
            if(fileInput) fileInput.click();
        });
        
        const fileInput = area.querySelector('input[type="file"]');
        if(fileInput) {
            fileInput.addEventListener('change', (e) => {
                if(e.target.files[0]) {
                    const fileName = e.target.files[0].name;
                    area.innerHTML = `<span style="font-size: 2rem;">📁</span><br><strong>Selected:</strong> ${fileName}`;
                    area.appendChild(e.target);
                }
            });
        }
    });
}

// =========================================================
// 7. DYNAMIC DAILY CRIME & SAFETY NEWS ENGINE
// =========================================================
const CRIME_NEWS_MASTER_POOL = [
    { branch: "Financial Safety", headline: "Elderly Citizen Duped of ₹42 Lakh in 'Digital Arrest' Threat", cause: "Victim panicked over fake police Skype call, violating rule to never transfer funds to verify innocence.", place: "Pune, MH", source: "The Times of India", link: "https://timesofindia.indiatimes.com/city/pune", defaultDayOffset: 0, time: "10:15 AM" },
    { branch: "Cyber Security", headline: "Hospital Network Compromised by Ransomware via Unverified Invoice", cause: "Staff opened malicious invoice .exe email attachment, lacking basic email verification training.", place: "Bengaluru, KA", source: "CERT-In Advisory", link: "https://www.cert-in.org.in", defaultDayOffset: 0, time: "08:45 AM" },
    { branch: "Women Safety", headline: "Cab Driver Diverts Route at Night; Passenger Triggers SOS Alert", cause: "Driver tried detouring unlit roads; passenger's active route sharing and SOS button prevented assault.", place: "Gurugram, HR", source: "The Indian Express", link: "https://indianexpress.com", defaultDayOffset: 1, time: "11:20 PM" },
    { branch: "Digital Safety", headline: "Family Extorted ₹3 Lakh via AI Voice-Cloned Emergency Kidnap Scam", cause: "Transferred emergency funds immediately without calling the child's actual phone or asking family safe-word.", place: "New Delhi", source: "National Cyber Crime Portal", link: "https://cybercrime.gov.in", defaultDayOffset: 1, time: "04:10 PM" },
    { branch: "Child Safety", headline: "Minor Duped into Stealing Parents' Card for Online Game Skins", cause: "Stranger on voice chat groomed child for OTPs; device lacked parental purchase authentication.", place: "Hyderabad, TS", source: "The Hindu", link: "https://www.thehindu.com", defaultDayOffset: 2, time: "02:30 PM" },
    { branch: "Personal Safety", headline: "Commuter Mugged on Dark Walkway While Using Noise-Cancelling Earphones", cause: "Lack of auditory situational awareness allowed attacker to ambush from behind unnoticed.", place: "Mumbai, MH", source: "Mid-Day News", link: "https://www.mid-day.com", defaultDayOffset: 2, time: "09:40 PM" },
    { branch: "Financial Safety", headline: "Fake Electricity Bill SMS Scams Drain ₹1.8 Lakh via Malware APK", cause: "Victim installed unknown APK sent via WhatsApp instead of paying directly on official utility portal.", place: "Ahmedabad, GJ", source: "PIB Fact Check", link: "https://pib.gov.in", defaultDayOffset: 3, time: "01:15 PM" }
];

function getOrInitNewsDatabase() {
    const STORAGE_KEY = 'safeSphereCrimeNews_v2';
    let storedNews = localStorage.getItem(STORAGE_KEY);
    const now = Date.now();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    if (!storedNews) {
        const seeded = CRIME_NEWS_MASTER_POOL.map((item, index) => ({
            id: 'news_' + index + '_' + (now - item.defaultDayOffset * ONE_DAY_MS),
            branch: item.branch, headline: item.headline, cause: item.cause, place: item.place, source: item.source, link: item.link, time: item.time,
            timestamp: now - (item.defaultDayOffset * ONE_DAY_MS) + (index * 60000)
        }));
        storedNews = seeded;
    } else {
        try { storedNews = JSON.parse(storedNews); } catch (e) { storedNews = []; }
    }

    const THREE_DAYS_MS = 3 * ONE_DAY_MS;
    let filteredNews = storedNews.filter(item => {
        const ageMs = now - item.timestamp;
        return ageMs >= 0 && ageMs <= THREE_DAYS_MS;
    });

    if (filteredNews.length < 4) {
        CRIME_NEWS_MASTER_POOL.slice(0, 5).forEach((poolItem, idx) => {
            if (!filteredNews.some(n => n.headline === poolItem.headline)) {
                filteredNews.push({
                    id: 'news_replenish_' + now + '_' + idx,
                    branch: poolItem.branch, headline: poolItem.headline, cause: poolItem.cause, place: poolItem.place, source: poolItem.source, link: poolItem.link, time: poolItem.time,
                    timestamp: now - (idx * 16 * 3600 * 1000) 
                });
            }
        });
    }

    filteredNews.sort((a, b) => b.timestamp - a.timestamp);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredNews));
    return filteredNews;
}

function formatNewsAge(timestamp, timeStr) {
    const diffDays = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return `Today, ${timeStr}`;
    if (diffDays === 1) return `Yesterday, ${timeStr}`;
    return `${diffDays} days ago, ${timeStr}`;
}

function renderDailyCrimeNews() {
    const track = document.getElementById('newsTickerTrack');
    const dateStamp = document.getElementById('newsDateStamp');
    if (!track) return;

    if (dateStamp) dateStamp.innerText = `${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} Active`;

    const activeNews = getOrInitNewsDatabase();
    let cardsHTML = '';
    [...activeNews, ...activeNews].forEach((item) => {
        cardsHTML += `
            <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="news-card-link">
                <div class="news-item">
                    <div class="news-card-top"><span class="news-branch-tag">${item.branch}</span><span class="news-time">🚨 ${formatNewsAge(item.timestamp, item.time)}</span></div>
                    <h4 class="news-headline">${item.headline}</h4>
                    <p class="news-desc">${item.cause}</p>
                    <div class="news-card-footer"><span class="news-location">📍 ${item.place}</span><span class="news-source">Source: ${item.source} ↗</span></div>
                </div>
            </a>
        `;
    });
    track.innerHTML = cardsHTML;
}

// =========================================================
// 8. GLOBAL SERVER-CONNECTED FEEDBACK SYSTEM
// =========================================================
function initFeedbackSystem() {
    renderFeedbacks();
    const stars = document.querySelectorAll('.star-rating .star');
    const ratingInput = document.getElementById('fbRating');
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const val = this.getAttribute('data-val');
            if(ratingInput) ratingInput.value = val;
            stars.forEach(s => {
                s.classList.remove('active');
                if (s.getAttribute('data-val') <= val) s.classList.add('active');
            });
        });
    });
}

window.handleFeedbackSubmit = async function(event) {
    event.preventDefault();
    const name = document.getElementById('fbName').value.trim();
    const email = document.getElementById('fbEmail').value.trim();
    const rating = document.getElementById('fbRating').value;
    const text = document.getElementById('fbText').value.trim();
    const statusEl = document.getElementById('fbStatus');

    if (rating === "0") { statusEl.style.color = "var(--accent-red)"; statusEl.innerText = "Please provide a star rating."; return; }
    if (!validateEmailAlgorithm(email)) { statusEl.style.color = "var(--accent-red)"; statusEl.innerText = "Please enter a genuine, active email address."; return; }

    statusEl.style.color = "var(--text-muted)";
    statusEl.innerText = "Submitting feedback...";
    
    try {
        const response = await fetch('https://safe-sphere-backend-v6sg.onrender.com/api/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, rating, text })
        });

        const data = await response.json();
        if(data.success) {
            renderFeedbacksFromServer(data.feedbacks);
            document.getElementById('feedbackForm').reset();
            document.getElementById('fbRating').value = "0";
            document.querySelectorAll('.star-rating .star').forEach(s => s.classList.remove('active'));
            
            statusEl.style.color = "var(--primary-blue)";
            statusEl.innerText = "Feedback posted successfully!";
            setTimeout(() => statusEl.innerText = "", 3000);
        } else {
            throw new Error();
        }
    } catch (error) {
        statusEl.style.color = "var(--accent-red)";
        statusEl.innerText = "Failed to connect to server.";
    }
}

function validateEmailAlgorithm(email) {
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) return false;
    return !['test.com', 'example.com', 'fake.com', 'email.com', 'mailinator.com', '10minutemail.com', 'tempmail.com', 'yopmail.com'].includes(email.split('@')[1].toLowerCase());
}

async function renderFeedbacks() {
    const feedContainer = document.getElementById('feedbackFeedContainer');
    if (!feedContainer) return;

    try {
        const response = await fetch('https://safe-sphere-backend-v6sg.onrender.com/api/feedbacks');
        const feedbacks = await response.json();
        renderFeedbacksFromServer(feedbacks);
    } catch (error) {
        console.error("Failed to load feedbacks from server");
    }
}

function renderFeedbacksFromServer(feedbacks) {
    const feedContainer = document.getElementById('feedbackFeedContainer');
    if (!feedContainer) return;

    feedContainer.innerHTML = '';
    feedbacks.forEach(fb => {
        const card = document.createElement('div');
        card.className = 'fb-card';
        card.innerHTML = `
            <div class="fb-card-header"><span class="fb-author">${fb.name}</span><span class="fb-date">${fb.date}</span></div>
            <div class="fb-stars">${'★'.repeat(fb.rating) + '☆'.repeat(5 - fb.rating)}</div>
            <p class="fb-text">"${fb.text}"</p>
        `;
        feedContainer.appendChild(card);
    });
}

// =========================================================
// 9. DYNAMIC AI QUIZ ENGINE
// =========================================================
window.startQuiz = async function(topicCode) {
    const topicView = document.getElementById('topic-selection-view');
    const quizView = document.getElementById('active-quiz-view');
    const resultsView = document.getElementById('results-view');
    const questionsContainer = document.getElementById('questions-container');
    const quizTitle = document.getElementById('quiz-title');
    const submitBtn = document.querySelector('.submit-quiz-btn');

    const titles = { cyber: "Cyber Security", child: "Child Safety", personal: "Personal Safety", women: "Women Safety", digital: "Digital Safety", financial: "Financial Safety" };
    const fullTopicName = titles[topicCode];
    if(quizTitle) quizTitle.innerText = fullTopicName + " Quiz";

    if(topicView) topicView.style.display = 'none';
    if(resultsView) resultsView.style.display = 'none';
    if(quizView) quizView.style.display = 'block';
    
    if(questionsContainer) {
        questionsContainer.innerHTML = `
            <div style="text-align:center; padding: 4rem 1rem;">
                <div style="font-size: 3rem; animation: pulse 1.5s infinite;">🤖</div>
                <h3 style="margin-top: 1rem; color: var(--primary-blue);">Generating AI Quiz</h3>
                <p style="color: var(--text-muted);">Our AI is actively writing 10 unique questions about ${fullTopicName}... please wait.</p>
            </div>
            <style>@keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }</style>
        `;
    }
    if(submitBtn) submitBtn.style.display = 'none';

    window.scrollTo(0,0);

    try {
        const response = await fetch('https://safe-sphere-backend-v6sg.onrender.com/api/generate-quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic: fullTopicName })
        });

        const data = await response.json();
        
        if (data.error || !Array.isArray(data)) {
            throw new Error("Invalid response format");
        }

        window.currentQuestions = data;
        window.userAnswers = new Array(10).fill(null);

        questionsContainer.innerHTML = '';
        window.currentQuestions.forEach((qObj, index) => {
            const block = document.createElement('div');
            block.className = 'question-block';
            let optionsHTML = '';
            qObj.options.forEach((opt, optIndex) => {
                optionsHTML += `<label class="option-label"><input type="radio" name="q${index}" value="${optIndex}" onchange="recordAnswer(${index}, ${optIndex})">${opt}</label>`;
            });
            block.innerHTML = `<h4>${index + 1}. ${qObj.q}</h4><div class="options-wrapper">${optionsHTML}</div>`;
            questionsContainer.appendChild(block);
        });

        if(submitBtn) submitBtn.style.display = 'block';

    } catch (error) {
        console.error(error);
        if(questionsContainer) {
            questionsContainer.innerHTML = `
                <div style="text-align:center; padding: 3rem; color: var(--accent-red);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️️</div>
                    <h3>Loading Error</h3>
                    <p>Failed to generate AI quiz. Please ensure your backend server is running.</p>
                </div>
            `;
        }
    }
}

window.recordAnswer = function(qIndex, optIndex) { window.userAnswers[qIndex] = optIndex; }

window.submitQuiz = function() {
    let score = 0;
    if (window.userAnswers.includes(null)) { alert("Please answer all 10 questions before submitting!"); return; }

    window.currentQuestions.forEach((qObj, index) => { if (window.userAnswers[index] === qObj.ans) score++; });

    const scoreDisplay = document.getElementById('score-display');
    if(scoreDisplay) scoreDisplay.innerText = `${score} / 10`;
    
    let message = "";
    if (score === 10) message = "Perfect Score! You are highly secure.";
    else if (score >= 7) message = "Great job! You have solid safety awareness.";
    else if (score >= 4) message = "Good effort, but there is room to improve your safety knowledge.";
    else message = "Please review our safety guides. Stay aware, stay safe!";
    
    const scoreMessage = document.getElementById('score-message');
    if(scoreMessage) scoreMessage.innerText = message;

    const quizView = document.getElementById('active-quiz-view');
    const resultsView = document.getElementById('results-view');

    if(quizView) quizView.style.display = 'none';
    if(resultsView) resultsView.style.display = 'block';
    window.scrollTo(0,0);
}

window.showTopics = function() {
    const topicView = document.getElementById('topic-selection-view');
    const quizView = document.getElementById('active-quiz-view');
    const resultsView = document.getElementById('results-view');

    if(quizView) quizView.style.display = 'none';
    if(resultsView) resultsView.style.display = 'none';
    if(topicView) topicView.style.display = 'block';
    window.scrollTo(0,0);
}

// =========================================================
// 10. SAFEBOT AI CHAT INTERFACE
// =========================================================
function toggleSafeBot() {
    const modal = document.getElementById('safebotModal');
    if(modal) modal.classList.toggle('open');
}

function handleSafeBotEnter(event) {
    if (event.key === 'Enter') sendSafeBotMessage();
}

async function sendSafeBotMessage() {
    const inputEl = document.getElementById('safebotInput');
    const message = inputEl.value.trim();
    if (!message) return;

    addChatMessage(message, 'user');
    inputEl.value = '';

    const typingEl = document.getElementById('safebotTyping');
    if(typingEl) typingEl.style.display = 'block';
    scrollToChatBottom();

    try {
        const response = await fetch('https://safe-sphere-backend-v6sg.onrender.com/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message })
        });
        
        const data = await response.json();
        if(typingEl) typingEl.style.display = 'none';
        
        let formattedReply = data.reply.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        addChatMessage(formattedReply, 'bot');

    } catch (error) {
        if(typingEl) typingEl.style.display = 'none';
        addChatMessage("Loading Error: Unable to connect to the SafeBot AI server right now.", 'bot');
    }
}

function addChatMessage(text, sender) {
    const messagesContainer = document.getElementById('safebotMessages');
    if(!messagesContainer) return;
    
    const msgDiv = document.createElement('div');
    msgDiv.className = sender === 'user' ? 'user-msg' : 'bot-msg';
    msgDiv.innerHTML = text;
    
    const typingEl = document.getElementById('safebotTyping');
    messagesContainer.insertBefore(msgDiv, typingEl);
    scrollToChatBottom();
}

function scrollToChatBottom() {
    const messagesContainer = document.getElementById('safebotMessages');
    if(messagesContainer) messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
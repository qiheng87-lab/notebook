// Built-in locked template pages
const BUILT_IN_TEMPLATES = [];

// YouTube Audio Channels Configuration
const YOUTUBE_CHANNELS = [
    {
        name: 'Test Video 1',
        icon: '🎵',
        videoId: 'dQw4w9WgXcQ'
    },
    {
        name: 'Test Video 2',
        icon: '🎶',
        videoId: 'dQw4w9WgXcQ'
    },
    {
        name: 'Test Video 3',
        icon: '🎼',
        videoId: 'dQw4w9WgXcQ'
    },
    {
        name: 'Test Video 4',
        icon: '🎧',
        videoId: 'dQw4w9WgXcQ'
    }
];

// Pomodoro Timer Settings
const POMODORO_SETTINGS = {
    workDuration: 25 * 60, // 25 minutes in seconds
    breakDuration: 5 * 60, // 5 minutes in seconds
};

// Notebook App - Main Logic
class NotebookApp {
    constructor() {
        console.log('NotebookApp constructor called');
        
        this.pages = [];
        this.currentPageId = null;
        this.zoomLevel = 100;
        this.baseEditorFontSize = 14;
        this.basePageTitleFontSize = 20;
        this.storageKey = 'notebook_data';
        
        // Calendar properties
        this.currentDate = new Date();
        
        // Audio properties
        this.youtubePlayer = null;
        this.currentChannelIndex = -1;
        this.isPlaying = false;
        
        // Pomodoro properties
        this.pomodoroInterval = null;
        this.timeRemaining = POMODORO_SETTINGS.workDuration;
        this.totalTime = POMODORO_SETTINGS.workDuration;
        this.isWorkTime = true;
        this.isTimerRunning = false;
        
        // Fullscreen properties
        this.isFullscreen = false;
        
        this.initElements();
        console.log('Elements initialized');
        
        this.loadData();
        console.log('Data loaded, pages:', this.pages.length);
        
        this.attachEventListeners();
        console.log('Event listeners attached');
        
        // Initialize calendar view
        this.renderCalendarView();
        
        // Initialize audio channels
        this.renderAudioChannels();
        
        // Initialize pomodoro timer display
        this.updateTimerDisplay();
        
        // Create first page if none exist
        if (this.pages.length === 0) {
            this.addPage();
            console.log('First page created');
        } else {
            this.loadPage(this.pages[0].id);
            console.log('First page loaded');
        }
    }

    initElements() {
        // Navigation tabs
        this.pagesTab = document.getElementById('pagesTab');
        this.calendarTab = document.getElementById('calendarTab');
        this.audioTab = document.getElementById('audioTab');
        this.pagesContent = document.getElementById('pagesContent');
        this.audioContent = document.getElementById('audioContent');
        this.pagesView = document.getElementById('pagesView');
        this.calendarView = document.getElementById('calendarView');

        // Pages
        this.sidebar = document.getElementById('sidebar');
        this.pagesList = document.getElementById('pagesList');
        this.addPageBtn = document.getElementById('addPageBtn');
        this.editor = document.getElementById('editor');
        this.pageTitle = document.getElementById('pageTitle');
        this.boldBtn = document.getElementById('boldBtn');
        this.italicBtn = document.getElementById('italicBtn');
        this.underlineBtn = document.getElementById('underlineBtn');
        this.highlightBtn = document.getElementById('highlightBtn');
        this.lockBtn = document.getElementById('lockBtn');
        this.lockIcon = document.getElementById('lockIcon');
        this.lockText = document.getElementById('lockText');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        this.zoomIn = document.getElementById('zoomIn');
        this.zoomOut = document.getElementById('zoomOut');
        this.zoomLevel = document.getElementById('zoomLevel');
        this.toolbar = document.querySelector('.toolbar');
        this.editorContainer = document.querySelector('.editor-container');
        this.mainContent = document.getElementById('mainContent');
        
        // Calendar view
        this.calendarGridLarge = document.getElementById('calendarGridLarge');
        this.currentMonthLarge = document.getElementById('currentMonthLarge');
        this.prevMonthLarge = document.getElementById('prevMonthLarge');
        this.nextMonthLarge = document.getElementById('nextMonthLarge');
        
        // Audio player elements
        this.audioChannels = document.getElementById('audioChannels');
        
        // Pomodoro timer elements
        this.pomodoroTimerBar = document.getElementById('pomodoroTimerBar');
        this.timerDisplay = document.getElementById('timerDisplay');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.timerStatus = document.getElementById('timerStatus');
        this.timerProgress = document.getElementById('timerProgress');
    }

    attachEventListeners() {
        // Navigation tabs
        this.pagesTab.addEventListener('click', () => this.switchView('pages'));
        this.calendarTab.addEventListener('click', () => this.switchView('calendar'));
        this.audioTab.addEventListener('click', () => this.switchView('audio'));

        // Add page
        this.addPageBtn.addEventListener('click', () => {
            console.log('Add page clicked');
            this.addPage();
        });

        // Format buttons
        this.boldBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.formatText('bold');
        });
        
        this.italicBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.formatText('italic');
        });
        
        this.underlineBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.formatText('underline');
        });

        this.highlightBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.highlightText();
        });

        // Lock button
        this.lockBtn.addEventListener('click', () => {
            this.togglePageLock();
        });

        // Fullscreen button
        this.fullscreenBtn.addEventListener('click', () => {
            this.toggleFullscreen();
        });

        // Editor events
        this.editor.addEventListener('input', () => this.savePage());
        this.pageTitle.addEventListener('input', () => this.savePage());

        // Zoom controls
        this.zoomIn.addEventListener('click', () => this.zoom(10));
        this.zoomOut.addEventListener('click', () => this.zoom(-10));

        // Calendar view navigation
        this.prevMonthLarge.addEventListener('click', () => this.previousMonth());
        this.nextMonthLarge.addEventListener('click', () => this.nextMonth());

        // Pomodoro timer controls
        this.startBtn.addEventListener('click', () => this.startTimer());
        this.pauseBtn.addEventListener('click', () => this.pauseTimer());
        this.resetBtn.addEventListener('click', () => this.resetTimer());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'b') {
                    e.preventDefault();
                    this.formatText('bold');
                }
                if (e.key === 'i') {
                    e.preventDefault();
                    this.formatText('italic');
                }
                if (e.key === 'u') {
                    e.preventDefault();
                    this.formatText('underline');
                }
                if (e.key === 'h') {
                    e.preventDefault();
                    this.highlightText();
                }
            }
        });

        // Update active button on selection change
        document.addEventListener('selectionchange', () => {
            this.updateActiveButtons();
        });
    }

    switchView(view) {
        console.log('Switching to view:', view);

        // Update tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });

        // Hide all sidebar content
        document.querySelectorAll('.sidebar-content').forEach(content => {
            content.classList.remove('active');
        });

        // Hide all view containers
        document.querySelectorAll('.view-container').forEach(container => {
            container.classList.remove('active');
        });

        if (view === 'pages') {
            this.pagesTab.classList.add('active');
            this.pagesContent.classList.add('active');
            this.pagesView.classList.add('active');
        } else if (view === 'calendar') {
            this.calendarTab.classList.add('active');
            this.pagesView.classList.add('active');
            this.calendarView.classList.add('active');
        } else if (view === 'audio') {
            this.audioTab.classList.add('active');
            this.audioContent.classList.add('active');
            this.pagesView.classList.add('active');
        }
    }

    addPage() {
        const pageId = Date.now();
        const newPage = {
            id: pageId,
            title: `Page ${this.pages.length + 1}`,
            content: '',
            locked: false,
            isTemplate: false
        };
        
        this.pages.push(newPage);
        this.savePage();
        this.renderPagesList();
        this.loadPage(pageId);
    }

    loadPage(pageId) {
        const page = this.pages.find(p => p.id === pageId);
        if (!page) return;

        this.currentPageId = pageId;
        this.pageTitle.value = page.title;
        this.editor.innerHTML = page.content;
        
        this.updateLockUI();
        this.renderPagesList();
        this.updateActiveButtons();
    }

    deletePage(pageId) {
        const page = this.pages.find(p => p.id === pageId);
        
        if (page && page.locked) {
            alert('This page is locked and cannot be deleted. Unlock it first.');
            return;
        }

        if (this.pages.length === 1) {
            alert('You must keep at least one page.');
            return;
        }

        const index = this.pages.findIndex(p => p.id === pageId);
        this.pages.splice(index, 1);
        
        if (this.currentPageId === pageId) {
            this.loadPage(this.pages[0].id);
        }
        
        this.savePage();
        this.renderPagesList();
    }

    togglePageLock() {
        if (this.currentPageId === null) return;

        const page = this.pages.find(p => p.id === this.currentPageId);
        if (page) {
            page.locked = !page.locked;
            console.log(`Page locked: ${page.locked}`);
            this.savePage();
            this.updateLockUI();
            this.renderPagesList();
        }
    }

    updateLockUI() {
        if (this.currentPageId === null) return;

        const page = this.pages.find(p => p.id === this.currentPageId);
        if (!page) return;

        const isLocked = page.locked;
        
        this.lockBtn.classList.toggle('locked', isLocked);
        this.lockIcon.textContent = isLocked ? '🔒' : '🔓';
        this.lockText.textContent = isLocked ? 'Unlock' : 'Lock';
        
        this.editor.classList.toggle('locked', isLocked);
        this.editor.contentEditable = !isLocked;
        this.pageTitle.disabled = isLocked;
    }

    toggleFullscreen() {
        this.isFullscreen = !this.isFullscreen;
        console.log('Fullscreen toggled:', this.isFullscreen);

        if (this.isFullscreen) {
            // Enter fullscreen mode
            this.toolbar.classList.add('fullscreen-mode');
            this.pageTitle.classList.add('fullscreen-mode');
            this.editorContainer.classList.add('fullscreen');
            this.mainContent.classList.add('fullscreen-mode');
            this.fullscreenBtn.classList.add('active');
            this.sidebar.style.display = 'none';
            document.body.style.overflow = 'hidden';
        } else {
            // Exit fullscreen mode
            this.toolbar.classList.remove('fullscreen-mode');
            this.pageTitle.classList.remove('fullscreen-mode');
            this.editorContainer.classList.remove('fullscreen');
            this.mainContent.classList.remove('fullscreen-mode');
            this.fullscreenBtn.classList.remove('active');
            this.sidebar.style.display = 'flex';
            document.body.style.overflow = 'auto';
        }

        this.editor.focus();
    }

    savePage() {
        if (this.currentPageId === null) return;

        const page = this.pages.find(p => p.id === this.currentPageId);
        if (page && !page.locked) {
            page.title = this.pageTitle.value || 'Untitled';
            page.content = this.editor.innerHTML;
        }

        localStorage.setItem(this.storageKey, JSON.stringify(this.pages));
    }

    loadData() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            try {
                this.pages = JSON.parse(saved);
            } catch (e) {
                console.error('Error loading data:', e);
                this.pages = [];
            }
        }

        // Add built-in templates if they don't exist
        this.addBuiltInTemplates();
    }

    addBuiltInTemplates() {
        BUILT_IN_TEMPLATES.forEach(template => {
            const exists = this.pages.some(p => p.id === template.id);
            if (!exists) {
                this.pages.unshift(template);
                console.log(`Added built-in template: ${template.title}`);
            }
        });
    }

    renderPagesList() {
        this.pagesList.innerHTML = '';
        
        this.pages.forEach(page => {
            const pageItem = document.createElement('div');
            pageItem.className = 'page-item';
            if (page.id === this.currentPageId) {
                pageItem.classList.add('active');
            }
            if (page.locked) {
                pageItem.classList.add('locked');
            }

            const lockIndicator = page.locked ? '<span class="lock-indicator">🔒</span>' : '';

            pageItem.innerHTML = `
                <div class="page-item-name">
                    ${lockIndicator}
                    <span>${this.escapeHtml(page.title || 'Untitled')}</span>
                </div>
                <button class="delete-page-btn" title="Delete page" ${page.locked ? 'disabled' : ''}>×</button>
            `;

            pageItem.querySelector('.page-item-name').addEventListener('click', () => {
                this.loadPage(page.id);
            });

            const deleteBtn = pageItem.querySelector('.delete-page-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (page.locked) {
                    alert('This page is locked. Unlock it first to delete.');
                    return;
                }
                if (confirm(`Delete "${page.title}"?`)) {
                    this.deletePage(page.id);
                }
            });

            this.pagesList.appendChild(pageItem);
        });
    }

    formatText(command) {
        console.log('formatText called with:', command);
        document.execCommand(command, false, null);
        this.editor.focus();
        this.savePage();
        this.updateActiveButtons();
    }

    highlightText() {
        console.log('highlightText called');
        const selection = window.getSelection();
        
        if (!selection.rangeCount || selection.isCollapsed) {
            console.log('No text selected');
            return;
        }

        const range = selection.getRangeAt(0);
        const span = document.createElement('mark');
        span.style.backgroundColor = '#FFFF00';
        
        try {
            range.surroundContents(span);
        } catch (e) {
            console.log('Complex selection, using alternative method');
            const fragment = range.extractContents();
            span.appendChild(fragment);
            range.insertNode(span);
        }

        this.editor.focus();
        this.savePage();
        this.updateActiveButtons();
    }

    updateActiveButtons() {
        this.boldBtn.classList.toggle('active', document.queryCommandState('bold'));
        this.italicBtn.classList.toggle('active', document.queryCommandState('italic'));
        this.underlineBtn.classList.toggle('active', document.queryCommandState('underline'));
        
        // Check if current selection is highlighted
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const parent = range.commonAncestorContainer.parentElement;
            this.highlightBtn.classList.toggle('active', parent && parent.tagName === 'MARK');
        }
    }

    zoom(delta) {
        this.zoomLevel = Math.max(80, Math.min(150, this.zoomLevel + delta));
        this.zoomLevel = Math.round(this.zoomLevel / 10) * 10;
        
        const zoomFactor = this.zoomLevel / 100;
        
        this.editor.style.fontSize = `${this.baseEditorFontSize * zoomFactor}px`;
        this.pageTitle.style.fontSize = `${this.basePageTitleFontSize * zoomFactor}px`;
        document.getElementById('zoomLevel').textContent = `${this.zoomLevel}%`;
    }

    // Calendar functions
    renderCalendarView() {
        this.updateCalendarHeaderLarge();
        this.renderCalendarGridLarge();
    }

    updateCalendarHeaderLarge() {
        const monthYear = this.currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        this.currentMonthLarge.textContent = monthYear;
    }

    renderCalendarGridLarge() {
        this.calendarGridLarge.innerHTML = '';
        
        // Day headers
        const dayHeaders = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        dayHeaders.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header-large';
            dayHeader.textContent = day;
            this.calendarGridLarge.appendChild(dayHeader);
        });

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        // Previous month's days
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            const dayElement = this.createDayElementLarge(day, true);
            this.calendarGridLarge.appendChild(dayElement);
        }

        // Current month's days
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = day === today.getDate() && 
                           month === today.getMonth() && 
                           year === today.getFullYear();
            const dayElement = this.createDayElementLarge(day, false, isToday);
            this.calendarGridLarge.appendChild(dayElement);
        }

        // Next month's days
        const totalCells = this.calendarGridLarge.children.length;
        const remainingCells = 42 - totalCells; // 6 rows × 7 days
        for (let day = 1; day <= remainingCells; day++) {
            const dayElement = this.createDayElementLarge(day, true);
            this.calendarGridLarge.appendChild(dayElement);
        }
    }

    createDayElementLarge(day, isOtherMonth = false, isToday = false) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day-large';
        
        if (isOtherMonth) {
            dayElement.classList.add('other-month');
        }
        if (isToday) {
            dayElement.classList.add('today');
        }
        
        dayElement.textContent = day;
        return dayElement;
    }

    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        console.log('Previous month:', this.currentDate);
        this.renderCalendarView();
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        console.log('Next month:', this.currentDate);
        this.renderCalendarView();
    }

    // Audio functions
    renderAudioChannels() {
        this.audioChannels.innerHTML = '';

        YOUTUBE_CHANNELS.forEach((channel, index) => {
            const channelItem = document.createElement('div');
            channelItem.className = 'audio-channel-item';
            if (index === this.currentChannelIndex) {
                channelItem.classList.add('active');
            }

            channelItem.innerHTML = `
                <span class="channel-icon">${channel.icon}</span>
                <span class="channel-name">${this.escapeHtml(channel.name)}</span>
            `;

            channelItem.addEventListener('click', () => {
                this.loadAudioChannel(index);
            });

            this.audioChannels.appendChild(channelItem);
        });
    }

    loadAudioChannel(index) {
        console.log('Loading audio channel:', index);
        
        if (index < 0 || index >= YOUTUBE_CHANNELS.length) {
            console.error('Invalid channel index');
            return;
        }

        this.currentChannelIndex = index;
        const channel = YOUTUBE_CHANNELS[index];

        // Update UI
        this.renderAudioChannels();

        // Load YouTube video using IFrame API
        this.loadYoutubePlayer(channel.videoId);
    }

    loadYoutubePlayer(videoId) {
        console.log('Loading YouTube video:', videoId);

        // Check if YouTube API is ready
        if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') {
            console.log('YouTube API not ready, retrying...');
            setTimeout(() => this.loadYoutubePlayer(videoId), 500);
            return;
        }

        // If player already exists, load new video
        if (this.youtubePlayer && typeof this.youtubePlayer.loadVideoById === 'function') {
            this.youtubePlayer.loadVideoById(videoId);
            console.log('Loaded new video:', videoId);
        } else {
            // Create new player
            this.youtubePlayer = new YT.Player('youtubePlayer', {
                height: '200',
                width: '100%',
                videoId: videoId,
                events: {
                    'onReady': (event) => this.onPlayerReady(event),
                    'onStateChange': (event) => this.onPlayerStateChange(event),
                    'onError': (event) => this.onPlayerError(event)
                },
                playerVars: {
                    'autoplay': 0,
                    'controls': 1,
                    'modestbranding': 1,
                    'rel': 0,
                    'showinfo': 0,
                    'iv_load_policy': 3,
                    'fs': 1,
                    'playsinline': 1
                }
            });
            console.log('YouTube player created');
        }
    }

    onPlayerReady(event) {
        console.log('YouTube player ready');
    }

    onPlayerStateChange(event) {
        console.log('Player state changed:', event.data);
    }

    onPlayerError(event) {
        console.error('YouTube player error:', event.data);
        let errorMessage = 'Unknown error';
        
        switch(event.data) {
            case 2:
                errorMessage = 'Invalid parameter. Check the video ID.';
                break;
            case 5:
                errorMessage = 'HTML5 player error';
                break;
            case 100:
                errorMessage = 'Video not found. It may have been deleted or made private.';
                break;
            case 101:
            case 150:
                errorMessage = 'Video cannot be played embedded. Try opening it on YouTube directly.';
                break;
            case 153:
                errorMessage = 'Video is restricted from being embedded.';
                break;
        }
        
        alert('YouTube Error ' + event.data + ': ' + errorMessage);
    }

    // Pomodoro Timer functions
    startTimer() {
        if (this.isTimerRunning) return;

        this.isTimerRunning = true;
        this.startBtn.style.display = 'none';
        this.pauseBtn.style.display = 'flex';

        this.pomodoroInterval = setInterval(() => {
            this.timeRemaining--;

            if (this.timeRemaining <= 0) {
                this.completePhase();
            } else {
                this.updateTimerDisplay();
            }
        }, 1000);
    }

    pauseTimer() {
        this.isTimerRunning = false;
        this.pauseBtn.style.display = 'none';
        this.startBtn.style.display = 'flex';

        if (this.pomodoroInterval) {
            clearInterval(this.pomodoroInterval);
            this.pomodoroInterval = null;
        }
    }

    resetTimer() {
        this.pauseTimer();
        this.isWorkTime = true;
        this.timeRemaining = POMODORO_SETTINGS.workDuration;
        this.totalTime = POMODORO_SETTINGS.workDuration;
        this.updateTimerDisplay();
    }

    completePhase() {
        this.pauseTimer();

        if (this.isWorkTime) {
            // Switch to break time
            this.isWorkTime = false;
            this.timeRemaining = POMODORO_SETTINGS.breakDuration;
            this.totalTime = POMODORO_SETTINGS.breakDuration;
            alert('Work time complete! Time for a break.');
        } else {
            // Switch back to work time
            this.isWorkTime = true;
            this.timeRemaining = POMODORO_SETTINGS.workDuration;
            this.totalTime = POMODORO_SETTINGS.workDuration;
            alert('Break complete! Ready for another work session?');
        }

        this.updateTimerDisplay();
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        
        this.timerDisplay.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Update status
        this.timerStatus.textContent = this.isWorkTime ? 'Work Time' : 'Break Time';

        // Update progress bar
        const progressPercent = ((this.totalTime - this.timeRemaining) / this.totalTime) * 100;
        this.timerProgress.style.width = progressPercent + '%';

        // Change color based on phase
        if (this.isWorkTime) {
            this.pomodoroTimerBar.style.background = 'linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%)';
        } else {
            this.pomodoroTimerBar.style.background = 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)';
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired');
    window.notebookApp = new NotebookApp();
    console.log('NotebookApp initialized successfully');
});

// Also try window.onload as backup
window.addEventListener('load', () => {
    console.log('Window load event fired');
    if (!window.notebookApp) {
        console.log('App not initialized in DOMContentLoaded, initializing now...');
        window.notebookApp = new NotebookApp();
    }
});

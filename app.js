// Built-in locked template pages
const BUILT_IN_TEMPLATES = [];

// YouTube Audio Channels Configuration
const YOUTUBE_CHANNELS = [
        {
        name: 'Yellow Cherry Jam',
        icon: '🎵',
        videoId: 'JYozwaAbAvc'
    },
    {
        name: 'Frieren x Jazz',
        icon: '🎶',
        videoId: 'teWgiwkC6hM'
    },
    {
        name: 'Nature Rain Piano',
        icon: '🎼',
        videoId: 't0VMo8x-jj8'
    },
    {
        name: 'Afloat in Time',
        icon: '🎧',
        videoId: '16Lx917STJY'
    }
];

// Pomodoro Timer Settings
const POMODORO_SETTINGS = {
    workDuration: 25 * 60,
    breakDuration: 5 * 60,
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
        
        this.currentDate = new Date();
        this.youtubePlayer = null;
        this.currentChannelIndex = -1;
        this.isPlaying = false;
        
        this.pomodoroInterval = null;
        this.timeRemaining = POMODORO_SETTINGS.workDuration;
        this.totalTime = POMODORO_SETTINGS.workDuration;
        this.isWorkTime = true;
        this.isTimerRunning = false;
        
        this.isFullscreen = false;
        
        this.initElements();
        this.loadData();
        this.attachEventListeners();
        this.renderCalendarView();
        this.renderAudioChannels();
        this.updateTimerDisplay();
        
        if (this.pages.length === 0) {
            this.addPage();
        } else {
            this.loadPage(this.pages[0].id);
        }
    }

    initElements() {
        const getElement = (id) => {
            const element = document.getElementById(id);
            if (!element) {
                console.warn(`Element with id "${id}" not found`);
            }
            return element;
        };

        const getQuerySelector = (selector) => {
            const element = document.querySelector(selector);
            if (!element) {
                console.warn(`Element with selector "${selector}" not found`);
            }
            return element;
        };

        this.pagesTab = getElement('pagesTab');
        this.calendarTab = getElement('calendarTab');
        this.audioTab = getElement('audioTab');
        this.pagesContent = getElement('pagesContent');
        this.audioContent = getElement('audioContent');
        this.pagesView = getElement('pagesView');
        this.calendarView = getElement('calendarView');

        this.sidebar = getElement('sidebar');
        this.pagesList = getElement('pagesList');
        this.addPageBtn = getElement('addPageBtn');
        this.editor = getElement('editor');
        this.pageTitle = getElement('pageTitle');
        this.boldBtn = getElement('boldBtn');
        this.italicBtn = getElement('italicBtn');
        this.underlineBtn = getElement('underlineBtn');
        this.highlightBtn = getElement('highlightBtn');
        this.lockBtn = getElement('lockBtn');
        this.lockIcon = getElement('lockIcon');
        this.lockText = getElement('lockText');
        this.fullscreenBtn = getElement('fullscreenBtn');
        this.zoomIn = getElement('zoomIn');
        this.zoomOut = getElement('zoomOut');
        this.zoomLevelElement = getElement('zoomLevel');
        this.toolbar = getQuerySelector('.toolbar');
        this.editorContainer = getQuerySelector('.editor-container');
        this.mainContent = getElement('mainContent');
        
        this.calendarGridLarge = getElement('calendarGridLarge');
        this.currentMonthLarge = getElement('currentMonthLarge');
        this.prevMonthLarge = getElement('prevMonthLarge');
        this.nextMonthLarge = getElement('nextMonthLarge');
        
        this.audioChannels = getElement('audioChannels');
        
        this.pomodoroTimerBar = getElement('pomodoroTimerBar');
        this.timerDisplay = getElement('timerDisplay');
        this.startBtn = getElement('startBtn');
        this.pauseBtn = getElement('pauseBtn');
        this.resetBtn = getElement('resetBtn');
        this.timerStatus = getElement('timerStatus');
        this.timerProgress = getElement('timerProgress');
    }

    attachEventListeners() {
        const addListener = (element, event, callback) => {
            if (element) {
                element.addEventListener(event, callback);
            }
        };

        addListener(this.pagesTab, 'click', () => this.switchView('pages'));
        addListener(this.calendarTab, 'click', () => this.switchView('calendar'));
        addListener(this.audioTab, 'click', () => this.switchView('audio'));

        addListener(this.addPageBtn, 'click', () => this.addPage());

        addListener(this.boldBtn, 'click', (e) => {
            e.preventDefault();
            this.formatText('bold');
        });
        
        addListener(this.italicBtn, 'click', (e) => {
            e.preventDefault();
            this.formatText('italic');
        });
        
        addListener(this.underlineBtn, 'click', (e) => {
            e.preventDefault();
            this.formatText('underline');
        });

        addListener(this.highlightBtn, 'click', (e) => {
            e.preventDefault();
            this.highlightText();
        });

        addListener(this.lockBtn, 'click', () => this.togglePageLock());
        addListener(this.fullscreenBtn, 'click', () => this.toggleFullscreen());

        addListener(this.editor, 'input', () => this.savePage());
        addListener(this.pageTitle, 'input', () => this.savePage());

        addListener(this.zoomIn, 'click', () => this.zoom(10));
        addListener(this.zoomOut, 'click', () => this.zoom(-10));

        addListener(this.prevMonthLarge, 'click', () => this.previousMonth());
        addListener(this.nextMonthLarge, 'click', () => this.nextMonth());

        addListener(this.startBtn, 'click', () => this.startTimer());
        addListener(this.pauseBtn, 'click', () => this.pauseTimer());
        addListener(this.resetBtn, 'click', () => this.resetTimer());

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

        document.addEventListener('selectionchange', () => {
            this.updateActiveButtons();
        });
    }

    switchView(view) {
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });

        document.querySelectorAll('.sidebar-content').forEach(content => {
            content.classList.remove('active');
        });

        document.querySelectorAll('.view-container').forEach(container => {
            container.classList.remove('active');
        });

        if (view === 'pages') {
            if (this.pagesTab) this.pagesTab.classList.add('active');
            if (this.pagesContent) this.pagesContent.classList.add('active');
            if (this.pagesView) this.pagesView.classList.add('active');
        } else if (view === 'calendar') {
            if (this.calendarTab) this.calendarTab.classList.add('active');
            if (this.pagesView) this.pagesView.classList.add('active');
            if (this.calendarView) this.calendarView.classList.add('active');
        } else if (view === 'audio') {
            if (this.audioTab) this.audioTab.classList.add('active');
            if (this.audioContent) this.audioContent.classList.add('active');
            if (this.pagesView) this.pagesView.classList.add('active');
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
        
        if (this.pageTitle) this.pageTitle.value = page.title;
        if (this.editor) this.editor.innerHTML = page.content;
        
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
        
        if (this.lockBtn) this.lockBtn.classList.toggle('locked', isLocked);
        if (this.lockIcon) this.lockIcon.textContent = isLocked ? '🔒' : '🔓';
        if (this.lockText) this.lockText.textContent = isLocked ? 'Unlock' : 'Lock';
        
        if (this.editor) {
            this.editor.classList.toggle('locked', isLocked);
            this.editor.contentEditable = !isLocked;
        }
        if (this.pageTitle) this.pageTitle.disabled = isLocked;
    }

    toggleFullscreen() {
        this.isFullscreen = !this.isFullscreen;

        if (this.isFullscreen) {
            if (this.toolbar) this.toolbar.classList.add('fullscreen-mode');
            if (this.pageTitle) this.pageTitle.classList.add('fullscreen-mode');
            if (this.editorContainer) this.editorContainer.classList.add('fullscreen');
            if (this.mainContent) this.mainContent.classList.add('fullscreen-mode');
            if (this.fullscreenBtn) this.fullscreenBtn.classList.add('active');
            if (this.sidebar) this.sidebar.style.display = 'none';
            document.body.style.overflow = 'hidden';
        } else {
            if (this.toolbar) this.toolbar.classList.remove('fullscreen-mode');
            if (this.pageTitle) this.pageTitle.classList.remove('fullscreen-mode');
            if (this.editorContainer) this.editorContainer.classList.remove('fullscreen');
            if (this.mainContent) this.mainContent.classList.remove('fullscreen-mode');
            if (this.fullscreenBtn) this.fullscreenBtn.classList.remove('active');
            if (this.sidebar) this.sidebar.style.display = 'flex';
            document.body.style.overflow = 'auto';
        }

        if (this.editor) this.editor.focus();
    }

    savePage() {
        if (this.currentPageId === null) return;

        const page = this.pages.find(p => p.id === this.currentPageId);
        if (page && !page.locked) {
            if (this.pageTitle) page.title = this.pageTitle.value || 'Untitled';
            if (this.editor) page.content = this.editor.innerHTML;
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

        this.addBuiltInTemplates();
    }

    addBuiltInTemplates() {
        BUILT_IN_TEMPLATES.forEach(template => {
            const exists = this.pages.some(p => p.id === template.id);
            if (!exists) {
                this.pages.unshift(template);
            }
        });
    }

    renderPagesList() {
        if (!this.pagesList) return;
        
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
        document.execCommand(command, false, null);
        if (this.editor) this.editor.focus();
        this.savePage();
        this.updateActiveButtons();
    }

    highlightText() {
    const selection = window.getSelection();
    
    if (!selection.rangeCount || selection.isCollapsed) {
        return;
    }

    const range = selection.getRangeAt(0);
    const span = range.commonAncestorContainer.parentElement;

    // Check if the selected text is already highlighted
    if (span && span.tagName === 'MARK') {
        // Remove highlight
        const parent = span.parentNode;
        while (span.firstChild) {
            parent.insertBefore(span.firstChild, span);
        }
        parent.removeChild(span);
    } else {
        // Add highlight
        const mark = document.createElement('mark');
        mark.style.backgroundColor = '#FFFF00';
        
        try {
            range.surroundContents(mark);
        } catch (e) {
            const fragment = range.extractContents();
            mark.appendChild(fragment);
            range.insertNode(mark);
        }
    }

    if (this.editor) this.editor.focus();
    this.savePage();
    this.updateActiveButtons();
    }


    updateActiveButtons() {
        if (this.boldBtn) {
            this.boldBtn.classList.toggle('active', document.queryCommandState('bold'));
        }
        if (this.italicBtn) {
            this.italicBtn.classList.toggle('active', document.queryCommandState('italic'));
        }
        if (this.underlineBtn) {
            this.underlineBtn.classList.toggle('active', document.queryCommandState('underline'));
        }
        
        const selection = window.getSelection();
        if (selection.rangeCount > 0 && this.highlightBtn) {
            const range = selection.getRangeAt(0);
            const parent = range.commonAncestorContainer.parentElement;
            this.highlightBtn.classList.toggle('active', parent && parent.tagName === 'MARK');
        }
    }

    zoom(delta) {
        this.zoomLevel = Math.max(80, Math.min(150, this.zoomLevel + delta));
        this.zoomLevel = Math.round(this.zoomLevel / 10) * 10;
        
        const zoomFactor = this.zoomLevel / 100;
        
        if (this.editor) {
            this.editor.style.fontSize = `${this.baseEditorFontSize * zoomFactor}px`;
        }
        if (this.pageTitle) {
            this.pageTitle.style.fontSize = `${this.basePageTitleFontSize * zoomFactor}px`;
        }
        if (this.zoomLevelElement) {
            this.zoomLevelElement.textContent = `${this.zoomLevel}%`;
        }
    }

    renderCalendarView() {
        this.updateCalendarHeaderLarge();
        this.renderCalendarGridLarge();
    }

    updateCalendarHeaderLarge() {
        const monthYear = this.currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        if (this.currentMonthLarge) {
            this.currentMonthLarge.textContent = monthYear;
        }
    }

    renderCalendarGridLarge() {
        if (!this.calendarGridLarge) return;
        
        this.calendarGridLarge.innerHTML = '';
        
        const dayHeaders = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        dayHeaders.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header-large';
            dayHeader.textContent = day;
            this.calendarGridLarge.appendChild(dayHeader);
        });

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        for (let i = firstDay - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            const dayElement = this.createDayElementLarge(day, true);
            this.calendarGridLarge.appendChild(dayElement);
        }

        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = day === today.getDate() && 
                           month === today.getMonth() && 
                           year === today.getFullYear();
            const dayElement = this.createDayElementLarge(day, false, isToday);
            this.calendarGridLarge.appendChild(dayElement);
        }

        const totalCells = this.calendarGridLarge.children.length;
        const remainingCells = 42 - totalCells;
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
        this.renderCalendarView();
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendarView();
    }

    renderAudioChannels() {
        if (!this.audioChannels) return;
        
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
        if (index < 0 || index >= YOUTUBE_CHANNELS.length) {
            console.error('Invalid channel index');
            return;
        }

        this.currentChannelIndex = index;
        const channel = YOUTUBE_CHANNELS[index];

        this.renderAudioChannels();
        this.loadYoutubePlayer(channel.videoId);
    }

    loadYoutubePlayer(videoId) {
        if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') {
            setTimeout(() => this.loadYoutubePlayer(videoId), 500);
            return;
        }

        if (this.youtubePlayer && typeof this.youtubePlayer.loadVideoById === 'function') {
            this.youtubePlayer.loadVideoById(videoId);
        } else {
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

    startTimer() {
        if (this.isTimerRunning) return;

        this.isTimerRunning = true;
        if (this.startBtn) this.startBtn.style.display = 'none';
        if (this.pauseBtn) this.pauseBtn.style.display = 'flex';

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
        if (this.pauseBtn) this.pauseBtn.style.display = 'none';
        if (this.startBtn) this.startBtn.style.display = 'flex';

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
            this.isWorkTime = false;
            this.timeRemaining = POMODORO_SETTINGS.breakDuration;
            this.totalTime = POMODORO_SETTINGS.breakDuration;
            alert('Work time complete! Time for a break.');
        } else {
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
        
        if (this.timerDisplay) {
            this.timerDisplay.textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        if (this.timerStatus) {
            this.timerStatus.textContent = this.isWorkTime ? 'Work Time' : 'Break Time';
        }

        if (this.timerProgress) {
            const progressPercent = ((this.totalTime - this.timeRemaining) / this.totalTime) * 100;
            this.timerProgress.style.width = progressPercent + '%';
        }

        if (this.pomodoroTimerBar) {
            if (this.isWorkTime) {
                this.pomodoroTimerBar.style.background = 'linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%)';
            } else {
                this.pomodoroTimerBar.style.background = 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)';
            }
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
    try {
        window.notebookApp = new NotebookApp();
        console.log('NotebookApp initialized successfully');
    } catch (error) {
        console.error('Error initializing NotebookApp:', error);
    }
});

// Also try window.onload as backup
window.addEventListener('load', () => {
    if (!window.notebookApp) {
        try {
            window.notebookApp = new NotebookApp();
        } catch (error) {
            console.error('Error initializing NotebookApp on load:', error);
        }
    }
});

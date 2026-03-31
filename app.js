// Built-in locked template pages (add your templates here)
const BUILT_IN_TEMPLATES = [
    // You can add locked pages here after exporting them
];

// YouTube Audio Channels Configuration
const YOUTUBE_CHANNELS = [
    {
        name: 'Channel 1',
        icon: '🎵',
        videoId: 'teWgiwkC6hM' // Use just the video ID from URL
    },
    {
        name: 'Channel 2',
        icon: '🎶',
        videoId: 'dQw4w9WgXcQ' // Replace with actual YouTube video ID
    },
    {
        name: 'Channel 3',
        icon: '🎼',
        videoId: 'VIDEO_ID_3' // Replace with actual YouTube video ID
    },
    {
        name: 'Channel 4',
        icon: '🎧',
        videoId: 'VIDEO_ID_4' // Replace with actual YouTube video ID
    }
];

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
        this.audioElement = null;
        
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
        this.toggleBtn = document.getElementById('toggleBtn');
        this.addPageBtn = document.getElementById('addPageBtn');
        this.editor = document.getElementById('editor');
        this.pageTitle = document.getElementById('pageTitle');
        this.boldBtn = document.getElementById('boldBtn');
        this.italicBtn = document.getElementById('italicBtn');
        this.underlineBtn = document.getElementById('underlineBtn');
        this.lockBtn = document.getElementById('lockBtn');
        this.lockIcon = document.getElementById('lockIcon');
        this.lockText = document.getElementById('lockText');
        this.zoomIn = document.getElementById('zoomIn');
        this.zoomOut = document.getElementById('zoomOut');
        this.zoomLevel = document.getElementById('zoomLevel');
        this.exportBtn = document.getElementById('exportBtn');
        this.importBtn = document.getElementById('importBtn');
        this.fileInput = document.getElementById('fileInput');
        
        // Calendar view
        this.calendarGridLarge = document.getElementById('calendarGridLarge');
        this.currentMonthLarge = document.getElementById('currentMonthLarge');
        this.prevMonthLarge = document.getElementById('prevMonthLarge');
        this.nextMonthLarge = document.getElementById('nextMonthLarge');
        this.backToPagesBtn = document.getElementById('backToPagesBtn');
        
        // Audio player elements
        this.audioChannels = document.getElementById('audioChannels');
        this.audioPlayerBar = document.getElementById('audioPlayerBar');
        this.nowPlaying = document.getElementById('nowPlaying');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.progressBar = document.getElementById('progressBar');
        this.currentTimeDisplay = document.getElementById('currentTime');
        this.durationDisplay = document.getElementById('duration');
        this.volumeControl = document.getElementById('volumeControl');
        this.volumePercent = document.getElementById('volumePercent');
        
        if (!this.boldBtn) console.error('boldBtn not found');
        if (!this.italicBtn) console.error('italicBtn not found');
        if (!this.underlineBtn) console.error('underlineBtn not found');
    }

    attachEventListeners() {
        // Navigation tabs
        this.pagesTab.addEventListener('click', () => this.switchView('pages'));
        this.calendarTab.addEventListener('click', () => this.switchView('calendar'));
        this.audioTab.addEventListener('click', () => this.switchView('audio'));

        // Sidebar toggle
        this.toggleBtn.addEventListener('click', () => {
            console.log('Toggle clicked');
            this.toggleSidebar();
        });

        // Add page
        this.addPageBtn.addEventListener('click', () => {
            console.log('Add page clicked');
            this.addPage();
        });

        // Format buttons
        this.boldBtn.addEventListener('click', (e) => {
            console.log('Bold clicked');
            e.preventDefault();
            this.formatText('bold');
        });
        
        this.italicBtn.addEventListener('click', (e) => {
            console.log('Italic clicked');
            e.preventDefault();
            this.formatText('italic');
        });
        
        this.underlineBtn.addEventListener('click', (e) => {
            console.log('Underline clicked');
            e.preventDefault();
            this.formatText('underline');
        });

        // Lock button
        this.lockBtn.addEventListener('click', () => {
            console.log('Lock button clicked');
            this.togglePageLock();
        });

        // Editor events
        this.editor.addEventListener('input', () => this.savePage());
        this.pageTitle.addEventListener('input', () => this.savePage());

        // Zoom controls
        this.zoomIn.addEventListener('click', () => {
            console.log('Zoom in clicked');
            this.zoom(10);
        });
        
        this.zoomOut.addEventListener('click', () => {
            console.log('Zoom out clicked');
            this.zoom(-10);
        });

        // Export/Import
        this.exportBtn.addEventListener('click', () => {
            console.log('Export clicked');
            this.exportLockedPages();
        });

        this.importBtn.addEventListener('click', () => {
            console.log('Import clicked');
            this.fileInput.click();
        });

        this.fileInput.addEventListener('change', (e) => {
            this.importLockedPages(e);
        });

        // Calendar view navigation
        this.prevMonthLarge.addEventListener('click', () => this.previousMonth());
        this.nextMonthLarge.addEventListener('click', () => this.nextMonth());
        this.backToPagesBtn.addEventListener('click', () => this.switchView('pages'));

        // Audio player controls
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.progressBar.addEventListener('input', (e) => this.seekAudio(e));
        this.volumeControl.addEventListener('input', (e) => {
            this.setVolume(e.target.value);
            this.volumePercent.textContent = e.target.value + '%';
        });

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

        if (view === 'pages') {
            this.pagesTab.classList.add('active');
            this.pagesContent.classList.add('active');
            this.pagesView.classList.add('active');
            this.calendarView.classList.remove('active');
        } else if (view === 'calendar') {
            this.calendarTab.classList.add('active');
            this.pagesContent.classList.remove('active');
            this.pagesView.classList.remove('active');
            this.calendarView.classList.add('active');
        } else if (view === 'audio') {
            this.audioTab.classList.add('active');
            this.audioContent.classList.add('active');
            this.pagesView.classList.remove('active');
            this.calendarView.classList.remove('active');
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

    updateActiveButtons() {
        this.boldBtn.classList.toggle('active', document.queryCommandState('bold'));
        this.italicBtn.classList.toggle('active', document.queryCommandState('italic'));
        this.underlineBtn.classList.toggle('active', document.queryCommandState('underline'));
    }

    zoom(delta) {
        this.zoomLevel = Math.max(80, Math.min(150, this.zoomLevel + delta));
        this.zoomLevel = Math.round(this.zoomLevel / 10) * 10;
        
        const zoomFactor = this.zoomLevel / 100;
        
        this.editor.style.fontSize = `${this.baseEditorFontSize * zoomFactor}px`;
        this.pageTitle.style.fontSize = `${this.basePageTitleFontSize * zoomFactor}px`;
        document.getElementById('zoomLevel').textContent = `${this.zoomLevel}%`;
    }

    toggleSidebar() {
        this.sidebar.classList.toggle('collapsed');
    }

    exportLockedPages() {
        const lockedPages = this.pages.filter(p => p.locked);
        
        if (lockedPages.length === 0) {
            alert('No locked pages to export. Lock some pages first!');
            return;
        }

        // Create export data
        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            templates: lockedPages.map(page => ({
                id: page.id,
                title: page.title,
                content: page.content,
                locked: true,
                isTemplate: true
            }))
        };

        // Create blob and download
        const dataStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `locked-pages-${new Date().getTime()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log('Export data:', exportData);
        alert(`Exported ${lockedPages.length} locked page(s)!\n\nTo make them permanent:\n1. Open the downloaded JSON file\n2. Copy the "templates" array\n3. Paste into BUILT_IN_TEMPLATES at the top of app.js`);
    }

    importLockedPages(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importData = JSON.parse(e.target.result);
                const templates = importData.templates || [];

                if (templates.length === 0) {
                    alert('No templates found in the file.');
                    return;
                }

                let addedCount = 0;
                templates.forEach(template => {
                    const exists = this.pages.some(p => p.id === template.id);
                    if (!exists) {
                        this.pages.push(template);
                        addedCount++;
                        console.log(`Imported template: ${template.title}`);
                    }
                });

                this.savePage();
                this.renderPagesList();
                alert(`Successfully imported ${addedCount} locked template(s)!`);

            } catch (error) {
                console.error('Error importing file:', error);
                alert('Error importing file. Make sure it\'s a valid locked pages export.');
            }
        };
        reader.readAsText(file);

        // Reset file input
        this.fileInput.value = '';
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
        this.nowPlaying.textContent = `Now Playing: ${channel.name}`;

        // Load YouTube video directly into the embedded player
        this.loadYoutubePlayer(channel.videoId);
    }

    loadYoutubePlayer(videoId) {
        console.log('Loading YouTube video:', videoId);

        const iframe = document.getElementById('youtubePlayer');
        
        if (!iframe) {
            console.error('YouTube player iframe not found');
            return;
        }

        // Set the src to load the YouTube video
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&fs=1&playsinline=1`;
        console.log('YouTube player loaded with video:', videoId);

        // Initialize audio element for volume control
        this.initializeYoutubeAPI();
    }

    initializeYoutubeAPI() {
        // Create hidden audio element for volume simulation
        if (!this.audioElement) {
            this.audioElement = document.createElement('audio');
            this.audioElement.id = 'audioPlayer';
            this.audioElement.style.display = 'none';
            document.body.appendChild(this.audioElement);
        }

        // Set initial volume
        if (this.audioElement) {
            this.audioElement.volume = this.volumeControl.value / 100;
        }
    }

    togglePlayPause() {
        const iframe = document.getElementById('youtubePlayer');
        
        if (!iframe || !iframe.src) {
            alert('Please select a channel first');
            return;
        }

        // YouTube embedded player has its own play/pause controls
        // User can click the play button directly on the embedded player
        console.log('Click the play button on the embedded YouTube player above');
        
        this.updatePlayPauseUI();
    }

    seekAudio(event) {
        // Seeking in YouTube iframe is handled by the embedded player controls
        console.log('Use the progress bar on the embedded YouTube player');
    }

    setVolume(value) {
        if (!this.audioElement) {
            this.initializeYoutubeAPI();
        }
        this.audioElement.volume = value / 100;
        console.log('Volume set to:', value + '%');
    }

    updateProgressBar() {
        // YouTube player handles its own progress bar
        // This is kept for compatibility
    }

    updateDuration() {
        // YouTube player handles its own duration display
        // This is kept for compatibility
    }

    updatePlayPauseUI() {
        // YouTube player has built-in controls
        const playIcon = this.playPauseBtn.querySelector('.play-icon');
        const pauseIcon = this.playPauseBtn.querySelector('.pause-icon');

        // Show play icon as default
        playIcon.style.display = 'inline-block';
        pauseIcon.style.display = 'none';
    }

    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
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

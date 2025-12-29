/**
 * Resume Scorer - Interactive JavaScript Application
 * Features: File upload, API calls, Chart.js visualizations, interactive UI
 */

class ResumeScorerApp {
    constructor() {
        this.charts = {};
        this.currentSessionId = null;
        this.isAnalyzing = false;
        this.animationDelay = 100;
        
        this.init();
    }

    init() {
        this.loadTheme();
        this.bindEvents();
        this.initializeCharts();
        this.setupFileUpload();
        this.setupAnimations();
        console.log('Resume Scorer App initialized');
    }

    bindEvents() {
        // Form submission
        const form = document.getElementById('resumeForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // File input change
        const fileInput = document.getElementById('resumeFile');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        // Action buttons
        const newAnalysisBtn = document.getElementById('newAnalysisBtn');
        if (newAnalysisBtn) {
            newAnalysisBtn.addEventListener('click', () => this.resetAnalysis());
        }


        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Help modal
        const helpToggle = document.getElementById('helpToggle');
        const helpModal = document.getElementById('helpModal');
        const helpModalBackdrop = document.getElementById('helpModalBackdrop');
        const closeHelpModal = document.getElementById('closeHelpModal');
        const closeHelpModalBtn = document.getElementById('closeHelpModalBtn');

        if (helpToggle) {
            helpToggle.addEventListener('click', () => this.showHelpModal());
        }

        if (closeHelpModal) {
            closeHelpModal.addEventListener('click', () => this.hideHelpModal());
        }

        if (closeHelpModalBtn) {
            closeHelpModalBtn.addEventListener('click', () => this.hideHelpModal());
        }

        if (helpModalBackdrop) {
            helpModalBackdrop.addEventListener('click', (e) => {
                if (e.target === helpModalBackdrop) {
                    this.hideHelpModal();
                }
            });
        }

        // Chart toggle buttons
        this.bindChartEvents();

        // Drag and drop
        this.setupDragAndDrop();

        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
    }

    setupFileUpload() {
        const fileInput = document.getElementById('resumeFile');
        const fileInfo = document.getElementById('fileInfo');
        
        if (!fileInput || !fileInfo) return;

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.displayFileInfo(file);
            }
        });
    }

    setupDragAndDrop() {
        const fileInputWrapper = document.querySelector('.file-input-wrapper');
        if (!fileInputWrapper) return;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            fileInputWrapper.addEventListener(eventName, this.preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            fileInputWrapper.addEventListener(eventName, () => {
                fileInputWrapper.classList.add('drag-over');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            fileInputWrapper.addEventListener(eventName, () => {
                fileInputWrapper.classList.remove('drag-over');
            }, false);
        });

        fileInputWrapper.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const fileInput = document.getElementById('resumeFile');
                fileInput.files = files;
                this.displayFileInfo(files[0]);
            }
        }, false);
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    displayFileInfo(file) {
        const fileInfo = document.getElementById('fileInfo');
        if (!fileInfo) return;

        const fileSize = this.formatFileSize(file.size);
        const fileName = file.name;
        
        fileInfo.innerHTML = `
            <div class="file-info-content">
                <i class="fas fa-file-pdf"></i>
                <div class="file-details">
                    <div class="file-name">${fileName}</div>
                    <div class="file-size">${fileSize}</div>
                </div>
            </div>
        `;
        
        fileInfo.classList.add('show');
        fileInfo.classList.add('fade-in');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        if (this.isAnalyzing) return;
        
        const formData = new FormData(e.target);
        const file = formData.get('resume');
        const jobDescription = formData.get('job_description');

        if (!file || !jobDescription.trim()) {
            this.showToast('Please select a resume file and enter a job description.', 'warning');
            return;
        }

        this.isAnalyzing = true;
        this.showLoadingState(true);
        this.showProgressBar();

        try {
            const response = await fetch('/rater', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            this.currentSessionId = result.session_id;
            
            await this.displayResults(result.analysis_result);
            this.showToast('Resume analysis completed successfully!', 'success');
            
        } catch (error) {
            console.error('Analysis failed:', error);
            this.showToast('Analysis failed. Please try again.', 'error');
        } finally {
            this.isAnalyzing = false;
            this.showLoadingState(false);
            this.hideProgressBar();
        }
    }

    showLoadingState(show) {
        const submitBtn = document.getElementById('submitBtn');
        const spinner = document.getElementById('loadingSpinner');
        
        if (submitBtn) {
            submitBtn.disabled = show;
            if (show) {
                submitBtn.classList.add('loading');
            } else {
                submitBtn.classList.remove('loading');
            }
        }

        if (spinner) {
            if (show) {
                spinner.classList.add('show');
            } else {
                spinner.classList.remove('show');
            }
        }
    }

    showProgressBar() {
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressBar.innerHTML = '<div class="progress-fill" style="width: 0%"></div>';
        
        const uploadCard = document.querySelector('.upload-card');
        if (uploadCard) {
            uploadCard.appendChild(progressBar);
            
            // Animate progress
            setTimeout(() => {
                const fill = progressBar.querySelector('.progress-fill');
                if (fill) {
                    fill.style.width = '100%';
                }
            }, 100);
        }
    }

    hideProgressBar() {
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.remove();
        }
    }

    async displayResults(analysisResult) {
        const resultsSection = document.getElementById('resultsSection');
        if (!resultsSection) return;

        // Show results section with animation
        resultsSection.style.display = 'block';
        resultsSection.classList.add('fade-in');

        // Update session ID
        const sessionIdElement = document.getElementById('sessionId');
        if (sessionIdElement) {
            sessionIdElement.textContent = this.currentSessionId;
        }

        // Update overall score
        this.updateOverallScore(analysisResult);

        // Create charts with animation delays
        await this.createCharts(analysisResult);

        // Update additional content
        this.updateAdditionalContent(analysisResult);

        // Animate elements in sequence
        this.animateResults();
    }

    updateOverallScore(analysisResult) {
        const scoreElement = document.getElementById('overallScore');
        const descriptionElement = document.getElementById('scoreDescription');
        
        if (scoreElement && analysisResult.overall_score !== undefined) {
            this.animateScore(scoreElement, analysisResult.overall_score);
        }

        if (descriptionElement && analysisResult.score_description) {
            descriptionElement.textContent = analysisResult.score_description;
        }
    }

    animateScore(element, targetScore) {
        let currentScore = 0;
        const increment = targetScore / 50;
        const timer = setInterval(() => {
            currentScore += increment;
            if (currentScore >= targetScore) {
                currentScore = targetScore;
                clearInterval(timer);
            }
            element.textContent = Math.round(currentScore);
        }, 30);
    }

    async createCharts(analysisResult) {
        const chartConfigs = [
            {
                id: 'skillsChart',
                type: 'radar',
                data: this.prepareSkillsData(analysisResult),
                title: 'Skills Analysis'
            },
            {
                id: 'experienceChart',
                type: 'doughnut',
                data: this.prepareExperienceData(analysisResult),
                title: 'Experience Match'
            },
            {
                id: 'educationChart',
                type: 'bar',
                data: this.prepareEducationData(analysisResult),
                title: 'Education Fit'
            },
            {
                id: 'complianceChart',
                type: 'polarArea',
                data: this.prepareComplianceData(analysisResult),
                title: 'Job Compliance'
            }
        ];

        for (let i = 0; i < chartConfigs.length; i++) {
            const config = chartConfigs[i];
            await this.delay(this.animationDelay * i);
            this.createChart(config);
        }
    }

    prepareSkillsData(analysisResult) {
        const skills = analysisResult.skills_match || {};
        const labels = Object.keys(skills);
        const values = Object.values(skills);

        return {
            labels: labels,
            datasets: [{
                label: 'Skills Match',
                data: values,
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(99, 102, 241, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(99, 102, 241, 1)'
            }]
        };
    }

    prepareExperienceData(analysisResult) {
        const experience = analysisResult.experience_match || {};
        const labels = Object.keys(experience);
        const values = Object.values(experience);

        return {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(6, 182, 212, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)'
                ],
                borderColor: [
                    'rgba(99, 102, 241, 1)',
                    'rgba(139, 92, 246, 1)',
                    'rgba(6, 182, 212, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(245, 158, 11, 1)'
                ],
                borderWidth: 2
            }]
        };
    }

    prepareEducationData(analysisResult) {
        const education = analysisResult.education_match || {};
        const labels = Object.keys(education);
        const values = Object.values(education);

        return {
            labels: labels,
            datasets: [{
                label: 'Education Match',
                data: values,
                backgroundColor: 'rgba(99, 102, 241, 0.6)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 2,
                borderRadius: 4,
                borderSkipped: false
            }]
        };
    }

    prepareComplianceData(analysisResult) {
        const compliance = analysisResult.job_compliance || {};
        const labels = Object.keys(compliance);
        const values = Object.values(compliance);

        return {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    'rgba(99, 102, 241, 0.7)',
                    'rgba(139, 92, 246, 0.7)',
                    'rgba(6, 182, 212, 0.7)',
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(245, 158, 11, 0.7)',
                    'rgba(239, 68, 68, 0.7)'
                ],
                borderColor: [
                    'rgba(99, 102, 241, 1)',
                    'rgba(139, 92, 246, 1)',
                    'rgba(6, 182, 212, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(239, 68, 68, 1)'
                ],
                borderWidth: 2
            }]
        };
    }

    createChart(config) {
        const canvas = document.getElementById(config.id);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.charts[config.id]) {
            this.charts[config.id].destroy();
        }

        const chartOptions = this.getChartOptions(config.type);
        
        this.charts[config.id] = new Chart(ctx, {
            type: config.type,
            data: config.data,
            options: chartOptions
        });

        // Add animation class to chart container
        const chartContainer = canvas.closest('.chart-container');
        if (chartContainer) {
            chartContainer.classList.add('scale-in');
        }
    }

    getChartOptions(type) {
        const baseOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#cbd5e1',
                        font: {
                            family: 'Inter, sans-serif'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(30, 41, 59, 0.95)',
                    titleColor: '#f8fafc',
                    bodyColor: '#cbd5e1',
                    borderColor: '#475569',
                    borderWidth: 1,
                    cornerRadius: 8
                }
            },
            scales: type !== 'radar' && type !== 'doughnut' && type !== 'polarArea' ? {
                x: {
                    ticks: {
                        color: '#94a3b8'
                    },
                    grid: {
                        color: '#334155'
                    }
                },
                y: {
                    ticks: {
                        color: '#94a3b8'
                    },
                    grid: {
                        color: '#334155'
                    },
                    beginAtZero: true,
                    max: 100
                }
            } : {},
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        };

        if (type === 'radar') {
            baseOptions.scales = {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        color: '#94a3b8',
                        stepSize: 20
                    },
                    grid: {
                        color: '#334155'
                    },
                    pointLabels: {
                        color: '#cbd5e1',
                        font: {
                            size: 12
                        }
                    }
                }
            };
        }

        return baseOptions;
    }

    updateAdditionalContent(analysisResult) {
        // Update additional points
        const additionalPointsElement = document.getElementById('additionalPoints');
        if (additionalPointsElement && analysisResult.additional_points) {
            additionalPointsElement.innerHTML = this.formatAdditionalPoints(analysisResult.additional_points);
        }

        // Update improvements list
        const improvementsListElement = document.getElementById('improvementsList');
        if (improvementsListElement && analysisResult.improvements) {
            improvementsListElement.innerHTML = this.formatImprovements(analysisResult.improvements);
        }
    }

    formatAdditionalPoints(points) {
        if (Array.isArray(points)) {
            return points.map(point => `<div class="point-item slide-in-left">• ${point}</div>`).join('');
        }
        return `<div class="point-item slide-in-left">${points}</div>`;
    }

    formatImprovements(improvements) {
        if (Array.isArray(improvements)) {
            return improvements.map((improvement, index) => `
                <div class="improvement-item slide-in-right" style="animation-delay: ${index * 0.1}s">
                    <i class="fas fa-lightbulb"></i>
                    <div class="improvement-text">${improvement}</div>
                </div>
            `).join('');
        }
        return `
            <div class="improvement-item slide-in-right">
                <i class="fas fa-lightbulb"></i>
                <div class="improvement-text">${improvements}</div>
            </div>
        `;
    }

    animateResults() {
        const elements = document.querySelectorAll('.chart-card, .additional-points-card, .improvements-card');
        elements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('fade-in');
            }, index * this.animationDelay);
        });
    }

    resetAnalysis() {
        // Hide results section
        const resultsSection = document.getElementById('resultsSection');
        if (resultsSection) {
            resultsSection.style.display = 'none';
            resultsSection.classList.remove('fade-in');
        }

        // Reset form
        const form = document.getElementById('resumeForm');
        if (form) {
            form.reset();
        }

        // Clear file info
        const fileInfo = document.getElementById('fileInfo');
        if (fileInfo) {
            fileInfo.classList.remove('show');
            fileInfo.innerHTML = '';
        }

        // Destroy charts
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};

        // Reset session ID
        this.currentSessionId = null;

        // Show upload section
        const uploadSection = document.getElementById('uploadSection');
        if (uploadSection) {
            uploadSection.scrollIntoView({ behavior: 'smooth' });
        }

        this.showToast('Ready for new analysis', 'info');
    }

    downloadReport() {
        if (!this.currentSessionId) {
            this.showToast('No analysis data available to download', 'warning');
            return;
        }

        // Create a comprehensive report
        const reportData = this.generateReportData();
        this.downloadJSON(reportData, `resume-analysis-${this.currentSessionId}.json`);
        this.showToast('Report downloaded successfully', 'success');
    }

    generateReportData() {
        const report = {
            session_id: this.currentSessionId,
            timestamp: new Date().toISOString(),
            charts_data: {},
            analysis_summary: {
                overall_score: document.getElementById('overallScore')?.textContent || 'N/A',
                score_description: document.getElementById('scoreDescription')?.textContent || 'N/A'
            }
        };

        // Add chart data
        Object.keys(this.charts).forEach(chartId => {
            if (this.charts[chartId]) {
                report.charts_data[chartId] = {
                    type: this.charts[chartId].config.type,
                    data: this.charts[chartId].data
                };
            }
        });

        return report;
    }

    downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${this.getToastIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(toast);

        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        // Hide toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    setupAnimations() {
        // Add intersection observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        const animatedElements = document.querySelectorAll('.upload-card, .chart-card, .additional-points-card, .improvements-card');
        animatedElements.forEach(el => observer.observe(el));
    }

    initializeCharts() {
        // Initialize empty charts or placeholder charts
        const chartIds = ['skillsChart', 'experienceChart', 'educationChart', 'complianceChart'];
        
        chartIds.forEach(chartId => {
            const canvas = document.getElementById(chartId);
            if (canvas) {
                const ctx = canvas.getContext('2d');
                this.charts[chartId] = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['No Data'],
                        datasets: [{
                            data: [100],
                            backgroundColor: ['rgba(51, 65, 85, 0.8)'],
                            borderColor: ['rgba(71, 85, 105, 1)'],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                enabled: false
                            }
                        }
                    }
                });
            }
        });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    toggleTheme() {
        const body = document.body;
        const themeToggle = document.getElementById('themeToggle');
        const icon = themeToggle.querySelector('i');
        
        // Toggle between dark and light theme
        if (body.classList.contains('light-theme')) {
            body.classList.remove('light-theme');
            icon.className = 'fas fa-moon';
            localStorage.setItem('theme', 'dark');
            this.showToast('Switched to dark theme', 'info');
        } else {
            body.classList.add('light-theme');
            icon.className = 'fas fa-sun';
            localStorage.setItem('theme', 'light');
            this.showToast('Switched to light theme', 'info');
        }
    }

    showHelpModal() {
        const modal = document.getElementById('helpModal');
        const backdrop = document.getElementById('helpModalBackdrop');
        
        if (modal && backdrop) {
            backdrop.classList.add('show');
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    hideHelpModal() {
        const modal = document.getElementById('helpModal');
        const backdrop = document.getElementById('helpModalBackdrop');
        
        if (modal && backdrop) {
            backdrop.classList.remove('show');
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    bindChartEvents() {
        const chartToggles = document.querySelectorAll('.chart-toggle');
        chartToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                const chartCard = e.target.closest('.chart-card');
                const chartId = chartCard.querySelector('canvas').id;
                this.toggleChartFullscreen(chartId);
            });
        });
    }

    toggleChartFullscreen(chartId) {
        const chartCard = document.querySelector(`#${chartId}`).closest('.chart-card');
        const toggleBtn = chartCard.querySelector('.chart-toggle i');
        
        if (chartCard.classList.contains('fullscreen')) {
            chartCard.classList.remove('fullscreen');
            toggleBtn.className = 'fas fa-expand';
            document.body.style.overflow = '';
        } else {
            chartCard.classList.add('fullscreen');
            toggleBtn.className = 'fas fa-compress';
            document.body.style.overflow = 'hidden';
        }
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        const themeToggle = document.getElementById('themeToggle');
        const icon = themeToggle?.querySelector('i');
        
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            if (icon) icon.className = 'fas fa-sun';
        } else {
            if (icon) icon.className = 'fas fa-moon';
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter to submit form
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                const form = document.getElementById('resumeForm');
                if (form && !this.isAnalyzing) {
                    form.dispatchEvent(new Event('submit'));
                }
            }
            
            // Escape to close modals
            if (e.key === 'Escape') {
                this.hideHelpModal();
                
                // Close fullscreen charts
                const fullscreenChart = document.querySelector('.chart-card.fullscreen');
                if (fullscreenChart) {
                    fullscreenChart.classList.remove('fullscreen');
                    const toggleBtn = fullscreenChart.querySelector('.chart-toggle i');
                    if (toggleBtn) toggleBtn.className = 'fas fa-expand';
                    document.body.style.overflow = '';
                }
            }
            
            // F1 to show help
            if (e.key === 'F1') {
                e.preventDefault();
                this.showHelpModal();
            }
            
            // Ctrl/Cmd + T to toggle theme
            if ((e.ctrlKey || e.metaKey) && e.key === 't') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.resumeScorerApp = new ResumeScorerApp();
});

// Add CSS for drag and drop
const dragDropCSS = `
.file-input-wrapper.drag-over {
    border-color: var(--primary-color) !important;
    background: var(--bg-tertiary) !important;
    transform: scale(1.02);
}

.file-info-content {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
}

.file-details {
    display: flex;
    flex-direction: column;
}

.file-name {
    font-weight: 600;
    color: var(--text-primary);
}

.file-size {
    font-size: 0.9rem;
    color: var(--text-secondary);
}

.toast-content {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
}

.submit-btn.loading {
    opacity: 0.7;
    cursor: not-allowed;
}

.point-item {
    margin-bottom: var(--space-sm);
    padding: var(--space-sm);
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
    border-left: 3px solid var(--primary-color);
}
`;

// Inject CSS
const style = document.createElement('style');
style.textContent = dragDropCSS;
document.head.appendChild(style);

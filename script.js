// GoalPulse - Personal Goal & Streak Tracker JavaScript

class GoalPulse {
    constructor() {
        this.goals = [];
        this.pieChart = null;
        this.lineChart = null;
        
        // Enhanced Categories with Colors
        this.goalCategories = {
            'Study': { icon: '📚', color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.1)' },
            'Fitness': { icon: '💪', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)' },
            'Coding': { icon: '💻', color: '#8B5CF6', bgColor: 'rgba(139, 92, 246, 0.1)' },
            'Personal': { icon: '🌱', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)' },
            'Work': { icon: '💼', color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
            'Health': { icon: '🏥', color: '#06B6D4', bgColor: 'rgba(6, 182, 212, 0.1)' },
            'Finance': { icon: '💰', color: '#84CC16', bgColor: 'rgba(132, 204, 22, 0.1)' },
            'Learning': { icon: '🎓', color: '#F97316', bgColor: 'rgba(249, 115, 22, 0.1)' },
            'Custom': { icon: '✨', color: '#EC4899', bgColor: 'rgba(236, 72, 153, 0.1)' }
        };
        
        // Priority Levels
        this.priorityLevels = {
            'High': { color: '#EF4444', icon: '🔴', weight: 3 },
            'Medium': { color: '#F59E0B', icon: '🟡', weight: 2 },
            'Low': { color: '#10B981', icon: '🟢', weight: 1 }
        };
        
        // Theme System
        this.currentTheme = localStorage.getItem('goalPulseTheme') || 'dark';
        
        // Sound Effects
        this.soundEnabled = localStorage.getItem('goalPulseSound') !== 'false';
        
        // Enhanced Streak System
        this.streakFreezes = 3;
        this.lastFreezeReset = new Date().getMonth();
        this.unlockedRewards = new Set();
        this.combinedStreak = 0;
        
        // Streak Rewards Configuration
        this.streakRewards = {
            3: { title: '🌟 Streak Starter', description: 'You\'re on fire! Keep going!', feature: 'custom_themes' },
            7: { title: '🔥 Week Warrior', description: 'A full week of consistency!', feature: 'advanced_analytics' },
            14: { title: '⚡ Two Week Titan', description: 'Unstoppable consistency!', feature: 'goal_templates' },
            30: { title: '🏆 Monthly Master', description: '30 days of dedication!', feature: 'export_data' },
            50: { title: '💎 Diamond Streak', description: 'Elite level consistency!', feature: 'custom_badges' },
            100: { title: '👑 Century Champion', description: '100 days - Legendary!', feature: 'premium_features' }
        };
        
        this.motivationQuotes = [
            "Success is the sum of small efforts repeated day in and day out.",
            "The secret of getting ahead is getting started.",
            "Don't watch the clock; do what it does. Keep going.",
            "A goal without a plan is just a wish.",
            "Progress is impossible without change.",
            "The only way to do great work is to love what you do.",
            "Believe you can and you're halfway there.",
            "Your limitation—it's only your imagination."
        ];
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.initCharts(); // Initialize charts first
        this.updateUI();
        this.updateDate();
        this.updateMotivation();
    }

    // Data Management
    loadData() {
        const savedData = localStorage.getItem('goalPulseData');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.goals = data.goals || [];
            this.streakFreezes = data.streakFreezes || 3;
            this.lastFreezeReset = data.lastFreezeReset || new Date().getMonth();
            this.unlockedRewards = new Set(data.unlockedRewards || []);
            this.combinedStreak = data.combinedStreak || 0;
        }
        
        // Load theme preference
        this.currentTheme = localStorage.getItem('goalPulseTheme') || 'dark';
        this.applyTheme();
        
        // Load sound preference
        this.soundEnabled = localStorage.getItem('goalPulseSound') !== 'false';
    }

    saveData() {
        const data = {
            goals: this.goals,
            streakFreezes: this.streakFreezes,
            lastFreezeReset: this.lastFreezeReset,
            unlockedRewards: Array.from(this.unlockedRewards),
            combinedStreak: this.combinedStreak
        };
        localStorage.setItem('goalPulseData', JSON.stringify(data));
    }
    
    // Sound Effects System
    playSound(type) {
        if (!this.soundEnabled) return;
        
        // Create audio context for sound effects
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch(type) {
            case 'complete':
                oscillator.frequency.value = 523.25; // C5 (success sound)
                gainNode.gain.value = 0.3;
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.1);
                break;
            case 'achievement':
                oscillator.frequency.value = 659.25; // E5 (achievement sound)
                gainNode.gain.value = 0.3;
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.15);
                break;
            case 'button':
                oscillator.frequency.value = 440; // A4 (button click)
                gainNode.gain.value = 0.1;
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.05);
                break;
            case 'error':
                oscillator.frequency.value = 220; // A3 (error sound)
                gainNode.gain.value = 0.2;
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.1);
                break;
        }
    }
    
    // Theme System
    applyTheme() {
        document.body.className = this.currentTheme + '-theme';
        
        // Update theme toggle button
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.textContent = this.currentTheme === 'dark' ? '🌙' : '☀️';
        }
    }
    
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('goalPulseTheme', this.currentTheme);
        this.applyTheme();
        this.playSound('button');
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        localStorage.setItem('goalPulseSound', this.soundEnabled.toString());
        this.playSound('button');
        
        const soundToggle = document.getElementById('soundToggle');
        if (soundToggle) {
            soundToggle.textContent = this.soundEnabled ? '🔊' : '🔇';
        }
        
        this.showNotification(this.soundEnabled ? 'Sound effects enabled!' : 'Sound effects disabled!', 'info');
    }

    // UI Updates
    updateUI() {
        this.updateStats();
        this.generateConsistencyHeatmap();
        this.renderGoals();
        this.updateCharts();
        this.updateBadges();
        this.renderCalendar();
        this.updateFreezeDisplay();
        this.resetFreezesMonthly();
        this.updateQuickStats();
        this.toggleEmptyState();
    }

    updateDate() {
        const dateElement = document.getElementById('currentDate');
        const today = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = today.toLocaleDateString('en-US', options);
    }

    updateMotivation() {
        const motivationElement = document.getElementById('motivationText');
        const randomQuote = this.motivationQuotes[Math.floor(Math.random() * this.motivationQuotes.length)];
        motivationElement.textContent = `"${randomQuote}"`;
    }

    // Consistency Heatmap
    generateConsistencyHeatmap() {
        const heatmapContainer = document.getElementById('heatmapContainer');
        const lastYearData = this.getLastYearActivityData();
        
        // Clear previous content
        heatmapContainer.innerHTML = '';
        
        // Create main container
        const mainContainer = document.createElement('div');
        mainContainer.style.display = 'flex';
        mainContainer.style.flexDirection = 'column';
        mainContainer.style.gap = '8px';
        
        // Create month labels row
        const monthsRow = document.createElement('div');
        monthsRow.style.display = 'flex';
        monthsRow.style.gap = '8px';
        monthsRow.style.marginBottom = '4px';
        monthsRow.style.alignItems = 'flex-start';
        
        // Create days grid
        const daysGrid = document.createElement('div');
        daysGrid.style.display = 'flex';
        daysGrid.style.gap = '8px';
        daysGrid.style.alignItems = 'flex-start';
        
        // Group data by months with calendar structure
        const monthlyData = this.groupDataByMonthsCalendar(lastYearData);
        
        monthlyData.forEach((monthData) => {
            // Create month container
            const monthContainer = document.createElement('div');
            monthContainer.className = 'heatmap-month-container';
            
            // Create calendar grid for this month (6 weeks x 7 days)
            const calendarGrid = document.createElement('div');
            calendarGrid.className = 'heatmap-calendar-grid';
            
            // Add day headers (Sun, Mon, Tue, Wed, Thu, Fri, Sat)
            const dayHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
            dayHeaders.forEach((header, index) => {
                const dayHeader = document.createElement('div');
                dayHeader.className = 'heatmap-day-header';
                dayHeader.textContent = header;
                dayHeader.style.opacity = index === 0 || index === 6 ? '0.5' : '0.3'; // Weekend dimmer
                calendarGrid.appendChild(dayHeader);
            });
            
            // Add empty cells for days before month starts
            for (let i = 0; i < monthData.startDayOfWeek; i++) {
                const emptyDay = document.createElement('div');
                emptyDay.className = 'heatmap-day empty';
                calendarGrid.appendChild(emptyDay);
            }
            
            // Add actual days of the month (max 30 days as requested)
            for (let day = 0; day < Math.min(30, monthData.days.length); day++) {
                const dayData = monthData.days[day];
                const dayElement = document.createElement('div');
                dayElement.className = 'heatmap-day';
                
                if (dayData.activities > 0) {
                    // Calculate completion percentage for this day
                    const completionPercentage = (dayData.activities / this.goals.length) * 100;
                    
                    // Color based on completion percentage
                    let level;
                    if (completionPercentage === 100) {
                        level = 5; // Bright green - all goals completed
                        dayElement.style.background = 'rgb(14, 255, 102)'; // Bright green
                    } else if (completionPercentage >= 75) {
                        level = 4;
                        dayElement.style.background = 'rgba(34, 197, 94, 0.8)'; // Dark green
                    } else if (completionPercentage >= 50) {
                        level = 3;
                        dayElement.style.background = 'rgba(34, 197, 94, 0.6)'; // Medium green
                    } else if (completionPercentage >= 25) {
                        level = 2;
                        dayElement.style.background = 'rgba(34, 197, 94, 0.4)'; // Light green
                    } else {
                        level = 1;
                        dayElement.style.background = 'rgba(34, 197, 94, 0.2)'; // Very light green
                    }
                    
                    dayElement.title = `${dayData.date}: ${dayData.activities}/${this.goals.length} goals completed (${Math.round(completionPercentage)}%)`;
                } else {
                    dayElement.title = `${dayData.date}: No activity`;
                }
                
                // Add hover effect
                dayElement.addEventListener('mouseenter', () => {
                    dayElement.style.transform = 'scale(1.2)';
                });
                dayElement.addEventListener('mouseleave', () => {
                    dayElement.style.transform = 'scale(1)';
                });
                
                calendarGrid.appendChild(dayElement);
            }
            
            // Fill remaining cells to complete the calendar grid
            const totalCells = calendarGrid.children.length - 7; // Subtract headers
            const remainingCells = (6 * 7) - totalCells; // 6 weeks x 7 days
            for (let i = 0; i < remainingCells; i++) {
                const emptyDay = document.createElement('div');
                emptyDay.className = 'heatmap-day empty';
                calendarGrid.appendChild(emptyDay);
            }
            
            monthContainer.appendChild(calendarGrid);
            daysGrid.appendChild(monthContainer);
            
            // Add month label
            const monthLabel = document.createElement('div');
            monthLabel.className = 'heatmap-month-label';
            monthLabel.textContent = monthData.name;
            monthsRow.appendChild(monthLabel);
        });
        
        mainContainer.appendChild(monthsRow);
        mainContainer.appendChild(daysGrid);
        heatmapContainer.appendChild(mainContainer);
        
        this.updateHeatmapStats(lastYearData);
    }

    groupDataByMonthsCalendar(lastYearData) {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyData = [];
        
        if (lastYearData.length === 0) return monthlyData;
        
        // Get current month to determine which months to show
        const today = new Date();
        const currentMonth = today.getMonth();
        
        // Create array of months to show (starting from January up to current month)
        const monthsToShow = [];
        for (let i = 0; i <= currentMonth; i++) {
            monthsToShow.push(i);
        }
        
        // Process each month in chronological order
        monthsToShow.forEach(monthIndex => {
            const monthDays = lastYearData.filter(day => {
                const date = new Date(day.date);
                return date.getMonth() === monthIndex;
            });
            
            if (monthDays.length > 0) {
                // Calculate start day of week for this month
                const firstDate = new Date(monthDays[0].date);
                const startDayOfWeek = firstDate.getDay();
                
                monthlyData.push({
                    name: monthNames[monthIndex],
                    days: monthDays.slice(0, 30), // Limit to 30 days
                    startDayOfWeek: startDayOfWeek
                });
            }
        });
        
        return monthlyData;
    }

    calculateMonthPositionsForGrid(lastYearData, emptyDaysAtStart) {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthPositions = [];
        
        if (lastYearData.length === 0) return monthPositions;
        
        let currentMonth = null;
        let monthStartWeek = 0;
        let weekCount = 0;
        
        lastYearData.forEach((day, index) => {
            const date = new Date(day.date);
            const monthIndex = date.getMonth();
            
            if (currentMonth !== monthIndex) {
                if (currentMonth !== null) {
                    monthPositions.push({
                        name: monthNames[currentMonth],
                        startWeek: monthStartWeek,
                        weeks: weekCount
                    });
                }
                currentMonth = monthIndex;
                // Calculate which week this month starts in (considering empty days)
                monthStartWeek = Math.floor((index + emptyDaysAtStart) / 7);
                weekCount = 0;
            }
            
            // Calculate how many weeks this month spans
            weekCount = Math.floor((index + emptyDaysAtStart) / 7) - monthStartWeek + 1;
        });
        
        // Add the last month
        if (currentMonth !== null) {
            monthPositions.push({
                name: monthNames[currentMonth],
                startWeek: monthStartWeek,
                weeks: weekCount
            });
        }
        
        return monthPositions;
    }

    groupDataByWeeks(lastYearData) {
        const weeks = [];
        let currentWeek = [];
        
        lastYearData.forEach((day, index) => {
            currentWeek.push(day);
            
            // Start new week every 7 days or at the end
            if (currentWeek.length === 7 || index === lastYearData.length - 1) {
                weeks.push({
                    days: [...currentWeek]
                });
                currentWeek = [];
            }
        });
        
        return weeks;
    }

    generateMonthLabels(lastYearData) {
        const months = [];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        let currentMonth = null;
        let weekCount = 0;
        
        lastYearData.forEach((day, index) => {
            const date = new Date(day.date);
            const monthIndex = date.getMonth();
            const monthName = monthNames[monthIndex];
            
            if (currentMonth !== monthIndex) {
                if (currentMonth !== null) {
                    months.push({
                        name: monthNames[currentMonth],
                        weeks: weekCount
                    });
                }
                currentMonth = monthIndex;
                weekCount = 0;
            }
            
            // Count weeks for this month
            if (index % 7 === 0) {
                weekCount++;
            }
        });
        
        // Add the last month
        if (currentMonth !== null) {
            months.push({
                name: monthNames[currentMonth],
                weeks: weekCount
            });
        }
        
        return months;
    }

    getLastYearActivityData() {
        const days = [];
        const today = new Date();
        
        // Start from 12 months ago and go up to today
        const startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 11);
        startDate.setDate(1); // Start from 1st of the month
        
        // Generate data from 12 months ago to today
        const currentDate = new Date(startDate);
        while (currentDate <= today) {
            const dateString = currentDate.toISOString().split('T')[0];
            
            let activities = 0;
            this.goals.forEach(goal => {
                if (goal.progress[dateString] === true) {
                    activities++;
                }
            });
            
            days.push({
                date: dateString,
                activities: activities
            });
            
            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return days;
    }

    updateHeatmapStats(lastYearData) {
        const activeDays = lastYearData.filter(day => day.activities > 0).length;
        const totalActivities = lastYearData.reduce((sum, day) => sum + day.activities, 0);
        const currentStreak = this.calculateCurrentStreak(lastYearData);
        
        document.getElementById('totalActivities').textContent = `${totalActivities} activities in the last year`;
        document.getElementById('activeDaysCount').textContent = activeDays;
        document.getElementById('currentStreakCount').textContent = currentStreak;
    }

    calculateCurrentStreak(lastYearData) {
        let currentStreak = 0;
        
        // Start from the most recent day and count backwards
        for (let i = lastYearData.length - 1; i >= 0; i--) {
            const day = lastYearData[i];
            
            if (day.activities > 0) {
                currentStreak++;
            } else {
                break; // Streak broken
            }
        }
        
        return currentStreak;
    }

    // Stats Calculation
    updateStats() {
        const totalGoals = this.goals.length;
        const bestStreak = this.calculateBestStreak();
        const consistencyRate = this.calculateConsistencyRate();
        const badgeCount = this.calculateBadgeCount();

        document.getElementById('totalGoals').textContent = totalGoals;
        document.getElementById('bestStreak').textContent = bestStreak;
        document.getElementById('consistencyRate').textContent = `${consistencyRate}%`;
        document.getElementById('badgeCount').textContent = badgeCount;
    }

    calculateBestStreak() {
        if (this.goals.length === 0) return 0;
        return Math.max(...this.goals.map(goal => goal.longestStreak || 0));
    }

    calculateConsistencyRate() {
        if (this.goals.length === 0) return 0;
        
        let totalDays = 0;
        let completedDays = 0;

        this.goals.forEach(goal => {
            if (goal.progress) {
                Object.keys(goal.progress).forEach(date => {
                    totalDays++;
                    if (goal.progress[date]) {
                        completedDays++;
                    }
                });
            }
        });

        return totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
    }

    calculateBadgeCount() {
        const allBadges = new Set();
        this.goals.forEach(goal => {
            if (goal.badges) {
                goal.badges.forEach(badge => allBadges.add(badge));
            }
        });
        return allBadges.size;
    }

    // Goal Management
    addGoal(goalData) {
        const goal = {
            id: this.generateId(),
            title: goalData.title,
            category: goalData.category,
            priority: goalData.priority || 'Medium',
            createdAt: goalData.startDate,
            progress: {},
            currentStreak: 0,
            longestStreak: 0,
            badges: []
        };

        this.goals.push(goal);
        this.saveData();
        this.updateUI();
        this.playSound('achievement');
        this.showNotification('Goal added successfully!', 'success');
    }

    deleteGoal(goalId) {
        this.goals = this.goals.filter(goal => goal.id !== goalId);
        this.saveData();
        this.updateUI();
        this.showNotification('Goal deleted successfully!', 'success');
    }

    // Progress Tracking
    markGoalComplete(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (!goal) return;

        const today = this.getTodayString();
        
        // Check if already marked today
        if (goal.progress[today]) {
            this.playSound('error');
            this.showNotification('Already marked as complete today!', 'warning');
            return;
        }

        // Mark today as complete
        goal.progress[today] = true;

        // Add completion animation
        this.animateGoalCompletion(goalId);

        // Update streaks
        this.updateStreaks(goal);

        // Check for badges
        this.checkAndAwardBadges(goal);

        this.saveData();
        this.updateUI();
        
        // Force update badges after UI update
        setTimeout(() => {
            this.updateBadges();
        }, 100);
        
        this.playSound('complete');
        this.showNotification('Great job! Goal marked as complete! 🔥', 'success');
    }
    
    animateGoalCompletion(goalId) {
        const goalCard = document.querySelector(`[data-goal-id="${goalId}"]`);
        if (!goalCard) return;
        
        // Add completion animation
        goalCard.style.animation = 'goalComplete 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        
        // Create confetti effect
        this.createConfetti(goalCard);
        
        // Add glow effect
        goalCard.style.boxShadow = '0 0 30px rgba(34, 197, 94, 0.8)';
        
        setTimeout(() => {
            goalCard.style.animation = '';
            goalCard.style.boxShadow = '';
        }, 600);
    }
    
    createConfetti(element) {
        const rect = element.getBoundingClientRect();
        const colors = ['#22C55E', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];
        
        for (let i = 0; i < 20; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: 8px;
                height: 8px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${rect.left + rect.width / 2}px;
                top: ${rect.top + rect.height / 2}px;
                pointer-events: none;
                z-index: 10000;
                border-radius: 50%;
            `;
            
            document.body.appendChild(confetti);
            
            const angle = (Math.PI * 2 * i) / 20;
            const velocity = 5 + Math.random() * 5;
            const lifetime = 1000 + Math.random() * 1000;
            
            confetti.animate([
                { 
                    transform: 'translate(0, 0) scale(1)',
                    opacity: 1
                },
                { 
                    transform: `translate(${Math.cos(angle) * velocity * 20}px, ${Math.sin(angle) * velocity * 20 + 50}px) scale(0)`,
                    opacity: 0
                }
            ], {
                duration: lifetime,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
            });
            
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.parentNode.removeChild(confetti);
                }
            }, lifetime);
        }
    }
    
    animateStatUpdate(statId, newValue) {
        const statElement = document.getElementById(statId);
        if (!statElement) return;
        
        const oldValue = parseInt(statElement.textContent) || 0;
        const duration = 1000;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentValue = Math.floor(oldValue + (newValue - oldValue) * this.easeOutQuart(progress));
            statElement.textContent = currentValue;
            
            // Add pulse effect
            if (progress < 0.3) {
                statElement.style.transform = `scale(${1 + progress * 0.2})`;
            } else {
                statElement.style.transform = 'scale(1)';
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }
    
    animateProgressBar(progressBar, targetWidth) {
        const currentWidth = parseFloat(progressBar.style.width) || 0;
        const duration = 600;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeProgress = this.easeOutQuart(progress);
            const newWidth = currentWidth + (targetWidth - currentWidth) * easeProgress;
            progressBar.style.width = `${newWidth}%`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    addLoadingState(element) {
        element.style.opacity = '0.5';
        element.style.pointerEvents = 'none';
        
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        spinner.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 20px;
            height: 20px;
            border: 2px solid var(--surface-light);
            border-top: 2px solid var(--neon-primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        `;
        
        element.style.position = 'relative';
        element.appendChild(spinner);
        
        return () => {
            element.style.opacity = '1';
            element.style.pointerEvents = 'auto';
            if (spinner.parentNode) {
                spinner.parentNode.removeChild(spinner);
            }
        };
    }

    updateStreaks(goal) {
        const dates = Object.keys(goal.progress).sort();
        if (dates.length === 0) return;

        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        const today = this.getTodayString();

        // Calculate streak from most recent to oldest
        for (let i = dates.length - 1; i >= 0; i--) {
            const date = dates[i];
            
            if (goal.progress[date]) {
                if (i === dates.length - 1) {
                    // Start counting from the most recent date
                    tempStreak = 1;
                    // Check if this is today to determine current streak
                    if (date === today) {
                        currentStreak = tempStreak;
                    }
                } else {
                    const currentDate = new Date(date);
                    const nextDate = new Date(dates[i + 1]);
                    const dayDiff = Math.floor((nextDate - currentDate) / (1000 * 60 * 60 * 24));
                    
                    if (dayDiff === 1) {
                        tempStreak++;
                        // If we reached today in our backward count, update current streak
                        if (date === today) {
                            currentStreak = tempStreak;
                        }
                    } else {
                        tempStreak = 1;
                        // If there's a gap and this is today, start fresh
                        if (date === today) {
                            currentStreak = tempStreak;
                        }
                    }
                }
                
                longestStreak = Math.max(longestStreak, tempStreak);
            } else {
                tempStreak = 0;
                // If today is not completed, current streak is 0
                if (date === today) {
                    currentStreak = 0;
                }
            }
        }

        goal.currentStreak = currentStreak;
        goal.longestStreak = Math.max(goal.longestStreak || 0, longestStreak);
    }

    // Badge System
    checkAndAwardBadges(goal) {
        const badges = [];
        
        // Get total completed days for this goal
        const goalCompletedDays = Object.values(goal.progress || {}).filter(isComplete => isComplete).length;
        
        // Debug logging
        console.log(`Badge check for goal: ${goal.title}`);
        console.log(`Total completed days: ${goalCompletedDays}`);
        console.log(`Current streak: ${goal.currentStreak}`);
        console.log(`Existing badges: ${goal.badges.join(', ')}`);
        
        // Check streak badges based on total completed days (not current streak)
        if (goalCompletedDays >= 7 && !goal.badges.includes('7-day')) {
            console.log('✅ 7-day badge should be awarded (total days)!');
            badges.push('7-day');
        }
        
        // Also check current streak badges
        if (goal.currentStreak >= 7 && !goal.badges.includes('7-day')) {
            console.log('✅ 7-day badge should be awarded (current streak)!');
            badges.push('7-day');
        }
        
        if (goalCompletedDays >= 14 && !goal.badges.includes('14-day')) {
            badges.push('14-day');
        }
        
        if (goalCompletedDays >= 30 && !goal.badges.includes('30-day')) {
            badges.push('30-day');
        }
        
        if (goalCompletedDays >= 60 && !goal.badges.includes('60-day')) {
            badges.push('60-day');
        }
        
        if (goalCompletedDays >= 90 && !goal.badges.includes('90-day')) {
            badges.push('90-day');
        }
        
        if (goalCompletedDays >= 180 && !goal.badges.includes('180-day')) {
            badges.push('180-day');
        }
        
        if (goalCompletedDays >= 365 && !goal.badges.includes('365-day')) {
            badges.push('365-day');
        }
        
        if (goalCompletedDays >= 1000 && !goal.badges.includes('1000-day')) {
            badges.push('1000-day');
        }

        console.log(`Badges to award: ${badges.length > 0 ? badges.join(', ') : 'None'}`);
        
        badges.forEach(badge => {
            console.log(`🏆 Awarding badge: ${badge}`);
            goal.badges.push(badge);
            this.showNotification(`🏆 Badge unlocked: ${this.getBadgeName(badge)}!`, 'success');
            this.playSound('achievement');
            
            // Add celebration animation
            this.celebrateBadgeUnlock(badge);
        });
        
        // Check category-specific badges
        this.checkCategoryBadges();
    }

    getBadgeName(badgeId) {
        const badgeNames = {
            // Streak badges
            '7-day': '7-Day Consistency',
            '14-day': '14-Day Warrior',
            '30-day': '30-Day Legend',
            '60-day': '60-Day Master',
            '90-day': '90-Day Elite',
            '180-day': '180-Day Champion',
            '365-day': '365-Day God Mode',
            '1000-day': '1000-Day Immortal',
            
            // Category badges
            'study-master': 'Study Master',
            'fitness-warrior': 'Fitness Warrior',
            'coding-ninja': 'Coding Ninja',
            
            // Time-based badges
            'early-bird': 'Early Bird',
            'night-owl': 'Night Owl',
            
            // Special badges
            'perfect-week': 'Perfect Week',
            'multi-tasker': 'Multi-Tasker',
            'consistency-king': 'Consistency King'
        };
        return badgeNames[badgeId] || badgeId;
    }

    // Calendar View Functions
    renderCalendar() {
        const calendarGrid = document.getElementById('calendarGrid');
        const currentMonthElement = document.getElementById('currentMonth');
        
        if (!calendarGrid) return;
        
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        // Update month display
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];
        currentMonthElement.textContent = `${monthNames[currentMonth]} ${currentYear}`;
        
        // Clear previous calendar
        calendarGrid.innerHTML = '';
        
        // Get first day of month
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        // Add empty cells for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            calendarGrid.appendChild(emptyDay);
        }
        
        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            const currentDate = new Date(currentYear, currentMonth, day);
            const dateString = currentDate.toISOString().split('T')[0];
            const isToday = day === today.getDate();
            const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
            
            // Check goal completion for this day
            let completedGoals = 0;
            let totalGoals = this.goals.length;
            let goalCategories = [];
            
            this.goals.forEach(goal => {
                if (goal.progress[dateString]) {
                    completedGoals++;
                    const category = this.goalCategories[goal.category] || this.goalCategories['Custom'];
                    goalCategories.push(category);
                }
            });
            
            const completionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
            
            // Set day content and styling
            dayElement.innerHTML = `
                <div class="calendar-day-number">${day}</div>
                ${completedGoals > 0 ? `
                    <div class="calendar-day-progress">
                        <div class="calendar-day-indicators">
                            ${goalCategories.slice(0, 3).map(cat => 
                                `<span class="category-dot" style="background: ${cat.color}"></span>`
                            ).join('')}
                            ${goalCategories.length > 3 ? `<span class="more-indicator">+${goalCategories.length - 3}</span>` : ''}
                        </div>
                        <div class="completion-rate">${Math.round(completionRate)}%</div>
                    </div>
                ` : ''}
            `;
            
            // Add classes based on status
            if (isToday) {
                dayElement.classList.add('today');
            }
            if (isWeekend) {
                dayElement.classList.add('weekend');
            }
            if (completedGoals > 0) {
                dayElement.classList.add('has-activity');
                if (completionRate === 100) {
                    dayElement.classList.add('complete');
                }
            }
            
            // Add tooltip
            dayElement.title = `${monthNames[currentMonth]} ${day}: ${completedGoals}/${totalGoals} goals completed`;
            
            calendarGrid.appendChild(dayElement);
        }
        
        // Setup calendar navigation
        this.setupCalendarNavigation();
    }
    
    setupCalendarNavigation() {
        const prevBtn = document.getElementById('prevMonth');
        const nextBtn = document.getElementById('nextMonth');
        
        if (prevBtn) {
            prevBtn.onclick = () => {
                this.playSound('button');
                this.navigateCalendar(-1);
            };
        }
        
        if (nextBtn) {
            nextBtn.onclick = () => {
                this.playSound('button');
                this.navigateCalendar(1);
            };
        }
    }
    
    navigateCalendar(direction) {
        // This would navigate to previous/next month
        // For now, just show current month
        this.renderCalendar();
    }

    // Calculate total completed days across all goals (ignoring consistency breaks)
    calculateTotalCompletedDays() {
        const allCompletedDates = new Set();
        
        this.goals.forEach(goal => {
            Object.entries(goal.progress || {}).forEach(([date, isComplete]) => {
                if (isComplete) {
                    allCompletedDates.add(date);
                }
            });
        });
        
        return allCompletedDates.size;
    }
    
    // Get max completed days for any single goal
    getMaxGoalCompletedDays() {
        let maxDays = 0;
        
        this.goals.forEach(goal => {
            const completedDays = Object.values(goal.progress || {}).filter(isComplete => isComplete).length;
            maxDays = Math.max(maxDays, completedDays);
        });
        
        return maxDays;
    }
    
    updateBadges() {
        const badgesGrid = document.getElementById('badgesGrid');
        if (!badgesGrid) return;
        
        const badgeCards = badgesGrid.querySelectorAll('.badge-card');
        
        // Get the highest current streak across all goals
        const maxCurrentStreak = Math.max(...this.goals.map(goal => goal.currentStreak || 0), 0);
        
        // Get total completed days (ignoring consistency breaks)
        const totalCompletedDays = this.calculateTotalCompletedDays();
        const maxGoalCompletedDays = this.getMaxGoalCompletedDays();
        
        console.log('=== UPDATING BADGES ===');
        console.log('Max current streak:', maxCurrentStreak);
        console.log('Total completed days:', totalCompletedDays);
        console.log('Max goal completed days:', maxGoalCompletedDays);
        console.log('Total goals:', this.goals.length);
        console.log('Badge cards found:', badgeCards.length);
        
        badgeCards.forEach(card => {
            const badgeId = card.dataset.badge;
            if (!badgeId) return;
            
            console.log('Processing badge:', badgeId);
            
            // Check if any goal has this badge
            const isUnlocked = this.goals.some(goal => goal.badges && goal.badges.includes(badgeId));
            
            if (isUnlocked) {
                card.classList.remove('locked');
                card.classList.add('unlocked');
            } else {
                card.classList.add('locked');
                card.classList.remove('unlocked');
            }

            // Update progress based on current streak
            let requiredDays = 0;
            let progressType = 'days';
            let currentProgress = 0;
            
            // Parse different badge types
            if (badgeId.includes('-day')) {
                requiredDays = parseInt(badgeId.split('-')[0]);
                progressType = 'days';
                // Use total completed days instead of current streak
                currentProgress = Math.min(totalCompletedDays, requiredDays);
            } else if (badgeId === 'study-master') {
                requiredDays = 50;
                progressType = 'sessions';
                currentProgress = this.calculateCategorySessions('study');
            } else if (badgeId === 'fitness-warrior') {
                requiredDays = 30;
                progressType = 'sessions';
                currentProgress = this.calculateCategorySessions('fitness');
            } else if (badgeId === 'coding-ninja') {
                requiredDays = 100;
                progressType = 'sessions';
                currentProgress = this.calculateCategorySessions('coding');
            } else if (badgeId === 'early-bird' || badgeId === 'night-owl') {
                requiredDays = 20;
                progressType = 'days';
                currentProgress = this.calculateTimeBasedProgress(badgeId);
            } else if (badgeId === 'perfect-week') {
                requiredDays = 7;
                progressType = 'days';
                currentProgress = this.calculatePerfectWeekProgress();
            } else if (badgeId === 'multi-tasker') {
                requiredDays = 5;
                progressType = 'goals';
                currentProgress = this.calculateMaxDailyGoals();
            } else if (badgeId === 'consistency-king') {
                requiredDays = 30;
                progressType = 'days';
                currentProgress = this.calculateConsistencyKingProgress();
            }
            
            const progress = Math.min((currentProgress / requiredDays) * 100, 100);
            
            // Find progress elements more robustly
            const progressFill = card.querySelector('.progress-fill');
            const progressText = card.querySelector('.progress-text');
            
            console.log('Badge', badgeId, 'Progress:', {
                current: currentProgress,
                required: requiredDays,
                percentage: progress,
                isUnlocked: isUnlocked,
                progressText: progressText?.textContent,
                progressFill: progressFill?.style.width
            });
            
            if (progressFill) {
                this.animateProgressBar(progressFill, progress);
            }
            
            if (progressText) {
                // Format the progress text properly
                let progressTextContent = '';
                if (progressType === 'days') {
                    progressTextContent = `${currentProgress}/${requiredDays} days`;
                } else if (progressType === 'sessions') {
                    progressTextContent = `${currentProgress}/${requiredDays} sessions`;
                } else if (progressType === 'goals') {
                    progressTextContent = `${currentProgress}/${requiredDays} goals`;
                }
                
                // Force update the text with multiple methods
                progressText.textContent = progressTextContent;
                progressText.innerHTML = progressTextContent;
                progressText.innerText = progressTextContent;
                
                // Force reflow to ensure visual update
                progressText.style.display = 'none';
                progressText.offsetHeight; // Trigger reflow
                progressText.style.display = '';
                
                console.log('Updated progress text for', badgeId, ':', progressTextContent);
            } else {
                console.warn('Progress text element not found for badge:', badgeId);
                
                // Try to find it with a different selector
                const altProgressText = card.querySelector('.badge-progress .progress-text');
                if (altProgressText) {
                    let progressTextContent = '';
                    if (progressType === 'days') {
                        progressTextContent = `${currentProgress}/${requiredDays} days`;
                    } else if (progressType === 'sessions') {
                        progressTextContent = `${currentProgress}/${requiredDays} sessions`;
                    } else if (progressType === 'goals') {
                        progressTextContent = `${currentProgress}/${requiredDays} goals`;
                    }
                    altProgressText.textContent = progressTextContent;
                    altProgressText.innerHTML = progressTextContent;
                    altProgressText.innerText = progressTextContent;
                    
                    // Force reflow
                    altProgressText.style.display = 'none';
                    altProgressText.offsetHeight;
                    altProgressText.style.display = '';
                    
                    console.log('Updated alt progress text for', badgeId, ':', progressTextContent);
                }
            }
        });
        
        console.log('=== BADGES UPDATE COMPLETE ===');
    }
    
    calculateTimeBasedProgress(badgeId) {
        let progress = 0;
        const today = new Date();
        
        this.goals.forEach(goal => {
            Object.entries(goal.progress || {}).forEach(([date, isComplete]) => {
                if (isComplete) {
                    const completionDate = new Date(date);
                    const completionHour = completionDate.getHours();
                    
                    if (badgeId === 'early-bird' && completionHour < 8) {
                        progress++;
                    } else if (badgeId === 'night-owl' && completionHour >= 22) {
                        progress++;
                    }
                }
            });
        });
        
        return Math.min(progress, 20);
    }
    
    calculatePerfectWeekProgress() {
        // Calculate consecutive days with all goals completed
        let perfectWeekDays = 0;
        const today = new Date();
        
        for (let i = 0; i < 30; i++) { // Check last 30 days
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            const dateString = checkDate.toISOString().split('T')[0];
            
            let allGoalsCompleted = true;
            if (this.goals.length === 0) {
                allGoalsCompleted = false;
            } else {
                this.goals.forEach(goal => {
                    if (!goal.progress[dateString]) {
                        allGoalsCompleted = false;
                    }
                });
            }
            
            if (allGoalsCompleted) {
                perfectWeekDays++;
            } else {
                break; // Stop at first incomplete day
            }
        }
        
        return Math.min(perfectWeekDays, 7);
    }
    
    calculateConsistencyKingProgress() {
        // Calculate days with 80%+ consistency
        let consistentDays = 0;
        const today = new Date();
        
        for (let i = 0; i < 90; i++) { // Check last 90 days
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            const dateString = checkDate.toISOString().split('T')[0];
            
            let completedGoals = 0;
            this.goals.forEach(goal => {
                if (goal.progress[dateString]) {
                    completedGoals++;
                }
            });
            
            const consistencyRate = this.goals.length > 0 ? (completedGoals / this.goals.length) * 100 : 0;
            if (consistencyRate >= 80) {
                consistentDays++;
            }
        }
        
        return Math.min(consistentDays, 30);
    }
    
    calculateCategorySessions(category) {
        let sessions = 0;
        this.goals.forEach(goal => {
            if (goal.category.toLowerCase() === category.toLowerCase()) {
                Object.values(goal.progress || {}).forEach(isComplete => {
                    if (isComplete) sessions++;
                });
            }
        });
        return sessions;
    }
    
    calculateMaxDailyGoals() {
        const dailyCounts = {};
        
        this.goals.forEach(goal => {
            Object.entries(goal.progress || {}).forEach(([date, isComplete]) => {
                if (isComplete) {
                    dailyCounts[date] = (dailyCounts[date] || 0) + 1;
                }
            });
        });
        
        return Math.max(...Object.values(dailyCounts), 0);
    }
    
    checkCategoryBadges() {
        const categoryStats = {};
        
        this.goals.forEach(goal => {
            if (!categoryStats[goal.category]) {
                categoryStats[goal.category] = 0;
            }
            
            Object.values(goal.progress || {}).forEach(isComplete => {
                if (isComplete) {
                    categoryStats[goal.category]++;
                }
            });
        });
        
        // Check category badges
        if (categoryStats['Study'] >= 50 && !this.hasGlobalBadge('study-master')) {
            this.awardGlobalBadge('study-master');
        }
        
        if (categoryStats['Fitness'] >= 30 && !this.hasGlobalBadge('fitness-warrior')) {
            this.awardGlobalBadge('fitness-warrior');
        }
        
        if (categoryStats['Coding'] >= 100 && !this.hasGlobalBadge('coding-ninja')) {
            this.awardGlobalBadge('coding-ninja');
        }
    }
    
    hasGlobalBadge(badgeId) {
        return this.goals.some(goal => goal.badges && goal.badges.includes(badgeId));
    }
    
    awardGlobalBadge(badgeId) {
        // Award to first goal (global badges)
        if (this.goals.length > 0) {
            this.goals[0].badges.push(badgeId);
            this.showNotification(`🏆 Badge unlocked: ${this.getBadgeName(badgeId)}!`, 'success');
            this.playSound('achievement');
            this.celebrateBadgeUnlock(badgeId);
        }
    }
    
    celebrateBadgeUnlock(badgeId) {
        const badgeCard = document.querySelector(`[data-badge="${badgeId}"]`);
        if (badgeCard) {
            badgeCard.style.animation = 'pulse 0.6s ease-out';
            setTimeout(() => {
                badgeCard.style.animation = '';
            }, 600);
        }
    }

    // Charts
    initCharts() {
        this.initPieChart();
        this.initLineChart();
    }

    initPieChart() {
        const ctx = document.getElementById('pieChart').getContext('2d');
        this.pieChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'Missed'],
                datasets: [{
                    data: [0, 0],
                    backgroundColor: ['#22C55E', '#EF4444'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#F1F5F9',
                            padding: 20
                        }
                    }
                }
            }
        });
    }

    initLineChart() {
        const ctx = document.getElementById('lineChart').getContext('2d');
        this.lineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Completion Rate',
                    data: [],
                    borderColor: '#4F46E5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            color: '#94A3B8',
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        grid: {
                            color: '#374151'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#94A3B8'
                        },
                        grid: {
                            color: '#374151'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    updateCharts() {
        if (this.pieChart && this.lineChart) {
            this.updatePieChart();
            this.updateLineChart();
        }
    }

    updatePieChart() {
        let completed = 0;
        let missed = 0;

        this.goals.forEach(goal => {
            if (goal.progress) {
                Object.values(goal.progress).forEach(isComplete => {
                    if (isComplete) {
                        completed++;
                    } else {
                        missed++;
                    }
                });
            }
        });

        this.pieChart.data.datasets[0].data = [completed, missed];
        this.pieChart.update();
    }

    updateLineChart() {
        const last7Days = this.getLast7Days();
        const completionRates = [];

        last7Days.forEach(date => {
            const rate = this.calculateDailyCompletionRate(date);
            completionRates.push(rate);
        });

        this.lineChart.data.labels = last7Days.map(date => {
            const d = new Date(date);
            return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        });
        this.lineChart.data.datasets[0].data = completionRates;
        this.lineChart.update();
    }

    calculateDailyCompletionRate(date) {
        if (this.goals.length === 0) return 0;
        
        let completed = 0;
        this.goals.forEach(goal => {
            if (goal.progress && goal.progress[date]) {
                completed++;
            }
        });

        return Math.round((completed / this.goals.length) * 100);
    }

    // Rendering
    renderGoals() {
        const goalsList = document.getElementById('goalsList');
        goalsList.innerHTML = '';

        this.goals.forEach(goal => {
            const goalCard = this.createGoalCard(goal);
            goalsList.appendChild(goalCard);
        });

        // Add event listeners to mark complete buttons
        document.querySelectorAll('.mark-complete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const goalId = e.target.dataset.goalId;
                console.log('Button clicked! goalId:', goalId);
                this.markGoalComplete(goalId);
            });
        });
    }

    createGoalCard(goal) {
        const card = document.createElement('div');
        card.className = 'goal-card';
        card.dataset.goalId = goal.id;
        
        // Get category colors
        const category = this.goalCategories[goal.category] || this.goalCategories['Custom'];
        
        // Get priority info
        const priority = this.priorityLevels[goal.priority] || this.priorityLevels['Medium'];

        const last7Days = this.getLast7Days();
        const calendarHTML = last7Days.map(date => {
            const isCompleted = goal.progress[date] === true;
            const isToday = date === this.getTodayString();
            const isFuture = new Date(date) > new Date();
            
            let className = 'day-indicator';
            if (isCompleted) className += ' completed';
            else if (isToday) className += ' today';
            else if (isFuture) className += ' future';
            else className += ' missed';

            const dayNum = new Date(date).getDate();
            return `<div class="${className}">${dayNum}</div>`;
        }).join('');

        const isTodayCompleted = goal.progress[this.getTodayString()] === true;

        card.innerHTML = `
            <div class="goal-header">
                <div class="goal-info">
                    <div class="goal-title-row">
                        <h3>${goal.title}</h3>
                        <span class="priority-indicator" style="color: ${priority.color}">${priority.icon}</span>
                    </div>
                    <span class="goal-category" style="background: ${category.bgColor}; color: ${category.color}; border-color: ${category.color}">
                        ${category.icon} ${goal.category}
                    </span>
                </div>
                <div class="goal-actions">
                    <button class="btn btn-danger btn-sm" onclick="goalPulse.deleteGoal('${goal.id}')">
                        🗑️
                    </button>
                </div>
            </div>
            <div class="goal-stats">
                <div class="goal-stat">
                    <span class="streak-fire">🔥</span>
                    <span>Current: ${goal.currentStreak || 0} days</span>
                </div>
                <div class="goal-stat">
                    <span>🏆</span>
                    <span>Best: ${goal.longestStreak || 0} days</span>
                </div>
            </div>
            <div class="goal-progress">
                <div class="progress-calendar">
                    ${calendarHTML}
                </div>
                <button class="mark-complete-btn" 
                        data-goal-id="${goal.id}"
                        ${isTodayCompleted ? 'disabled' : ''}
                        style="background: ${category.color};">
                    ${isTodayCompleted ? '✅ Done Today' : 'Mark Complete'}
                </button>
            </div>
        `;

        return card;
    }

    toggleEmptyState() {
        const emptyState = document.getElementById('emptyState');
        const goalsList = document.getElementById('goalsList');
        
        if (this.goals.length === 0) {
            emptyState.style.display = 'block';
            goalsList.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            goalsList.style.display = 'grid';
        }
    }

    // Event Listeners
    setupEventListeners() {
        // Goal form submission
        document.getElementById('goalForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleGoalSubmit();
        });

        // Modal controls
        document.getElementById('addGoalBtn').addEventListener('click', () => {
            this.showAddGoalModal();
        });

        document.getElementById('addGoalBtnMain').addEventListener('click', () => {
            this.showAddGoalModal();
        });

        document.getElementById('cancelGoalBtn').addEventListener('click', () => {
            this.hideAddGoalModal();
        });

        // Close modal on outside click
        document.getElementById('addGoalModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideAddGoalModal();
            }
        });

        // Search functionality
        const searchInput = document.getElementById('goalSearch');
        const clearSearchBtn = document.getElementById('clearSearch');
        
        searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
            clearSearchBtn.style.display = e.target.value ? 'block' : 'none';
        });

        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            this.handleSearch('');
            clearSearchBtn.style.display = 'none';
            this.playSound('button');
        });

        // Filter functionality
        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.handleFilter();
        });

        document.getElementById('priorityFilter').addEventListener('change', (e) => {
            this.handleFilter();
        });

        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.handleFilter();
        });

        // Set default date
        document.getElementById('startDate').valueAsDate = new Date();
    }

    showAddGoalModal() {
        document.getElementById('addGoalModal').classList.add('active');
    }

    hideAddGoalModal() {
        document.getElementById('addGoalModal').classList.remove('active');
        document.getElementById('goalForm').reset();
        document.getElementById('startDate').valueAsDate = new Date();
    }

    handleGoalSubmit() {
        const title = document.getElementById('goalTitle').value.trim();
        const category = document.getElementById('goalCategory').value;
        const priority = document.getElementById('goalPriority').value;
        const startDate = document.getElementById('startDate').value;

        if (!title) {
            this.playSound('error');
            this.showNotification('Please enter a goal title!', 'error');
            return;
        }

        if (this.goals.some(goal => goal.title.toLowerCase() === title.toLowerCase())) {
            this.playSound('error');
            this.showNotification('A goal with this title already exists!', 'error');
            return;
        }

        this.addGoal({
            title,
            category,
            priority,
            startDate
        });

        this.hideAddGoalModal();
    }

    // Utility Functions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getTodayString() {
        return new Date().toISOString().split('T')[0];
    }

    getLast7Days() {
        const days = [];
        const today = new Date();
        
        // Start from 6 days ago to today (oldest to newest)
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            days.push(date.toISOString().split('T')[0]);
        }
        
        console.log('Last 7 days:', days);
        return days;
    }

    // Streak Freeze System
    useStreakFreeze() {
        if (this.streakFreezes <= 0) {
            this.playSound('error');
            this.showNotification('No streak freezes available! Complete goals to earn more.', 'error');
            return false;
        }

        this.streakFreezes--;
        this.saveData();
        this.updateFreezeDisplay();
        this.playSound('button');
        this.showNotification(`Streak freeze used! ${this.streakFreezes} freezes remaining.`, 'success');
        
        // Apply freeze effect - maintain streak for today
        const today = this.getTodayString();
        this.goals.forEach(goal => {
            if (!goal.progress[today]) {
                // Mark today as "frozen" - doesn't count as completion but doesn't break streak
                goal.frozenToday = true;
            }
        });
        
        return true;
    }
    
    updateFreezeDisplay() {
        const freezeCount = document.getElementById('freezeCount');
        const useFreezeBtn = document.getElementById('useFreezeBtn');
        
        if (freezeCount) {
            freezeCount.textContent = this.streakFreezes;
        }
        
        if (useFreezeBtn) {
            useFreezeBtn.disabled = this.streakFreezes <= 0;
            useFreezeBtn.textContent = this.streakFreezes <= 0 ? 'No Freezes' : 'Use Freeze';
        }
    }
    
    resetFreezesMonthly() {
        const currentMonth = new Date().getMonth();
        if (this.lastFreezeReset !== currentMonth) {
            this.streakFreezes = 3;
            this.lastFreezeReset = currentMonth;
            this.saveData();
            this.updateFreezeDisplay();
            this.playSound('achievement');
            this.showNotification('Monthly streak freezes reset! You have 3 freezes.', 'info');
        }
    }
    
    // Export Data Functionality
    exportData() {
        this.playSound('button');
        
        // Generate comprehensive data export
        const exportData = {
            exportDate: new Date().toISOString(),
            appVersion: '1.0.0',
            userStats: {
                totalGoals: this.goals.length,
                totalCompletions: this.calculateTotalCompletions(),
                bestStreak: this.calculateBestStreak(),
                consistencyRate: this.calculateConsistencyRate(),
                earnedBadges: this.calculateBadgeCount(),
                currentStreakFreezes: this.streakFreezes
            },
            goals: this.goals.map(goal => ({
                id: goal.id,
                title: goal.title,
                category: goal.category,
                priority: goal.priority,
                createdAt: goal.createdAt,
                currentStreak: goal.currentStreak,
                longestStreak: goal.longestStreak,
                totalCompletions: Object.keys(goal.progress || {}).filter(date => goal.progress[date]).length,
                badges: goal.badges || [],
                progress: goal.progress || {}
            })),
            achievements: this.generateAchievementReport(),
            calendarData: this.generateCalendarExport()
        };
        
        // Create downloadable JSON file
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `goalpulse-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.showNotification('Data exported successfully! 📊', 'success');
    }
    
    calculateTotalCompletions() {
        let total = 0;
        this.goals.forEach(goal => {
            if (goal.progress) {
                Object.values(goal.progress).forEach(isComplete => {
                    if (isComplete) total++;
                });
            }
        });
        return total;
    }
    
    generateAchievementReport() {
        const achievements = [];
        
        // Streak achievements
        const bestStreak = this.calculateBestStreak();
        if (bestStreak >= 7) achievements.push({ type: 'streak', name: 'Week Warrior', achieved: true });
        if (bestStreak >= 30) achievements.push({ type: 'streak', name: 'Monthly Master', achieved: true });
        if (bestStreak >= 100) achievements.push({ type: 'streak', name: 'Century Champion', achieved: true });
        
        // Category achievements
        const categoryStats = {};
        this.goals.forEach(goal => {
            if (!categoryStats[goal.category]) {
                categoryStats[goal.category] = 0;
            }
            categoryStats[goal.category] += Object.keys(goal.progress || {}).filter(date => goal.progress[date]).length;
        });
        
        Object.entries(categoryStats).forEach(([category, count]) => {
            if (category === 'Study' && count >= 50) achievements.push({ type: 'category', name: 'Study Master', achieved: true });
            if (category === 'Fitness' && count >= 30) achievements.push({ type: 'category', name: 'Fitness Warrior', achieved: true });
            if (category === 'Coding' && count >= 100) achievements.push({ type: 'category', name: 'Coding Ninja', achieved: true });
        });
        
        return achievements;
    }
    
    generateCalendarExport() {
        const calendarData = {};
        const lastYearData = this.getLastYearActivityData();
        
        lastYearData.forEach(day => {
            calendarData[day.date] = {
                activities: day.activities,
                completionRate: this.goals.length > 0 ? (day.activities / this.goals.length) * 100 : 0
            };
        });
        
        return calendarData;
    }
    
    // Search & Filter Functions
    handleSearch(searchTerm) {
        const filteredGoals = this.filterGoals(searchTerm);
        this.renderFilteredGoals(filteredGoals);
        this.playSound('button');
    }
    
    handleFilter() {
        const searchTerm = document.getElementById('goalSearch').value;
        const filteredGoals = this.filterGoals(searchTerm);
        this.renderFilteredGoals(filteredGoals);
        this.playSound('button');
    }
    
    filterGoals(searchTerm = '') {
        const categoryFilter = document.getElementById('categoryFilter').value;
        const priorityFilter = document.getElementById('priorityFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        const today = this.getTodayString();
        
        return this.goals.filter(goal => {
            // Search filter
            const matchesSearch = !searchTerm || 
                goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                goal.category.toLowerCase().includes(searchTerm.toLowerCase());
            
            // Category filter
            const matchesCategory = !categoryFilter || goal.category === categoryFilter;
            
            // Priority filter
            const matchesPriority = !priorityFilter || goal.priority === priorityFilter;
            
            // Status filter
            let matchesStatus = true;
            if (statusFilter === 'completed') {
                matchesStatus = goal.progress[today] === true;
            } else if (statusFilter === 'pending') {
                matchesStatus = !goal.progress[today];
            } else if (statusFilter === 'streak') {
                matchesStatus = (goal.currentStreak || 0) > 0;
            }
            
            return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
        });
    }
    
    renderFilteredGoals(filteredGoals) {
        const goalsList = document.getElementById('goalsList');
        const emptyState = document.getElementById('emptyState');
        
        goalsList.innerHTML = '';
        
        if (filteredGoals.length === 0) {
            emptyState.style.display = 'block';
            emptyState.innerHTML = `
                <div class="empty-icon">🔍</div>
                <h3>No goals found!</h3>
                <p>Try adjusting your search or filters.</p>
                <button class="btn btn-secondary" onclick="goalPulse.clearAllFilters()">
                    Clear Filters
                </button>
            `;
            goalsList.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            goalsList.style.display = 'grid';
            
            filteredGoals.forEach(goal => {
                const goalCard = this.createGoalCard(goal);
                goalsList.appendChild(goalCard);
            });
            
            // Add event listeners to mark complete buttons
            document.querySelectorAll('.mark-complete-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const goalId = e.target.dataset.goalId;
                    this.markGoalComplete(goalId);
                });
            });
        }
    }
    
    clearAllFilters() {
        document.getElementById('goalSearch').value = '';
        document.getElementById('categoryFilter').value = '';
        document.getElementById('priorityFilter').value = '';
        document.getElementById('statusFilter').value = '';
        document.getElementById('clearSearch').style.display = 'none';
        
        this.renderGoals();
        this.playSound('button');
        this.showNotification('All filters cleared!', 'info');
    }
    
    // Quick Stats Widget Functions
    updateQuickStats() {
        this.updateTodayProgress();
        this.updateWeeklyPerformance();
        this.updateCategoryBreakdown();
        this.updateRecentActivity();
    }
    
    updateTodayProgress() {
        const today = this.getTodayString();
        let completedToday = 0;
        
        this.goals.forEach(goal => {
            if (goal.progress[today]) {
                completedToday++;
            }
        });
        
        const totalGoals = this.goals.length;
        const percentage = totalGoals > 0 ? Math.round((completedToday / totalGoals) * 100) : 0;
        
        // Update progress ring
        const progressRing = document.getElementById('todayProgressRing');
        const progressPercent = document.getElementById('todayProgressPercent');
        const progressText = document.getElementById('todayProgressText');
        
        if (progressRing) {
            const circumference = 2 * Math.PI * 25; // radius = 25
            const offset = circumference - (percentage / 100) * circumference;
            progressRing.style.strokeDashoffset = offset;
        }
        
        if (progressPercent) {
            this.animateStatUpdate('todayProgressPercent', percentage);
        }
        
        if (progressText) {
            progressText.textContent = `${completedToday} of ${totalGoals} goals completed`;
        }
    }
    
    updateWeeklyPerformance() {
        const last7Days = this.getLast7Days();
        const weeklyAvgElement = document.getElementById('weeklyAvgText');
        
        let totalPercentage = 0;
        let validDays = 0;
        
        console.log('Updating weekly performance for days:', last7Days);
        
        // Map days to match HTML order (Mon-Sun)
        const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        
        last7Days.forEach((date, index) => {
            // Find the correct day index based on actual day of week
            const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
            const dayIndex = dayOrder.indexOf(dayOfWeek);
            
            const dayBars = document.querySelectorAll('.day-bar');
            const barFill = dayBars[dayIndex]?.querySelector('.bar-fill');
            
            const completionRate = this.calculateDailyCompletionRate(date);
            
            console.log(`Day ${dayOfWeek} (${dayIndex}): ${date} - ${completionRate}% completion`);
            
            if (barFill) {
                setTimeout(() => {
                    barFill.style.height = `${completionRate}%`;
                    // Add color based on completion rate
                    if (completionRate === 100) {
                        barFill.style.background = 'linear-gradient(to top, #22C55E, #16A34A)';
                    } else if (completionRate >= 80) {
                        barFill.style.background = 'linear-gradient(to top, #3B82F6, #2563EB)';
                    } else if (completionRate >= 50) {
                        barFill.style.background = 'linear-gradient(to top, #F59E0B, #D97706)';
                    } else {
                        barFill.style.background = 'linear-gradient(to top, #EF4444, #DC2626)';
                    }
                }, dayIndex * 100);
            }
            
            if (this.goals.length > 0) {
                totalPercentage += completionRate;
                validDays++;
            }
        });
        
        const average = validDays > 0 ? Math.round(totalPercentage / validDays) : 0;
        
        if (weeklyAvgElement) {
            weeklyAvgElement.textContent = `Average: ${average}% completion`;
        }
        
        console.log('Weekly performance updated - Average:', average);
    }
    
    updateCategoryBreakdown() {
        const categoryStats = {};
        let totalActivities = 0;
        
        this.goals.forEach(goal => {
            if (!categoryStats[goal.category]) {
                categoryStats[goal.category] = 0;
            }
            
            Object.values(goal.progress || {}).forEach(isComplete => {
                if (isComplete) {
                    categoryStats[goal.category]++;
                    totalActivities++;
                }
            });
        });
        
        const categoryStatsElement = document.getElementById('categoryStats');
        const categoryTotalText = document.getElementById('categoryTotalText');
        
        if (categoryStatsElement) {
            categoryStatsElement.innerHTML = '';
            
            Object.entries(categoryStats).forEach(([category, count]) => {
                const categoryInfo = this.goalCategories[category] || this.goalCategories['Custom'];
                const statItem = document.createElement('div');
                statItem.className = 'category-stat-item';
                statItem.innerHTML = `
                    <span class="category-name">
                        <span>${categoryInfo.icon}</span>
                        <span>${category}</span>
                    </span>
                    <span class="category-count">${count}</span>
                `;
                categoryStatsElement.appendChild(statItem);
            });
        }
        
        if (categoryTotalText) {
            categoryTotalText.textContent = `${totalActivities} total activities`;
        }
    }
    
    updateRecentActivity() {
        const activityTimeline = document.getElementById('activityTimeline');
        const activitySummary = document.getElementById('activitySummary');
        
        if (!activityTimeline) return;
        
        // Get recent activity (last 5 completions)
        const recentActivities = [];
        
        this.goals.forEach(goal => {
            Object.entries(goal.progress || {}).forEach(([date, isComplete]) => {
                if (isComplete) {
                    recentActivities.push({
                        goal: goal.title,
                        category: goal.category,
                        date: date,
                        timestamp: new Date(date).getTime()
                    });
                }
            });
        });
        
        // Sort by timestamp (most recent first) and take last 5
        recentActivities.sort((a, b) => b.timestamp - a.timestamp);
        const lastFive = recentActivities.slice(0, 5);
        
        activityTimeline.innerHTML = '';
        
        if (lastFive.length === 0) {
            if (activitySummary) {
                activitySummary.textContent = 'No recent activity';
            }
            return;
        }
        
        lastFive.forEach((activity, index) => {
            const categoryInfo = this.goalCategories[activity.category] || this.goalCategories['Custom'];
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <span class="activity-icon">${categoryInfo.icon}</span>
                <span class="activity-text">${activity.goal}</span>
                <span class="activity-time">${this.formatRelativeTime(activity.date)}</span>
            `;
            
            setTimeout(() => {
                activityTimeline.appendChild(activityItem);
            }, index * 100);
        });
        
        if (activitySummary) {
            const today = this.getTodayString();
            const todayActivities = recentActivities.filter(a => a.date === today);
            activitySummary.textContent = `${todayActivities.length} goals completed today`;
        }
    }
    
    formatRelativeTime(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            const daysAgo = Math.floor((today - date) / (1000 * 60 * 60 * 24));
            return `${daysAgo} days ago`;
        }
    }
    
    // Test function for badges
    testBadges() {
        console.log('Testing badges system...');
        
        // Create a test goal with exactly 1 day streak
        const testGoal = {
            id: 'test-goal',
            title: 'Test Goal',
            category: 'Study',
            priority: 'High',
            currentStreak: 1,
            longestStreak: 1,
            progress: {},
            badges: []
        };
        
        // Add progress for today only (1 day streak)
        const today = new Date().toISOString().split('T')[0];
        testGoal.progress[today] = true;
        
        this.goals.push(testGoal);
        
        console.log('Test goal created:', {
            currentStreak: testGoal.currentStreak,
            progress: testGoal.progress,
            progressDays: Object.keys(testGoal.progress).length
        });
        
        // Test badge checking
        this.checkAndAwardBadges(testGoal);
        this.updateBadges();
        
        console.log('Test goal badges:', testGoal.badges);
        console.log('All goals badges:', this.goals.map(g => ({ title: g.title, badges: g.badges })));
        
        // Check specific badge progress
        const badge7Day = document.querySelector('[data-badge="7-day"]');
        if (badge7Day) {
            const progressText = badge7Day.querySelector('.progress-text');
            const progressFill = badge7Day.querySelector('.progress-fill');
            console.log('7-Day Badge Progress:', {
                text: progressText?.textContent,
                fillWidth: progressFill?.style.width
            });
        }
        
        // Clean up
        this.goals.pop();
        this.updateBadges();
        
        console.log('Badge test completed!');
    }
    
    // Debug function for badge progress
    debugBadgeProgress() {
        console.log('=== BADGE PROGRESS DEBUG ===');
        
        const maxCurrentStreak = Math.max(...this.goals.map(goal => goal.currentStreak || 0), 0);
        console.log('Max Current Streak:', maxCurrentStreak);
        
        const badge7Day = document.querySelector('[data-badge="7-day"]');
        if (badge7Day) {
            const progressText = badge7Day.querySelector('.progress-text');
            const progressFill = badge7Day.querySelector('.progress-fill');
            console.log('7-Day Badge Element:', {
                isLocked: badge7Day.classList.contains('locked'),
                isUnlocked: badge7Day.classList.contains('unlocked'),
                progressText: progressText?.textContent,
                progressFill: progressFill?.style.width
            });
        }
        
        console.log('All Goals:', this.goals.map(g => ({
            title: g.title,
            currentStreak: g.currentStreak,
            badges: g.badges
        })));
        
        console.log('=== END DEBUG ===');
    }
    
    // Manual force update for badge progress
    forceUpdateBadgeProgress() {
        console.log('Force updating badge progress...');
        
        const badgesGrid = document.getElementById('badgesGrid');
        if (!badgesGrid) {
            console.error('Badges grid not found');
            return;
        }
        
        const badgeCards = badgesGrid.querySelectorAll('.badge-card');
        console.log('Found badge cards:', badgeCards.length);
        
        // Get the highest current streak across all goals
        const maxCurrentStreak = Math.max(...this.goals.map(goal => goal.currentStreak || 0), 0);
        console.log('Max current streak:', maxCurrentStreak);
        
        badgeCards.forEach(card => {
            const badgeId = card.dataset.badge;
            if (!badgeId) return;
            
            // Find progress elements with multiple selectors
            const progressText = card.querySelector('.progress-text') || 
                               card.querySelector('.badge-progress .progress-text') ||
                               card.querySelector('span.progress-text');
            
            const progressFill = card.querySelector('.progress-fill') ||
                               card.querySelector('.progress-bar .progress-fill') ||
                               card.querySelector('div.progress-fill');
            
            console.log('Badge:', badgeId, 'Elements found:', {
                progressText: !!progressText,
                progressFill: !!progressFill
            });
            
            if (badgeId === '7-day') {
                const progress = Math.min((maxCurrentStreak / 7) * 100, 100);
                const currentProgress = Math.min(maxCurrentStreak, 7);
                
                if (progressText) {
                    const text = `${currentProgress}/7 days`;
                    progressText.textContent = text;
                    progressText.innerHTML = text;
                    progressText.innerText = text;
                    console.log('Updated 7-day text to:', text);
                }
                
                if (progressFill) {
                    progressFill.style.width = `${progress}%`;
                    console.log('Updated 7-day progress to:', progress + '%');
                }
            }
        });
    }
    
    // Debug function for weekly performance
    debugWeeklyPerformance() {
        console.log('=== WEEKLY PERFORMANCE DEBUG ===');
        
        const last7Days = this.getLast7Days();
        console.log('Last 7 days:', last7Days);
        
        const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        
        last7Days.forEach((date, index) => {
            const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
            const dayIndex = dayOrder.indexOf(dayOfWeek);
            const completionRate = this.calculateDailyCompletionRate(date);
            
            console.log(`Day ${index}: ${date} (${dayOfWeek}) -> Bar ${dayIndex} -> ${completionRate}%`);
        });
        
        // Check HTML elements
        const dayBars = document.querySelectorAll('.day-bar');
        console.log('Day bars found:', dayBars.length);
        
        dayBars.forEach((bar, index) => {
            const barFill = bar.querySelector('.bar-fill');
            const barLabel = bar.querySelector('.bar-label');
            console.log(`Bar ${index}: Label="${barLabel?.textContent}", Height="${barFill?.style.height}"`);
        });
        
        console.log('=== END DEBUG ===');
    }
    
    // Manual function to update consistency badges
    updateConsistencyBadges() {
        console.log('=== MANUAL UPDATING CONSISTENCY BADGES ===');
        
        // Get the highest current streak across all goals
        const maxCurrentStreak = Math.max(...this.goals.map(goal => goal.currentStreak || 0), 0);
        
        console.log('Current max streak:', maxCurrentStreak);
        console.log('Goals with streaks:', this.goals.map(g => ({ title: g.title, streak: g.currentStreak })));
        
        // Update all day-based badges
        const dayBadges = ['7-day', '14-day', '30-day', '60-day', '90-day', '180-day', '365-day', '1000-day'];
        
        dayBadges.forEach(badgeId => {
            const requiredDays = parseInt(badgeId.split('-')[0]);
            const currentProgress = Math.min(maxCurrentStreak, requiredDays);
            const progress = Math.min((currentProgress / requiredDays) * 100, 100);
            
            const badgeCard = document.querySelector(`[data-badge="${badgeId}"]`);
            if (badgeCard) {
                const progressText = badgeCard.querySelector('.progress-text') || 
                                   badgeCard.querySelector('.badge-progress .progress-text');
                const progressFill = badgeCard.querySelector('.progress-fill');
                
                if (progressText) {
                    const text = `${currentProgress}/${requiredDays} days`;
                    progressText.textContent = text;
                    progressText.innerHTML = text;
                    console.log(`Updated ${badgeId} text to: ${text}`);
                }
                
                if (progressFill) {
                    progressFill.style.width = `${progress}%`;
                    console.log(`Updated ${badgeId} progress to: ${progress}%`);
                }
                
                // Check if badge should be unlocked
                const isUnlocked = this.goals.some(goal => goal.badges && goal.badges.includes(badgeId));
                if (isUnlocked) {
                    badgeCard.classList.remove('locked');
                    badgeCard.classList.add('unlocked');
                } else {
                    badgeCard.classList.add('locked');
                    badgeCard.classList.remove('unlocked');
                }
            }
        });
        
        console.log('=== CONSISTENCY BADGES UPDATE COMPLETE ===');
    }
    
    // Simple debug function to check current streak
    checkCurrentStreak() {
        console.log('=== CURRENT STREAK DEBUG ===');
        console.log('Total goals:', this.goals.length);
        
        if (this.goals.length === 0) {
            console.log('No goals found - creating test goal...');
            this.addGoal('Test Goal', 'Test Category', 'medium');
            console.log('Test goal created');
        }
        
        this.goals.forEach((goal, index) => {
            console.log(`Goal ${index + 1}:`);
            console.log('  Title:', goal.title);
            console.log('  Current Streak:', goal.currentStreak || 0);
            console.log('  Progress:', goal.progress || {});
            console.log('  Badges:', goal.badges || []);
        });
        
        const maxStreak = Math.max(...this.goals.map(goal => goal.currentStreak || 0), 0);
        console.log('Max streak across all goals:', maxStreak);
        
        // Check 7-day badge specifically
        const badge7Day = document.querySelector('[data-badge="7-day"]');
        if (badge7Day) {
            const progressText = badge7Day.querySelector('.progress-text');
            console.log('7-day badge progress text:', progressText?.textContent);
        }
        
        console.log('=== END DEBUG ===');
    }
    
    // Instant visual test for badge progress
    testBadgeVisual() {
        console.log('=== VISUAL BADGE TEST ===');
        
        // Test 7-day badge specifically
        const badge7Day = document.querySelector('[data-badge="7-day"]');
        if (badge7Day) {
            const progressText = badge7Day.querySelector('.progress-text');
            const progressFill = badge7Day.querySelector('.progress-fill');
            
            console.log('7-day badge elements found:', {
                progressText: !!progressText,
                progressFill: !!progressFill,
                currentText: progressText?.textContent,
                currentWidth: progressFill?.style.width
            });
            
            // Force update with test values
            if (progressText) {
                progressText.textContent = 'TEST: 1/7 days';
                progressText.innerHTML = 'TEST: 1/7 days';
                progressText.innerText = 'TEST: 1/7 days';
                
                // Flash the text to make it visible
                progressText.style.color = 'red';
                progressText.style.fontSize = '16px';
                progressText.style.fontWeight = 'bold';
                
                setTimeout(() => {
                    progressText.style.color = '';
                    progressText.style.fontSize = '';
                    progressText.style.fontWeight = '';
                }, 2000);
                
                console.log('Updated 7-day badge with TEST text');
            }
            
            if (progressFill) {
                progressFill.style.width = '14.28%'; // 1/7 = 14.28%
                progressFill.style.background = 'red';
                
                setTimeout(() => {
                    progressFill.style.background = '';
                }, 2000);
                
                console.log('Updated 7-day progress bar');
            }
        }
        
        console.log('=== VISUAL TEST COMPLETE ===');
    }
    
    // Test function for total completed days badges
    testTotalDaysBadges() {
        console.log('=== TESTING TOTAL DAYS BADGES ===');
        
        const totalCompletedDays = this.calculateTotalCompletedDays();
        const maxGoalCompletedDays = this.getMaxGoalCompletedDays();
        
        console.log('Total completed days:', totalCompletedDays);
        console.log('Max goal completed days:', maxGoalCompletedDays);
        
        // Show all goal progress
        this.goals.forEach((goal, index) => {
            const completedDays = Object.values(goal.progress || {}).filter(isComplete => isComplete).length;
            console.log(`Goal ${index + 1} (${goal.title}):`);
            console.log('  Total completed days:', completedDays);
            console.log('  Current streak:', goal.currentStreak);
            console.log('  Progress dates:', Object.keys(goal.progress || {}).filter(date => goal.progress[date]));
        });
        
        // Update badges with new logic
        this.updateBadges();
        
        console.log('=== TEST COMPLETE ===');
    }
    
    // Mobile Menu Functions
    toggleMobileMenu() {
        const mobileMenu = document.getElementById('mobileMenu');
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        
        if (mobileMenu.classList.contains('active')) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }
    
    openMobileMenu() {
        const mobileMenu = document.getElementById('mobileMenu');
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const mobileMenuDate = document.getElementById('mobileMenuDate');
        const mobileFreezeCount = document.getElementById('mobileFreezeCount');
        
        mobileMenu.classList.add('active');
        mobileMenuToggle.classList.add('active');
        
        // Update mobile menu content
        if (mobileMenuDate) {
            mobileMenuDate.textContent = new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        }
        
        if (mobileFreezeCount) {
            mobileFreezeCount.textContent = this.streakFreezes;
        }
        
        // Add overlay
        this.addMobileMenuOverlay();
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        this.playSound('button');
    }
    
    closeMobileMenu() {
        const mobileMenu = document.getElementById('mobileMenu');
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        
        mobileMenu.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
        
        // Remove overlay
        this.removeMobileMenuOverlay();
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        this.playSound('button');
    }
    
    addMobileMenuOverlay() {
        let overlay = document.getElementById('mobileMenuOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'mobileMenuOverlay';
            overlay.className = 'mobile-menu-overlay';
            overlay.onclick = () => this.closeMobileMenu();
            document.body.appendChild(overlay);
        }
        
        setTimeout(() => {
            overlay.classList.add('active');
        }, 10);
    }
    
    removeMobileMenuOverlay() {
        const overlay = document.getElementById('mobileMenuOverlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 300);
        }
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '10000',
            animation: 'slideInRight 0.3s ease',
            maxWidth: '300px'
        });

        // Set background color based on type
        const colors = {
            success: '#22C55E',
            error: '#EF4444',
            warning: '#F59E0B',
            info: '#4F46E5'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        // Add to page
        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Add notification animations to the page
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the app
const goalPulse = new GoalPulse();

// Make test functions available globally
window.testBadges = () => goalPulse.testBadges();
window.debugBadgeProgress = () => goalPulse.debugBadgeProgress();
window.forceUpdateBadgeProgress = () => goalPulse.forceUpdateBadgeProgress();
window.debugWeeklyPerformance = () => goalPulse.debugWeeklyPerformance();
window.updateConsistencyBadges = () => goalPulse.updateConsistencyBadges();
window.checkCurrentStreak = () => goalPulse.checkCurrentStreak();
window.testBadgeVisual = () => goalPulse.testBadgeVisual();
window.testTotalDaysBadges = () => goalPulse.testTotalDaysBadges();

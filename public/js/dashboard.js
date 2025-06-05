// Dashboard JavaScript
class PregnancyDashboard {
    constructor() {
        this.apiBase = '';
        this.charts = {};
        this.init();
    }

    async init() {
        await this.loadStats();
        await this.loadCharts();
        this.setupEventListeners();
    }

    // API call helper
    async apiCall(endpoint) {
        try {
            const response = await fetch(`${this.apiBase}/api${endpoint}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            return null;
        }
    }

    // Load main statistics
    async loadStats() {
        const stats = await this.apiCall('/stats');
        if (stats) {
            document.getElementById('totalMothers').textContent = stats.total_cases.toLocaleString();
            document.getElementById('pregnancyCount').textContent = stats.active_pregnancies.toLocaleString();
            document.getElementById('totalDeliveries').textContent = stats.total_deliveries.toLocaleString();
        }
    }

    // Load all charts
    async loadCharts() {
        await Promise.all([
            this.loadWeeklyTrendChart(),
            this.loadDistrictChart(),
            this.loadVillageChart(),
            this.loadValidationsChart(),
            this.loadWorkforceChart(),
            this.loadRiskCategoryChart(),
            this.loadActivePregnanciesChart(),
            this.loadDistributionChart(),
            this.loadActiveDistrictChart()
        ]);
    }

    // Weekly trend chart
    async loadWeeklyTrendChart() {
        const data = await this.apiCall('/trends/weekly');
        if (!data) return;

        const ctx = document.getElementById('weeklyTrendChart').getContext('2d');
        this.charts.weeklyTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(item => new Date(item.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                datasets: [{
                    label: 'HRP Cases',
                    data: data.map(item => item.count),
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff'
                    }
                },
                scales: {
                    x: {
                        display: true,
                        grid: { display: false },
                        ticks: { font: { size: 10 } }
                    },
                    y: {
                        display: true,
                        grid: { color: 'rgba(0,0,0,0.1)' },
                        ticks: { font: { size: 10 } }
                    }
                }
            }
        });
    }

    // District chart
    async loadDistrictChart() {
        const data = await this.apiCall('/cases/by-district');
        if (!data || data.length === 0) {
            console.log('No district data available');
            return;
        }

        const ctx = document.getElementById('districtChart').getContext('2d');
        this.charts.district = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.slice(0, 8).map(item => item.district || 'Unknown'),
                datasets: [{
                    data: data.slice(0, 8).map(item => parseInt(item.count) || 0),
                    backgroundColor: [
                        '#007bff', '#28a745', '#ffc107', '#dc3545',
                        '#6f42c1', '#fd7e14', '#20c997', '#6c757d'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        display: true,
                        grid: { display: false },
                        ticks: { font: { size: 10 } }
                    },
                    y: {
                        display: true,
                        grid: { display: false },
                        ticks: { font: { size: 10 } }
                    }
                }
            }
        });
    }

    // Village chart
    async loadVillageChart() {
        const data = await this.apiCall('/cases/by-village');
        if (!data) return;

        const ctx = document.getElementById('villageChart').getContext('2d');
        this.charts.village = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.slice(0, 10).map(item => item.village || 'Unknown'),
                datasets: [{
                    data: data.slice(0, 10).map(item => item.count),
                    backgroundColor: '#007bff',
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        display: true,
                        grid: { display: false },
                        ticks: { font: { size: 10 } }
                    },
                    y: {
                        display: true,
                        grid: { display: false },
                        ticks: { font: { size: 9 } }
                    }
                }
            }
        });
    }

    // Validations chart (using age group data as proxy)
    async loadValidationsChart() {
        const data = await this.apiCall('/cases/by-age-group');
        if (!data) return;

        const ctx = document.getElementById('validationsChart').getContext('2d');
        this.charts.validations = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(item => item.age_group),
                datasets: [{
                    data: data.map(item => item.count),
                    backgroundColor: '#007bff',
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        display: true,
                        grid: { display: false },
                        ticks: { font: { size: 10 } }
                    },
                    y: {
                        display: true,
                        grid: { display: false },
                        ticks: { font: { size: 10 } }
                    }
                }
            }
        });
    }

    // Workforce pie chart
    async loadWorkforceChart() {
        const data = await this.apiCall('/workload-category');
        const ctx = document.getElementById('workforceChart').getContext('2d');
        
        let chartData, labels;
        if (data && data.length > 0) {
            labels = data.map(item => item.category);
            chartData = data.map(item => parseInt(item.count) || 0);
        } else {
            // Fallback sample data
            labels = ['Optimal', 'Underutilized', 'Overutilized'];
            chartData = [45, 30, 25];
        }

        this.charts.workforce = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: chartData,
                    backgroundColor: ['#007bff', '#ffc107', '#28a745'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                cutout: '60%'
            }
        });
    }

    // Risk category chart
    async loadRiskCategoryChart() {
        const data = await this.apiCall('/cases/by-risk-category');
        if (!data) return;

        const ctx = document.getElementById('riskCategoryChart').getContext('2d');
        this.charts.riskCategory = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.slice(0, 6).map(item => item.risk_category || 'Unknown'),
                datasets: [{
                    data: data.slice(0, 6).map(item => item.count),
                    backgroundColor: '#007bff',
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        display: true,
                        grid: { display: false },
                        ticks: { font: { size: 9 } }
                    },
                    y: {
                        display: true,
                        grid: { display: false },
                        ticks: { font: { size: 9 } }
                    }
                }
            }
        });
    }

    // Active pregnancies chart
    async loadActivePregnanciesChart() {
        const data = await this.apiCall('/active-pregnancies/by-volunteer');
        if (!data || data.length === 0) {
            console.log('No active pregnancies data available');
            return;
        }

        const ctx = document.getElementById('activePregnanciesChart').getContext('2d');
        this.charts.activePregnancies = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.slice(0, 6).map(item => item.volunteer || 'Unknown'),
                datasets: [{
                    data: data.slice(0, 6).map(item => parseInt(item.count) || 0),
                    backgroundColor: '#007bff',
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        display: true,
                        grid: { display: false },
                        ticks: { font: { size: 9 } }
                    },
                    y: {
                        display: true,
                        grid: { display: false },
                        ticks: { font: { size: 9 } }
                    }
                }
            }
        });
    }

    // Distribution chart - Custom Heatmap
    async loadDistributionChart() {
        const data = await this.apiCall('/distribution/village-risk');
        if (!data || data.length === 0) {
            console.log('No distribution data available');
            return;
        }

        // Get unique villages and risk categories
        const villages = [...new Set(data.map(item => item.village))].filter(v => v).slice(0, 6);
        const riskCategories = [...new Set(data.map(item => item.risk_category))].filter(r => r).slice(0, 5);
        
        // Create heatmap container
        const chartContainer = document.getElementById('distributionChart').parentElement;
        chartContainer.innerHTML = `
            <div class="heatmap-container">
                <div class="heatmap-header">
                    <div class="heatmap-corner"></div>
                    ${riskCategories.map(cat => `<div class="heatmap-col-header">${cat}</div>`).join('')}
                </div>
                <div class="heatmap-body">
                    ${villages.map(village => {
                        const rowData = riskCategories.map(risk => {
                            const item = data.find(d => d.village === village && d.risk_category === risk);
                            return item ? parseInt(item.count) || 0 : 0;
                        });
                        const maxValue = Math.max(...data.map(item => parseInt(item.count) || 0));
                        
                        return `
                            <div class="heatmap-row">
                                <div class="heatmap-row-header">${village}</div>
                                ${rowData.map((value, index) => {
                                    const intensity = maxValue > 0 ? value / maxValue : 0;
                                    const color = this.getHeatmapColor(intensity);
                                    return `
                                        <div class="heatmap-cell" 
                                             style="background-color: ${color};"
                                             data-village="${village}"
                                             data-risk="${riskCategories[index]}"
                                             data-value="${value}"
                                             title="${village} - ${riskCategories[index]}: ${value} cases">
                                            <span class="heatmap-value">${value}</span>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="heatmap-legend">
                    <span>Low</span>
                    <div class="legend-gradient"></div>
                    <span>High</span>
                </div>
            </div>
        `;

        // Add interactive hover effects
        document.querySelectorAll('.heatmap-cell').forEach(cell => {
            cell.addEventListener('mouseenter', (e) => {
                e.target.style.transform = 'scale(1.1)';
                e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                e.target.style.zIndex = '10';
            });
            
            cell.addEventListener('mouseleave', (e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = 'none';
                e.target.style.zIndex = '1';
            });
        });
    }

    // Helper function to generate heatmap colors
    getHeatmapColor(intensity) {
        if (intensity === 0) return '#f8f9fa';
        
        // Create a gradient from light red to dark red for high pregnancy cases
        const colors = [
            '#ffebee', // Very light red
            '#ffcdd2', // Light red  
            '#ef9a9a', // Medium light red
            '#e57373', // Medium red
            '#ef5350', // Medium dark red
            '#f44336', // Red
            '#e53935', // Dark red
            '#d32f2f', // Darker red
            '#c62828', // Very dark red
            '#b71c1c'  // Deep red
        ];
        
        const index = Math.min(Math.floor(intensity * colors.length), colors.length - 1);
        return colors[index];
    }

    // Active district chart
    async loadActiveDistrictChart() {
        const data = await this.apiCall('/active-pregnancies/by-district');
        if (!data) return;

        const ctx = document.getElementById('activeDistrictChart').getContext('2d');
        this.charts.activeDistrict = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.slice(0, 6).map(item => item.district || 'Unknown'),
                datasets: [{
                    data: data.slice(0, 6).map(item => item.count),
                    backgroundColor: '#007bff',
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        display: true,
                        grid: { display: false },
                        ticks: { font: { size: 9 } }
                    },
                    y: {
                        display: true,
                        grid: { display: false },
                        ticks: { font: { size: 9 } }
                    }
                }
            }
        });
    }

    // Setup event listeners
    setupEventListeners() {
        // Back button functionality
        document.querySelector('.btn-back').addEventListener('click', () => {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = '/';
            }
        });

        // Auto-refresh every 5 minutes
        setInterval(() => {
            this.loadStats();
        }, 5 * 60 * 1000);

        // Handle window resize
        window.addEventListener('resize', () => {
            Object.values(this.charts).forEach(chart => {
                if (chart) {
                    chart.resize();
                }
            });
        });
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PregnancyDashboard();
}); 
let weightChart, runningChart, bikingChart;

// Common chart options
const commonOptions = {
    responsive: true,
    interaction: {
        mode: 'index',
        intersect: false,
    },
    animation: {
        duration: 1000,
        easing: 'easeInOutQuart'
    },
    plugins: {
        legend: {
            labels: {
                usePointStyle: true,
                padding: 15,
                font: {
                    family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    size: 12
                }
            }
        },
        tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
                size: 14,
                weight: 'bold'
            },
            bodyFont: {
                size: 13
            },
            bodySpacing: 8,
            usePointStyle: true,
            callbacks: {
                label: function(context) {
                    let label = context.dataset.label || '';
                    if (label) {
                        label += ': ';
                    }
                    if (context.parsed.y !== null) {
                        label += context.parsed.y;
                        if (label.includes('Miles')) {
                            label += ' mi';
                        } else if (label.includes('Weight')) {
                            label += ' lbs';
                        } else if (label.includes('Fat')) {
                            label += '%';
                        }
                    }
                    return label;
                }
            }
        }
    }
};

function createCharts() {
    // Weight and Body Fat Chart (dual axis)
    const weightCtx = document.getElementById('weightChart').getContext('2d');
    weightChart = new Chart(weightCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Weight',
                    data: [],
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    yAxisID: 'y-weight',
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: 'Body Fat',
                    data: [],
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    yAxisID: 'y-bodyfat',
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            ...commonOptions,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'month',
                        displayFormats: {
                            month: 'MMM yyyy'
                        }
                    },
                    grid: {
                        display: false
                    }
                },
                'y-weight': {
                    type: 'linear',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Weight (lbs)',
                        font: {
                            size: 13
                        }
                    },
                    grid: {
                        color: 'rgba(75, 192, 192, 0.1)'
                    },
                    ticks: {
                        callback: value => `${value} lbs`
                    }
                },
                'y-bodyfat': {
                    type: 'linear',
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Body Fat %',
                        font: {
                            size: 13
                        }
                    },
                    grid: {
                        display: false
                    },
                    ticks: {
                        callback: value => `${value}%`
                    }
                }
            }
        }
    });

    // Running/Walking Chart
    const runningCtx = document.getElementById('runningChart').getContext('2d');
    runningChart = new Chart(runningCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Monthly Miles',
                data: [],
                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                borderRadius: 6,
                borderSkipped: false,
                hoverBackgroundColor: 'rgb(54, 162, 235)'
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'month',
                        displayFormats: {
                            month: 'MMM yyyy'
                        }
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Distance (miles)',
                        font: {
                            size: 13
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        callback: value => `${value} mi`
                    }
                }
            }
        }
    });

    // Biking Chart
    const bikingCtx = document.getElementById('bikingChart').getContext('2d');
    bikingChart = new Chart(bikingCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Monthly Miles',
                data: [],
                backgroundColor: 'rgba(255, 159, 64, 0.8)',
                borderRadius: 6,
                borderSkipped: false,
                hoverBackgroundColor: 'rgb(255, 159, 64)'
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'month',
                        displayFormats: {
                            month: 'MMM yyyy'
                        }
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Distance (miles)',
                        font: {
                            size: 13
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        callback: value => `${value} mi`
                    }
                }
            }
        }
    });
}

function updateCharts(data) {
    // Use the actual Date objects for the x-axis
    const dates = data.dates;

    // Update Weight and Body Fat Chart
    weightChart.data.labels = dates;
    weightChart.data.datasets[0].data = data.weight;
    weightChart.data.datasets[1].data = data.bodyfat;
    weightChart.update('show');

    // Update Running Chart
    runningChart.data.labels = dates;
    runningChart.data.datasets[0].data = data.running;
    runningChart.update('show');

    // Update Biking Chart
    bikingChart.data.labels = dates;
    bikingChart.data.datasets[0].data = data.biking;
    bikingChart.update('show');
}

// Create charts when the page loads
document.addEventListener('DOMContentLoaded', createCharts); 
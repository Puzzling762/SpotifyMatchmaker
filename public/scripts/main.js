// Add subtle interactivity (optional animations or alerts)
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.form');
    form?.addEventListener('submit', () => {
        alert('Connecting to Spotify...');
    });
});

// GitHub Repo Details
const GITHUB_USER = 'alihaidershakermax';
const GITHUB_REPO = 'Elite';

// Fetch Latest APK from GitHub
async function updateDownloadLinks() {
    try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/releases/latest`);
        const data = await response.json();

        const apkAsset = data.assets.find(asset => asset.name.endsWith('.apk'));
        const apkBtn = document.getElementById('apk-download');

        if (apkAsset && apkBtn) {
            apkBtn.href = apkAsset.browser_download_url;
            console.log('APK link updated:', apkAsset.browser_download_url);
        }
    } catch (error) {
        console.error('Error fetching GitHub release:', error);
    }
}

// Platform Detection
function detectPlatform() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const downloadSection = document.getElementById('download');

    if (/android/i.test(userAgent)) {
        document.getElementById('apk-download')?.classList.add('recommended');
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        document.getElementById('ios-download')?.classList.add('recommended');
    } else {
        document.getElementById('web-btn')?.classList.add('recommended');
    }
}

// Initialize
window.addEventListener('load', () => {
    updateDownloadLinks();
    detectPlatform();
    reveal(); // Trigger reveal on load
});

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Reveal on scroll
const reveal = () => {
    const reveals = document.querySelectorAll('.reveal');
    for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const revealTop = reveals[i].getBoundingClientRect().top;
        const revealPoint = 150;

        if (revealTop < windowHeight - revealPoint) {
            reveals[i].classList.add('active');
        }
    }
};

window.addEventListener('scroll', reveal);

// Smooth scroll for anchors
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetValue = this.getAttribute('href');
        if (targetValue === '#') return;

        const target = document.querySelector(targetValue);
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Dynamic background blobs move slightly on mouse move
document.addEventListener('mousemove', (e) => {
    const blobs = document.querySelectorAll('.blob');
    const x = (e.clientX * 0.02);
    const y = (e.clientY * 0.02);
    blobs.forEach(blob => {
        blob.style.transform = `translate(${x}px, ${y}px)`;
    });
});

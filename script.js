// ==========================================
// 1. 抓取網頁上所有需要用到的基本積木
// ==========================================
const slides = document.querySelectorAll('.slide');
const indicators = document.querySelectorAll('.indicator');
const animalTags = document.querySelectorAll('.animal-tag');
const dots = document.querySelectorAll('.dot');
const animalCards = document.querySelectorAll('.animal-card'); // 確保這行有抓到卡片

let currentIndex = 0;
let slideInterval;

// ==========================================
// 2. 核心輪播圖控制邏輯（首頁專用）
// ==========================================
function showSlide(index) {
    if (slides.length === 0) return; 
    
    slides[currentIndex].classList.remove('active');
    indicators[currentIndex].classList.remove('active');
    animalTags[currentIndex].classList.remove('active');
    dots[currentIndex].classList.remove('active');

    currentIndex = index;

    slides[currentIndex].classList.add('active');
    indicators[currentIndex].classList.add('active');
    animalTags[currentIndex].classList.add('active');
    dots[currentIndex].classList.add('active');
}

function nextSlide() {
    if (slides.length === 0) return;
    let next = (currentIndex + 1) % slides.length;
    showSlide(next);
}

function prevSlide() {
    if (slides.length === 0) return;
    let prev = (currentIndex - 1 + slides.length) % slides.length;
    showSlide(prev);
}

function goToSlide(index) {
    showSlide(index);
    resetTimer(); 
}

function startTimer() {
    if (slides.length === 0) return;
    slideInterval = setInterval(nextSlide, 8000); 
}

function resetTimer() {
    clearInterval(slideInterval);
    startTimer();
}

// 啟動首頁自動更換圖片
startTimer();


// ==========================================
// 3. 🧠【智慧型鋼鐵封印】：只鎖死 Explore 首頁，其餘分頁放行自由滾動
// ==========================================
function preventScroll(e) {
    if (window.location.href.includes('habitats.html') || 
        window.location.href.includes('conservation.html') ||
        window.location.href.includes('adopt.html')) {
        return; 
    }
    e.preventDefault(); 
}

window.addEventListener('wheel', preventScroll, { passive: false });
window.addEventListener('touchmove', preventScroll, { passive: false });


// ==========================================
// 4. 控制彈出式視窗（Modal）、回到頂部 與 睇全相燈箱
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    const contactBtn = document.querySelector('.btn-donate');
    const donateModal = document.getElementById('donateModal');
    const closeBtn = document.getElementById('closeBtn');
    const modalForm = document.getElementById('modalForm');
    const thankYouState = document.getElementById('thankYouState');
    const backToTopBtn = document.querySelector('.back-to-top');
    const animalButtons = document.querySelectorAll('.btn-adopt-now');
    
    // 【新抓取】：睇全相燈箱的積木
    const imageLightbox = document.getElementById('imageLightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const closeLightboxBtn = document.getElementById('closeLightboxBtn');

    // ---- A. 認養/捐款彈窗邏輯 ----
    if (donateModal) {
        if (contactBtn) {
            contactBtn.addEventListener('click', function(event) {
                event.preventDefault();
                donateModal.classList.add('active');
            });
        }

        if (animalButtons.length > 0) {
            animalButtons.forEach(button => {
                button.addEventListener('click', function(event) {
                    event.preventDefault();
                    donateModal.classList.add('active');
                });
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                donateModal.classList.remove('active');
                setTimeout(resetModal, 400); 
            });
        }

        donateModal.addEventListener('click', function(event) {
            if (event.target === donateModal) {
                donateModal.classList.remove('active');
                setTimeout(resetModal, 400); 
            }
        });

        // 🔥【核心大對接】：當使用者按下 Support Now 送出表單時，同步寄去 Google Sheet！
        if (modalForm && thankYouState) {
            modalForm.addEventListener('submit', function(event) {
                event.preventDefault(); // 阻止網頁刷新
                
                // 1. 先把按鈕文字改成載入中，提升使用者體驗 (UX)
                const submitBtn = modalForm.querySelector('.btn-submit');
                const originalText = submitBtn.innerText;
                submitBtn.innerText = 'Sending...';
                submitBtn.style.opacity = '0.7';
                submitBtn.disabled = true;

                // 2. 抓取表單內使用者真正填寫的 Full Name, Email 和選單項目
                // 表單裡面第一個 input 是名字，第二個是 Email
                const inputs = modalForm.querySelectorAll('input');
                const selectOpt = modalForm.querySelector('select');
                
                const formData = {
                    name: inputs[0].value,
                    email: inputs[1].value,
                    option: selectOpt.value
                };

                // 3. 你的專屬 Google Sheet 後台 API 網址
                const scriptUrl = 'https://script.google.com/macros/s/AKfycbwiWtEjtLzeuRDfLfMvBVz3kkB221LkKUQ5jOV-SvFp6gtnQICm9QJCvOdvU1M1liuj/exec';

                // 4. 使用現代網頁 fetch 絕招，把資料當成包裹郵寄出去！
                fetch(scriptUrl, {
                    method: 'POST',
                    mode: 'no-cors', // 破除瀏覽器跨網域安全鎖，確保順暢發送
                    cache: 'no-cache',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                })
                .then(() => {
                    // 5. 郵寄成功！原地隱藏表單，彈出你最得意的 Thank You 畫面！
                    modalForm.style.display = 'none';
                    thankYouState.style.display = 'block';
                })
                .catch(error => {
                    console.error('資料庫回報錯誤:', error);
                    alert('Submission failed. Please try again.');
                })
                .finally(() => {
                    // 恢復按鈕原本的狀態
                    submitBtn.innerText = originalText;
                    submitBtn.style.opacity = '1';
                    submitBtn.disabled = false;
                });
            });
        }
        
        function resetModal() {
            modalForm.style.display = 'block';
            thankYouState.style.display = 'none';
            modalForm.reset(); 
        }
    }

    // ---- B. 右下角「回到頂部」按鈕控制 ----
    if (backToTopBtn) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });
    }

    // ---- C. 🌟【已完美融入】：點擊卡片睇動物全相（Lightbox）功能 ----
    if (imageLightbox && lightboxImg && animalCards.length > 0) {
        animalCards.forEach(card => {
            card.addEventListener('click', function(e) {
                // 如果點擊的是底部的「Sponsor 按鈕」，去開捐款表格，不開燈箱
                if (e.target.classList.contains('btn-adopt-now')) {
                    return; 
                }

                // 1. 自動抓取這張卡片的 CSS 高清背景圖網址
                const computedStyle = window.getComputedStyle(this);
                const bgUrl = computedStyle.backgroundImage;

                // 2. 清洗網址字眼提取乾淨 URL
                const cleanUrl = bgUrl.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');

                // 3. 送入大圖容器並亮起燈箱
                lightboxImg.src = cleanUrl;
                imageLightbox.classList.add('active');
            });
        });

        // 點擊 X 關閉燈箱
        if (closeLightboxBtn) {
            closeLightboxBtn.addEventListener('click', function() {
                imageLightbox.classList.remove('active');
            });
        }

        // 點擊大片黑色背景直接關閉燈箱
        imageLightbox.addEventListener('click', function(e) {
            if (e.target === imageLightbox) {
                imageLightbox.classList.remove('active');
            }
        });
    }

    // ---- D. 頂部按鈕「動態標籤篩選器」功能 ----
    const filterButtons = document.querySelectorAll('.btn-filter');
    if (filterButtons.length > 0 && animalCards.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                document.querySelector('.btn-filter.active').classList.remove('active');
                this.classList.add('active');

                const targetCategory = this.getAttribute('data-category');

                animalCards.forEach(card => {
                    const cardType = card.getAttribute('data-type');
                    if (targetCategory === 'all' || targetCategory === cardType) {
                        card.classList.remove('hide');
                    } else {
                        card.classList.add('hide');
                    }
                });
            });
        });
    }
});

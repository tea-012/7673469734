// Header blur
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (header) header.classList.toggle('scrolled', window.scrollY > 50);
});

// Плавное появление
const observer = new IntersectionObserver(entries => {
    entries.forEach(e => e.isIntersecting && e.target.classList.add('show'));
});
document.querySelectorAll('section, .card').forEach(el => {
    el.classList.add('fade');
    observer.observe(el);
});

/* =========================
   КНОПКА ПОКАЗАТЬ/СКРЫТЬ ДОП. РАБОТЫ
========================= */
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('toggleExtraBtn');
    const extraWorks = document.querySelectorAll('.extra-work');
    
    if (toggleBtn && extraWorks.length > 0) {
        let isVisible = false; // сначала скрыты
        
        toggleBtn.addEventListener('click', () => {
            if (!isVisible) {
                // ПОКАЗЫВАЕМ дополнительные работы
                extraWorks.forEach(work => {
                    work.style.display = 'block';
                    work.style.animation = 'slideUp 0.4s ease forwards';
                });
                toggleBtn.innerHTML = 'Скрыть дополнительные работы';
                toggleBtn.style.background = 'linear-gradient(135deg, #97277A, #C93367)';
                isVisible = true;
                
                if (typeof starRain === 'function') {
                    starRain({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
                }
            } else {
                // СКРЫВАЕМ дополнительные работы
                extraWorks.forEach(work => {
                    work.style.display = 'none';
                });
                toggleBtn.innerHTML = 'Показать ещё работы';
                toggleBtn.style.background = 'linear-gradient(135deg, #5B4BFF, #8A7CFF)';
                isVisible = false;
            }
        });
    }
});

// Анимация появления для доп. работ
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);



// Модалка
const modal = document.getElementById('workModal');
if (modal) {
    const modalImg = modal.querySelector('.modal-img');
    const modalTitle = modal.querySelector('.modal-title');
    const modalDesc = modal.querySelector('.modal-desc');
    
    document.querySelector('.grid').addEventListener('click', (e) => {
        const card = e.target.closest('.card');
        if (!card) return;
        modalImg.src = card.querySelector('img')?.src || '';
        modalTitle.textContent = card.querySelector('h3')?.textContent || '';
        modalDesc.textContent = card.querySelector('p')?.textContent || '';
        modal.classList.add('is-active');
        document.body.style.overflow = 'hidden';
    });
    
    modal.querySelector('.modal-close')?.addEventListener('click', () => {
        modal.classList.remove('is-active');
        document.body.style.overflow = '';
    });
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('is-active'); });
}

/* =========================
   ПОМОЩНИК
========================= */
const openBtn = document.getElementById('assistantOpen');
const assistant = document.getElementById('assistant');
const message = document.getElementById('message');
const questions = document.getElementById('questions');
const characterImg = document.getElementById('characterImg');
const closeBtn = document.getElementById('assistantClose');
const typingAudio = document.getElementById('typingSound');

let talkingInterval = null;
let typingInterval = null;
let soundInterval = null;

// Управление звуком
function startSound() {
    if (soundInterval) clearInterval(soundInterval);
    if (typingAudio && !window._soundBlocked) {
        typingAudio.volume = 0.1;
        typingAudio.play().catch(() => { window._soundBlocked = true; });
        soundInterval = setInterval(() => {
            if (typingAudio && !window._soundBlocked) {
                typingAudio.currentTime = 0;
                typingAudio.play().catch(() => {});
            }
        }, 100);
    }
}

function stopSound() {
    if (soundInterval) clearInterval(soundInterval);
    soundInterval = null;
    if (typingAudio) {
        typingAudio.pause();
        typingAudio.currentTime = 0;
    }
}

// Эффект печатания текста
function typeText(text, callback) {
    if (!message) return;
    message.innerText = '';
    message.classList.add('active');

    let i = 0;
    const speed = 55; // скорость печати (мс)

    startSound();     // звук сразу
    startTalking();   // анимация рта сразу

    typingInterval = setInterval(() => {
        if (i < text.length) {
            message.innerText += text.charAt(i); // корректно добавляет пробелы
            i++;
        } else {
            clearInterval(typingInterval);
            typingInterval = null;
            stopSound();
            if (callback) callback();
        }
    }, speed);
}

function showIntro() {
    if (questions) questions.style.display = 'none';
    message?.classList.remove('active');
    typeText("Привет! Я помогу тебе ✨", () => {
        setTimeout(() => {
            stopTalking();
            showQuestions();
        }, 2000);
    });
}

function showQuestions() {
    if (!questions) return;
    if (typingInterval) { clearInterval(typingInterval); typingInterval = null; }
    stopSound();
    stopTalking();

    message?.classList.remove('active');
    questions.style.display = 'flex';
    questions.innerHTML = '';

    const qData = [
        { id: 1, text: "Как заказать?" },
        { id: 2, text: "Доставка?" },
        { id: 3, text: "Материалы?" }
    ];

    qData.forEach((q, i) => {
        const bubble = document.createElement("div");
        bubble.className = "question-bubble";
        bubble.innerText = q.text;
        bubble.style.animationDelay = `${i * 0.1}s`;
        bubble.addEventListener('click', () => answer(q.id));
        questions.appendChild(bubble);
    });
}

function answer(id) {
    let text = "";
    if (id === 1) text = "Заполни форму заказа ✨";
    else if (id === 2) text = "Доставка через СДЭК 📦";
    else if (id === 3) text = "Использую безопасные материалы";

    if (questions) {
        questions.innerHTML = '';
        questions.style.display = 'none';
    }

    typeText(text, () => {
        setTimeout(() => {
            stopTalking();
            showQuestions();
        }, 2500);
    });
}

function startTalking() {
    if (!characterImg) return;
    characterImg.classList.add('talking');
    let isOpen = false;
    characterImg.src = "images/talk.jfif";

    if (talkingInterval) clearInterval(talkingInterval);
    talkingInterval = setInterval(() => {
        if (characterImg) {
            characterImg.src = isOpen ? "images/talk.jfif" : "images/GAKUPO CATZ.jfif";
        }
        isOpen = !isOpen;
    }, 200);
}

function stopTalking() {
    if (talkingInterval) {
        clearInterval(talkingInterval);
        talkingInterval = null;
    }
    if (characterImg) {
        characterImg.src = "images/GAKUPO CATZ.jfif";
        characterImg.classList.remove('talking');
    }
}

// События
if (openBtn && assistant) {
    openBtn.addEventListener('click', () => {
        assistant.classList.add('is-open');
        openBtn.classList.add('is-hidden');
        showIntro();
    });

    closeBtn?.addEventListener('click', () => {
        assistant.classList.remove('is-open');
        openBtn.classList.remove('is-hidden');
        if (typingInterval) { clearInterval(typingInterval); typingInterval = null; }
        stopTalking();
        stopSound();
        message?.classList.remove('active');
        if (questions) questions.innerHTML = '';
    });

    // Клик по персонажу сбрасывает ответ и возвращает к вопросам
    characterImg?.addEventListener('click', () => {
        if (message && message.classList.contains('active')) {
            if (typingInterval) { clearInterval(typingInterval); typingInterval = null; }
            stopTalking();
            stopSound();
            message.classList.remove('active');
            showQuestions();
        }
    });
}

/* =========================
   БУРГЕР-МЕНЮ
========================= */
document.addEventListener('DOMContentLoaded', () => {
    const burger = document.getElementById('burgerBtn');
    const nav = document.querySelector('nav');
    const overlay = document.getElementById('menuOverlay');
    if (!burger || !nav) return;
    
    const toggleMenu = () => {
        const isOpen = nav.classList.toggle('is-open');
        burger.classList.toggle('is-active');
        overlay?.classList.toggle('is-active', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    };
    
    burger.addEventListener('click', toggleMenu);
    overlay?.addEventListener('click', toggleMenu);
    
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('is-open');
            burger.classList.remove('is-active');
            overlay?.classList.remove('is-active');
            document.body.style.overflow = '';
        });
    });
});

/* =========================
   ПЛАВНЫЙ СКРОЛЛ
========================= */
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});

/* =========================
PROCESS - НИТКА С ЦВЕТАМИ
========================= */
const threadCards = document.querySelectorAll('.thread-card');
const threadLines = document.querySelectorAll('.thread-line');

threadCards.forEach((card, index) => {
  card.addEventListener('mouseenter', () => {
    // Получаем цвет из data-атрибута
    const color = card.getAttribute('data-color');
    
    // Находим соответствующий сегмент нитки
    const line = document.querySelector(`.thread-line[data-segment="${index + 1}"]`);
    
    if (line) {
      // Меняем цвет нитки
      line.style.stroke = color;
      line.classList.add('active');
      
      // Меняем цвет узелка
      const knot = card.querySelector('.thread-knot');
      if (knot) {
        knot.style.background = color;
        knot.style.boxShadow = `0 3px 10px ${color}66`;
      }
    }
  });
  
  card.addEventListener('mouseleave', () => {
    const line = document.querySelector(`.thread-line[data-segment="${index + 1}"]`);
    
    if (line) {
      // Возвращаем исходный цвет
      line.style.stroke = '#a18cd1';
      line.classList.remove('active');
      
      // Возвращаем узелок
      const knot = card.querySelector('.thread-knot');
      if (knot) {
        knot.style.background = '#97277A';
        knot.style.boxShadow = '0 3px 10px rgba(151, 39, 122, 0.4)';
      }
    }
  });
});

/* =========================
ПАРАЛЛАКС — МЕРЧ
========================= */
(() => {
  const merchSection = document.getElementById('merch');
  if (!merchSection) return;
  
  // Выбираем только обёртки (parallax-item)
  const items = merchSection.querySelectorAll('.parallax-item');
  if (items.length === 0) return;

  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;

  document.addEventListener('mousemove', (e) => {
    targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function animate() {
    // Плавность
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    items.forEach((item) => {
      const speed = parseFloat(item.dataset.speed) || 0.02;
      const moveX = currentX * speed * 100; // Увеличил амплитуду до 1-2 см
      const moveY = currentY * speed * 100;
      
      // Двигаем только обёртку
      item.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });

    requestAnimationFrame(animate);
  }

  animate();
})();
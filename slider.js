(function () {
    var slider = document.getElementById('brandSlider');
    if (!slider) return;
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.slide'));
    var dotsWrap = document.getElementById('sliderDots');
    var prevBtn = document.getElementById('sliderPrev');
    var nextBtn = document.getElementById('sliderNext');
    var index = 0;
    var timer = null;

    function goTo(i) {
        index = (i + slides.length) % slides.length;
        slides.forEach(function (slide, n) {
            slide.classList.toggle('is-active', n === index);
        });
        if (dotsWrap) {
            dotsWrap.querySelectorAll('.slider-dot').forEach(function (dot, n) {
                dot.classList.toggle('is-active', n === index);
                dot.setAttribute('aria-selected', n === index ? 'true' : 'false');
            });
        }
    }

    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }

    function startAuto() {
        stopAuto();
        timer = setInterval(next, 5500);
    }

    function stopAuto() {
        if (timer) clearInterval(timer);
        timer = null;
    }

    if (dotsWrap) {
        slides.forEach(function (_, n) {
            var dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'slider-dot' + (n === 0 ? ' is-active' : '');
            dot.setAttribute('aria-label', 'الشريحة ' + (n + 1));
            dot.setAttribute('role', 'tab');
            dot.addEventListener('click', function () {
                goTo(n);
                startAuto();
            });
            dotsWrap.appendChild(dot);
        });
    }

    if (nextBtn) nextBtn.addEventListener('click', function () { next(); startAuto(); });
    if (prevBtn) prevBtn.addEventListener('click', function () { prev(); startAuto(); });

    slider.addEventListener('mouseenter', stopAuto);
    slider.addEventListener('mouseleave', startAuto);

    var touchX = 0;
    slider.addEventListener('touchstart', function (e) {
        touchX = e.changedTouches[0].clientX;
    }, { passive: true });
    slider.addEventListener('touchend', function (e) {
        var dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) < 50) return;
        if (dx > 0) prev();
        else next();
        startAuto();
    }, { passive: true });

    goTo(0);
    startAuto();
})();

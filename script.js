(function () {
    var menuBtn = document.getElementById('mobileMenuBtn');
    var mobileNav = document.getElementById('mobileNav');
    if (menuBtn && mobileNav) {
        menuBtn.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
        mobileNav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                mobileNav.classList.remove('open');
            });
        });
    }

    /* Brand slider (homepage) */
    var slider = document.getElementById('brandSlider');
    if (slider) {
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
    }

    var form = document.getElementById('orderForm');
    if (!form) return;

    var sheetUrl = form.getAttribute('data-sheet') ||
        (typeof STORE !== 'undefined' && STORE.sheetUrl) ||
        'https://sheetdb.io/api/v1/glsn5w5ktwugw';
    var productName = form.getAttribute('data-product') || 'طلب نسمة هوم';
    var msg = document.getElementById('orderMsg');
    var submitBtn = document.getElementById('orderSubmit');
    var stickyPrice = document.getElementById('stickyPrice');
    var stickyBtn = document.getElementById('stickyOrderBtn');

    if (stickyPrice || stickyBtn) {
        document.body.classList.add('has-sticky-order');
    }

    function getSelectedBundle() {
        var checked = form.querySelector('input[name="bundle"]:checked');
        if (!checked) {
            return { price: 199, label: 'قطعة واحدة', id: 'single' };
        }
        return {
            price: parseInt(checked.getAttribute('data-price'), 10) || 199,
            label: checked.getAttribute('data-label') || 'قطعة واحدة',
            id: checked.value,
            quantity: parseInt(checked.getAttribute('data-quantity'), 10) || 1
        };
    }

    var hasBundles = form.querySelectorAll('input[name="bundle"]').length > 0;

    function syncBundleUI() {
        if (!hasBundles) return;
        var bundle = getSelectedBundle();
        var priceText = bundle.price + ' ر.س';
        if (submitBtn) {
            submitBtn.textContent = 'تأكيد الطلب — ' + priceText;
        }
        if (stickyPrice) {
            stickyPrice.textContent = priceText;
        }
        form.querySelectorAll('.bundle-option').forEach(function (el) {
            var input = el.querySelector('input');
            el.classList.toggle('selected', input && input.checked);
        });
    }

    form.querySelectorAll('input[name="bundle"]').forEach(function (radio) {
        radio.addEventListener('change', syncBundleUI);
    });
    syncBundleUI();

    if (stickyBtn) {
        stickyBtn.addEventListener('click', function () {
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    /** Read checkout fields by `name` (preferred) or legacy id order-* */
    function readOrderField(fieldName) {
        var byName = form.querySelector('[name="' + fieldName + '"]');
        if (byName) return byName.value.trim();
        var byId = form.querySelector('#order-' + fieldName);
        return byId ? byId.value.trim() : '';
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        var bundle = hasBundles ? getSelectedBundle() : null;
        var name = readOrderField('name');
        var phone = readOrderField('phone');
        var cityValue = readOrderField('city');
        var addressValue = readOrderField('address');
        var defaultSubmitText = submitBtn ? submitBtn.textContent : '';
        var productKey = form.getAttribute('data-product-key');
        productName = form.getAttribute('data-product') || productName;
        var useCodNetwork = hasBundles && typeof CodNetwork !== 'undefined';

        console.log('[NASMA COD] Submit path', {
            useCodNetwork: useCodNetwork,
            hasCodModule: typeof CodNetwork !== 'undefined',
            productKey: productKey,
            productName: productName
        });

        if (!name || !phone) {
            if (msg) {
                msg.textContent = 'يرجى إدخال الاسم ورقم الجوال.';
                msg.className = 'form-msg err';
            }
            return;
        }

        if (useCodNetwork && !cityValue) {
            if (msg) {
                msg.textContent = 'يرجى إدخال المدينة.';
                msg.className = 'form-msg err';
            }
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'جاري الإرسال...';
        if (msg) msg.className = 'form-msg';

        function finishSuccess(extraQuery) {
            var q = extraQuery || '';
            if (!q && bundle) {
                q =
                    '?product=' +
                    encodeURIComponent(productName) +
                    '&bundle=' +
                    encodeURIComponent(bundle.label) +
                    '&price=' +
                    bundle.price;
            }
            if (msg) {
                msg.textContent =
                    'تم استلام طلبك بنجاح! سيتواصل معك فريق التأكيد قريباً — الدفع عند الاستلام.';
                msg.className = 'form-msg ok';
            }
            window.setTimeout(function () {
                window.location.href = 'thank-you.html' + q;
            }, useCodNetwork ? 900 : 0);
        }

        function failSubmit(text) {
            if (msg) {
                msg.textContent = text || 'حدث خطأ، حاول مرة ثانية.';
                msg.className = 'form-msg err';
            }
            submitBtn.disabled = false;
            if (hasBundles) {
                syncBundleUI();
            } else {
                submitBtn.textContent = defaultSubmitText || 'إرسال';
            }
        }

        if (useCodNetwork) {
            var catalog =
                typeof PRODUCTS !== 'undefined' && productKey ? PRODUCTS[productKey] : null;
            var sku =
                (catalog && catalog.codSku) ||
                form.getAttribute('data-cod-sku') ||
                productName;
            var qty = bundle.quantity || 1;
            var notes =
                productName +
                ' | ' +
                bundle.label +
                ' | ' +
                bundle.price +
                ' ' +
                (typeof STORE !== 'undefined' ? STORE.currency : 'ر.س');

            CodNetwork.submitCodOrder({
                customerName: name,
                phone: phone,
                city: cityValue,
                address: addressValue || cityValue,
                sku: sku,
                quantity: qty,
                lineTotal: bundle.price,
                notes: notes
            })
                .then(function (result) {
                    console.log('[NASMA COD] Submit success', result);
                    var q =
                        '?product=' +
                        encodeURIComponent(productName) +
                        '&bundle=' +
                        encodeURIComponent(bundle.label) +
                        '&price=' +
                        bundle.price;
                    if (result.reference) {
                        q += '&ref=' + encodeURIComponent(result.reference);
                    }
                    finishSuccess(q);
                })
                .catch(function (err) {
                    console.error('[NASMA COD] Submit failed', err);
                    if (err && err.details) {
                        console.error('[NASMA COD] API validation/details', err.details);
                    }
                    if (err && err.status) {
                        console.error('[NASMA COD] HTTP status', err.status);
                    }
                    if (err && err.message === 'missing_token') {
                        failSubmit(
                            'إعدادات COD Network غير مكتملة. أضف ملف cod-config.js برمز API.'
                        );
                        return;
                    }
                    if (err && err.message && err.message.indexOf('Failed to fetch') !== -1) {
                        console.error(
                            '[NASMA COD] Likely CORS or network block — browser cannot call api.cod.network directly.'
                        );
                        failSubmit(
                            'تعذّر الاتصال بـ COD Network (CORS/شبكة). قد تحتاج ربطاً عبر خادم وسيط.'
                        );
                        return;
                    }
                    failSubmit(err && err.message ? err.message : undefined);
                });
            return;
        }

        console.log('[NASMA COD] Fallback: SheetDB (CodNetwork unavailable or non-product form)');

        var orderLine = productName;
        if (bundle) {
            orderLine += ' | ' + bundle.label + ' | ' + bundle.price + ' SAR';
        }
        if (cityValue) orderLine += ' | ' + cityValue;
        if (addressValue) orderLine += ' | ' + addressValue;

        fetch(sheetUrl, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: [{ name: name, phone: phone, city: orderLine }]
            })
        })
            .then(function (res) {
                if (res.ok || res.status === 201) {
                    finishSuccess();
                } else {
                    throw new Error('fail');
                }
            })
            .catch(function () {
                failSubmit();
            });
    });
})();

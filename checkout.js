(function () {
    var PRODUCT = window.NASMA_PRODUCT || {};
    var TRACK = window.NASMA_TRACK || {};
    var SHIPEH_ENDPOINT = 'https://seller.shipeh.com/api/aadea90b-4444-4e39-8835-4ff986dfe5c7/import-leads';
    var SHIPEH_TOKEN = '121|VEAJSKNJFrPfsVKTIu57PBwudl4BYzmgc4dBOhi12dc9721e';
    var OFFERS = {
        single: { qty: 1, price: 150, save: 0, label: 'قطعة واحدة', per: 150 },
        gift: { qty: 2, price: 260, save: 40, label: 'عرض الهدية', per: 130 },
        family: { qty: 3, price: 360, save: 90, label: 'العرض العائلي', per: 120 }
    };
    var current = PRODUCT.defaultOffer || 'gift';
    var sku = PRODUCT.sku || TRACK.contentId || 'DRP92203';
    var form = document.getElementById('order');
    var checkoutTracked = false;
    function trackCheckout() {
        if (checkoutTracked || !window.nasmaTrack) return;
        checkoutTracked = true;
        window.nasmaTrack('InitiateCheckout', { value: OFFERS[current].price });
    }
    if (form) form.addEventListener('focusin', trackCheckout);
    var submitBtn = document.getElementById('orderSubmit');
    var msg = document.getElementById('orderMsg');
    var citySelect = document.getElementById('order-city');
    var cityOtherWrap = document.getElementById('fieldCityOther');

    function setText(id, value) {
        var el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    function setOffer(id) {
        if (!OFFERS[id]) id = 'gift';
        current = id;
        var offer = OFFERS[id];
        document.querySelectorAll('[data-offer]').forEach(function (el) {
            var on = el.getAttribute('data-offer') === id;
            el.classList.toggle('is-selected', on);
            if (el.tagName === 'BUTTON') el.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        setText('summaryLabel', offer.label);
        setText('summaryMeta', (offer.qty === 1 ? 'قطعة واحدة' : offer.qty === 2 ? 'قطعتان' : 'ثلاث قطع') + ' · ' + offer.per + ' د.ل للقطعة');
        setText('summaryPrice', offer.price + ' د.ل');
        setText('stickyLabel', offer.label);
        setText('stickyPrice', offer.price + ' د.ل');
        var save = document.getElementById('summarySave');
        var stickySave = document.getElementById('stickySave');
        if (save) {
            save.hidden = offer.save === 0;
            save.textContent = 'وفّر ' + offer.save + ' د.ل';
        }
        if (stickySave) {
            stickySave.hidden = offer.save === 0;
            stickySave.textContent = 'وفّر ' + offer.save + ' د.ل';
        }
        if (submitBtn) submitBtn.textContent = 'تأكيد الطلب — ' + offer.price + ' د.ل';
    }

    document.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-offer]');
        if (!btn || btn.tagName !== 'BUTTON') return;
        setOffer(btn.getAttribute('data-offer'));
    });

    function setFieldError(fieldId, errId, message) {
        var field = document.getElementById(fieldId);
        var err = document.getElementById(errId);
        if (!field || !err) return;
        var input = field.querySelector('input, select, textarea');
        if (message) {
            field.classList.add('is-invalid');
            err.hidden = false;
            err.textContent = message;
            if (input) input.setAttribute('aria-invalid', 'true');
        } else {
            field.classList.remove('is-invalid');
            err.hidden = true;
            err.textContent = '';
            if (input) input.removeAttribute('aria-invalid');
        }
    }

    function normalizePhone(raw) {
        var digits = String(raw || '').replace(/\D/g, '');
        if (digits.indexOf('00218') === 0) digits = digits.slice(5);
        else if (digits.indexOf('218') === 0 && digits.length >= 12) digits = digits.slice(3);
        if (digits.charAt(0) !== '0' && digits.length === 9) digits = '0' + digits;
        return digits;
    }

    if (citySelect) {
        citySelect.addEventListener('change', function () {
            var other = citySelect.value === 'أخرى';
            cityOtherWrap.hidden = !other;
            if (!other) setFieldError('fieldCityOther', 'cityOtherErr', '');
        });
    }

    ['order-name', 'order-phone', 'order-city', 'order-city-other'].forEach(function (id) {
        var el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('input', function () {
            var map = {
                'order-name': ['fieldName', 'nameErr'],
                'order-phone': ['fieldPhone', 'phoneErr'],
                'order-city': ['fieldCity', 'cityErr'],
                'order-city-other': ['fieldCityOther', 'cityOtherErr']
            };
            setFieldError(map[id][0], map[id][1], '');
            if (msg) { msg.textContent = ''; msg.className = 'form-msg'; }
        });
    });

    function validate() {
        var name = document.getElementById('order-name').value.trim();
        var phone = normalizePhone(document.getElementById('order-phone').value);
        var city = citySelect.value;
        var cityOther = document.getElementById('order-city-other').value.trim();
        var ok = true;
        setFieldError('fieldName', 'nameErr', name.length >= 2 ? '' : 'اكتب الاسم الكامل.');
        setFieldError('fieldPhone', 'phoneErr', /^09\d{8}$/.test(phone) ? '' : 'اكتب رقماً ليبياً صحيحاً، مثل 0912345678.');
        setFieldError('fieldCity', 'cityErr', city ? '' : 'اختر المدينة.');
        if (city === 'أخرى') {
            setFieldError('fieldCityOther', 'cityOtherErr', cityOther.length >= 2 ? '' : 'اكتب اسم المدينة.');
            if (cityOther.length < 2) ok = false;
        }
        if (name.length < 2 || !/^09\d{8}$/.test(phone) || !city) ok = false;
        return ok ? { name: name, phone: phone, city: city === 'أخرى' ? cityOther : city } : null;
    }

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (msg) { msg.textContent = ''; msg.className = 'form-msg'; }
            var data = validate();
            if (!data) {
                var bad = form.querySelector('.is-invalid input, .is-invalid select, .is-invalid textarea');
                if (bad) bad.focus();
                return;
            }
            var offer = OFFERS[current];
            trackCheckout();
            submitBtn.disabled = true;
            submitBtn.textContent = 'جاري تأكيد الطلب...';
            submitOrderToShipeh({
                sku: sku,
                name: data.name,
                phone: data.phone,
                address: data.city,
                qty: 1,
                total_price: offer.price,
                url: location.href.split('#')[0]
            }).then(function () {
                showSuccess(data);
            }).catch(function (error) {
                if (msg) {
                    msg.textContent = error && error.userMessage
                        ? error.userMessage
                        : 'حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى.';
                    msg.className = 'form-msg err';
                }
                submitBtn.disabled = false;
                setOffer(current);
            });
        });
    }

    function submitOrderToShipeh(formData) {
        var orderData = {
            sku: formData.sku || sku,
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            qty: formData.qty || 1,
            total_price: formData.total_price,
            url: formData.url
        };
        return fetch(SHIPEH_ENDPOINT, {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + SHIPEH_TOKEN,
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        }).then(function (response) {
            return response.text().then(function (text) {
                console.log(text);
                var result = {};
                try { result = text ? JSON.parse(text) : {}; } catch (e) { result = { message: text }; }
                if (!response.ok) {
                    console.error('خطأ في إرسال الطلب:', text);
                    var err = new Error('shipeh');
                    if (result && result.reason === 'product_not_found') {
                        err.userMessage = 'تعذّر تسجيل الطلب: رمز المنتج غير موجود في حساب Shipeh.';
                    } else if (result && result.message) {
                        err.userMessage = 'حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى.';
                    }
                    throw err;
                }
                console.log('تم إرسال الطلب بنجاح إلى Shipeh:', result);
                return result;
            });
        });
    }

    function showSuccess(data) {
        var offer = OFFERS[current];
        var thanks = document.getElementById('thanks');
        var text = document.getElementById('successText');
        if (text) {
            text.textContent = data.name + '، تم تسجيل طلبك: ' + offer.label + ' — ' + offer.price + ' د.ل — ' + data.city + '.';
        }
        if (window.nasmaTrack) {
            window.nasmaTrack('Purchase', { value: offer.price, transactionId: 'nasma-' + Date.now() });
        }
        if (msg) {
            msg.textContent = 'تم تسجيل طلبك بنجاح. سنتصل بك قريباً.';
            msg.className = 'form-msg ok';
        }
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'تم تأكيد الطلب';
        }
        if (!thanks) return;
        thanks.hidden = false;
        thanks.setAttribute('aria-hidden', 'false');
        requestAnimationFrame(function () { thanks.classList.add('is-open'); });
        var closeBtn = document.getElementById('thanksClose');
        if (closeBtn) closeBtn.focus();
    }

    var thanksEl = document.getElementById('thanks');
    var thanksClose = document.getElementById('thanksClose');
    if (thanksClose && thanksEl) {
        thanksClose.addEventListener('click', function () {
            thanksEl.classList.remove('is-open');
            thanksEl.setAttribute('aria-hidden', 'true');
        });
    }

    var sticky = document.getElementById('stickyBar');
    var orderEl = document.getElementById('order');
    if (sticky && orderEl && 'IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
            var visible = entries[0] && entries[0].isIntersecting;
            sticky.classList.toggle('is-hidden', visible);
            document.body.classList.toggle('has-sticky', !visible);
        }, { threshold: 0.22 });
        io.observe(orderEl);
    }

    setOffer(current);
})();

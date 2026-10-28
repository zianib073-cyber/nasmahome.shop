(function (cfg) {
    cfg = cfg || window.NASMA_TRACK || {};
    window.nasmaTrack = function (eventName, params) {
        params = params || {};
        var value = Number(params.value || 0);
        var currency = cfg.currency || 'LYD';
        var contentId = cfg.contentId || (window.NASMA_PRODUCT && window.NASMA_PRODUCT.sku) || 'DRP92203';
        if (cfg.facebookPixelId && window.fbq) {
            if (eventName === 'PageView') fbq('track', 'PageView');
            else if (eventName === 'InitiateCheckout') fbq('track', 'InitiateCheckout', { value: value, currency: currency, content_ids: [contentId], content_type: 'product', num_items: 1 });
            else if (eventName === 'Purchase') fbq('track', 'Purchase', { value: value, currency: currency, content_ids: [contentId], content_type: 'product', num_items: 1 });
        }
        if (cfg.tiktokPixelId && window.ttq) {
            if (eventName === 'PageView') ttq.page();
            else if (eventName === 'InitiateCheckout') ttq.track('InitiateCheckout', { value: value, currency: currency, content_id: contentId, content_type: 'product' });
            else if (eventName === 'Purchase') ttq.track('CompletePayment', { value: value, currency: currency, content_id: contentId, content_type: 'product' });
        }
        if (window.gtag && (cfg.googleMeasurementId || cfg.googleAdsId)) {
            if (eventName === 'InitiateCheckout') gtag('event', 'begin_checkout', { currency: currency, value: value, items: [{ item_id: contentId, quantity: 1 }] });
            else if (eventName === 'Purchase') {
                gtag('event', 'purchase', { transaction_id: params.transactionId || ('nasma-' + Date.now()), currency: currency, value: value, items: [{ item_id: contentId, quantity: 1 }] });
                if (cfg.googleAdsId && cfg.googleAdsLabel) gtag('event', 'conversion', { send_to: cfg.googleAdsId + '/' + cfg.googleAdsLabel, value: value, currency: currency, transaction_id: params.transactionId || '' });
            }
        }
    };
    if (cfg.facebookPixelId) {
        !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', cfg.facebookPixelId);
        fbq('track', 'PageView');
    }
    if (cfg.tiktokPixelId) {
        !function (w, d, t) { w.TiktokAnalyticsObject = t; var ttq = w[t] = w[t] || []; ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie']; ttq.setAndDefer = function (t, e) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))); }; }; for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]); ttq.load = function (e, n) { var i = 'https://analytics.tiktok.com/i18n/pixel/events.js'; ttq._i = ttq._i || {}; ttq._i[e] = []; ttq._i[e]._u = i; ttq._t = ttq._t || {}; ttq._t[e] = +new Date(); ttq._o = ttq._o || {}; ttq._o[e] = n || {}; var o = document.createElement('script'); o.type = 'text/javascript'; o.async = !0; o.src = i + '?sdkid=' + e + '&lib=' + t; var a = document.getElementsByTagName('script')[0]; a.parentNode.insertBefore(o, a); }; }(window, document, 'ttq');
        ttq.load(cfg.tiktokPixelId);
        ttq.page();
    }
    if (cfg.googleMeasurementId || cfg.googleAdsId) {
        var gid = cfg.googleMeasurementId || cfg.googleAdsId;
        var gs = document.createElement('script');
        gs.async = true;
        gs.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(gid);
        document.head.appendChild(gs);
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () { dataLayer.push(arguments); };
        gtag('js', new Date());
        if (cfg.googleMeasurementId) gtag('config', cfg.googleMeasurementId);
        if (cfg.googleAdsId) gtag('config', cfg.googleAdsId);
    }
})(window.NASMA_TRACK);

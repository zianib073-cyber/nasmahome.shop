const STORE = {
    name: 'نسمة هوم',
    nameEn: 'NASMA Home',
    tagline: 'منتجات موثوقة · شحن مجاني · دفع عند الاستلام',
    currency: 'ر.س',
    sheetUrl: 'https://sheetdb.io/api/v1/glsn5w5ktwugw',
    codNetwork: {
        apiBase: 'https://api.cod.network/api/v2',
        /** Cloudflare Worker URL (no trailing slash). Required on GitHub Pages — fixes CORS. */
        proxyUrl: 'https://nasma-cod-proxy.zianib073.workers.dev',
        /** Leads → call-center queue (default). Use '/seller/orders' for direct order mode. */
        ordersPath: '/seller/leads',
        countryCode: 'SA',
        currencyCode: 'SAR',
        paymentMethod: 'cod',
        source: 'nasma-home-website',
        phoneFormat: 'sa_local',
        /** COD leads API expects `items`, not `products` (error 41030 otherwise). */
        lineItemsKey: 'items',
        debug: true
    }
};

const BUNDLES = [
    { id: 'single', price: 199, titleAr: 'قطعة واحدة', badge: '', quantity: 1 },
    { id: 'dual', price: 279, titleAr: 'باقة ثنائية', badge: 'الأكثر طلباً', quantity: 2 },
    { id: 'mega', price: 349, titleAr: 'الباقة المتكاملة', badge: 'وفّر أكثر', quantity: 3 }
];

const PRODUCTS = {
    light: {
        slug: 'product-light.html',
        nameAr: 'مصباح العمل المغناطيسي القابل للتدوير',
        sheetProduct: 'Ultra Work Light',
        codSku: 'MP-MSVRSTUWG5S2'
    },
    lock: {
        slug: 'product-lock.html',
        nameAr: 'قفل أمان النوافذ المنزلقة',
        sheetProduct: 'قفل نوافذ منزلقة',
        codSku: 'MP-MSVRSTUWG5S2'
    },
    straps: {
        slug: 'product-straps.html',
        nameAr: 'أحزمة رفع ونقل الأثاث الثقيل',
        sheetProduct: 'أحزمة نقل',
        codSku: 'MP-MSVRSTUWG5S2'
    }
};

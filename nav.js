(function () {
    var menuBtn = document.getElementById('mobileMenuBtn');
    var mobileNav = document.getElementById('mobileNav');
    if (!menuBtn || !mobileNav) return;
    function setOpen(open) {
        mobileNav.classList.toggle('open', open);
        menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        menuBtn.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
    }
    menuBtn.addEventListener('click', function () {
        setOpen(!mobileNav.classList.contains('open'));
    });
    mobileNav.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () { setOpen(false); });
    });
})();

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        if (url.pathname === "/" || url.pathname === "/index.html") {
            url.pathname = "/product-quran.html";
        }
        return env.ASSETS.fetch(new Request(url, request));
    }
};

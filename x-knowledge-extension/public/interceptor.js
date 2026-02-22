// X-knowledge 拦截器 v3.0.0
// 此文件运行在页面的 MAIN world 中
// 仅拦截书签相关的 GraphQL 请求（Bookmarks / bookmark_timeline）
(function () {
    var VERSION = '3.0.0';
    console.log('[X-knowledge] Inject: fetch/XHR interceptors installing (v' + VERSION + ')...');

    // 判断 URL 是否为书签相关的 GraphQL 端点
    function isBookmarkEndpoint(url) {
        // Twitter 书签 API 端点通常包含这些关键词
        var lowerUrl = url.toLowerCase();
        return (
            lowerUrl.indexOf('/bookmarks') !== -1 ||
            lowerUrl.indexOf('bookmark_timeline') !== -1 ||
            lowerUrl.indexOf('bookmarktimeline') !== -1
        );
    }

    // --- 拦截 Fetch ---
    var originalFetch = window.fetch;
    window.fetch = function () {
        var args = arguments;
        var fetchPromise = originalFetch.apply(this, args);

        try {
            var url = '';
            var input = args[0];
            if (typeof input === 'string') {
                url = input;
            } else if (input && input.href) {
                url = input.href;
            } else if (input && input.url) {
                url = input.url;
            } else if (input) {
                url = String(input);
            }

            if (url.indexOf('/graphql/') !== -1 && isBookmarkEndpoint(url)) {
                console.log('[X-knowledge-inject] Fetch 拦截到书签 API:', url.split('?')[0]);
                fetchPromise.then(function (response) {
                    var clone = response.clone();
                    clone.json().then(function (data) {
                        console.log('[X-knowledge-inject] 书签数据接收成功，发送消息...');
                        window.postMessage({
                            type: 'X_KNOWLEDGE_BOOKMARKS',
                            payload: data,
                            sourceUrl: url
                        }, '*');
                    }).catch(function () { });
                }).catch(function () { });
            }
        } catch (e) {
            console.error('[X-knowledge] Fetch interceptor error:', e);
        }

        return fetchPromise;
    };

    // --- 拦截 XMLHttpRequest ---
    var origOpen = XMLHttpRequest.prototype.open;
    var origSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method, url) {
        this._xk_url = (typeof url === 'string') ? url : String(url);
        return origOpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function () {
        var xhr = this;
        var url = xhr._xk_url || '';

        if (url.indexOf('/graphql/') !== -1 && isBookmarkEndpoint(url)) {
            xhr.addEventListener('load', function () {
                try {
                    if (xhr.responseText) {
                        console.log('[X-knowledge-inject] XHR 拦截到书签 API:', url.split('?')[0]);
                        var data = JSON.parse(xhr.responseText);
                        window.postMessage({
                            type: 'X_KNOWLEDGE_BOOKMARKS',
                            payload: data,
                            sourceUrl: url
                        }, '*');
                    }
                } catch (e) { }
            });
        }

        return origSend.apply(this, arguments);
    };

    console.log('[X-knowledge] Inject: 拦截器安装完成 (v' + VERSION + ')，仅监听书签 API');
})();

// 添加消息发出的监听器
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        // 不知道为什么这里面 console 会失效，同时如果使用 alert 会因为不能即时反应报错

        // 如果发出的消息是下载图片（"type" 也是自定义的，发出消息的参数是一个对象，里面的字段可以自由定义）
        if (request.type === "downloadImage") {
            downloadImage(request.fileName, request.url);
        }
    }
);

/**
 * 下载图片
 * @param {string} fileName 下载后的文件名，不包括后缀名
 * @param {string} url 下载链接
 */
function downloadImage(fileName, url) {
    // 按照 url 给下载文件名补充后缀名
    fileName += url.substring(url.lastIndexOf("."));
    // 下载
    chrome.downloads.download({
        filename: fileName,
        url: url
    });
}

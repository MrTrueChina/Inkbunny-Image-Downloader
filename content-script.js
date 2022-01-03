/**
 * 这个脚本用于给 Inkbunny 网页添加下载按钮
 */

// 添加按钮
addDownloadButton();

/**
 * 添加下载按钮
 */
function addDownloadButton() {
    // 获取图片名称元素包装元素时的根元素的 id
    let getPicNameContainerElementRootId = "pictop";
    // 获取图片名称元素包装元素时从根元素开始到获取到图片名称元素包装元素所需的所有标签和索引
    let getPicNameContainerElementTagPath = [["table", 0], ["tbody", 0], ["tr", 0], ["td", 1], ["div", 0], ["table", 0], ["tbody", 0], ["tr", 2]];
    // 图片名称元素
    let picNameElement;

    // 根据 id 获取根元素
    picNameElement = document.getElementById(getPicNameContainerElementRootId);

    // 遍历标签找到图片名称元素
    getPicNameContainerElementTagPath.forEach(tag => {
        picNameElement = picNameElement.getElementsByTagName(tag[0])[tag[1]];
    });

    // 创建按钮
    let td = document.createElement("td");
    let button = document.createElement("button");
    let text = document.createTextNode("Download");
    button.appendChild(text);
    td.appendChild(button);
    picNameElement.appendChild(td);

    // 给按钮的点击事件添加监听，调用下载按钮点击方法
    button.addEventListener("click", downloadButtonClick, false);
}

/**
 * 下载按钮点击时执行的方法
 */
function downloadButtonClick() {
    // 获取到正在浏览的图片的元素
    let imageElement = document.getElementById("magicbox");
    // 向上获取到 同时包含图片和下载按钮的层级的 div
    let imageAndDownloadDiv = imageElement.parentElement.parentElement
    // 向上找到 同时包含图片和图片列表的层级的 div
    let imageAndImageListDiv = imageElement.parentElement.parentElement.parentElement;

    // 获取下载图片的 a 标签
    let aList = imageAndDownloadDiv.getElementsByTagName("a");
    let downloadA = aList[aList.length - 1];

    let testName = "page.jpg";

    // 向 background 发出下载图片消息，downloads 在注入内容里不能使用，需要向 background 发消息让 background 使用
    chrome.runtime.sendMessage({ type: "downloadImage", fileName: testName, url: downloadA.href });
}

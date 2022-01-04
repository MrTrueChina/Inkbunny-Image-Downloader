/**
 * 这个脚本用于给 Inkbunny 网页添加下载按钮
 */

/**
 * 重命名单张图片的格式化字符串
 */
let renameSingleName;
/**
 * 重命名多张图片的格式化字符串
 */
let renameMultiName;
/**
 * 是否已经点击过下载按钮
 */
let downloaded = false;
/**
 * 下载按钮
 */
let downloadButton;

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
    downloadButton = document.createElement("button");
    let text = document.createTextNode("Download");
    downloadButton.appendChild(text);
    td.appendChild(downloadButton);
    picNameElement.appendChild(td);

    // 给按钮的点击事件添加监听，调用下载按钮点击方法
    downloadButton.addEventListener("click", downloadButtonClick, false);
}

/**
 * 下载按钮点击时执行的方法
 */
function downloadButtonClick() {
    // 如果已经下载了则不再起效
    if(downloaded){
        return;
    }

    // 先读取设置再下载
    chrome.storage.sync.get(
        {
            renameSingleName: "[${authorName}] ${imageName}_Inkbunny_${imageId}",
            renameMultiName: "[${authorName}] ${imageName}_Inkbunny_${imageId}_${page}"
        },
        (items) => {
            // 将读取到的格式化字符串保存到本地
            renameSingleName = items.renameSingleName;
            renameMultiName = items.renameMultiName;
            
            if (isSingleImage()) {
                // 当前图片是单图，直接下载当前网页上的单图
                downloadSingleImage();
            } else {
                // 否则使用多图方式下载
                downloadMultipleImage();
            }

            // 记录已下载
            downloaded = true;
            // 按钮文本改为已下载
            downloadButton.textContent = "Downloaded";
        }
    );
}

/**
 * 检测当前图片是否是单图
 * @returns 如果当前图片是单图则返回 true，是多图则返回 false
 */
function isSingleImage() {
    // 获取 id 为 files_area 的元素，这个是多图列表展示部分的一个元素的 id，获取不到则是单图
    return !(document.getElementById("files_area"));
}

/**
 * 下载单张图片
 */
function downloadSingleImage() {
    // 获取下载后的名称
    let fileName = getSingleImageName();
    
    // 单张下载
    downloadSingleImageByDocument(document, fileName);
}

/**
 * 通过 Document 下载单张图片
 * @param {Document} inkbunnyDoc Inkbunny 主站的图片浏览网页的 Document 对象
 * @param {string} fileName 下载后的文件名，包括后缀名
 */
function downloadSingleImageByDocument(inkbunnyDoc, fileName) {
    // 获取到正在浏览的图片的元素
    let imageElement = inkbunnyDoc.getElementById("magicbox");
    // 向上获取到 同时包含图片和下载按钮的层级的 div
    let imageAndDownloadDiv = imageElement.parentElement.parentElement;

    // 获取下载图片的 a 标签
    let aList = imageAndDownloadDiv.getElementsByTagName("a");
    let downloadA = aList[aList.length - 1];

    // 向 background 发出下载图片消息，downloads 在注入内容里不能使用，需要向 background 发消息让 background 使用
    chrome.runtime.sendMessage({ type: "downloadImage", fileName: fileName, url: downloadA.href });
}

/**
 * 下载多张图片
 */
function downloadMultipleImage(){
    // 获取 包括所有的分P列表的元素，Inkbunny 的分P是一个大容器里面好多个小列表，小列表存储分P
    let listContentElement = document.getElementById("files_area").parentElement;
    // 获取 包括每个图片的div
    let pageDivList = listContentElement.getElementsByClassName("widget_imageFromSubmission");

    // 遍历每个图
    for(let pageIndex = 0;pageIndex < pageDivList.length;pageIndex++){
        // 获取到这个图的 a 标签
        let pageA = pageDivList[pageIndex].getElementsByTagName("a")[0];
        // 通过标签里的链接下载图片
        downloadImageByHttpGet(pageIndex, pageA.href);
    }
}

/**
 * 通过 HTTP GET 请求下载图片
 * @param {int} pageIndex 这张图片在图集中的索引
 * @param {string} url HTTP GET 请求的链接
 */
function downloadImageByHttpGet(pageIndex, url){
    // 准备发送 HTTP 请求的对象
    let httpRequest = new XMLHttpRequest();
    
    // 开始连接，连接 a 标签的链接
    httpRequest.open('GET', url, true);

    // 设置获取成功后的处理方法
    httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            // 获取请求得到的值
            let responseText = httpRequest.responseText;

            // 以 HTML 方式转化为 Document 对象
            let doc = new DOMParser().parseFromString(responseText, "text/html");

            // 获取下载后的文件名
            let fileName = getMultipleImageName(pageIndex);

            // 下载这个网页的主图
             downloadSingleImageByDocument(doc,fileName);
        }
    };
    
    // 发送请求
    httpRequest.send();
}

/**
 * 获取单张图片下载后的名字
 */
function getSingleImageName(){
    
    // 以格式化文本为基础
    let name = renameSingleName;

    // 替换文本
    name = name.replace(/\$\{authorName\}/g, getAuthorName());
    name = name.replace(/\$\{authorId\}/g, getAuthorId());
    name = name.replace(/\$\{imageName\}/g, getOriginImageName());
    name = name.replace(/\$\{imageId\}/g, getImageId());

    // 去除 windows 不能命名的字符
    name = name.replace(/\\|\/|:|\*|\?|"|<|>|\|/g, "");

    return name;
}

/**
 * 获取多P图集中单张图片下载后的名字
 * @param {int} index 这张图片在多P图集中的索引
 */
function getMultipleImageName(index){
    
    // 以格式化文本为基础
    let name = renameMultiName;

    // 替换文本
    name = name.replace(/\$\{authorName\}/g, getAuthorName());
    name = name.replace(/\$\{authorId\}/g, getAuthorId());
    name = name.replace(/\$\{imageName\}/g, getOriginImageName());
    name = name.replace(/\$\{imageId\}/g, getImageId());
    name = name.replace(/\$\{page\}/g, index);

    // 去除 windows 不能命名的字符
    name = name.replace(/\\|\/|:|\*|\?|"|<|>|\|/g, "");

    return name;
}

/**
 * 获取图片作者名字
 */
function getAuthorName(){

    // 获取图片作者名字元素包装元素时的根元素的 id
    let getAuthorNameContainerElementRootId = "pictop";
    // 获取图片作者名字元素包装元素时从根元素开始到获取到图片名称元素包装元素所需的所有标签和索引
    let getAuthorNameContainerElementTagPath = [["table", 0], ["tbody", 0], ["tr", 0], ["td", 1], ["div", 0], ["table", 0], ["tbody", 0], ["tr", 0], ["td", 0], ["a", 1]];
    // 图片作者名字元素
    let authorNameElement;

    // 根据 id 获取根元素
    authorNameElement = document.getElementById(getAuthorNameContainerElementRootId);

    // 遍历标签找到图片名称元素
    getAuthorNameContainerElementTagPath.forEach(tag => {
        authorNameElement = authorNameElement.getElementsByTagName(tag[0])[tag[1]];
    });

    // 获取作者名称文本
    let authorName = authorNameElement.textContent;

    // 去除前后空格
    authorName = authorName.replace(/(^\s*)|(\s*$)/g, "");

    // 去除作者名后面的 “的作品” 和作品数量
    authorName = authorName.substring(0, authorName.lastIndexOf("'s Gallery"));

    return authorName;
}

/**
 * 获取图片作者 ID
 */
function getAuthorId() {
    // 获取图片作者头像元素包装元素时的根元素的 id
    let getAuthorHeadContainerElementRootId = "pictop";
    // 获取图片作者头像元素包装元素时从根元素开始到获取到图片名称元素包装元素所需的所有标签和索引
    let getAuthorHeadContainerElementTagPath = [["table", 0], ["tbody", 0], ["tr", 0], ["td", 1], ["div", 0], ["table", 0], ["tbody", 0], ["tr", 0], ["td", 0], ["a", 0]];
    // 图片作者头像元素
    let authorHeadElement;

    // 根据 id 获取根元素
    authorHeadElement = document.getElementById(getAuthorHeadContainerElementRootId);

    // 遍历标签找到图片名称元素
    getAuthorHeadContainerElementTagPath.forEach(tag => {
        authorHeadElement = authorHeadElement.getElementsByTagName(tag[0])[tag[1]];
    });

    // 获取作者的链接，这个链接可以提取出 ID
    let authorId = authorHeadElement.href;

    // 去除作者个人空间网址的固定部分
    authorId = authorId.replace("https://inkbunny.net/", "");

    return authorId;
}

/**
 * 获取图片原名
 */
function getOriginImageName() {
    // 获取图片名称元素包装元素时的根元素的 id
    let getImageNameContainerElementRootId = "pictop";
    // 获取图片名称元素包装元素时从根元素开始到获取到图片名称元素包装元素所需的所有标签和索引
    let getImageNameContainerElementTagPath = [["table", 0], ["tbody", 0], ["tr", 0], ["td", 1], ["div", 0], ["table", 0], ["tbody", 0], ["tr", 2], ["td", 0], ["h1", 0]];
    // 图片名称元素
    let imageNameElement;

    // 根据 id 获取根元素
    imageNameElement = document.getElementById(getImageNameContainerElementRootId);

    // 遍历标签找到图片名称元素
    getImageNameContainerElementTagPath.forEach(tag => {
        imageNameElement = imageNameElement.getElementsByTagName(tag[0])[tag[1]];
    });

    // 获取图片名称
    let imageName = imageNameElement.textContent;

    // 去除前后空格
    imageName = imageName.replace(/(^\s*)|(\s*$)/g, "");

    return imageName;
}

/**
 * 获取图片 ID
 */
function getImageId() {
    // 获取当前网页的 url
    let url = window.location.toString();
    
    // 移除固定部分
    let id = url.replace("https://inkbunny.net/s/","");

    // 对于多P图，Inkbunny 的网址后缀了分P等信息，需要删掉
    if (id.indexOf("-") != -1) {
        id = id.substring(0, id.indexOf("-"));
    }

    return id;
}

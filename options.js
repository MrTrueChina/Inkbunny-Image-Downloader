// 监听加载完毕事件，加载完毕后调用读取设置方法
document.addEventListener('DOMContentLoaded', restoreOptions);

// 监听保存按钮的点击事件，点击时调用保存设置方法
document.getElementById('save').addEventListener('click', saveOptions);

/**
 * 保存设置
 */
function saveOptions() {
    // 读取两个输入框的值
    let renameSingleName = document.getElementById("renameSingleImageInput").value;
    let multiImageFolderName = document.getElementById("multiImageFolderNameInput").value;
    let renameMultiName = document.getElementById("renameMultiImageInput").value;
    // 保存，保存分两个参数，前一个是保存设置的 KV 对象，后一个是保存成功的回调
    chrome.storage.sync.set(
        {
            renameSingleName: renameSingleName,
            multiImageFolderName: multiImageFolderName,
            renameMultiName: renameMultiName
        },
        () => { alert("Saved") }
    );
}
/**
 * 读取设置
 */
function restoreOptions() {
    // 读取，读取分两个参数，前一个是 KV 的“保存的名字”:“默认值”，后一个是回调，回调参数是和前面参数一样结构的对象
    chrome.storage.sync.get(
        {
            renameSingleName: "[${authorName}] ${imageName}_Inkbunny_${imageId}",
            multiImageFolderName: "[${authorName}] ${imageName}_Inkbunny_${imageId}",
            renameMultiName: "[${authorName}] ${imageName}_Inkbunny_${imageId}_${page}"
        },
        (items) => {
            document.getElementById('renameSingleImageInput').value = items.renameSingleName;
            document.getElementById('multiImageFolderNameInput').value = items.renameSingleName;
            document.getElementById('renameMultiImageInput').value = items.renameMultiName;
        }
    );
}

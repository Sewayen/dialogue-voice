// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化导航功能
    initNavigation();
    
    // 初始化语音生成器
    const dialogueGenerator = new DialogueGenerator();
    window.dialogueGenerator = dialogueGenerator;
    
    // 初始化短信界面生成器
    const messageGenerator = new MessageGenerator();
    window.messageGenerator = messageGenerator;
    
    // 初始化API相关功能
    initApiFeatures(dialogueGenerator);
});

// 初始化导航功能
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page-content');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetPage = item.dataset.page;
            navItems.forEach(nav => nav.classList.toggle('active', nav === item));
            pages.forEach(page => page.classList.toggle('active', page.id === targetPage));
        });
    });
}

// 初始化API相关功能
async function initApiFeatures(dialogueGenerator) {
    const apiKeyInput = document.getElementById('api-key');
    const verifyButton = document.getElementById('verify-api-key');
    const apiStatus = document.getElementById('api-status');

    // 清除之前的状态
    apiStatus.className = '';
    apiStatus.textContent = '';

    // 从localStorage加载API密钥
    const savedApiKey = localStorage.getItem('elevenlabs_api_key');
    if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
        try {
            await verifyApiKey(savedApiKey);
            apiStatus.textContent = '';
            apiStatus.className = 'api-status success';
            // 确保API验证成功后再加载角色
            await dialogueGenerator.loadSavedCharacters();
        } catch (error) {
            apiStatus.textContent = '';
            apiStatus.className = 'api-status error';
            localStorage.removeItem('elevenlabs_api_key');
            // API验证失败时清除保存的角色信息
            localStorage.removeItem('saved_characters');
        }
    }

    // 验证按钮点击事件
    if (verifyButton && apiKeyInput) {
        verifyButton.addEventListener('click', async () => {
            const apiKey = apiKeyInput.value.trim();
            if (!apiKey) {
                apiStatus.textContent = '';
                apiStatus.className = 'api-status error';
                return;
            }

            try {
                await verifyApiKey(apiKey);
                apiStatus.textContent = '';
                apiStatus.className = 'api-status success';
                localStorage.setItem('elevenlabs_api_key', apiKey);
                // 验证成功后再加载角色
                await dialogueGenerator.loadSavedCharacters();
            } catch (error) {
                apiStatus.textContent = '';
                apiStatus.className = 'api-status error';
                localStorage.removeItem('elevenlabs_api_key');
                // API验证失败时清除保存的角色信息
                localStorage.removeItem('saved_characters');
            }
        });
    }
}

// 显示API状态
function showApiStatus(message, isSuccess) {
    const statusDiv = document.getElementById('api-status');
    if (statusDiv) {
        statusDiv.textContent = '';
        statusDiv.className = 'api-status ' + (isSuccess ? 'success' : 'error');
    }
} 
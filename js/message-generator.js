// 短信界面生成器类
class MessageGenerator {
    constructor() {
        this.cropper = null;
        this.imageMap = new Map(); // 存储图片数据
        this.initEventListeners();
    }

    // 初始化事件监听器
    initEventListeners() {
        // 头像上传和裁剪
        const avatarInput = document.getElementById('avatarInput');
        const avatarPreview = document.querySelector('.avatar-preview');
        const avatarModal = document.getElementById('avatarModal');
        const closeBtn = avatarModal.querySelector('.close-btn');
        const cropBtn = avatarModal.querySelector('.crop-btn');
        const cancelBtn = avatarModal.querySelector('.cancel-btn');

        if (avatarInput) {
            avatarInput.addEventListener('change', (e) => this.handleAvatarUpload(e));
        }

        if (avatarPreview) {
            avatarPreview.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                avatarInput.click();
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeAvatarModal());
        }

        if (cropBtn) {
            cropBtn.addEventListener('click', () => this.cropAvatar());
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeAvatarModal());
        }

        // 生成对话按钮
        const generateBtn = document.querySelector('.generate-btn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateMessages());
        }

        // 导出截图按钮
        const exportBtn = document.querySelector('.export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportScreenshot());
        }

        // 添加图片按钮
        const addImageBtn = document.querySelector('.add-btn');
        if (addImageBtn) {
            addImageBtn.addEventListener('click', () => this.addImage());
        }

        // 监听输入变化
        const inputs = document.querySelectorAll('.config-item input[type="text"]');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.updatePreview());
        });

        // 加载保存的配置
        this.loadSavedConfig();
    }

    // 处理头像上传
    handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('请选择图片文件');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const avatarModal = document.getElementById('avatarModal');
            const cropperImage = document.getElementById('cropperImage');
            
            if (this.cropper) {
                this.cropper.destroy();
            }

            cropperImage.src = e.target.result;
            avatarModal.showModal();

            this.cropper = new Cropper(cropperImage, {
                aspectRatio: 1,
                viewMode: 1,
                dragMode: 'move',
                autoCropArea: 1,
                restore: false,
                guides: true,
                center: true,
                highlight: false,
                cropBoxMovable: false,
                cropBoxResizable: false,
                toggleDragModeOnDblclick: false
            });
        };
        reader.readAsDataURL(file);
    }

    // 关闭头像裁剪模态框
    closeAvatarModal() {
        const avatarModal = document.getElementById('avatarModal');
        avatarModal.close();
        if (this.cropper) {
            this.cropper.destroy();
            this.cropper = null;
        }
    }

    // 裁剪头像
    cropAvatar() {
        if (!this.cropper) return;

        const canvas = this.cropper.getCroppedCanvas({
            width: 128,
            height: 128
        });

        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const avatar = document.querySelector('.avatar');
            if (avatar) {
                avatar.src = url;
                this.saveConfig();
            }
        });

        this.closeAvatarModal();
    }

    // 生成消息
    generateMessages() {
        const textarea = document.querySelector('.text-input-area textarea');
        const chatContainer = document.querySelector('.chat-container');
        if (!textarea || !chatContainer) return;

        const lines = textarea.value.trim().split('\n');
        chatContainer.innerHTML = '';

        // 获取并处理发送方和接收方标识
        let senderMark = document.getElementById('senderMark').value.trim();
        let receiverMark = document.getElementById('receiverMark').value.trim();
        
        // 移除标识中的冒号
        senderMark = senderMark.replace(':', '');
        receiverMark = receiverMark.replace(':', '');

        let lastSender = null;
        let messageGroup = null;
        let currentSenderName = null;

        lines.forEach((line, index) => {
            if (!line.trim()) return;

            let sender, text;
            const hasIdentifier = line.includes(':');

            if (hasIdentifier) {
                const senderMatch = line.match(/^([^:]+):/);
                if (!senderMatch) return;
                sender = senderMatch[1].trim();
                currentSenderName = sender;
                text = line.substring(line.indexOf(':') + 1).trim();
            } else {
                if (!currentSenderName) return;
                sender = currentSenderName;
                text = line.trim();
            }

            // 判断是否为发送方消息（直接比较，因为已经移除了冒号）
            const isSent = sender === senderMark;
            const messageType = isSent ? 'sent' : 'received';

            // 如果发送者改变，创建新的消息组
            if (lastSender !== messageType) {
                messageGroup = document.createElement('div');
                messageGroup.className = `message-group ${messageType}`;
                chatContainer.appendChild(messageGroup);
            }

            const message = document.createElement('div');
            message.className = `message ${messageType}`;

            // 检查是否是图片消息
            const imageMatch = text.match(/\[图片:(\d+)\]/);
            if (imageMatch) {
                const imageId = imageMatch[1];
                const imageData = this.imageMap.get(imageId);

                if (imageData) {
                    message.setAttribute('data-type', 'image');
                    const img = document.createElement('img');
                    img.src = imageData;
                    img.className = 'message-image';
                    message.appendChild(img);
                } else {
                    message.textContent = '[图片]';
                }
            } else {
                message.textContent = text;
            }

            // 判断是否为最后一条消息
            const nextLine = lines[index + 1];
            const isLast = !nextLine || 
                          !nextLine.trim() || 
                          (nextLine.includes(':') && nextLine.split(':')[0].trim() !== sender);
            
            if (isLast) {
                message.classList.add('last');
            }

            if (messageGroup) {
                messageGroup.appendChild(message);
            }

            lastSender = messageType;
        });

        // 滚动到底部
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // 导出截图
    async exportScreenshot() {
        const iPhoneContainer = document.querySelector('.iphone-container');
        
        try {
            const canvas = await html2canvas(iPhoneContainer, {
                scale: 2,
                backgroundColor: null,
                logging: false
            });
            
            // 使用 dataURL 而不是 blob
            const dataUrl = canvas.toDataURL('image/png');
            
            // 获取当前日期
            const now = new Date();
            const year = now.getFullYear().toString().slice(-2);
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            
            // 从 localStorage 获取当前日期的计数器
            const dateKey = `${year}${month}${day}`;
            let counter = parseInt(localStorage.getItem(dateKey) || '0');
            counter++;
            localStorage.setItem(dateKey, counter.toString());
            
            // 生成文件名
            const fileName = `短信截图${year}${month}${day}${String(counter).padStart(2, '0')}`;
            
            // 创建下载链接
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('截图生成失败:', error);
        }
    }

    // 添加图片
    addImage() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.style.display = 'none';
        document.body.appendChild(input);

        const textarea = document.querySelector('.text-input-area textarea');
        if (!textarea) return;

        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                // 生成唯一的图片ID
                const imageId = Date.now().toString();
                // 存储图片数据
                this.imageMap.set(imageId, event.target.result);

                // 获取光标位置和文本
                const cursorPosition = textarea.selectionStart;
                const text = textarea.value;
                
                // 找到光标所在行的开始和结束位置
                const lastNewLine = text.lastIndexOf('\n', cursorPosition - 1) + 1;
                const nextNewLine = text.indexOf('\n', cursorPosition);
                const currentLine = text.substring(
                    lastNewLine,
                    nextNewLine === -1 ? text.length : nextNewLine
                );
                
                // 检查光标是否在当前行的末尾
                const cursorPosInLine = cursorPosition - lastNewLine;
                const isAtLineEnd = cursorPosInLine === currentLine.length;

                // 获取上一行的发送者
                let lastSender = '';
                if (isAtLineEnd && currentLine.trim()) {
                    // 如果在当前行末尾，使用当前行的发送者
                    const match = currentLine.match(/^([^:]+):/);
                    if (match) {
                        lastSender = match[1].trim();
                    }
                } else {
                    // 否则查找上一行的发送者
                    const textBeforeCursor = text.substring(0, lastNewLine);
                    const lines = textBeforeCursor.split('\n');
                    for (let i = lines.length - 1; i >= 0; i--) {
                        const line = lines[i].trim();
                        if (line) {
                            const match = line.match(/^([^:]+):/);
                            if (match) {
                                lastSender = match[1].trim();
                                break;
                            }
                        }
                    }
                }

                // 如果没有找到发送者，使用默认的发送者标记
                if (!lastSender) {
                    lastSender = document.getElementById('senderMark').value.trim();
                }

                // 构建图片标记文本
                const imageText = `${lastSender}: [图片:${imageId}]`;

                // 组装新文本
                let newText;
                let newPosition;
                if (isAtLineEnd && currentLine.trim()) {
                    // 在当前行末尾，且当前行不为空，先添加换行再插入图片
                    const beforeCursor = text.substring(0, cursorPosition);
                    const afterCursor = text.substring(cursorPosition);
                    newText = beforeCursor + '\n' + imageText + afterCursor;
                    newPosition = cursorPosition + 1 + imageText.length;
                } else {
                    // 不在行末或当前行为空，直接添加图片
                    const beforeCursor = text.substring(0, cursorPosition);
                    const afterCursor = text.substring(cursorPosition);
                    newText = beforeCursor + imageText + afterCursor;
                    newPosition = cursorPosition + imageText.length;
                }

                textarea.value = newText;
                textarea.setSelectionRange(newPosition, newPosition);
                textarea.focus();

                // 生成预览
                this.generateMessages();
            };
            reader.readAsDataURL(file);
            document.body.removeChild(input);
        });

        input.click();
    }

    // 更新预览
    updatePreview() {
        const contactName = document.getElementById('contactName').value;
        const nameDisplay = document.querySelector('.contact-name');
        if (nameDisplay) {
            nameDisplay.textContent = contactName || '联系人';
        }
        this.saveConfig();
    }

    // 保存配置
    saveConfig() {
        const config = {
            contactName: document.getElementById('contactName').value,
            senderMark: document.getElementById('senderMark').value,
            receiverMark: document.getElementById('receiverMark').value,
            avatarUrl: document.querySelector('.avatar').src
        };
        localStorage.setItem('message_generator_config', JSON.stringify(config));
    }

    // 加载保存的配置
    loadSavedConfig() {
        const savedConfig = localStorage.getItem('message_generator_config');
        if (savedConfig) {
            try {
                const config = JSON.parse(savedConfig);
                document.getElementById('contactName').value = config.contactName || '';
                document.getElementById('senderMark').value = config.senderMark || 'Ethan';  // 默认值改为不带冒号
                document.getElementById('receiverMark').value = config.receiverMark || 'Lily';  // 默认值改为不带冒号
                
                const avatar = document.querySelector('.avatar');
                if (avatar && config.avatarUrl) {
                    avatar.src = config.avatarUrl;
                }

                this.updatePreview();
            } catch (error) {
                console.error('加载配置失败:', error);
            }
        } else {
            // 如果没有保存的配置，设置默认值
            document.getElementById('senderMark').value = 'Ethan';
            document.getElementById('receiverMark').value = 'Lily';
        }
    }
}

// 导出MessageGenerator类
window.MessageGenerator = MessageGenerator; 
// 对话生成器类
class DialogueGenerator {
    constructor() {
        this.audioProcessor = new AudioProcessor();
        this.dialogues = [];
        this.characters = new Map();
        this.isGenerating = false;
        
        this.initEventListeners();
    }

    // 初始化事件监听器
    initEventListeners() {
        // 添加新角色按钮
        const addCharacterBtn = document.getElementById('add-character');
        if (addCharacterBtn) {
            addCharacterBtn.addEventListener('click', () => this.addNewCharacter());
        }

        // 解析对话按钮
        const parseDialogueBtn = document.getElementById('parse-dialogue');
        if (parseDialogueBtn) {
            parseDialogueBtn.addEventListener('click', () => this.parseDialogue());
        }

        // 生成音频按钮
        const generateAudioBtn = document.getElementById('generate-audio');
        if (generateAudioBtn) {
            generateAudioBtn.addEventListener('click', () => this.generateAudio());
        }

        // 合并音频按钮（不去静音）
        const mergeAudioBtn = document.getElementById('merge-audio');
        if (mergeAudioBtn) {
            mergeAudioBtn.addEventListener('click', () => this.mergeAudio(false));
        }

        // 合并音频按钮（去除静音）
        const mergeAudioNoSilenceBtn = document.getElementById('merge-audio-no-silence');
        if (mergeAudioNoSilenceBtn) {
            mergeAudioNoSilenceBtn.addEventListener('click', () => this.mergeAudio(true));
        }
    }

    // 添加新角色
    addNewCharacter() {
        const characterList = document.getElementById('character-list');
        if (!characterList) return;

        const character = {
            name: '',
            voiceId: '',
            stability: 0.2,
            similarity: 0.5,
            style: 0.5
        };

        const card = this.createCharacterCard(character);
        characterList.appendChild(card);
        this.saveCharacters();
    }

    // 创建角色卡片
    createCharacterCard(character) {
        const card = document.createElement('div');
        card.className = 'character-card';
        card.innerHTML = `
            <div class="character-info">
                <input type="text" class="character-name" value="${character.name}" placeholder="角色名称">
                <div class="voice-id-group">
                    <input type="text" class="character-voice-id" value="${character.voiceId}" placeholder="声音ID">
                    <button class="match-voice">匹配</button>
                </div>
            </div>
            <div class="voice-select-group">
                <select class="voice-select">
                    <option value="">选择声音</option>
                </select>
            </div>
            <div class="voice-params">
                <div class="param-group">
                    <label>稳定性</label>
                    <input type="range" class="stability" min="0" max="1" step="0.05" value="${character.stability}">
                    <span class="param-value">${character.stability}</span>
                </div>
                <div class="param-group">
                    <label>相似度</label>
                    <input type="range" class="similarity" min="0" max="1" step="0.05" value="${character.similarity}">
                    <span class="param-value">${character.similarity}</span>
                </div>
                <div class="param-group">
                    <label>风格</label>
                    <input type="range" class="style" min="0" max="1" step="0.05" value="${character.style}">
                    <span class="param-value">${character.style}</span>
                </div>
            </div>
            <div class="character-controls">
                <button class="preview-voice" title="Preview Voice">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                        <path d="M12 3v18a9 9 0 0 0 0-18z" fill="currentColor"/>
                        <path d="M16.5 3A11.5 11.5 0 0 1 16.5 21" stroke="currentColor" fill="none" stroke-width="2"/>
                        <path d="M19.5 5A15.5 15.5 0 0 1 19.5 19" stroke="currentColor" fill="none" stroke-width="2"/>
                    </svg>
                </button>
                <button class="remove-character" title="Delete">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                    </svg>
                </button>
            </div>
        `;

        // 添加事件监听器
        this.addCharacterCardListeners(card, character);

        // 加载声音列表
        const voiceSelect = card.querySelector('.voice-select');
        if (voiceSelect) {
            this.loadVoiceOptions(voiceSelect).then(() => {
                if (character.voiceId) {
                    voiceSelect.value = character.voiceId;
                    card.querySelector('.character-voice-id').value = character.voiceId;
                }
            });
        }

        // 添加匹配按钮事件监听器
        const matchButton = card.querySelector('.match-voice');
        if (matchButton) {
            matchButton.addEventListener('click', () => {
                const voiceId = card.querySelector('.character-voice-id').value;
                const voiceSelect = card.querySelector('.voice-select');
                if (voiceId && voiceSelect) {
                    voiceSelect.value = voiceId;
                    character.voiceId = voiceId;
                    this.saveCharacters();
                }
            });
        }

        return card;
    }

    // 加载声音选项
    async loadVoiceOptions(selectElement) {
        try {
            const apiKey = document.getElementById('api-key').value;
            if (!apiKey) {
                console.log('未找到API密钥');
                return;
            }

            console.log('开始获取声音列表...');
            const voices = await getVoices(apiKey);
            console.log('获取到的原始声音列表:', voices);

            if (!Array.isArray(voices)) {
                console.error('声音列表格式错误:', voices);
                throw new Error('声音列表格���错误');
            }

            selectElement.innerHTML = '<option value="">选择声音</option>';
            
            voices.forEach(voice => {
                console.log('处理声音:', voice);
                const option = document.createElement('option');
                option.value = voice.voice_id;
                
                let description = '';
                if (voice.labels && typeof voice.labels === 'object') {
                    const labels = [];
                    // 添加性别标签
                    if (voice.labels.gender) {
                        labels.push(voice.labels.gender);
                    }
                    // 添加年龄标签
                    if (voice.labels.age) {
                        labels.push(voice.labels.age);
                    }
                    // 添加其他标签
                    if (voice.labels.description) {
                        labels.push(voice.labels.description);
                    }
                    // 添加语言标签
                    if (voice.labels.language) {
                        labels.push(voice.labels.language);
                    }
                    // 添加使用案例标签
                    if (voice.labels.use_case) {
                        labels.push(voice.labels.use_case);
                    }
                    
                    if (labels.length > 0) {
                        description = ` (${labels.join(', ')})`;
                    }
                }
                
                option.textContent = `${voice.name}${description}`;
                console.log('创建的选项:', option.textContent);
                
                selectElement.appendChild(option);
            });

            console.log('声音列表加载完成，选项数量:', selectElement.options.length);
        } catch (error) {
            console.error('加载声音列表失败:', error);
            alert('加载声音列表失败: ' + error.message);
        }
    }

    // 更新声音详情
    updateVoiceDetails(card, voiceId) {
        const select = card.querySelector('.voice-select');
        const detailsDiv = card.querySelector('.voice-details');
        const selectedOption = Array.from(select.options).find(opt => opt.value === voiceId);
        
        if (selectedOption && selectedOption.dataset.details) {
            const details = JSON.parse(selectedOption.dataset.details);
            detailsDiv.innerHTML = `
                <div class="voice-detail-item">${details.gender}</div>
                <div class="voice-detail-item">${details.age}</div>
                <div class="voice-detail-item">${details.description}</div>
            `;
        } else {
            detailsDiv.innerHTML = '';
        }
    }

    // 添加角色卡片事件监听器
    addCharacterCardListeners(card, character) {
        // 更新参数值显示
        card.querySelectorAll('input[type="range"]').forEach(range => {
            range.addEventListener('input', (e) => {
                const value = e.target.value;
                e.target.nextElementSibling.textContent = value;
                character[e.target.className] = parseFloat(value);
                this.saveCharacters();
            });
        });

        // 预览声音
        card.querySelector('.preview-voice').addEventListener('click', () => {
            this.previewVoice(character);
        });

        // 删除角色
        card.querySelector('.remove-character').addEventListener('click', () => {
            if (confirm('确定要删除这个角色吗？')) {
                card.remove();
                this.removeCharacter(character);
            }
        });

        // 更新角色名称和声音ID
        card.querySelector('.character-name').addEventListener('change', (e) => {
            character.name = e.target.value;
            this.saveCharacters();
        });

        card.querySelector('.character-voice-id').addEventListener('change', (e) => {
            character.voiceId = e.target.value;
            const voiceSelect = card.querySelector('.voice-select');
            if (voiceSelect) {
                voiceSelect.value = e.target.value;
            }
            this.saveCharacters();
        });

        // 新声音选择
        card.querySelector('.voice-select').addEventListener('change', (e) => {
            character.voiceId = e.target.value;
            const voiceIdInput = card.querySelector('.character-voice-id');
            if (voiceIdInput) {
                voiceIdInput.value = e.target.value;
            }
            this.saveCharacters();
        });
    }

    // 解析对话内容
    parseDialogue() {
        const textarea = document.getElementById('batch-dialogue');
        const previewDiv = document.getElementById('dialogue-preview');
        if (!textarea || !previewDiv) return;

        const text = textarea.value.trim();
        if (!text) {
            previewDiv.innerHTML = '';
            this.dialogues = [];
            return;
        }

        const lines = text.split('\n');
        this.dialogues = [];
        previewDiv.innerHTML = '';

        for (const line of lines) {
            const match = line.match(/^(.+?):\s*(.+)$/);
            if (match) {
                const [, character, text] = match;
                this.dialogues.push({ character: character.trim(), text: text.trim() });
                
                const dialogueDiv = document.createElement('div');
                dialogueDiv.className = 'dialogue-preview-item';
                dialogueDiv.innerHTML = `
                    <span class="character-name">${character.trim()}</span>
                    <span class="dialogue-text">${text.trim()}</span>
                `;
                previewDiv.appendChild(dialogueDiv);
            }
        }
    }

    // 生成音频
    async generateAudio() {
        if (this.isGenerating || this.dialogues.length === 0) return;
        this.isGenerating = true;

        const apiKey = document.getElementById('api-key').value;
        if (!apiKey) {
            alert('请先输入并验证API密钥');
            this.isGenerating = false;
            return;
        }

        const audioList = document.getElementById('audio-list');
        const progressBar = document.getElementById('progress-bar');
        const progressDiv = progressBar.querySelector('.progress');
        
        audioList.innerHTML = '';
        this.audioProcessor.clearAudioBuffers();
        
        try {
            progressBar.classList.add('active');
            
            for (let i = 0; i < this.dialogues.length; i++) {
                const dialogue = this.dialogues[i];
                const character = this.findCharacter(dialogue.character);
                
                if (!character || !character.voiceId) {
                    console.warn(`找不到角色 "${dialogue.character}" 的声音配置`);
                    continue;
                }

                const progress = ((i + 1) / this.dialogues.length) * 100;
                progressDiv.style.width = `${progress}%`;

                try {
                    const audioBlob = await generateSpeech(apiKey, character.voiceId, dialogue.text, {
                        stability: character.stability,
                        similarity: character.similarity,
                        style: character.style
                    });

                    await this.audioProcessor.addAudioBuffer(audioBlob);

                    const audioElement = document.createElement('div');
                    audioElement.className = 'audio-item';
                    audioElement.innerHTML = `
                        <div class="audio-info">
                            <span class="character-name">${dialogue.character}</span>
                            <span class="dialogue-text">${dialogue.text}</span>
                        </div>
                        <audio controls src="${URL.createObjectURL(audioBlob)}"></audio>
                    `;
                    audioList.appendChild(audioElement);
                } catch (error) {
                    console.error(`生成音频失败: ${error.message}`);
                    alert(`生成 "${dialogue.character}" 的音频时出错: ${error.message}`);
                }
            }

            // 显示合并音频控制区域
            const mergedAudioContainer = document.querySelector('.merged-audio-container');
            if (mergedAudioContainer) {
                mergedAudioContainer.style.display = 'block';
            }
        } catch (error) {
            console.error('生成音频过程中出错:', error);
            alert('生成音频过程中出错: ' + error.message);
        } finally {
            this.isGenerating = false;
            progressDiv.style.width = '0%';
            progressBar.classList.remove('active');
        }
    }

    // 合并音频
    async mergeAudio(removeSilence = false) {
        try {
            // 合并音频缓冲区
            const mergedBuffer = await this.audioProcessor.mergeAudioBuffers();
            
            // 根据选择决定是否移除静音
            let finalBuffer = mergedBuffer;
            if (removeSilence) {
                console.log('开始移除静音部分...');
                finalBuffer = await this.audioProcessor.removeSilence(mergedBuffer, 0.01, 0.02);
                console.log('静音部分移除完成');
            }
            
            // 转换为Blob
            const finalBlob = await this.audioProcessor.audioBufferToBlob(finalBuffer);
            
            // 创建音频播放器
            const container = document.querySelector('.merged-audio-container');
            const playerContainer = container.querySelector('.merged-audio-player');
            container.style.display = 'block';
            
            // 创建音频元素
            playerContainer.innerHTML = `
                <div class="audio-item">
                    <div class="audio-info">
                        <span class="character-name">合并后的音频${removeSilence ? '（已去除静音）' : ''}</span>
                    </div>
                    <audio controls src="${URL.createObjectURL(finalBlob)}"></audio>
                    <button class="download-audio" data-type="${removeSilence ? 'no-silence' : 'normal'}">下载</button>
                </div>
            `;

            // 添加下载按钮事件监听器
            const downloadBtn = playerContainer.querySelector('.download-audio');
            downloadBtn.addEventListener('click', () => {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(finalBlob);
                a.download = `merged_dialogue${removeSilence ? '_no_silence' : ''}.wav`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            });

        } catch (error) {
            console.error('合并音频失败:', error);
            alert('合并音频失败: ' + error.message);
        }
    }

    // 查找角色配置
    findCharacter(name) {
        const characters = Array.from(document.querySelectorAll('.character-card')).map(card => ({
            name: card.querySelector('.character-name').value,
            voiceId: card.querySelector('.character-voice-id').value,
            stability: parseFloat(card.querySelector('.stability').value),
            similarity: parseFloat(card.querySelector('.similarity').value),
            style: parseFloat(card.querySelector('.style').value)
        }));

        return characters.find(c => c.name === name);
    }

    // 预览声音
    async previewVoice(character) {
        try {
            const apiKey = document.getElementById('api-key').value;
            if (!apiKey) {
                alert('请先输入并验证API密钥');
                return;
            }

            const audioBlob = await generateSpeech(apiKey, character.voiceId, 'Hello, this is a preview of my voice.', {
                stability: character.stability,
                similarity: character.similarity,
                style: character.style
            });

            const audio = new Audio(URL.createObjectURL(audioBlob));
            audio.play();
        } catch (error) {
            console.error('预览声音失败:', error);
            alert('预览声音失败: ' + error.message);
        }
    }

    // 保存角色配置
    saveCharacters() {
        const characters = Array.from(document.querySelectorAll('.character-card')).map(card => ({
            name: card.querySelector('.character-name').value,
            voiceId: card.querySelector('.character-voice-id').value,
            stability: parseFloat(card.querySelector('.stability').value),
            similarity: parseFloat(card.querySelector('.similarity').value),
            style: parseFloat(card.querySelector('.style').value)
        }));

        localStorage.setItem('saved_characters', JSON.stringify(characters));
    }

    // 删除角色
    removeCharacter(character) {
        const characters = JSON.parse(localStorage.getItem('saved_characters') || '[]');
        const index = characters.findIndex(c => 
            c.name === character.name && c.voiceId === character.voiceId
        );
        
        if (index !== -1) {
            characters.splice(index, 1);
            localStorage.setItem('saved_characters', JSON.stringify(characters));
        }
    }

    // 加载保存的角色
    async loadSavedCharacters() {
        try {
            console.log('开始加载保存的角色...');
            const savedCharacters = JSON.parse(localStorage.getItem('saved_characters') || '[]');
            console.log('从 localStorage 读取到的角色:', savedCharacters);
            
            if (savedCharacters.length === 0) {
                console.log('没有保存的角色');
                return;
            }

            const characterList = document.getElementById('character-list');
            if (!characterList) {
                console.error('找不到角色列表容器');
                return;
            }

            // 先清空角色列表
            characterList.innerHTML = '';

            // 获取API密钥
            const apiKey = document.getElementById('api-key').value;
            if (!apiKey) {
                console.error('未找到API密钥，无法加载声音列表');
                return;
            }

            // 获取声音列表（添加重试机制）
            let voices = null;
            let retryCount = 0;
            const maxRetries = 3;

            while (retryCount < maxRetries && !voices) {
                try {
                    console.log(`尝试获取声音列表... (第 ${retryCount + 1} 次)`);
                    voices = await getVoices(apiKey);
                    if (!Array.isArray(voices)) {
                        throw new Error('获取到的声音列表格式无效');
                    }
                    console.log('成功获取声音列表，数量:', voices.length);
                    break;
                } catch (error) {
                    retryCount++;
                    console.error(`第 ${retryCount} 次获取声音列表失败:`, error);
                    if (retryCount === maxRetries) {
                        throw new Error(`无法获取声音列表 (已重试 ${maxRetries} 次): ${error.message}`);
                    }
                    console.log(`等待 ${retryCount} 秒后重试...`);
                    await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
                }
            }

            // 为每个保存的角色创建卡片
            for (const character of savedCharacters) {
                try {
                    console.log('创建角色卡片:', character);
                    const card = this.createCharacterCard(character);
                    characterList.appendChild(card);

                    // 获取声音选择下拉框并加载声音列表
                    const voiceSelect = card.querySelector('.voice-select');
                    if (voiceSelect) {
                        // 加载声音列表
                        voiceSelect.innerHTML = '<option value="">选择声音</option>';
                        voices.forEach(voice => {
                            const labels = [];
                            if (voice.labels) {
                                if (voice.labels.gender) labels.push(voice.labels.gender);
                                if (voice.labels.age) labels.push(voice.labels.age);
                                if (voice.labels.description) labels.push(voice.labels.description);
                            }
                            const description = labels.length > 0 ? ` (${labels.join(', ')})` : '';
                            const option = document.createElement('option');
                            option.value = voice.voice_id;
                            option.textContent = `${voice.name}${description}`;
                            option.selected = voice.voice_id === character.voiceId;
                            voiceSelect.appendChild(option);
                        });

                        // 确保选中正确的声音
                        if (character.voiceId) {
                            voiceSelect.value = character.voiceId;
                            const voiceIdInput = card.querySelector('.character-voice-id');
                            if (voiceIdInput) {
                                voiceIdInput.value = character.voiceId;
                            }
                            console.log(`设置声音选择: ${character.name} -> ${character.voiceId}`);
                        }
                    }
                } catch (error) {
                    console.error('创建角色卡片时出错:', error);
                }
            }
            console.log('角色加载完成');
        } catch (error) {
            console.error('加载保存的角色时出错:', error);
            const errorMessage = error.message.includes('Failed to fetch') 
                ? '网络连接失败，请检查网络连接后重试' 
                : error.message;
            alert('加载保存的角色时出错: ' + errorMessage);
            
            // 如果是网络错误，不清除保存的角色信息
            if (!error.message.includes('Failed to fetch')) {
                localStorage.removeItem('saved_characters');
            }
        }
    }
}

// 导出DialogueGenerator类
window.DialogueGenerator = DialogueGenerator; 
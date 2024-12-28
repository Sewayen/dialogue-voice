// API相关的常量
const API_BASE_URL = 'https://api.elevenlabs.io/v1';
const DEFAULT_MODEL = 'eleven_multilingual_v2';

// 验证API密钥
async function verifyApiKey(apiKey) {
    try {
        const response = await fetch('https://api.elevenlabs.io/v1/voices', {
            headers: {
                'Accept': 'application/json',
                'xi-api-key': apiKey
            }
        });

        if (!response.ok) {
            throw new Error('API密钥验证失败');
        }

        return true;
    } catch (error) {
        console.error('验证API密钥时出错:', error);
        throw error;
    }
}

// 获取声音列表
async function getVoices(apiKey) {
    try {
        const response = await fetch('https://api.elevenlabs.io/v1/voices', {
            headers: {
                'Accept': 'application/json',
                'xi-api-key': apiKey
            }
        });

        if (!response.ok) {
            throw new Error('获取声音列表失败');
        }

        const data = await response.json();
        console.log('获取到的声音列表:', data); // 添加日志
        return data.voices;
    } catch (error) {
        console.error('获取声音列表时出错:', error);
        throw error;
    }
}

// 生成语音
async function generateSpeech(apiKey, voiceId, text, options = {}) {
    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': apiKey
            },
            body: JSON.stringify({
                text: text,
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: options.stability || 0.5,
                    similarity_boost: options.similarity || 0.75,
                    style: options.style || 0.5,
                    use_speaker_boost: true
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail?.message || '生成语音失败');
        }

        return await response.blob();
    } catch (error) {
        console.error('生成语音时出错:', error);
        throw error;
    }
}

// 获取用户订阅信息
async function getUserSubscription(apiKey) {
    try {
        const response = await fetch(`${API_BASE_URL}/user/subscription`, {
            headers: {
                'xi-api-key': apiKey
            }
        });
        
        if (!response.ok) {
            throw new Error('获取订阅信息失败');
        }
        
        return await response.json();
    } catch (error) {
        console.error('获取订阅信息时出错:', error);
        throw error;
    }
}

// 获取历史记录
async function getHistory(apiKey) {
    try {
        const response = await fetch(`${API_BASE_URL}/history`, {
            headers: {
                'xi-api-key': apiKey
            }
        });
        
        if (!response.ok) {
            throw new Error('获取历史记录失败');
        }
        
        return await response.json();
    } catch (error) {
        console.error('获取历史记录时出错:', error);
        throw error;
    }
}

// 导出函数
window.verifyApiKey = verifyApiKey;
window.getVoices = getVoices;
window.generateSpeech = generateSpeech;
window.getUserSubscription = getUserSubscription;
window.getHistory = getHistory; 
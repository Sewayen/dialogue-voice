// 音频处理相关的类
class AudioProcessor {
    constructor() {
        this.audioBuffers = [];
        this.audioContext = null;
    }

    // 初始化或获取 AudioContext
    async getAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            // 如果 AudioContext 是暂停状态，则恢复
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
        }
        return this.audioContext;
    }

    // 添加音频缓冲区
    async addAudioBuffer(audioBlob) {
        const audioContext = await this.getAudioContext();
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        this.audioBuffers.push(audioBuffer);
    }

    // 清除音频缓冲区
    clearAudioBuffers() {
        this.audioBuffers = [];
    }

    // 合并音频缓冲区
    async mergeAudioBuffers() {
        const audioContext = await this.getAudioContext();
        if (this.audioBuffers.length === 0) {
            throw new Error('没有可合并的音频');
        }

        // 计算总时长
        const totalLength = this.audioBuffers.reduce((total, buffer) => total + buffer.length, 0);
        const numberOfChannels = this.audioBuffers[0].numberOfChannels;
        const sampleRate = this.audioBuffers[0].sampleRate;
        
        // 创建新的音频缓冲区
        const mergedBuffer = audioContext.createBuffer(
            numberOfChannels,
            totalLength,
            sampleRate
        );

        // 合并音频数据
        for (let channel = 0; channel < numberOfChannels; channel++) {
            const mergedData = mergedBuffer.getChannelData(channel);
            let offset = 0;

            for (const buffer of this.audioBuffers) {
                const data = buffer.getChannelData(channel);
                mergedData.set(data, offset);
                offset += buffer.length;
            }
        }

        return mergedBuffer;
    }

    // 移除静音部分
    async removeSilence(audioBuffer, threshold = 0.01, minKeepDuration = 0.1) {
        const audioContext = await this.getAudioContext();
        const numberOfChannels = audioBuffer.numberOfChannels;
        const sampleRate = audioBuffer.sampleRate;
        const minKeepSamples = Math.floor(minKeepDuration * sampleRate);
        
        // 计算音频能量
        const energyData = new Float32Array(audioBuffer.length);
        for (let channel = 0; channel < numberOfChannels; channel++) {
            const channelData = audioBuffer.getChannelData(channel);
            for (let i = 0; i < audioBuffer.length; i++) {
                energyData[i] += Math.abs(channelData[i]) / numberOfChannels;
            }
        }

        // 标记非静音部分
        const keepSamples = new Uint8Array(audioBuffer.length);
        let silenceStart = 0;
        let isInSilence = true;

        for (let i = 0; i < audioBuffer.length; i++) {
            if (energyData[i] > threshold) {
                if (isInSilence) {
                    // 如果之前是静音，标记最小保留时长的样本
                    const markStart = Math.max(0, i - minKeepSamples);
                    for (let j = markStart; j < i; j++) {
                        keepSamples[j] = 1;
                    }
                }
                keepSamples[i] = 1;
                isInSilence = false;
            } else if (!isInSilence) {
                silenceStart = i;
                isInSilence = true;
            }
        }

        // 计算需要保留的样本总数
        const totalKeepSamples = keepSamples.reduce((sum, value) => sum + value, 0);

        // 创建新的音频缓冲区
        const trimmedBuffer = audioContext.createBuffer(
            numberOfChannels,
            totalKeepSamples,
            sampleRate
        );

        // 复制非静音部分
        for (let channel = 0; channel < numberOfChannels; channel++) {
            const inputData = audioBuffer.getChannelData(channel);
            const outputData = trimmedBuffer.getChannelData(channel);
            let outputIndex = 0;

            for (let i = 0; i < audioBuffer.length; i++) {
                if (keepSamples[i]) {
                    outputData[outputIndex++] = inputData[i];
                }
            }
        }

        return trimmedBuffer;
    }

    // 将音频缓冲区转换为Blob
    async audioBufferToBlob(audioBuffer) {
        const audioContext = await this.getAudioContext();
        const numberOfChannels = audioBuffer.numberOfChannels;
        const length = audioBuffer.length * numberOfChannels * 2;
        const buffer = new ArrayBuffer(44 + length);
        const view = new DataView(buffer);

        // 写入WAV文件头
        // RIFF chunk descriptor
        this.writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + length, true);
        this.writeString(view, 8, 'WAVE');

        // fmt sub-chunk
        this.writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numberOfChannels, true);
        view.setUint32(24, audioBuffer.sampleRate, true);
        view.setUint32(28, audioBuffer.sampleRate * numberOfChannels * 2, true);
        view.setUint16(32, numberOfChannels * 2, true);
        view.setUint16(34, 16, true);

        // data sub-chunk
        this.writeString(view, 36, 'data');
        view.setUint32(40, length, true);

        // 写入音频数据
        const offset = 44;
        for (let i = 0; i < audioBuffer.length; i++) {
            for (let channel = 0; channel < numberOfChannels; channel++) {
                const sample = audioBuffer.getChannelData(channel)[i];
                const value = Math.max(-1, Math.min(1, sample));
                view.setInt16(offset + (i * numberOfChannels + channel) * 2, value * 0x7FFF, true);
            }
        }

        return new Blob([buffer], { type: 'audio/wav' });
    }

    // 辅助方法：写入字符串到DataView
    writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }
}

// 导出AudioProcessor类
window.AudioProcessor = AudioProcessor; 
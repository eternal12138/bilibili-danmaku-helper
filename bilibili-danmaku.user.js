// ==UserScript==
// @name         B站直播间自动弹幕助手
// @namespace    https://github.com/
// @version      1.1
// @description  在B站直播间定时发送固定弹幕，支持UI开关、调整间隔与防吞尾缀
// @match        https://live.bilibili.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // 默认配置
    let config = {
        enabled: false,       // 默认是否启动
        text: '打卡支持主播！', // 默认发送弹幕内容
        interval: 15,         // 发送间隔（秒），建议 >= 15
        addRandomSuffix: true // 是否追加随机字符，防止B站系统判定为重复刷屏而吞弹幕
    };

    let timer = null;

    // 弹幕发送核心函数
    function sendDanmaku() {
        const textarea = document.querySelector('textarea.chat-input') || 
                         document.querySelector('.chat-input-ctnr textarea');
        const sendBtn = document.querySelector('.bottom-actions .send-btn') || 
                        document.querySelector('.chat-input-ctnr button');

        if (!textarea) {
            console.warn('[弹幕助手] 未找到输入框，等待加载...');
            return;
        }

        // 生成最终发送文本（防止被折叠/吞屏）
        let message = config.text;
        if (config.addRandomSuffix) {
            const randomCode = Math.floor(100 + Math.random() * 900);
            message = `${message} (${randomCode})`;
        }

        // 填入内容并派发 input 事件触发前端响应式绑定
        textarea.value = message;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));

        setTimeout(() => {
            if (sendBtn && !sendBtn.disabled) {
                sendBtn.click();
            } else {
                // 备用触发方案：回车键
                textarea.dispatchEvent(new KeyboardEvent('keydown', {
                    bubbles: true,
                    cancelable: true,
                    key: 'Enter',
                    code: 'Enter',
                    keyCode: 13
                }));
            }
            console.log(`[弹幕助手] 已发送: ${message}`);
        }, 300);
    }

    // 启停控制
    function toggleRunning(start) {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
        if (start) {
            sendDanmaku(); // 启动时立即发送第一条
            timer = setInterval(sendDanmaku, config.interval * 1000);
        }
    }

    // 创建页面悬浮控制面板
    function createUI() {
        const panel = document.createElement('div');
        panel.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            background: rgba(33, 33, 33, 0.85);
            color: #fff;
            padding: 12px;
            border-radius: 8px;
            z-index: 999999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            font-size: 12px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            width: 200px;
        `;

        panel.innerHTML = `
            <div style="font-weight: bold; border-bottom: 1px solid #555; padding-bottom: 4px;">自动弹幕控制器</div>
            <input type="text" id="dm-text" value="${config.text}" placeholder="弹幕内容" style="padding: 4px; border-radius: 4px; border: none; outline: none; color: #000;" />
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <span>间隔(秒):</span>
                <input type="number" id="dm-interval" value="${config.interval}" min="5" style="width: 50px; padding: 2px; border-radius: 4px; border: none; text-align: center; color: #000;" />
            </div>
            <label style="display: flex; align-items: center; gap: 4px; cursor: pointer;">
                <input type="checkbox" id="dm-suffix" ${config.addRandomSuffix ? 'checked' : ''} />
                <span>防吞随机尾缀</span>
            </label>
            <button id="dm-toggle-btn" style="padding: 6px; border: none; border-radius: 4px; background: #00aeec; color: #fff; cursor: pointer; font-weight: bold;">启动</button>
        `;

        document.body.appendChild(panel);

        const btn = panel.querySelector('#dm-toggle-btn');
        const textInput = panel.querySelector('#dm-text');
        const intervalInput = panel.querySelector('#dm-interval');
        const suffixCheckbox = panel.querySelector('#dm-suffix');

        btn.addEventListener('click', () => {
            config.enabled = !config.enabled;
            config.text = textInput.value.trim() || '打卡';
            config.interval = Math.max(5, parseInt(intervalInput.value, 10) || 15);
            config.addRandomSuffix = suffixCheckbox.checked;

            if (config.enabled) {
                btn.textContent = '停止';
                btn.style.background = '#f25d8e';
                toggleRunning(true);
            } else {
                btn.textContent = '启动';
                btn.style.background = '#00aeec';
                toggleRunning(false);
            }
        });
    }

    // 页面加载完成后挂载 UI
    window.addEventListener('load', () => {
        setTimeout(createUI, 2500);
    });
})();

<div align="center">

# 🎯 BiliLive-AutoDanmaku
### B站直播间轻量级自动弹幕助手 | 浏览器端原生 DOM 交互与防风控脚本

[![License: PolyForm Noncommercial 1.0.0](https://img.shields.io/badge/License-PolyForm%20Noncommercial%201.0.0-crimson.svg)](./LICENSE)
[![Platform: Tampermonkey / ScriptCat](https://img.shields.io/badge/Platform-Tampermonkey%20%7C%20ScriptCat-00aeec.svg)](https://www.tampermonkey.net/)
[![Tech: Vanilla JS](https://img.shields.io/badge/Tech-ES6%2B%20%7C%20DOM%20Events-f7df1e.svg)]()
[![Target: Bilibili Live](https://img.shields.io/badge/Target-live.bilibili.com-fb7299.svg)](https://live.bilibili.com/)

<p align="center">
  <a href="#-项目背景与核心特性">核心特性</a> •
  <a href="#-技术实现机制">实现机制</a> •
  <a href="#-快速部署与使用">快速部署</a> •
  <a href="#-仓库目录结构">目录结构</a> •
  <a href="#-开源协议与使用边界">开源协议</a>
</p>

</div>

---

## 📖 项目背景与核心特性

**BiliLive-AutoDanmaku** 是一款面向 Bilibili 网页版直播间设计的轻量级用户脚本（UserScript）。项目摒弃了传统需要逆向解析 Wbi 签名、提取敏感 Cookie（如 `SESSDATA` / `bili_jct`）的后端请求方案，采用**前端原生 DOM 事件派发与响应式状态同步技术**，在保障账号安全的前提下实现稳定的定时弹幕发送。

### ✨ 核心特性

* **🛡️ 零敏感信息接触（Zero-Credential Exposure）**：完全复用浏览器当前登录上下文，不读取、不存储、不外发任何账号 Cookie 与 Token，规避接口逆向带来的封号风险。
* **🎛️ 嵌入式可视化控制面板（Floating HUD）**：在直播间右下角动态挂载高内聚悬浮控制器，支持实时调整弹幕文本、发送周期与运行状态，无需反复打开 F12 控制台。
* **🎲 动态熵增防吞机制（Anti-Folding Suffix）**：内置可选的随机尾缀生成器，自动在固定文案末尾附加轻量级三位随机码，有效绕过直播间针对高频完全重复字符串的静默拦截与折叠策略。
* **⚡ 双模态触发降级（Dual-Mode Dispatch）**：优先通过原生发送按钮点击触发，当 DOM 结构局部变更或按钮处于特殊状态时，自动降级为 `KeyboardEvent (Enter)` 键盘事件派发，提升跨版本鲁棒性。

---

## 🔧 技术实现机制

B站直播间前端基于现代响应式框架构建，直接修改 `<textarea>` 的 `value` 属性无法触发框架内部的虚拟 DOM 状态更新（`v-model` / `state`）。本脚本通过以下三阶段流水线完成模拟：

1. **节点探针定位**：通过多重 CSS 选择器兼容匹配 `.chat-input` 与 `.send-btn`，适配不同活动页面的直播间布局。
2. **合成事件注入**：在写入文本值后，主动构造并派发携带冒泡属性（`bubbles: true`）的原生 `Event('input')`，强制触发前端状态树同步。
3. **异步时序点击**：引入 `300ms` 微延迟等待前端完成状态校验与按钮解禁，随后触发发送动作并由独立定时器（`setInterval`）接管生命周期。

---

## 🚀 快速部署与使用

### 1. 环境准备
请在浏览器（Chrome / Edge / Firefox）中安装以下任意一款用户脚本管理器：
* [Tampermonkey (油猴)](https://www.tampermonkey.net/)
* [ScriptCat (脚本猫)](https://scriptcat.org/)

### 2. 安装脚本
* **方式 A（直链一键安装）**：
  👉 **[点击此处通过 GitHub Raw 一键安装脚本](https://raw.githubusercontent.com/eternal12138/<你的仓库名>/main/bilibili-danmaku.user.js)**
* **方式 B（手动导入）**：
  克隆本仓库或复制 [`bilibili-danmaku.user.js`](./bilibili-danmaku.user.js) 源码，在油猴扩展管理面板中点击 **“添加新脚本”**，粘贴并按 `Ctrl + S` 保存。

### 3. 参数配置说明
进入任意 [Bilibili 直播间](https://live.bilibili.com/)，等待约 `2.5s` 页面 DOM 挂载完毕，右下角将出现 **“自动弹幕控制器”**：

| 配置项 | 默认值 | 推荐范围 / 说明 |
| :--- | :--- | :--- |
| **弹幕内容** | `打卡支持主播！` | 建议控制在 20 字以内，符合直播间字数上限要求 |
| **间隔 (秒)** | `15` | **强烈建议 $\ge 15$ 秒**。低于 5 秒极易触发房间级“发言过快”风控限制 |
| **防吞随机尾缀** | `开启 (Checked)` | 开启后输出形如 `打卡支持主播！ (482)`，防止连续相同弹幕被系统吞屏 |

---

## 📂 仓库目录结构

```text
BiliLive-AutoDanmaku/
├── bilibili-danmaku.user.js   # 核心油猴脚本源码（包含元数据声明、UI挂载与事件派发逻辑）
├── LICENSE                    # PolyForm Noncommercial License 1.0.0 协议全文
└── README.md                  # 项目文档与合规说明

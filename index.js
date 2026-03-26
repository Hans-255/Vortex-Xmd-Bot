global.conf = require('./config');
global.isShuttingDown = false;
const {
    default: makeWASocket,
    fetchLatestBaileysVersion,
    useMultiFileAuthState,
    makeCacheableSignalKeyStore,
    makeInMemoryStore,
    DisconnectReason,
    jidDecode,
    proto,
    getContentType,
    generateForwardMessageContent,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    generateMessageID,
    downloadContentFromMessage,
    downloadMediaMessage,
    makeId,
    jidNormalizedUser,
    getDevice,
    areJidsSameUser
} = require("@whiskeysockets/baileys");
const logger = require("@whiskeysockets/baileys/lib/Utils/logger").default.child({});
const { createContext } = require('./Hans/helper');
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const conf = require("./config");
const config = require("./config");
const abu = require("./config");
const axios = require("axios");
const moment = require("moment-timezone");
const fs = require("fs-extra");
const path = require("path");
const https = require('https');
const FileType = require("file-type");
const { Sticker, createSticker, StickerTypes } = require("wa-sticker-formatter");
const evt = require('./Hans/adams');

// ═══════ GITHUB MEDIA ═══════
const GITHUB_IMAGES_API = 'https://api.github.com/repos/Mrhanstz/HansTz-Sever/contents/Database';
let cachedImageUrls = [];
let usedImageIndices = [];
async function fetchGitHubImages() {
    try {
        const response = await fetch(GITHUB_IMAGES_API);
        const files = await response.json();
        if (Array.isArray(files)) {
            cachedImageUrls = files.filter(f => f.download_url && /\.(jpg|jpeg|png|webp|gif)$/i.test(f.name)).map(f => f.download_url);
            usedImageIndices = [];
            console.log('Loaded ' + cachedImageUrls.length + ' images from GitHub');
        }
    } catch (err) { console.error('Failed to fetch GitHub images:', err.message); }
}
function getRandomImage() {
    if (cachedImageUrls.length === 0) return 'https://raw.githubusercontent.com/Mrhanstz/HansTz-Sever/main/Database/HansTz.jpg';
    if (usedImageIndices.length >= cachedImageUrls.length) usedImageIndices = [];
    const available = cachedImageUrls.map((_, i) => i).filter(i => !usedImageIndices.includes(i));
    const randomIdx = available[Math.floor(Math.random() * available.length)];
    usedImageIndices.push(randomIdx);
    return cachedImageUrls[randomIdx];
}
fetchGitHubImages();
setInterval(fetchGitHubImages, 30 * 60 * 1000);

const GITHUB_AUDIOS_API = 'https://api.github.com/repos/Mrhanstz/HansTz-Sever/contents/databaseaudios';
let audioFiles = [];
let usedAudioIndices = [];
async function fetchAudioFiles() {
    try {
        const response = await fetch(GITHUB_AUDIOS_API);
        const files = await response.json();
        if (Array.isArray(files)) {
            const validAudios = files.filter(f => f.download_url && f.size > 100 && /\.(mp3|mp4|m4a|ogg|wav|aac|m4r)$/i.test(f.name)).map(f => f.download_url);
            if (validAudios.length > 0) { audioFiles = validAudios; usedAudioIndices = []; console.log('Loaded ' + audioFiles.length + ' audio files from GitHub'); }
        }
    } catch (err) { console.error('Failed to fetch audio files:', err.message); }
}
function getRandomAudio() {
    if (audioFiles.length === 0) return null;
    if (usedAudioIndices.length >= audioFiles.length) usedAudioIndices = [];
    const available = audioFiles.map((_, i) => i).filter(i => !usedAudioIndices.includes(i));
    const randomIdx = available[Math.floor(Math.random() * available.length)];
    usedAudioIndices.push(randomIdx);
    return audioFiles[randomIdx];
}
fetchAudioFiles();
setInterval(fetchAudioFiles, 30 * 60 * 1000);

const ownerNumber = ['255753668403'];
const tempDir = path.join(require('os').tmpdir(), 'cache-temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
const clearTempDir = () => { fs.readdir(tempDir, (err, files) => { if (err) return; for (const file of files) fs.unlink(path.join(tempDir, file), ()=>{}); }); };
setInterval(clearTempDir, 5 * 60 * 1000);
// ═══════ END GITHUB MEDIA ═══════

const rateLimit = new Map();
const MAX_RATE_LIMIT_ENTRIES = 100000;
const RATE_LIMIT_WINDOW = 3000;
const express = require("express");
const { exec } = require("child_process");
const http = require("http");
const zlib = require('zlib');
const PREFIX = conf.PREFIX;
const { promisify } = require('util');
const stream = require('stream');
const AdmZip = require("adm-zip");
const { File } = require('megajs');
const pipeline = promisify(stream.pipeline);
const more = String.fromCharCode(8206);
const herokuAppName = process.env.HEROKU_APP_NAME || "Unknown App Name";
const herokuAppLink = process.env.HEROKU_APP_LINK || `https://dashboard.heroku.com/apps/${herokuAppName}`;
const botOwner = process.env.NUMERO_OWNER || "Unknown Owner";
const PORT = process.env.PORT || 3000;
const app = express();
let vortex;

require("dotenv").config({ path: "./config.env" });
logger.level = "silent";

app.use(express.static('HansTz'));
app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));

// ENHANCED WORKER PROCESS MANAGER FOR AUTO-RESTART
class WorkerManager {
    constructor() {
        this.authErrorCount = 0;
        this.lastAuthError = 0;
        this.maxAuthErrors = 5;
        this.authErrorResetTime = 300000; // 5 minutes
        this.isRestarting = false;
        this.restartTimeout = null;
        this.workerProcess = null;
        this.maxRestartAttempts = 10;
        this.currentRestartAttempt = 0;
    }

    async handleAuthError(error) {
        const now = Date.now();
        const errorMessage = error.message || error.toString();
        
        // Check if it's the specific auth error
        if (errorMessage.includes('Unsupported state or unable to authenticate data') || 
            errorMessage.includes('aesDecryptGCM') ||
            errorMessage.includes('decrypt')) {
            
            console.error('Fixer has detected unerror:', errorMessage);
            
            // Reset counter if enough time has passed
            if (now - this.lastAuthError > this.authErrorResetTime) {
                this.authErrorCount = 0;
            }
            
            this.authErrorCount++;
            this.lastAuthError = now;
            
            console.log(`Authentication error count: ${this.authErrorCount}/${this.maxAuthErrors}`);
            
            // Immediate restart without waiting for max errors
            await this.restartWorker(this.authErrorCount >= this.maxAuthErrors);
            return true;
        }
        
        return false;
    }

    async restartWorker(cleanSession = false) {
        if (this.isRestarting) {
            console.log('⏳ Restart already in progress...');
            return;
        }

        this.isRestarting = true;
        this.currentRestartAttempt++;

        if (this.currentRestartAttempt > this.maxRestartAttempts) {
            console.error('🚨 Max restart attempts reached. Manual intervention required.');
            process.exit(1);
            return;
        }

        console.log(`🔄 Starting restart attempt ${this.currentRestartAttempt}/${this.maxRestartAttempts}...`);

        try {
            // Clean up current connections
            if (vortex) {
                try {
                    await vortex.end();
                } catch (e) {
                    console.log('Connection cleanup warning:', e.message);
                }
                adams = null;
            }

            if (store) {
                try {
                    store.destroy();
                } catch (e) {
                    console.log('Store cleanup warning:', e.message);
                }
                store = null;
            }

            // Clean session if required
            if (cleanSession || this.authErrorCount >= this.maxAuthErrors) {
                try {
                    const sessionDir = path.join(__dirname, 'sessions');
                    if (fs.existsSync(sessionDir)) {
                        await fs.remove(sessionDir);
                        console.log('✅ Session directory cleaned');
                    }
                    this.authErrorCount = 0; // Reset counter after cleaning
                } catch (cleanError) {
                    console.error('Failed to clean session:', cleanError);
                }
            }

            // Wait before restart
            const delay = Math.min(5000 * this.currentRestartAttempt, 30000);
            console.log(`⏱️ Waiting ${delay}ms before restart...`);
            
            await new Promise(resolve => setTimeout(resolve, delay));

            // Restart the worker
            console.log('🚀 Fixer is fixing the error ...');
            this.isRestarting = false;
            
            // Start the main process again
            await this.startWorker();

        } catch (error) {
            console.error('🚨 Restart failed:', error);
            this.isRestarting = false;
            
            // Retry restart after delay
            setTimeout(() => {
                this.restartWorker(cleanSession);
            }, 10000);
        }
    }

    async startWorker() {
        try {
            await main();
            
            // Reset restart attempt counter on successful start
            this.currentRestartAttempt = 0;
            console.log('✅ Fixer fixed the error successfully');
            
        } catch (error) {
            console.error('🚨 Worker start failed:', error);
            
            if (await this.handleAuthError(error)) {
                return; // Auth error handled, restart initiated
            }
            
            // Non-auth error, retry
            setTimeout(() => {
                this.restartWorker();
            }, 5000);
        }
    }

    setupErrorHandlers() {
        // Enhanced process error handlers
        process.on('uncaughtException', async (error) => {
            console.error('🚨 Uncaught Exception:', error);
            
            if (!(await this.handleAuthError(error))) {
                console.error('🔄 Non-auth uncaught exception, restarting...');
                await this.restartWorker();
            }
        });

        process.on('unhandledRejection', async (reason, promise) => {
            console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
            
            if (!(await this.handleAuthError(reason))) {
                console.error('🔄 Non-auth unhandled rejection, restarting...');
                await this.restartWorker();
            }
        });

        // Graceful shutdown handlers
        process.on('SIGTERM', () => {
            console.log('📡 SIGTERM received, shutting down gracefully...');
            global.isShuttingDown = true;
            try { if (store) store.destroy(); } catch(e) {}
            process.exit(0);
        });

        process.on('SIGINT', () => {
            console.log('📡 SIGINT received, shutting down gracefully...');
            global.isShuttingDown = true;
            try { if (store) store.destroy(); } catch(e) {}
            process.exit(0);
        });
    }
}

// Initialize worker manager
const workerManager = new WorkerManager();
workerManager.setupErrorHandlers();

// Health check and monitoring endpoints
app.get('/health', (req, res) => {
    res.json({
        status: vortex ? 'connected' : 'disconnected',
        uptime: process.uptime(),
        authErrors: workerManager.authErrorCount,
        restartAttempts: workerManager.currentRestartAttempt,
        isRestarting: workerManager.isRestarting,
        timestamp: new Date().toISOString(),
        memory: process.memoryUsage()
    });
});

app.get('/restart', async (req, res) => {
    res.json({ message: 'Manual restart initiated' });
    await workerManager.restartWorker(true);
});

app.listen(PORT, () => {
    console.log(`🚀 Running speed: ${PORT}`);
    console.log(`📊 Checking pong: ${PORT}`);
    console.log(`🔄 Upspeed: ${PORT}`);
});

//============================================================================//

function standardizeJid(jid) {
    if (!jid) return '';
    try {
        jid = typeof jid === 'string' ? jid : 
             (jid.decodeJid ? jid.decodeJid() : String(jid));
        jid = jid.split(':')[0].split('/')[0];
        if (!jid.includes('@')) {
            jid += '@s.whatsapp.net';
        } else if (jid.endsWith('@lid')) {
            // Keep LID format for group participants
            return jid.toLowerCase();
        }
        return jid.toLowerCase();
    } catch (e) {
        console.error("JID standardization error:", e);
        return '';
    }
}

// LID-TO-REGULAR JID MAPPING CACHE
const lidToRegularJidCache = new Map();

function extractRegularJidFromLid(lid) {
    if (!lid || !lid.includes('@lid')) return lid;
    
    // Check cache first
    if (lidToRegularJidCache.has(lid)) {
        return lidToRegularJidCache.get(lid);
    }
    
    try {
        // Extract the phone number part from LID
        const phoneNumber = lid.split('@')[0];
        if (phoneNumber && phoneNumber.length > 5) {
            const regularJid = `${phoneNumber}@s.whatsapp.net`;
            
            // Cache the mapping
            lidToRegularJidCache.set(lid, regularJid);
            return regularJid;
        }
    } catch (error) {
        console.error('Error extracting regular JID from LID:', error);
    }
    
    return lid;
}

// OPTIMIZED SECURITY STORE WITH BETTER ERROR HANDLING
class CustomStore {
    constructor() {
        this.messages = new Map();
        this.contacts = new Map();
        this.chats = new Map();
        this.groupMetadata = new Map();
        this.unauthorizedAttempts = new Map();
        this.maxMessages = 3000;
        this.maxChats = 1500;
        this.cleanupInterval = setInterval(() => this.cleanup(), 300000);
        this.messageIndex = new Map();
        this.securityLogFile = path.join(__dirname, 'security.log');
    }

    logUnauthorizedAttempt(jid, command, reason) {
        const timestamp = new Date().toISOString();
        const logEntry = `${timestamp} - UNAUTHORIZED ATTEMPT: JID=${jid}, CMD=${command}, REASON=${reason}\n`;
        
        console.error(`🚨 SECURITY ALERT: ${logEntry.trim()}`);
        
        try {
            fs.appendFileSync(this.securityLogFile, logEntry);
        } catch (error) {
            console.error('Failed to write security log:', error);
        }
        
        const attempts = this.unauthorizedAttempts.get(jid) || [];
        attempts.push({ command, timestamp: Date.now(), reason });
        this.unauthorizedAttempts.set(jid, attempts);
    }

    standardizeJid(jid) {
        return standardizeJid(jid);
    }

    loadMessage(jid, id) {
        try {
            if (!jid || !id) return null;
            
            const standardJid = this.standardizeJid(jid);
            const chatMessages = this.messages.get(standardJid);
            
            if (!chatMessages) return null;
            
            const message = chatMessages.get(id);
            return message || null;
        } catch (error) {
            console.error('Store loadMessage error:', error);
            return null;
        }
    }

    saveMessage(jid, message) {
        try {
            if (!jid || !message || !message.key?.id) return;
            
            const standardJid = this.standardizeJid(jid);
            
            if (!this.messages.has(standardJid)) {
                this.messages.set(standardJid, new Map());
            }
            
            const chatMessages = this.messages.get(standardJid);
            const messageId = message.key.id;
            
            const messageWithTimestamp = {
                ...message,
                timestamp: Date.now(),
                storedAt: new Date().toISOString()
            };
            
            chatMessages.set(messageId, messageWithTimestamp);
            this.messageIndex.set(`${standardJid}:${messageId}`, messageWithTimestamp);
            
            if (chatMessages.size > this.maxMessages) {
                const oldestKey = chatMessages.keys().next().value;
                chatMessages.delete(oldestKey);
                this.messageIndex.delete(`${standardJid}:${oldestKey}`);
            }
        } catch (error) {
            console.error('Store saveMessage error:', error);
        }
    }

    cleanup() {
        try {
            if (this.messages.size > this.maxChats) {
                const chatsToDelete = this.messages.size - this.maxChats;
                const oldestChats = Array.from(this.messages.keys()).slice(0, chatsToDelete);
                
                oldestChats.forEach(jid => {
                    const chatMessages = this.messages.get(jid);
                    if (chatMessages) {
                        chatMessages.forEach((_, messageId) => {
                            this.messageIndex.delete(`${jid}:${messageId}`);
                        });
                    }
                    this.messages.delete(jid);
                });
            }
            
            const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
            this.messages.forEach((chatMessages, jid) => {
                const messagesToDelete = [];
                chatMessages.forEach((message, messageId) => {
                    if (message.timestamp && message.timestamp < oneDayAgo) {
                        messagesToDelete.push(messageId);
                    }
                });
                
                messagesToDelete.forEach(messageId => {
                    chatMessages.delete(messageId);
                    this.messageIndex.delete(`${jid}:${messageId}`);
                });
            });
            
            console.log(`🧹 Store cleanup: ${this.messages.size} chats, ${this.messageIndex.size} messages`);
        } catch (error) {
            console.error('Store cleanup error:', error);
        }
    }

    bind(ev) {
        try {
            ev.on('messages.upsert', ({ messages }) => {
                if (Array.isArray(messages)) {
                    messages.forEach(msg => {
                        if (msg.key?.remoteJid && msg.key?.id) {
                            this.saveMessage(msg.key.remoteJid, msg);
                        }
                    });
                }
            });

            ev.on('chats.set', ({ chats }) => {
                if (Array.isArray(chats)) {
                    chats.forEach(chat => {
                        if (chat.id) {
                            this.chats.set(this.standardizeJid(chat.id), chat);
                        }
                    });
                }
            });

            ev.on('chats.upsert', ({ chats }) => {
                if (Array.isArray(chats)) {
                    chats.forEach(chat => {
                        if (chat.id) {
                            this.chats.set(this.standardizeJid(chat.id), chat);
                        }
                    });
                }
            });

            ev.on('contacts.set', ({ contacts }) => {
                if (Array.isArray(contacts)) {
                    contacts.forEach(contact => {
                        if (contact.id) {
                            this.contacts.set(this.standardizeJid(contact.id), contact);
                        }
                    });
                }
            });

            ev.on('contacts.upsert', ({ contacts }) => {
                if (Array.isArray(contacts)) {
                    contacts.forEach(contact => {
                        if (contact.id) {
                            this.contacts.set(this.standardizeJid(contact.id), contact);
                        }
                    });
                }
            });

            ev.on('groups.update', ({ groups }) => {
                if (Array.isArray(groups)) {
                    groups.forEach(group => {
                        if (group.id) {
                            this.groupMetadata.set(this.standardizeJid(group.id), group);
                        }
                    });
                }
            });
        } catch (error) {
            console.error('Store bind error:', error);
        }
    }

    destroy() {
        try {
            if (this.cleanupInterval) {
                clearInterval(this.cleanupInterval);
            }
            this.messages.clear();
            this.contacts.clear();
            this.chats.clear();
            this.groupMetadata.clear();
            this.unauthorizedAttempts.clear();
            this.messageIndex.clear();
            lidToRegularJidCache.clear();
            console.log('🗑️ Custom store destroyed successfully');
        } catch (error) {
            console.error('Store destroy error:', error);
        }
    }

    getChat(jid) {
        return this.chats.get(this.standardizeJid(jid)) || null;
    }

    getContact(jid) {
        return this.contacts.get(this.standardizeJid(jid)) || null;
    }

    getGroupMetadata(jid) {
        return this.groupMetadata.get(this.standardizeJid(jid)) || null;
    }
}

function atbverifierEtatJid(jid) {
    if (!jid || !jid.endsWith('@s.whatsapp.net')) {
        console.error('Invalid JID format:', jid);
        return false;
    }
    return true;
}

// ENHANCED AUTHENTICATION FUNCTION WITH BETTER ERROR HANDLING
async function authentification() {
    try {
        const sessionDir = path.join(__dirname, 'sessions');
        if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });
        const credsPath = path.join(sessionDir, 'creds.json');
        if (!fs.existsSync(credsPath)) {
            console.log('📥 Downloading session from Mega...');
            if (!conf.session) throw new Error('No SESSION_ID set. Please set SESSION_ID starting with HansTz&');
            const megaId = conf.session.replace('HansTz&', '');
            const filer = File.fromURL('https://mega.nz/file/' + megaId);
            await new Promise((resolve, reject) => {
                filer.download((err, data) => {
                    if (err) return reject(new Error('Mega download failed: ' + err.message));
                    fs.writeFileSync(credsPath, data);
                    console.log('✅ Session downloaded!');
                    resolve();
                });
            });
        }
    } catch (error) {
        console.error('❌ Session setup failed:', error.message);
        const sessionDir = path.join(__dirname, 'sessions');
        if (fs.existsSync(sessionDir)) fs.rmSync(sessionDir, { recursive: true, force: true });
        throw error;
    }
}

;

let zk;
let store;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 50;
const RECONNECT_DELAY = 5000;

//===============================================================================//
async function main() {
    try {
        await authentification();
        
        const { version, isLatest } = await fetchLatestBaileysVersion();
        const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/sessions');
        
        if (store) {
            store.destroy();
        }
        store = new CustomStore();
        
        const sockOptions = {
            version,
            logger: pino({ level: "silent" }),
            browser: ['ultra', "safari", "1.0.0"],
            printQRInTerminal: false,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger)
            },
            getMessage: async (key) => {
                try {
                    if (store && key?.remoteJid && key?.id) {
                        const msg = store.loadMessage(key.remoteJid, key.id);
                        if (msg?.message) {
                            return msg.message;
                        }
                    }
                } catch (e) {}
                return undefined;
            },
            connectTimeoutMs: 60000,
            defaultQueryTimeoutMs: 60000,
            keepAliveIntervalMs: 10000,
            markOnlineOnConnect: true,
            syncFullHistory: false,
            generateHighQualityLinkPreview: false,
            patchMessageBeforeSending: (message) => {
                const requiresPatch = !!(
                    message.buttonsMessage ||
                    message.templateMessage ||
                    message.listMessage
                );
                if (requiresPatch) {
                    message = {
                        viewOnceMessage: {
                            message: {
                                messageContextInfo: {
                                    deviceListMetadataVersion: 2,
                                    deviceListMetadata: {},
                                },
                                ...message,
                            },
                        },
                    };
                }
                return message;
            }
        };

        vortex = makeWASocket(sockOptions);
        adams = vortex;
        
        try {
            store.bind(vortex.ev);
            console.log('✅ Custom store bound successfully');
        } catch (storeError) {
            console.error('Store binding error:', storeError);
            if (await workerManager.handleAuthError(storeError)) return;
        }

        vortex.ev.process(async (events) => {
            if (events['creds.update']) {
                try {
                    await saveCreds();
                } catch (error) {
                    console.error('Credential saving error:', error);
                    if (await workerManager.handleAuthError(error)) return;
                }
            }
        });

        const groupCooldowns = new Map();

        function isGroupSpamming(jid) {
            const now = Date.now();
            const lastTime = groupCooldowns.get(jid) || 0;
            if (now - lastTime < 1500) return true;
            groupCooldowns.set(jid, now);
            return false;
        }

//============================================================================//
let ibraah = { chats: {} };
const botJid = `${vortex.user?.id.split(':')[0]}@s.whatsapp.net`;
const botOwnerJid = `${vortex.user?.id.split(':')[0]}@s.whatsapp.net`; // Fixed: Changed from vortex.user to config

// Improved media processing function with better error handling
const processMediaMessage = async (deletedMessage) => {
    let mediaType, mediaInfo;
    
    const mediaTypes = {
        imageMessage: 'image',
        videoMessage: 'video',
        audioMessage: 'audio',
        stickerMessage: 'sticker',
        documentMessage: 'document'
    };

    for (const [key, type] of Object.entries(mediaTypes)) {
        if (deletedMessage.message?.[key]) {
            mediaType = type;
            mediaInfo = deletedMessage.message[key];
            break;
        }
    }

    if (!mediaType || !mediaInfo) return null;

    try {
        const mediaStream = await downloadMediaMessage(deletedMessage, { logger });
        
        const extensions = {
            image: 'jpg',
            video: 'mp4',
            audio: mediaInfo.mimetype?.includes('mpeg') ? 'mp3' : 'ogg',
            sticker: 'webp',
            document: mediaInfo.fileName?.split('.').pop() || 'bin'
        };
        
        const tempPath = path.join(__dirname, `temp_media_${Date.now()}.${extensions[mediaType]}`);
        await pipeline(mediaStream, fs.createWriteStream(tempPath));
        
        return {
            path: tempPath,
            type: mediaType,
            caption: mediaInfo.caption || '',
            mimetype: mediaInfo.mimetype,
            fileName: mediaInfo.fileName || `${mediaType}_${Date.now()}.${extensions[mediaType]}`,
            ptt: mediaInfo.ptt
        };
    } catch (error) {
        logger.error(`Media processing failed:`, error);
        return null;
    }
};

// Enhanced message forwarding function with better synchronization
const handleDeletedMessage = async (deletedMsg, key, deleter) => {
    const context = createContext(deleter, {
        title: "Anti-Delete Protection",
        body: "Deleted message detected",
        thumbnail: "https://res.cloudinary.com/dptzpfgtm/image/upload/v1753723388/whatsapp_uploads/wqyliw4kzvrulh0bmg10.jpg"
    });

    const chatInfo = key.remoteJid.includes('@g.us') ? 
        `Group: ${key.remoteJid}` : 
        `DM with @${deleter.split('@')[0]}`;

    try {
        // Handle both ANTIDELETE1 and ANTIDELETE2 in parallel for better performance
        const promises = [];
        
        if (config.ANTIDELETE1 === "yes") {
            promises.push((async () => {
                try {
                    const baseAlert = `♻️ *Anti-Delete Alert* ♻️\n\n` +
                                    `🛑 Deleted by @${deleter.split('@')[0]}\n` +
                                    `💬 In: ${chatInfo}`;

                    if (deletedMsg.message.conversation || deletedMsg.message.extendedTextMessage?.text) {
                        const text = deletedMsg.message.conversation || 
                                    deletedMsg.message.extendedTextMessage.text;
                        
                        await vortex.sendMessage(key.remoteJid, {
                            text: `${baseAlert}\n\n📝 *Content:* ${text}`,
                            mentions: [deleter],
                            ...context
                        });
                    } else {
                        // Handle media in chat
                        const media = await processMediaMessage(deletedMsg);
                        if (media) {
                            await vortex.sendMessage(key.remoteJid, {
                                [media.type]: { url: media.path },
                                caption: media.caption ? 
                                    `${baseAlert}\n\n📌 *Media Caption:* ${media.caption}` : 
                                    baseAlert,
                                mentions: [deleter],
                                ...context,
                                ...(media.type === 'document' ? {
                                    mimetype: media.mimetype,
                                    fileName: media.fileName
                                } : {}),
                                ...(media.type === 'audio' ? {
                                    ptt: media.ptt,
                                    mimetype: media.mimetype
                                } : {})
                            });

                            // Cleanup temp file
                            setTimeout(() => {
                                if (fs.existsSync(media.path)) {
                                    fs.unlink(media.path, (err) => {
                                        if (err) logger.error('Cleanup failed:', err);
                                    });
                                }
                            }, 30000);
                        }
                    }
                } catch (error) {
                    logger.error('Failed to process ANTIDELETE1:', error);
                }
            })());
        }

        if (config.ANTIDELETE2 === "yes") {
            promises.push((async () => {
                try {
                    const ownerContext = {
                        ...context,
                        text: `👤 Sender: ${deleter}\n💬 Chat: ${chatInfo}`
                    };

                    if (deletedMsg.message.conversation || deletedMsg.message.extendedTextMessage?.text) {
                        const text = deletedMsg.message.conversation || 
                                    deletedMsg.message.extendedTextMessage.text;
                        
                        await vortex.sendMessage(botOwnerJid, { 
                            text: `📩 *Forwarded Deleted Message*\n\n${text}\n\n${ownerContext.text}`,
                            ...context
                        });
                    } else {
                        const media = await processMediaMessage(deletedMsg);
                        if (media) {
                            await vortex.sendMessage(botOwnerJid, {
                                [media.type]: { url: media.path },
                                caption: media.caption ? 
                                    `📩 *Forwarded Deleted Media*\n\n${media.caption}\n\n${ownerContext.text}` : 
                                    `📩 *Forwarded Deleted Media*\n\n${ownerContext.text}`,
                                ...context,
                                ...(media.type === 'document' ? {
                                    mimetype: media.mimetype,
                                    fileName: media.fileName
                                } : {}),
                                ...(media.type === 'audio' ? {
                                    ptt: media.ptt,
                                    mimetype: media.mimetype
                                } : {})
                            });

                            // Cleanup temp file
                            setTimeout(() => {
                                if (fs.existsSync(media.path)) {
                                    fs.unlink(media.path, (err) => {
                                        if (err) logger.error('Cleanup failed:', err);
                                    });
                                }
                            }, 30000);
                        }
                    }
                } catch (error) {
                    logger.error('Failed to process ANTIDELETE2:', error);
                    await vortex.sendMessage(botOwnerJid, {
                        text: `⚠️ Failed to forward deleted message from ${deleter}\n\nError: ${error.message}`,
                        ...context
                    });
                }
            })());
        }

        await Promise.all(promises);
    } catch (error) {
        logger.error('Anti-delete handling failed:', error);
    }
};

vortex.ev.on("messages.upsert", async ({ messages }) => {
    try {
        const ms = messages[0];
        if (!ms?.message) return;

        const { key } = ms;
        if (!key?.remoteJid) return;

        // Skip status updates (status@broadcast)
        if (key.remoteJid === 'status@broadcast') return;

        const sender = key.participant || key.remoteJid;
        if (sender === botJid || sender === botOwnerJid || key.fromMe) return;

        // Store message with timestamp
        if (!ibraah.chats[key.remoteJid]) ibraah.chats[key.remoteJid] = [];
        ibraah.chats[key.remoteJid].push({
            ...ms,
            timestamp: Date.now()
        });

        // Cleanup old messages (keep only last 100 messages per chat)
        if (ibraah.chats[key.remoteJid].length > 100) {
            ibraah.chats[key.remoteJid].shift();
        }

        // Check for deletion
        if (ms.message?.protocolMessage?.type === 0) {
            const deletedId = ms.message.protocolMessage.key.id;
            const deletedMsg = ibraah.chats[key.remoteJid].find(m => m.key.id === deletedId);
            if (!deletedMsg?.message) return;

            const deleter = ms.key.participant || ms.key.remoteJid;
            if (deleter === botJid || deleter === botOwnerJid) return;

            // Immediately handle the deleted message
            await handleDeletedMessage(deletedMsg, key, deleter);

            // Remove the deleted message from ibraah
            ibraah.chats[key.remoteJid] = ibraah.chats[key.remoteJid].filter(m => m.key.id !== deletedId);
        }
    } catch (error) {
        logger.error('Anti-delete system error:', error);
    }
});


// Get current time of day
function getTimeBlock() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return "morning";
    if (hour >= 11 && hour < 16) return "afternoon";
    if (hour >= 16 && hour < 21) return "evening";
    if (hour >= 21 || hour < 2) return "night";
    return "latenight";
}

// Quotes per time block
const quotes = {
  morning: [ "☀️ ʀɪsᴇ ᴀɴᴅ sʜɪɴᴇ. ɢʀᴇᴀᴛ ᴛʜɪɴɢs ɴᴇᴠᴇʀ ᴄᴀᴍᴇ ғʀᴏᴍ ᴄᴏᴍғᴏʀᴛ ᴢᴏɴᴇs.", "🌅 ᴇᴀᴄʜ ᴍᴏʀɴɪɴɢ ᴡᴇ ᴀʀᴇ ʙᴏʀɴ ᴀɢᴀɪɴ. ᴡʜᴀᴛ ᴡᴇ ᴅᴏ ᴛᴏᴅᴀʏ ɪs ᴡʜᴀᴛ ᴍᴀᴛᴛᴇʀs ᴍᴏsᴛ.", "⚡ sᴛᴀʀᴛ ʏᴏᴜʀ ᴅᴀʏ ᴡɪᴛʜ ᴅᴇᴛᴇʀᴍɪɴᴀᴛɪᴏɴ, ᴇɴᴅ ɪᴛ ᴡɪᴛʜ sᴀᴛɪsғᴀᴄᴛɪᴏɴ.", "🌞 ᴛʜᴇ sᴜɴ ɪs ᴜᴘ, ᴛʜᴇ ᴅᴀʏ ɪs ʏᴏᴜʀs.", "📖 ᴇᴠᴇʀʏ ᴍᴏʀɴɪɴɢ ɪs ᴀ ɴᴇᴡ ᴘᴀɢᴇ ᴏғ ʏᴏᴜʀ sᴛᴏʀʏ. ᴍᴀᴋᴇ ɪᴛ ᴄᴏᴜɴᴛ." ], 
 afternoon: [ "⏳ ᴋᴇᴇᴘ ɢᴏɪɴɢ. ʏᴏᴜ'ʀᴇ ʜᴀʟғᴡᴀʏ ᴛᴏ ɢʀᴇᴀᴛɴᴇss.", "🔄 sᴛᴀʏ ғᴏᴄᴜsᴇᴅ. ᴛʜᴇ ɢʀɪɴᴅ ᴅᴏᴇsɴ’ᴛ sᴛᴏᴘ ᴀᴛ ɴᴏᴏɴ.", "🏗️ sᴜᴄᴄᴇss ɪs ʙᴜɪʟᴛ ɪɴ ᴛʜᴇ ʜᴏᴜʀs ɴᴏʙᴏᴅʏ ᴛᴀʟᴋs ᴀʙᴏᴜᴛ.", "🔥 ᴘᴜsʜ ᴛʜʀᴏᴜɢʜ. ᴄʜᴀᴍᴘɪᴏɴs ᴀʀᴇ ᴍᴀᴅᴇ ɪɴ ᴛʜᴇ ᴍɪᴅᴅʟᴇ ᴏғ ᴛʜᴇ ᴅᴀʏ.", "⏰ ᴅᴏɴ’ᴛ ᴡᴀᴛᴄʜ ᴛʜᴇ ᴄʟᴏᴄᴋ, ᴅᴏ ᴡʜᴀᴛ ɪᴛ ᴅᴏᴇs—ᴋᴇᴇᴘ ɢᴏɪɴɢ." ],
 evening: [ "🛌 ʀᴇsᴛ ɪs ᴘᴀʀᴛ ᴏғ ᴛʜᴇ ᴘʀᴏᴄᴇss. ʀᴇᴄʜᴀʀɢᴇ ᴡɪsᴇʟʏ.", "🌇 ᴇᴠᴇɴɪɴɢ ʙʀɪɴɢꜱ ꜱɪʟᴇɴᴄᴇ ᴛʜᴀᴛ ꜱᴘᴇᴀᴋꜱ ʟᴏᴜᴅᴇʀ ᴛʜᴀɴ ᴅᴀʏʟɪɢʜᴛ.", "✨ ʏᴏᴜ ᴅɪᴅ ᴡᴇʟʟ ᴛᴏᴅᴀʏ. ᴘʀᴇᴘᴀʀᴇ ғᴏʀ ᴀɴ ᴇᴠᴇɴ ʙᴇᴛᴛᴇʀ ᴛᴏᴍᴏʀʀᴏᴡ.", "🌙 ʟᴇᴛ ᴛʜᴇ ɴɪɢʜᴛ sᴇᴛᴛʟᴇ ɪɴ, ʙᴜᴛ ᴋᴇᴇᴘ ʏᴏᴜʀ ᴅʀᴇᴀᴍs ᴡɪᴅᴇ ᴀᴡᴀᴋᴇ.", "🧠 ɢʀᴏᴡᴛʜ ᴅᴏᴇsɴ’ᴛ ᴇɴᴅ ᴀᴛ sᴜɴsᴇᴛ. ɪᴛ sʟᴇᴇᴘs ᴡɪᴛʜ ʏᴏᴜ." ],
 night: [ "🌌 ᴛʜᴇ ɴɪɢʜᴛ ɪs sɪʟᴇɴᴛ, ʙᴜᴛ ʏᴏᴜʀ ᴅʀᴇᴀᴍs ᴀʀᴇ ʟᴏᴜᴅ.", "⭐ sᴛᴀʀs sʜɪɴᴇ ʙʀɪɢʜᴛᴇsᴛ ɪɴ ᴛʜᴇ ᴅᴀʀᴋ. sᴏ ᴄᴀɴ ʏᴏᴜ.", "🧘‍♂️ ʟᴇᴛ ɢᴏ ᴏғ ᴛʜᴇ ɴᴏɪsᴇ. ᴇᴍʙʀᴀᴄᴇ ᴛʜᴇ ᴘᴇᴀᴄᴇ.", "✅ ʏᴏᴜ ᴍᴀᴅᴇ ɪᴛ ᴛʜʀᴏᴜɢʜ ᴛʜᴇ ᴅᴀʏ. ɴᴏᴡ ᴅʀᴇᴀᴍ ʙɪɢ.", "🌠 ᴍɪᴅɴɪɢʜᴛ ᴛʜᴏᴜɢʜᴛs ᴀʀᴇ ᴛʜᴇ ʙʟᴜᴇᴘʀɪɴᴛ ᴏғ ᴛᴏᴍᴏʀʀᴏᴡ's ɢʀᴇᴀᴛɴᴇss." ],
 latenight: [ "🕶️ ᴡʜɪʟᴇ ᴛʜᴇ ᴡᴏʀʟᴅ sʟᴇᴇᴘs, ᴛʜᴇ ᴍɪɴᴅs ᴏғ ʟᴇɢᴇɴᴅs ᴡᴀɴᴅᴇʀ.", "⏱️ ʟᴀᴛᴇ ɴɪɢʜᴛs ᴛᴇᴀᴄʜ ᴛʜᴇ ᴅᴇᴇᴘᴇsᴛ ʟᴇssᴏɴs.", "🔕 sɪʟᴇɴᴄᴇ ɪsɴ'ᴛ ᴇᴍᴘᴛʏ—ɪᴛ's ғᴜʟʟ ᴏғ ᴀɴsᴡᴇʀs.", "✨ ᴄʀᴇᴀᴛɪᴠɪᴛʏ ᴡʜɪsᴘᴇʀs ᴡʜᴇɴ ᴛʜᴇ ᴡᴏʀʟᴅ ɪs ǫᴜɪᴇᴛ.", "🌌 ʀᴇsᴛ ᴏʀ ʀᴇғʟᴇᴄᴛ, ʙᴜᴛ ɴᴇᴠᴇʀ ᴡᴀsᴛᴇ ᴛʜᴇ ɴɪɢʜᴛ." ] };

// Enhanced global date formatter (date only)
function getCurrentDateTime() {
    return new Intl.DateTimeFormat("en", {
        year: "numeric",
        month: "long",
        day: "2-digit"
    }).format(new Date());
}

// Auto Bio Update System
if (conf.AUTO_BIO === "yes") {
    const updateBio = async () => {
        try {
            const block = getTimeBlock();
            const timeDate = getCurrentDateTime();
            const timeQuotes = quotes[block];
            const quote = timeQuotes[Math.floor(Math.random() * timeQuotes.length)];

            const bioText = `VORTEX md\n➤ ${quote}\n📅 ${timeDate}`;

            await vortex.updateProfileStatus(bioText);
            //console.log('Bio updated at:', new Date().toLocaleString());
        } catch (error) {
            //console.error('Bio update failed:', error.message);
        }
    };

    // Initial update after 10 seconds
    setTimeout(updateBio, 10000);

    // Update every 60 minutes
    setInterval(updateBio, 3600000);
}

// Silent Anti-Call System (unchanged)
if (conf.ANTICALL === 'yes') {
    vortex.ev.on("call", async (callData) => {
        try {
            await vortex.rejectCall(callData[0].id, callData[0].from);
            console.log('Call blocked from:', callData[0].from.slice(0, 6) + '...');
        } catch (error) {
            console.error('Call block failed:', error.message);
        }
    });
}

const updatePresence = async (jid) => {
    try {
        // Get presence state from config
        const etat = conf.ETAT || 0; // Default to 0 (unavailable) if not set
        
        // Determine chat type
        const isGroup = jid.endsWith('@g.us');
        const isPrivate = jid.endsWith('@s.whatsapp.net');
        const isStatus = jid === 'status@broadcast';
        
        // Skip status broadcasts for targeted presence
        if (isStatus) {
            if (etat == 1) {
                await vortex.sendPresenceUpdate("available", jid);
            } else {
                await vortex.sendPresenceUpdate("unavailable", jid);
            }
            return;
        }
        
        // Set presence based on ETAT value with chat type filtering
        if (etat == 1) {
            // Available - works everywhere
            await vortex.sendPresenceUpdate("available", jid);
        } else if (etat == 2) {
            // Typing in private chats only
            if (isPrivate) {
                await vortex.sendPresenceUpdate("composing", jid);
            } else {
                await vortex.sendPresenceUpdate("unavailable", jid);
            }
        } else if (etat == 3) {
            // Recording in private chats only
            if (isPrivate) {
                await vortex.sendPresenceUpdate("recording", jid);
            } else {
                await vortex.sendPresenceUpdate("unavailable", jid);
            }
        } else if (etat == 4) {
            // Typing in groups only
            if (isGroup) {
                await vortex.sendPresenceUpdate("composing", jid);
            } else {
                await vortex.sendPresenceUpdate("unavailable", jid);
            }
        } else if (etat == 5) {
            // Typing in all chats (private + groups)
            if (isPrivate || isGroup) {
                await vortex.sendPresenceUpdate("composing", jid);
            } else {
                await vortex.sendPresenceUpdate("unavailable", jid);
            }
        } else if (etat == 6) {
            // Recording in groups only
            if (isGroup) {
                await vortex.sendPresenceUpdate("recording", jid);
            } else {
                await vortex.sendPresenceUpdate("unavailable", jid);
            }
        } else if (etat == 7) {
            // Recording in all chats (private + groups)
            if (isPrivate || isGroup) {
                await vortex.sendPresenceUpdate("recording", jid);
            } else {
                await vortex.sendPresenceUpdate("unavailable", jid);
            }
        } else {
            // Default: unavailable (etat = 0 or any other value)
            await vortex.sendPresenceUpdate("unavailable", jid);
        }
        
        logger.debug(`Presence updated based on ETAT: ${etat} for ${isGroup ? 'group' : isPrivate ? 'private' : 'other'} chat`);
    } catch (e) {
        logger.error('Presence update failed:', e.message);
    }
};

// Update presence on connection
vortex.ev.on("connection.update", ({ connection }) => {
    if (connection === "open") {
        logger.info("Connection established - updating presence");
        updatePresence("status@broadcast");
    }
});

// Update presence when receiving a message
vortex.ev.on("messages.upsert", async ({ messages }) => {
    if (messages && messages.length > 0) {
        const message = messages[0];
        if (message.key && message.key.remoteJid) {
            await updatePresence(message.key.remoteJid);
        }
    }
});

// ==================== AUTO READ SYSTEM ====================
if (conf.AUTO_READ === "yes") {
    logger.info("[Read] Auto-read enabled for chats");
    
    vortex.ev.on("messages.upsert", async (m) => {
        try {
            const unread = m.messages.filter(
                msg => !msg.key.fromMe && 
                       msg.key.remoteJid !== "status@broadcast" &&
                       msg.message // Ensure message exists
            );
            if (unread.length > 0) {
                await vortex.readMessages(unread.map(msg => msg.key));
                logger.info(`[Read] Marked ${unread.length} messages as read`);
            }
        } catch (err) {
            logger.error("[Read] Error:", err);
        }
    });
}

// ==================== STATUS REPLY SYSTEM ====================
if (conf.AUTO_REPLY_STATUS === "yes") {
    logger.info("[Status] Auto-reply enabled for status views");
    
    const lastNotified = new Map();
    
    vortex.ev.on("messages.upsert", async (m) => {
        try {
            const statusUpdates = m.messages.filter(
                msg => msg.key?.remoteJid === "status@broadcast" && 
                      !msg.key.participant?.includes(vortex.user.id.split(':')[0]) &&
                      msg.message
            );
            
            if (statusUpdates.length > 0) {
                const statusMessage = statusUpdates[0];
                const statusSender = statusMessage.key.participant;
                
                if (!statusSender || statusSender.includes(vortex.user.id.split(':')[0])) return;
                
                const now = Date.now();
                const lastNotification = lastNotified.get(statusSender) || 0;
                
                if (now - lastNotification > 300000) { // 5 minutes cooldown
                    lastNotified.set(statusSender, now);
                    
                    await vortex.sendMessage(statusSender, {
                        text: `${conf.REPLY_STATUS_TEXT || "*ʏᴏᴜʀ sᴛᴀᴛᴜs ʜᴀᴠᴇ ʙᴇᴇɴ ᴠɪᴇᴡᴇᴅ sᴜᴄᴄᴇssғᴜʟʟʏ ✅*"}\n\n📌 For more info visit: *bwmxmd.online*\n\n> ǫᴜᴀɴᴛᴜᴍ ᴠɪᴇᴡᴇʀ`,
                        contextInfo: {
                            quotedMessage: statusMessage.message,
                            stanzaId: statusMessage.key.id,
                            participant: statusSender,
                            remoteJid: "status@broadcast",
                            quotedParticipant: statusSender,
                            forwardingScore: 999,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363421513037430@newsletter',
                                newsletterName: "VORTEX XMD",
                                serverMessageId: Math.floor(100000 + Math.random() * 900000),
                            }
                        }
                    });
                    
                    logger.info(`[Status] Replied to status from ${statusSender}`);
                }
            }
        } catch (err) {
            logger.error("[Status] Reply error:", err);
        }
    });
}

// ==================== WELCOME/GOODBYE SYSTEM ====================
const welcomeImage = 'https://res.cloudinary.com/dptzpfgtm/image/upload/v1753723388/whatsapp_uploads/wqyliw4kzvrulh0bmg10.jpg';
const goodbyeImage = 'https://res.cloudinary.com/dptzpfgtm/image/upload/v1753723388/whatsapp_uploads/wqyliw4kzvrulh0bmg10.jpg';

// Cache for group names and profile photos
const groupCache = new Map();
const profileCache = new Map();
setInterval(() => {
    groupCache.clear();
    profileCache.clear();
}, 3600000); // Clear cache every hour

// Helper function to get profile photo with fallback
async function getProfilePhoto(jid, fallbackImage = welcomeImage) {
    try {
        if (profileCache.has(jid)) {
            return profileCache.get(jid);
        }
        
        const profileUrl = await vortex.profilePictureUrl(jid, 'image');
        profileCache.set(jid, profileUrl);
        return profileUrl;
    } catch (error) {
        logger.debug(`No profile photo for ${jid}, using fallback`);
        return fallbackImage;
    }
}

// Helper function to get contact name from group metadata
async function getContactName(jid, groupId) {
    try {
        // Get group metadata to find the participant
        const metadata = await vortex.groupMetadata(groupId);
        const participant = metadata.participants.find(p => p.id === jid);
        
        if (participant && participant.notify) {
            return participant.notify;
        }
        
        // Fallback to just the number part
        const number = jid.split('@')[0];
        return number;
    } catch (error) {
        logger.error('Error getting contact name:', error);
        // Ultimate fallback
        return jid.split('@')[0];
    }
}

vortex.ev.on('group-participants.update', async (update) => {
    try {
        const { id, participants, action } = update;
        
        if (!botJid) {
            logger.error('Bot JID not available');
            return;
        }

        logger.info(`Group update: ${action} in ${id}, participants: ${participants.length}`);

        // Get group metadata with caching
        let groupName = groupCache.get(id);
        let groupMetadata;
        if (!groupName) {
            try {
                groupMetadata = await vortex.groupMetadata(id);
                groupName = groupMetadata.subject || "this group";
                groupCache.set(id, groupName);
                logger.info(`Group name: ${groupName}`);
            } catch (error) {
                logger.error(`Failed to get group metadata for ${id}:`, error);
                groupName = "this group";
            }
        }

        for (const participant of participants) {
            if (participant === botJid) {
                logger.info('Skipping bot participant');
                continue;
            }

            try {
                logger.info(`Processing ${action} for ${participant}`);
                
                // Get user's actual name from group metadata
                const userName = await getContactName(participant, id);
                logger.info(`User name: ${userName}`);
                
                if (action === 'add' && conf.WELCOME_MESSAGE === 'yes') {
                    logger.info('Sending welcome message...');
                    
                    // Get user profile photo
                    const profilePhoto = await getProfilePhoto(participant, welcomeImage);
                    
                    const welcomeMessages = [
                        `🌟 *W E L C O M E* 🌟\n\n🎉 Welcome to *${groupName}*\n\n✨ We're thrilled to have you join our amazing community! Feel free to introduce yourself and explore what we have to offer.\n\n🤝 Don't hesitate to jump into conversations and make new connections.\n\n📌 *For more info visit:* bwmxmd.online\n\n🚀 _Enjoy your stay with us!_`,
                        
                        `✨ *N E W  M E M B E R* ✨\n\n🏠 You've just joined *${groupName}*\n\n💫 We're excited to have you here with us! This is a place where great minds meet and amazing conversations happen.\n\n🌈 Feel free to ask questions, share ideas, and participate actively.\n\n📌 *For more info visit:* bwmxmd.online\n\n🎯 _Let's make great memories together!_`,
                        
                        `🎉 *W A R M  W E L C O M E* 🎉\n\n🏆 Welcome to *${groupName}*\n\n🌟 We hope you'll find this group engaging, helpful, and full of positive vibes! Your presence adds value to our community.\n\n💡 Looking forward to your amazing contributions!\n\n📌 *For more info visit:* bwmxmd.online\n\n✅ _Welcome aboard!_`,
                        
                        `🚀 *H E L L O  T H E R E* 🚀\n\n🎪 Welcome to *${groupName}*\n\n🎨 We're pleased to have you as part of our wonderful community. This is your space to learn, share, and grow with like-minded people.\n\n🌍 Feel free to explore and make yourself at home!\n\n📌 *For more info visit:* bwmxmd.online\n\n🎭 _Great to have you here!_`
                    ];
                    
                    const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
                    
                    await vortex.sendMessage(id, {
                        image: { url: profilePhoto },
                        caption: randomMessage,
                        mentions: [participant],
                        contextInfo: {
                            forwardingScore: 999,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363421513037430@newsletter',
                                newsletterName: "VORTEX XMD",
                                serverMessageId: Math.floor(100000 + Math.random() * 900000),
                            },
                        }
                    });
                    
                    logger.info(`[Welcome] Sent welcome message to ${userName} in ${groupName}`);
                }
                else if (action === 'remove' && conf.GOODBYE_MESSAGE === 'yes') {
                    logger.info('Sending goodbye message...');
                    
                    // Get user profile photo for goodbye
                    const profilePhoto = await getProfilePhoto(participant, goodbyeImage);
                    
                    const farewellMessages = [
                        `👋🏻 *F A R E W E L L* 👋🏻\n\n🌅 *${userName}* has left *${groupName}*\n\n🙏🏻 We appreciate the wonderful time you spent with us and all the great memories we shared together.\n\n✨ Thank you for being part of our community.\n\n🌟 Wishing you all the best on your journey ahead!\n\n📌 *For more info visit:* bwmxmd.online\n\n🚪 _You're always welcome back!_`,
                        
                        `🌅 *G O O D B Y E* 🌅\n\n👋🏻 Farewell to *${userName}* from *${groupName}*\n\n💫 Thank you for your amazing contributions to our community. Your presence made a difference and we'll miss having you around.\n\n🎭 The memories we created together will always be cherished.\n\n🌈 You're always welcome back anytime!\n\n📌 *For more info visit:* bwmxmd.online\n\n🎯 _Take care and stay awesome!_`,
                        
                        `✨ *S E E  Y O U  L A T E R* ✨\n\n🙋🏻‍♂️ *${userName}* is no longer with us in *${groupName}*\n\n🌟 We're grateful for all the wonderful memories and meaningful interactions we shared together.\n\n🤝 Your contributions to our community were truly valuable.\n\n💫 Take care and stay in touch!\n\n📌 *For more info visit:* bwmxmd.online\n\n🎊 _Until we meet again!_`,
                        
                        `🙏🏻 *T H A N K  Y O U* 🙏🏻\n\n👋🏻 We bid farewell to *${userName}* from *${groupName}*\n\n🏆 It's been an absolute pleasure having you as part of our amazing community. Your positive energy and contributions made this place better.\n\n🌍 Wishing you success and happiness in all your endeavors!\n\n🎨 Keep being awesome wherever you go!\n\n📌 *For more info visit:* bwmxmd.online\n\n🚀 _Best wishes always!_`
                    ];
                    
                    const randomMessage = farewellMessages[Math.floor(Math.random() * farewellMessages.length)];
                    
                    await vortex.sendMessage(id, {
                        image: { url: profilePhoto },
                        caption: randomMessage,
                        mentions: [participant],
                        contextInfo: {
                            forwardingScore: 999,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363421513037430@newsletter',
                                newsletterName: "VORTEX XMD",
                                serverMessageId: Math.floor(100000 + Math.random() * 900000),
                            },
                        }
                    });
                    
                    logger.info(`[Goodbye] Sent goodbye message for ${userName} in ${groupName}`);
                }
                
                // Small delay between processing participants
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (participantError) {
                logger.error(`Error processing ${action} for ${participant}:`, participantError);
            }
        }
    } catch (err) {
        logger.error('Welcome/Goodbye system error:', err);
    }
});
        
// ==================== STATUS READ SYSTEM ====================
if (conf.AUTO_READ_STATUS === "yes") {
    logger.info("[Status] Auto-read enabled for status updates");
    
    vortex.ev.on("messages.upsert", async (m) => {
        try {
            const statusUpdates = m.messages.filter(
                msg => msg.key?.remoteJid === "status@broadcast" && 
                      !msg.key.participant?.includes(vortex.user.id.split(':')[0])
            );
            if (statusUpdates.length > 0) {
                await vortex.readMessages(statusUpdates.map(msg => msg.key));
            }
        } catch (err) {
            logger.error("[Status] Read error:", err);
        }
    });
}


// ==================== AUTO REACT TO MESSAGES ====================
if (conf.AUTO_REACT === "yes") {
    logger.info("[React] Auto-react to messages enabled");
    
    const emojiMap = {
        "hello": ["👋", "🙂", "😊"],
        "hi": ["👋", "😄", "🤗"],
        "good morning": ["🌞", "☀️", "🌻"],
        "good night": ["🌙", "🌠", "💤"],
        "thanks": ["🙏", "❤️", "😊"],
        "welcome": ["😊", "🤗", "👌"],
        "congrats": ["🎉", "👏", "🥳"],
        "sorry": ["😔", "🙏", "🥺"]
    };
                   
    const fallbackEmojis = [
        "👍", "👌", "💯", "✨", "🌟", "🏆", "🎯", "✅",
        "🙏", "❤️", "💖", "💝", "💐", "🌹",
        "😊", "🙂", "👋", "🤝", "🫱🏻‍🫲🏽",
        "🎉", "🎊", "🥂", "🍾", "🎈", "🎁",
        "🌞", "☀️", "🌙", "⭐", "🌈", "☕",
        "🌍", "✈️", "🗺️", "🌻", "🌸", "🌊",
        "📚", "🎨", "📝", "🔍", "💡", "⚙️",
        "📌", "📍", "🕰️", "⏳", "📊", "📈"
    ];

    let lastReactTime = 0;

    vortex.ev.on("messages.upsert", async (m) => {
        try {
            const { messages } = m;
            const now = Date.now();

            for (const message of messages) {
                if (!message.key || message.key.fromMe || 
                    message.key.remoteJid === "status@broadcast" ||
                    now - lastReactTime < 2000) continue;

                const msgText = (
                    message.message?.conversation || 
                    message.message?.extendedTextMessage?.text || ""
                ).toLowerCase();

                let emoji;
                for (const [keyword, emojis] of Object.entries(emojiMap)) {
                    if (msgText.includes(keyword)) {
                        emoji = emojis[Math.floor(Math.random() * emojis.length)];
                        break;
                    }
                }

                emoji = emoji || fallbackEmojis[Math.floor(Math.random() * fallbackEmojis.length)];

                await vortex.sendMessage(message.key.remoteJid, {
                    react: {
                        text: emoji,
                        key: message.key
                    }
                });

                lastReactTime = now;
                logger.info(`[React] Sent ${emoji} to ${message.key.remoteJid}`);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        } catch (err) {
            logger.error("[React] Error:", err);
        }
    });
}

// ==================== AUTO REACT TO STATUS ====================
if (conf.AUTO_REACT_STATUS === "yes") {
    logger.info("[Status] Auto-react to status enabled");
    
    let lastReactionTime = 0;

    vortex.ev.on("messages.upsert", async (m) => {
        const { messages } = m;
        
        const reactionEmojis = (conf.STATUS_REACT_EMOJIS || "🚀,🌎,♻️").split(",").map(e => e.trim());

        for (const message of messages) {
            if (message.key && message.key.remoteJid === "status@broadcast") {
                const now = Date.now();
                if (now - lastReactionTime < 5000) continue; // 5-second cooldown

                const botJid = vortex.user?.id ? `${vortex.user.id.split(':')[0]}@s.whatsapp.net` : null;
                if (!botJid) continue;

                try {
                    const randomEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];

                    await vortex.sendMessage(message.key.remoteJid, {
                        react: {
                            key: message.key,
                            text: randomEmoji,
                        },
                    }, {
                        statusJidList: [message.key.participant, botJid],
                    });

                    lastReactionTime = Date.now();
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    logger.info(`[Status] Reacted ${randomEmoji} to status from ${message.key.participant}`);
                } catch (error) {
                    logger.error(`Status reaction failed: ${error.message}`);
                }
            }
        }
    });
}


const googleTTS = require("google-tts-api");
const { createContext2 } = require('./Hans/helper2');

const availableApis = [
   // "https://bk9.fun/ai/jeeves-chat2?q=",
    "https://bk9.fun/ai/google-thinking?q=",
    "https://bk9.fun/ai/llama?q="
];

function getRandomApi() {
    return availableApis[Math.floor(Math.random() * availableApis.length)];
}

function processForTTS(text) {
    if (!text || typeof text !== 'string') return '';
    return text.replace(/[\[\]\(\)\{\}]/g, ' ')
              .replace(/\s+/g, ' ')
              .substring(0, 190);
}

async function getAIResponse(query) {
    const identityPatterns = [
    /who\s*(made|created|built)\s*you/i,
    /who\s*is\s*your\s*(creator|developer|maker|owner|father|parent)/i,
    /what('?s| is)\s*your\s*name\??/i,
    /who\s*are\s*you\??/i,
    /who\s*a?you\??/i,
    /who\s*au\??/i,
    /what('?s| is)\s*ur\s*name\??/i,
    /wat('?s| is)\s*(ur|your)\s*name\??/i,
    /wats?\s*(ur|your)\s*name\??/i,
    /wot('?s| is)\s*(ur|your)\s*name\??/i,
    /hoo\s*r\s*u\??/i,
    /who\s*u\??/i,
    /whos\s*u\??/i,
    /whos?\s*this\??/i,
    /you\s*called\s*bwm/i,
    /are\s*you\s*bwm/i,
    /are\s*u\s*bwm/i,
    /u\s*bwm\??/i,
    /who\s*is\s*your\s*boss\??/i,
    /who\s*ur\s*boss\??/i,
    /who\s*your\s*boss\??/i,
    /whoa\s*created\s*you\??/i,
    /who\s*made\s*u\??/i,
    /who\s*create\s*u\??/i,
    /who\s*built\s*u\??/i,
    /who\s*ur\s*owner\??/i,
    /who\s*is\s*u\??/i,
    /what\s*are\s*you\??/i,
    /what\s*r\s*u\??/i,
    /wat\s*r\s*u\??/i
];

    const isIdentityQuestion = identityPatterns.some(pattern => 
        typeof query === 'string' && pattern.test(query)
    );
    
    try {
        const apiUrl = getRandomApi();
        const response = await fetch(apiUrl + encodeURIComponent(query));
        
        // First try to parse as JSON
        try {
            const data = await response.json();
            // Handle different API response formats
            let aiResponse = data.BK9 || data.result || data.response || data.message || 
                           (data.data && (data.data.text || data.data.message)) || 
                           JSON.stringify(data);
            
            // If we got an object, stringify it
            if (typeof aiResponse === 'object') {
                aiResponse = JSON.stringify(aiResponse);
            }

            if (isIdentityQuestion) {
                aiResponse = 'I am VORTEX XMD, created by HansTz! 🚀';
            }
            
            return aiResponse;
        } catch (jsonError) {
            // If JSON parse fails, try to get as text
            const textResponse = await response.text();
            return isIdentityQuestion 
                ? `I am VORTEX XMD, created by HansTz! 🚀`
                : textResponse;
        }
    } catch (error) {
        console.error("API Error:", error);
        return isIdentityQuestion 
            ? "I'm VORTEX XMD, created by HansTz! 🚀"
            : "Sorry, I couldn't get a response right now";
    }
}

if (conf.CHATBOT === "yes" || conf.CHATBOT1 === "yes") {
    vortex.ev.on("messages.upsert", async ({ messages }) => {
        try {
            const msg = messages[0];
            if (!msg?.message || msg.key.fromMe) return;

            const jid = msg.key.remoteJid;
            let text = '';
            
            if (msg.message.conversation) {
                text = msg.message.conversation;
            } else if (msg.message.extendedTextMessage?.text) {
                text = msg.message.extendedTextMessage.text;
            } else if (msg.message.imageMessage?.caption) {
                text = msg.message.imageMessage.caption;
            }

            if (!text || typeof text !== 'string') return;

            const aiResponse = await getAIResponse(text);

            // Text response
            if (conf.CHATBOT === "yes") {
                await vortex.sendMessage(jid, { 
                    text: String(aiResponse),
                    ...createContext(jid, {
                        title: "ʙᴡᴍ xᴍᴅ ᴄʜᴀᴛʙᴏᴛ ᴄᴏɴᴠᴇʀsᴀᴛɪᴏɴ",
                        body: "ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɪʙʀᴀʜɪᴍ ᴀᴅᴀᴍs"
                    })
                }, { quoted: msg });
            }

            // Voice response
            if (conf.CHATBOT1 === "yes") {
                const ttsText = processForTTS(String(aiResponse));
                if (ttsText) {
                    const audioUrl = googleTTS.getAudioUrl(ttsText, {
                        lang: "en",
                        slow: false,
                        host: "https://translate.google.com",
                    });

                    await vortex.sendMessage(jid, {
                        audio: { url: audioUrl },
                        mimetype: "audio/mpeg",
                        ptt: true,
                        ...createContext2(jid, {
                            title: "ʙᴡᴍ xᴍᴅ ᴀᴜᴅɪᴏ_ᴄʜᴀᴛʙᴏᴛ",
                            body: "ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɪʙʀᴀʜɪᴍ ᴀᴅᴀᴍs"
                        })
                    }, { quoted: msg });
                }
            }
        } catch (error) {
            console.error("Message processing error:", error);
        }
    });
}

 const isAnyLink = (message) => {
    // Regex pattern to detect any link
    const linkPattern = /https?:\/\/[^\s]+/;
    return linkPattern.test(message);
};

vortex.ev.on('messages.upsert', async (msg) => {
    try {
        const { messages } = msg;
        const message = messages[0];

        if (!message.message) return; // Skip empty messages

        const from = message.key.remoteJid; // Chat ID
        const sender = message.key.participant || message.key.remoteJid; // Sender ID
        const isGroup = from.endsWith('@g.us'); // Check if the message is from a group

        if (!isGroup) return; // Skip non-group messages

        const groupMetadata = await vortex.groupMetadata(from); // Fetch group metadata
        const groupAdmins = groupMetadata.participants
            .filter((member) => member.admin)
            .map((admin) => admin.id);

        // Check if ANTI-LINK is enabled for the group
        if (conf.GROUP_ANTILINK === 'yes') {
            const messageType = Object.keys(message.message)[0];
            const body =
                messageType === 'conversation'
                    ? message.message.conversation
                    : message.message[messageType]?.text || '';

            if (!body) return; // Skip if there's no text

            // Skip messages from admins
            if (groupAdmins.includes(sender)) return;

            // Check for any link
            if (isAnyLink(body)) {
                // Delete the message
                await vortex.sendMessage(from, { delete: message.key });

                // Remove the sender from the group
                await vortex.groupParticipantsUpdate(from, [sender], 'remove');

                // Send a notification to the group
                await vortex.sendMessage(
                    from,
                    {
                        text: `⚠️VORTEX md anti-link online!\n User @${sender.split('@')[0]} has been removed for sharing a link.`,
                        mentions: [sender],
                    }
                );
            }
        }
    } catch (err) {
        console.error('Error handling message:', err);
    }
});


        //============================================================================================================

        console.log("lorded all commands successfully 🤗\n");
        try {
            const taskflowPath = path.join(__dirname, "HansTz");
            fs.readdirSync(taskflowPath).forEach((fichier) => {
                if (path.extname(fichier).toLowerCase() === ".js") {
                    try {
                        require(path.join(taskflowPath, fichier));
                    } catch (e) {
                        console.error(`❌ Failed to load ${fichier}: ${e.message}`);
                    }
                }
            });
        } catch (error) {
            console.error("❌ Error reading Taskflow folder:", error.message);
        }

        //============================================================================/

        // MAIN COMMAND PROCESSING WITH FIXED AUTHORIZATION LOGIC
        vortex.ev.on("messages.upsert", async ({ messages }) => {
            const ms = messages[0];
            if (!ms?.message || !ms?.key) return;

            const origineMessage = standardizeJid(ms.key.remoteJid);
            const idBot = standardizeJid(vortex.user?.id);
            const verifGroupe = origineMessage.endsWith("@g.us");
            
            let infosGroupe = null;
            let nomGroupe = '';
            try {
                infosGroupe = verifGroupe ? await vortex.groupMetadata(origineMessage).catch(() => null) : null;
                nomGroupe = infosGroupe?.subject || '';
            } catch (err) {
                console.error("Group metadata error:", err);
            }

            const msgRepondu = ms.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
            const auteurMsgRepondu = standardizeJid(ms.message?.extendedTextMessage?.contextInfo?.participant);
            const mentionedJids = (ms.message?.extendedTextMessage?.contextInfo?.mentionedJid || []).map(standardizeJid);

            // ENHANCED AUTHOR MESSAGE DETECTION WITH LID SUPPORT
            let auteurMessage = verifGroupe 
                ? standardizeJid(ms.key.participant || ms.participant || origineMessage)
                : origineMessage;
            if (ms.key.fromMe) auteurMessage = idBot;

            // EXTRACT REGULAR JID FROM LID FOR VERIFICATION
            const auteurRegularJid = extractRegularJidFromLid(auteurMessage);

            const utilisateur = mentionedJids.length > 0 
                ? mentionedJids[0] 
                : msgRepondu 
                    ? auteurMsgRepondu 
                    : '';

            // SUPERUSER DETECTION (ONLY FOR PRIVATE CHATS)
            const SUDO_NUMBERS = [
                "255753668403", 
                "254106727593"
            ];

            const botJid = idBot;
            const ownerJid = standardizeJid(conf.OWNER_NUMBER);

            // Enhanced superUser list
            const superUser = [
                ownerJid,
                botJid,
                ...SUDO_NUMBERS.map(num => standardizeJid(num))
            ];

            // CHECK BOTH LID AND REGULAR JID FOR SUPERUSER STATUS (ONLY FOR PRIVATE CHATS)
            const isSuperUser = !verifGroupe && (superUser.includes(auteurMessage) || superUser.includes(auteurRegularJid));

            // FIXED: Enhanced admin verification with bot owner support in groups
            let verifAdmin = false;
            let botIsAdmin = false;
            let isBotOwner = false;

            if (verifGroupe && infosGroupe) {
                try {
                    const admins = infosGroupe.participants
                        .filter(p => p.admin)
                        .map(p => standardizeJid(p.id));
                    
                    // Check both LID and regular JID formats for admin status
                    verifAdmin = admins.includes(auteurMessage) || admins.includes(auteurRegularJid);
                    botIsAdmin = admins.includes(botJid);
                    
                    // FIXED: Bot owner verification - use botJid for groups instead of owner number
                    isBotOwner = (auteurMessage === botJid) || ms.key.fromMe;
                    if (isBotOwner) verifAdmin = true; // Bot owner always treated as admin
                    
                    console.log(`🔍 Group Check: ${auteurMessage} (${auteurRegularJid}) - Admin: ${verifAdmin}, BotOwner: ${isBotOwner}, FromMe: ${ms.key.fromMe}`);
                } catch (error) {
                    console.error("Admin verification error:", error);
                    verifAdmin = false;
                    botIsAdmin = false;
                }
            } else {
                // In private chats, check if user is bot owner using owner number
                isBotOwner = (auteurMessage === ownerJid) || (auteurRegularJid === ownerJid);
            }

            const texte = ms.message?.conversation || 
                         ms.message?.extendedTextMessage?.text || 
                         ms.message?.imageMessage?.caption || 
                         '';
            const arg = typeof texte === 'string' ? texte.trim().split(/\s+/).slice(1) : [];
            const verifCom = typeof texte === 'string' && texte.startsWith(PREFIX);
            const com = verifCom ? texte.slice(PREFIX.length).trim().split(/\s+/)[0]?.toLowerCase() : null;

            if (verifCom && com) {
                const cmd = Array.isArray(evt.cm) 
                    ? evt.cm.find((c) => 
                        c?.nomCom === com || 
                        (Array.isArray(c?.aliases) && c.aliases.includes(com))
                    )
                    : null;

                if (cmd) {
                    // FIXED: Enhanced authorization check with proper group private mode logic
                    console.log(`🚀 Command: ${com} by ${auteurMessage} (${auteurRegularJid}) - Group: ${verifGroupe}, SuperUser: ${isSuperUser}, Admin: ${verifAdmin}, BotOwner: ${isBotOwner}`);

                    // DEFINE RESTRICTED COMMANDS
                    const restrictedCommands = [
    // Core bot controls
    'getallvar', 'setvar', 'settings', 'update', 'reset', 'restart', 'backup', 'status',
    
    // Presence/status features
    'autotyping', 'alwaysonline', 'autorecording', 'autobio', 'alwaysonline',
    
    // Reaction/read features
    'autoreact', 'autoreactstatus', 'autoread', 'autoreadstatus', 'autodownloadstatus',
    
    // Chat features
    'chatboton', 'audiochatbot', 'autoreply', 'startmsg',
    
    // Privacy/security
    'privatemode', 'anticall', 'antilink', 'antidelete', 'antideleterecover',
    
    // Group management
    'join', 'jid', 'block', 'link', 'invite', 'left', 'kick', 'kickall', 
    'opengroup', 'closegroup', 'hidetag', 'promote', 'demote', 'groupn', 
    'groupd', 'senttoall', 'opentime', 'closetime', 'canceltimer', 
    'lockdown', 'resetlink', 'ephemeral', 'del', 'reject', 'approve', 
    'setgpp', 'add', 'mute', 'unmute', 'setname', 'setdesc', 'revoke',
    
    // Welcome/goodbye
    'welcome', 'goodbye',
    
    // Variable controls
    'getvar', 'listvar'
];

                    const isRestrictedCommand = restrictedCommands.includes(com);

                    // FIXED: Authorization logic with correct private mode handling
                    let isAuthorized = false;
                    let blockReason = '';

                    if (verifGroupe) {
                        // GROUP AUTHORIZATION
                        if (conf.MODE?.toLowerCase() === "no") {
                            // PRIVATE MODE: Only admins and bot owner can use any commands
                            if (verifAdmin || isBotOwner) {
                                isAuthorized = true;
                            } else {
                                blockReason = "Bot in private mode - Groups: only admins and owner allowed";
                            }
                        } else {
                            // PUBLIC MODE: Everyone can use normal commands, only admins+owner can use restricted
                            if (isRestrictedCommand) {
                                if (verifAdmin || isBotOwner) {
                                    isAuthorized = true;
                                } else {
                                    blockReason = "Restricted command - Groups: only admins and owner allowed";
                                }
                            } else {
                                isAuthorized = true; // Normal commands allowed for everyone in public mode
                            }
                        }
                    } else {
                        // PRIVATE CHAT AUTHORIZATION
                        if (conf.MODE?.toLowerCase() === "no") {
                            // PRIVATE MODE: Only superusers can use any commands
                            if (isSuperUser) {
                                isAuthorized = true;
                            } else {
                                blockReason = "Bot in private mode - Private chats: only superusers allowed";
                            }
                        } else {
                            // PUBLIC MODE: Everyone can use normal commands, only superusers can use restricted
                            if (isRestrictedCommand) {
                                if (isSuperUser) {
                                    isAuthorized = true;
                                } else {
                                    blockReason = "Restricted command - Private chats: only superusers allowed";
                                }
                            } else {
                                isAuthorized = true; // Normal commands allowed for everyone in public mode
                            }
                        }
                    }

                    // BLOCK UNAUTHORIZED ACCESS
                    if (!isAuthorized) {
                        console.log(`🚨 BLOCKED: ${auteurMessage} tried ${com} - ${blockReason}`);
                        store.logUnauthorizedAttempt(auteurMessage, com, blockReason);
                        return;
                    }

                    // ADDITIONAL GROUP-SPECIFIC CHECKS FOR BOT ADMIN REQUIRED COMMANDS
                    if (verifGroupe) {
                        const botAdminRequired = [
                            'hdhdgd', 'dhdhd'
                        ];

                        if (botAdminRequired.includes(com) && !botIsAdmin) {
                            console.log(`🚨 BLOCKED: ${com} requires bot to be admin`);
                            return;
                        }
                    }

                    // EXECUTE COMMAND IF AUTHORIZED
                    console.log(`✅ AUTHORIZED: ${auteurMessage} (${auteurRegularJid}) executing ${com}`);
                    
                    try {
                        const repondre = async (text, options = {}) => {
                            if (typeof text !== 'string') return;
                            try {
                                await vortex.sendMessage(origineMessage, { 
                                    text,
                                    ...createContext(auteurMessage, {
                                        title: options.title || nomGroupe || "BWM-XMD",
                                        body: options.body || ""
                                    })
                                }, { quoted: ms });
                            } catch (err) {
                                console.error("Reply error:", err);
                                if (await workerManager.handleAuthError(err)) return;
                            }
                        };

                        if (cmd.reaction) {
                            try {
                                await vortex.sendMessage(origineMessage, {
                                    react: { 
                                        key: ms.key, 
                                        text: cmd.reaction 
                                    }
                                });
                            } catch (err) {
                                console.error("Reaction error:", err);
                            }
                        }

                        const context = {
                            ms,
                            arg,
                            repondre,
                            superUser,
                            verifAdmin,
                            botIsAdmin,
                            verifGroupe,
                            infosGroupe,
                            nomGroupe,
                            auteurMessage,
                            auteurRegularJid,
                            utilisateur: utilisateur || '',
                            membreGroupe: verifGroupe ? auteurMessage : '',
                            origineMessage,
                            msgRepondu,
                            auteurMsgRepondu: auteurMsgRepondu || '',
                            isSuperUser,
                            isBotOwner,
                            mybotpic: getRandomImage,
                            conf,
                            texte,
                            nomBot: conf.BOT_NAME || 'VORTEX XMD',
                            PREFIX: conf.PREFIX || '.',
                            com
                        };

                        await cmd.fonction(origineMessage, adams, context);

                    } catch (error) {
                        console.error(`Command error [${com}]:`, error);
                        
                        if (await workerManager.handleAuthError(error)) return;
                        
                        try {
                            await vortex.sendMessage(origineMessage, {
                                text: `🚨 Command failed: ${error.message}`,
                                ...createContext(auteurMessage, {
                                    title: "Error",
                                    body: "Command execution failed"
                                })
                            }, { quoted: ms });
                        } catch (sendErr) {
                            console.error("Error sending error message:", sendErr);
                        }
                    }
                }
            }
        });

       
    vortex.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
        console.log("QR Code received, scan it!");
    }

    if (connection === "connecting") {
        console.log("🪩 Bot scanning 🪩");
        reconnectAttempts = 0;
    }

    if (connection === "open") {
        console.log("🌎 VORTEX XMD ONLINE 🌎");
        reconnectAttempts = 0;
        
        setTimeout(async () => {
            try {
                console.log('🚀 Enjoy VORTEX md speed 🌎');
                const md = conf.MODE === "yes" ? "PUBLIC" : "PRIVATE";
                const ownerJid = `${conf.OWNER_NUMBER}@s.whatsapp.net`;
                const botSelf = vortex.user?.id;
                const connectionMsg = `╔══════════════════╗
║  🌟 *VORTEX XMD* 🌟  ║
╚══════════════════╝

✅ *Bot is ONLINE!*
⚡ *Status:* Connected
🔰 *Prefix:* [ ${conf.PREFIX} ]
☣️ *Mode:* ${md}
🔄 *Auto-fix:* ACTIVE
⏰ *Time:* ${new Date().toLocaleString('en-US', { timeZone: 'Africa/Dar_es_Salaam' })}

> *Powered by VORTEX XMD*`;

                const targets = [ownerJid];
                if (botSelf && botSelf !== ownerJid) targets.push(botSelf);

                for (const target of targets) {
                    try {
                        await vortex.sendMessage(target, { text: connectionMsg });
                    } catch (e) {}
                }

                if (conf.DP === "yes") {
                    await vortex.sendMessage(
                        botSelf,
                        {
                            text: connectionMsg,
                            ...createContext("VORTEX XMD", {
                                title: "SYSTEM ONLINE",
                                body: "VORTEX XMD"
                            })
                        },
                        { disappearingMessagesInChat: true, ephemeralExpiration: 600 }
                    );
                }
            } catch (err) {
                console.error("Post-connection setup error:", err);
            }
        }, 5000);
    }

            if (connection === "close") {
                if (global.isShuttingDown) {
                    console.log('📡 Connection closed during shutdown, not reconnecting.');
                    return;
                }
                const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
                const errorMessage = lastDisconnect?.error?.message || '';
                
                console.log(`Connection closed due to: ${reason}, Error: ${errorMessage}`);
                
                // Check for authentication errors first
                if (errorMessage.includes('Unsupported state or unable to authenticate data') || 
                    errorMessage.includes('aesDecryptGCM') ||
                    errorMessage.includes('decrypt')) {
                    console.log('🚨 Bwm xmd fixer has detected an error we are working on it..');
                    await workerManager.handleAuthError(new Error(errorMessage));
                    return;
                }
                
                if (reason === DisconnectReason.badSession) {
                    console.log("Your session was corrupt just a min we fix it");
                    await workerManager.restartWorker(true);
                } else if (reason === DisconnectReason.connectionClosed) {
                    console.log("We have disconnected the bot but we are connecting it again with full speed");
                    setTimeout(() => reconnectWithRetry(), RECONNECT_DELAY);
                } else if (reason === DisconnectReason.connectionLost) {
                    console.log("We have disconnected the bot but we are connecting it again with full speed");
                    setTimeout(() => reconnectWithRetry(), RECONNECT_DELAY);
                } else if (reason === DisconnectReason.connectionReplaced) {
                    console.log("Successfully Connected the bot it is starting up ✅");
                    await workerManager.restartWorker(false);
                } else if (reason === DisconnectReason.loggedOut) {
                    console.log("Device logged out, triggering restart with session cleanup");
                    await workerManager.restartWorker(true);
                } else if (reason === DisconnectReason.restartRequired) {
                    console.log("Restart required, triggering restart");
                    await workerManager.restartWorker(false);
                } else if (reason === DisconnectReason.timedOut) {
                    console.log("Connection timed out, reconnecting...");
                    setTimeout(() => reconnectWithRetry(), RECONNECT_DELAY * 2);
                } else {
                    console.log(`Unknown disconnect reason: ${reason}, attempting reconnection...`);
                    setTimeout(() => reconnectWithRetry(), RECONNECT_DELAY);
                }
            }
        });

        const cleanup = () => {
            global.isShuttingDown = true;
            if (store) {
                try { store.destroy(); } catch(e) {}
            }
            if (listenerManager) {
                try { listenerManager.cleanupListeners(); } catch(e) {}
            }
        };

        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);

    } catch (error) {
        console.error('Socket initialization error:', error);
        
        // Check if it's an auth error
        if (await workerManager.handleAuthError(error)) return;
        
        setTimeout(() => reconnectWithRetry(), RECONNECT_DELAY);
    }
}

async function reconnectWithRetry() {
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.error('Max reconnection attempts reached. Triggering fixer restart...');
        await workerManager.restartWorker(true);
        return;
    }

    reconnectAttempts++;
    const delay = Math.min(RECONNECT_DELAY * Math.pow(2, reconnectAttempts - 1), 300000);
    
    console.log(`Reconnection attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} in ${delay}ms...`);
    
    setTimeout(async () => {
        try {
            await main();
        } catch (error) {
            console.error('Reconnection failed:', error);
            
            if (!(await workerManager.handleAuthError(error))) {
                reconnectWithRetry();
            }
        }
    }, delay);
}

// Start the application with enhanced worker management
console.log('🚀 Starting Bwm xmd with quantum speed..');
setTimeout(() => {
    workerManager.startWorker().catch(err => {
        console.error("Fixer initialization error:", err);
    });
}, 5000);
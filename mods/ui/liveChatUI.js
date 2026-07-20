// Live chat overlay UI — DOM creation and message rendering.
// Data fetching and state live in features/liveChat.js.

export const OVERLAY_ID = 'tt-live-chat-overlay';

const MAX_MESSAGES = 10;
const FADE_AFTER_MS = 20000;

export function createOverlay(visible) {
    let el = document.getElementById(OVERLAY_ID);
    if (el) return el;

    el = document.createElement('div');
    el.id = OVERLAY_ID;
    el.className = 'tt-live-chat-overlay';
    el.style.display = visible ? 'flex' : 'none';

    document.body.appendChild(el);
    return el;
}

export function removeOverlay() {
    const el = document.getElementById(OVERLAY_ID);
    if (el) el.remove();
}

export function setOverlayVisible(visible) {
    const el = document.getElementById(OVERLAY_ID);
    if (!el) return;
    el.style.display = visible ? 'flex' : 'none';
    if (!visible) {
        while (el.firstChild) el.removeChild(el.firstChild);
    }
    updateChatToggleIcon(visible);
}

function updateChatToggleIcon(visible) {
    const btn = document.querySelector('yt-button-container[aria-label="Toggle Chat"]');
    if (!btn) return;
    const icon = btn.querySelector('yt-icon');
    if (!icon) return;
    const iconMap = Object.values(window._yttv).find(a => a instanceof Map && a.has('CHECK_BOX'));
    if (!iconMap) return;
    const checkedClass = iconMap.get('CHECK_BOX');
    const uncheckedClass = iconMap.get('CHECK_BOX_OUTLINE_BLANK');
    if (!checkedClass || !uncheckedClass) return;
    icon.classList.remove(visible ? uncheckedClass : checkedClass);
    icon.classList.add(visible ? checkedClass : uncheckedClass);
}

function createAuthorBadgeNode(badgeInfo, authorPhotoUrl) {
    if (authorPhotoUrl) {
        const img = document.createElement('img');
        img.className = 'tt-live-chat-author-photo';
        img.src = authorPhotoUrl;
        img.alt = '';
        return img;
    }

    const color = '#' + (badgeInfo?.color || 'aaaaaa');

    const dot = document.createElement('span');
    dot.className = 'tt-live-chat-badge-dot';
    dot.style.backgroundColor = color;
    return dot;
}

export function appendMessage(authorName, messageText, badgeInfo, messageParts, authorPhotoUrl) {
    const overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) return;

    const row = document.createElement('div');
    row.className = 'tt-live-chat-row';

    // Header line: avatar + bold username
    const header = document.createElement('div');
    header.className = 'tt-live-chat-header';

    const badge = createAuthorBadgeNode(badgeInfo, authorPhotoUrl);
    if (badge) header.appendChild(badge);

    const authorSpan = document.createElement('span');
    authorSpan.className = 'tt-live-chat-author';
    const authorColor = badgeInfo?.color || 'aaaaaa';
    authorSpan.style.color = '#' + authorColor;
    authorSpan.textContent = authorName;
    header.appendChild(authorSpan);

    // Message body
    const messageDiv = document.createElement('div');
    messageDiv.className = 'tt-live-chat-message';

    if (Array.isArray(messageParts) && messageParts.length) {
        for (const part of messageParts) {
            if (!part) continue;
            if (part.type === 'emoji' && part.url) {
                const img = document.createElement('img');
                img.className = 'tt-live-chat-emoji';
                img.src = part.url;
                img.alt = part.text || '';
                messageDiv.appendChild(img);
            } else {
                messageDiv.appendChild(document.createTextNode(part.text || ''));
            }
        }
    } else {
        messageDiv.textContent = messageText;
    }

    row.appendChild(header);
    row.appendChild(messageDiv);

    overlay.appendChild(row);
    // Scroll to bottom so messages push up as whole units
    overlay.scrollTop = overlay.scrollHeight;
    while (overlay.children.length > MAX_MESSAGES) overlay.removeChild(overlay.firstChild);

    setTimeout(() => {
        row.classList.add('tt-live-chat-row-hidden');
        setTimeout(() => row.remove(), 1000);
    }, FADE_AFTER_MS);
}

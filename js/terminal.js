/**
 * Linux the Game — jQuery Terminal
 * Эмуляция Linux-терминала с CRT-стилистикой
 */
$(function() {
    // Wait for CommandRegistry to be ready (async loading in index.js)
    function initWhenReady() {
        if (typeof window.CommandRegistry !== 'undefined') {
            initTerminal();
        } else {
            setTimeout(initWhenReady, 50);
        }
    }

    function initTerminal() {
    const terminal = $('#terminal');
    const prompt = $('#prompt');
    const input = $('#input');
    const cursor = $('#cursor');
    const mirror = $('#mirror');
    const output = $('#output');
    let history = [];
    let historyIndex = 0;
    let lastOutput = '';
    let pendingOutput = [];
    // Загрузка истории из localStorage
    (function() {
        const cached = localStorage.getItem('history');
        if (cached) {
            try {
                history = JSON.parse(cached);
                historyIndex = history.length;
            } catch(e) {
                history = [];
                historyIndex = 0;
            }
        }
    })();
    let commandsCache = [];
    let manCache = {};
    let suggestionsVisible = false;
    let suggestionIndex = -1;
    let currentLang = localStorage.getItem('lang') || 'ru';
    let currentPath = '/home/user';
    let currentUser = 'user';
    let currentHost = 'linux-game';
    let fs = {};
    let defaultFs = null;
    let currentUserData = null;
    let authState = 'idle';
    let authLogin = '';
    let authEmail = '';
    let authPass1 = '';
    let authPass2 = '';
    // Позиционирование курсора через зеркальный span
    function updateCursorPosition() {
        const val = input.val();
        const selStart = input[0].selectionStart || val.length;
        mirror.text(val.substring(0, selStart));
        requestAnimationFrame(function() {
            const mirrorWidth = mirror[0].offsetWidth;
            cursor.css('left', mirrorWidth + 'px');
        });
    }
    // ========== Виртуальная файловая система ==========
    (function() {
        const cached = localStorage.getItem('fs_state');
        if (cached) {
            try {
                fs = JSON.parse(cached);
            } catch(e) {
                fs = {};
            }
        }
        if (!fs['/']) {
            $.ajax({
                url: '/api/fs.php',
                dataType: 'json',
                async: false,
                success: function(data) {
                    fs = data;
                    localStorage.setItem('fs_state', JSON.stringify(fs));
                }
            });
        }
    })();
    (function() {
        $.ajax({
            url: '/api/fs.php?action=default',
            dataType: 'json',
            async: false,
            success: function(data) {
                defaultFs = data;
            }
        });
    })();
    function loadUserFilesystem(userId) {
        $.ajax({
            url: '/api/auth.php?action=get_fs',
            data: { user_id: userId },
            dataType: 'json',
            async: false,
            success: function(data) {
                if (data && !data.status) {
                    fs = data;
                    localStorage.setItem('fs_state', JSON.stringify(fs));
                }
            },
            error: function() {
                fs = JSON.parse(JSON.stringify(defaultFs));
            }
        });
    }
    function saveFS() {
        localStorage.setItem('fs_state', JSON.stringify(fs));
        if (currentUserData) {
            $.ajax({
                url: '/api/auth.php?action=save_fs',
                type: 'POST',
                data: { user_id: currentUserData.id },
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify({ fs: fs }),
                success: function() {},
                error: function() {}
            });
        }
    }
    function resetFS() {
        if (defaultFs) {
            fs = JSON.parse(JSON.stringify(defaultFs));
            localStorage.setItem('fs_state', JSON.stringify(fs));
            if (currentUserData) {
                $.ajax({
                    url: '/api/auth.php?action=save_fs',
                    type: 'POST',
                    data: { user_id: currentUserData.id },
                    contentType: 'application/json',
                    dataType: 'json',
                    data: JSON.stringify({ fs: fs }),
                    success: function() {},
                    error: function() {}
                });
            }
            return true;
        }
        return false;
    }
    function resolvePath(path) {
        if (!fs['/']) return null;
        if (!path) return null;
        path = String(path).trim();
        if (path === '/') return fs['/'];
        // Expand ~ to current user's home
        if (path === '~' || path === '~/') path = '/home/' + currentUser;
        if (path.startsWith('~/')) path = '/home/' + currentUser + '/' + path.slice(2);
        if (!path.startsWith('/')) path = currentPath + '/' + path;
        // Убрать trailing slash
        path = path.replace(/\/+$/, '');
        if (!path) return fs['/'];
        // Normalize .. and . in path segments
        var segs = path.split('/');
        var resolved = [];
        for (var i = 0; i < segs.length; i++) {
            if (segs[i] === '..') {
                if (resolved.length > 0) resolved.pop();
            } else if (segs[i] !== '' && segs[i] !== '.') {
                resolved.push(segs[i]);
            }
        }
        path = '/' + resolved.join('/');
        if (path === '') return fs['/'];
        var parts = path.split('/').filter(Boolean);
        var current = fs['/'];
        for (var p of parts) {
            if (!current || current.type !== 'dir' || !current.children[p]) return null;
            current = current.children[p];
        }
        return current;
    }
    function resolveParentPath(path) {
        let resolvedPath = path;
        if (!path.startsWith('/')) {
            resolvedPath = currentPath + '/' + path;
        }
        const parts = resolvedPath.split('/').filter(Boolean);
        const filename = parts.pop();
        const parentPath = '/' + parts.join('/') || '/';
        return { parent: resolvePath(parentPath), filename, parentPath };
    }
    function escapeHtml(str) {
        return $('<span>').text(str).html();
    }
    // ========== Словари переводов ==========
    const i18n = {
        ru: {
            welcome: '~ Добро пожаловать в Linux the Game ~',
            helpHint: 'Введите help для списка команд или man <команда>',
            noCommands: 'Список команд ещё не загружен. Подождите...',
            commandsTitle: '=== Доступные команды (',
            commandsCount: ' шт.) ===',
            manHint: 'Используйте: man <команда> для справки',
            unknownCmd: 'команда не найдена',
            helpAvailable: 'Введите help для списка доступных команд.',
            exitMsg: 'Выход невозможен — это симулятор. Нажмите F5 чтобы перезагрузить.',
            manNotFound: 'Нет справочной страницы для',
            manError: 'Ошибка загрузки man-страницы',
            loadError: 'Ошибка загрузки списка команд',
            exitHint: 'Выход невозможен — это симулятор.',
            gameinfoTitle: '═══ Linux the Game — Информация ═══',
            welcomeUser: 'Добро пожаловать'
        },
        en: {
            welcome: '~ Welcome to Linux the Game ~',
            helpHint: 'Type help for command list or man <command>',
            noCommands: 'Command list not loaded yet. Please wait...',
            commandsTitle: '=== Available Commands (',
            commandsCount: ') ===',
            manHint: 'Use: man <command> for help',
            unknownCmd: 'command not found',
            helpAvailable: 'Type help for available commands.',
            exitMsg: 'Exit not possible — this is a simulator. Press F5 to reload.',
            manNotFound: 'No manual page for',
            manError: 'Error loading man page',
            loadError: 'Error loading command list',
            exitHint: 'Exit not possible — this is a simulator.',
            gameinfoTitle: '═══ Linux the Game — Info ═══',
            welcomeUser: 'Welcome'
        }
    };
    function setLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('lang', lang);
        $('#btn-ru, #btn-en').removeClass('active');
        $('#btn-' + lang).addClass('active');
        $('html').attr('lang', lang === 'ru' ? 'ru' : 'en');
    }
    function loadCommands() {
        commandsCache = [];
        $.getJSON('/api/commands.php?lang=' + currentLang, function(data) {
            const seen = new Set();
            commandsCache = data.filter(function(cmd) {
                if (seen.has(cmd.name)) return false;
                seen.add(cmd.name);
                return true;
            });
        }).fail(function() {
            appendOutput('<span class="error">' + i18n[currentLang].loadError + '</span>');
        });
    }
    function showGameInfo() {
        const overlay = $('#gameinfo-overlay');
        const text = $('#gameinfo-text');
        const lang = currentLang;
        let info = '';
        if (lang === 'ru') {
            info = [
                'Linux the Game v1.0',
                '------------------------',
                'Браузерный симулятор терминала Linux',
                '',
                'Возможности:',
                '  • 100+ команд Linux',
                '  • Справочные страницы (man)',
                '  • Автодополнение (Tab)',
                '  • Двуязычный интерфейс (RU/EN)',
                '  • История команд (↑↓)',
                '',
                'Команды для начала:',
                '  help     — список команд',
                '  man      — справочная страница',
                '  clear    — очистить экран',
                '  gameinfo — информация об игре'
            ].join('\n');
        } else {
            info = [
                'Linux the Game v1.0',
                '------------------------',
                'Browser-based Linux terminal simulator',
                '',
                'Features:',
                '  • 100+ Linux commands',
                '  • Manual pages (man)',
                '  • Autocomplete (Tab)',
                '  • Bilingual interface (RU/EN)',
                '  • Command history (↑↓)',
                '',
                'Getting started:',
                '  help     — list commands',
                '  man      — manual page',
                '  clear    — clear screen',
                '  gameinfo — game information'
            ].join('\n');
        }
        text.text(info);
        overlay.addClass('active');
        input.blur();
    }
    function hideGameInfo() {
        $('#gameinfo-overlay').removeClass('active');
        input.focus();
    }
    $(document).on('keydown', function(e) {
        if (e.key === 'Escape') {
            hideGameInfo();
        }
    });
    function renderManFromCache(cmdName) {
        const key = cmdName + '_' + currentLang;
        if (manCache[key]) {
            appendOutput('<pre class="manpage">' + manCache[key] + '</pre>');
            if (history.length > 0) {
                history[history.length - 1].output = pendingOutput.slice();
                localStorage.setItem('history', JSON.stringify(history));
            }
            return true;
        }
        return false;
    }
    function rerenderOutput(lang) {
        const gameinfoOpen = $('#gameinfo-overlay').hasClass('active');
        output.empty();
        const welcomeLine = $('<div class="line"></div>');
        welcomeLine.append('<span class="info">~ ' + i18n[lang].welcome + ' ~</span>');
        output.append(welcomeLine);
        const hintLine = $('<div class="line"></div>');
        hintLine.append('<span class="info">' + i18n[lang].helpHint + '</span>');
        output.append(hintLine);
        history.forEach(function(entry) {
            const entryOutput = entry.output;
            if (entryOutput && entryOutput.length > 0) {
                entryOutput.forEach(function(line) {
                    const lineDiv = $('<div class="line"></div>');
                    lineDiv.append(line);
                    output.append(lineDiv);
                });
            } else {
                const cmdLine = $('<div class="line"></div>');
                cmdLine.append('<span class="prompt">$ </span>' + escapeHtml(entry.command));
                output.append(cmdLine);
            }
        });
        if (gameinfoOpen) showGameInfo();
    }
    function updateGameInfoHeaderFooter(lang) {
        if ($('#gameinfo-overlay').hasClass('active')) {
            if (lang === 'ru') {
                $('#gameinfo-header').text('Linux the Game — Информация');
                $('#gameinfo-footer').text('[ESC] — закрыть');
            } else {
                $('#gameinfo-header').text('Linux the Game — Info');
                $('#gameinfo-footer').text('[ESC] — close');
            }
        }
    }
    $('#btn-ru, #btn-en').on('click', function() {
        const lang = $(this).data('lang');
        setLanguage(lang);
        commandsCache = [];
        $.getJSON('/api/commands.php?lang=' + lang, function(data) {
            commandsCache = data;
            rerenderOutput(lang);
            updateGameInfoHeaderFooter(lang);
        }).fail(function() {
            appendOutput('<span class="error">' + i18n[lang].loadError + '</span>');
        });
    });
    setLanguage(currentLang);
    terminal.on('click', function() {
        input.focus();
    });
    input.focus();
    updateCursorPosition();
    loadCommands();
    function clearTerminal() {
        output.empty();
        history = [];
        localStorage.removeItem('history');
        const welcomeLine = $('<div class="line"></div>');
        welcomeLine.append('<span class="info">~ ' + i18n[currentLang].welcome + ' ~</span>');
        output.append(welcomeLine);
        const hintLine = $('<div class="line"></div>');
        hintLine.append('<span class="info">' + i18n[currentLang].helpHint + '</span>');
        output.append(hintLine);
    }
    function updatePrompt() {
        var displayPath = currentPath === '/home/' + currentUser ? '~' : currentPath;
        if (currentUser === 'user') {
            prompt.text('$');
        } else {
            prompt.text(currentUser + '@' + currentHost + ':' + displayPath + '$');
        }
    }

    function appendOutput(text) {
        const line = $('<div class="line"></div>');
        line.append(text);
        output.append(line);
        terminal.scrollTop(terminal[0].scrollHeight);
        pendingOutput.push(line.html());
    }
    // Выполнение команды
    function executeCommand(cmd) {
        const trimmed = cmd.trim();
        if (!trimmed) return;

        // Create context for commands
        var ctx = {
            _cmd: trimmed,
            appendOutput: appendOutput,
            saveToHistory: saveToHistory,
            escapeHtml: escapeHtml,
            resolvePath: resolvePath,
            resolveParentPath: resolveParentPath,
            saveFS: saveFS,
            clearTerminal: clearTerminal,
            findPathForDir: findPathForDir,
            resetFS: resetFS,
            showGameInfo: showGameInfo,
            showHelp: showHelp,
            renderManFromCache: renderManFromCache,
            fetchMan: fetchMan,
            loadUserFilesystem: loadUserFilesystem,
            setCurrentPath: function(p) {
                var normalized = (p || '').replace(/^\/+|\/+$/g, '');
                currentPath = normalized === '' ? '/' : '/' + normalized;
            },
            setCurrentUser: function(u) { currentUser = u; },
            setCurrentHost: function(h) { currentHost = h; },
            i18n: i18n,
            setFs: function(f) { fs = f; },
            setUserData: function(d) { currentUserData = d; },
            getAuthState: function() { return authState; },
            setAuthState: function(s) { authState = s; },
            getAuthLogin: function() { return authLogin; },
            setAuthLogin: function(v) { authLogin = v; },
            getAuthEmail: function() { return authEmail; },
            setAuthEmail: function(v) { authEmail = v; },
            getAuthPass1: function() { return authPass1; },
            setAuthPass1: function(v) { authPass1 = v; },
            getAuthPass2: function() { return authPass2; },
            setAuthPass2: function(v) { authPass2 = v; },
            updatePrompt: updatePrompt,
            _registerUser: function(login, email, pass1, pass2) {
                if (typeof window.CmdUseradd !== 'undefined' && typeof window.CmdUseradd._registerUser === 'function') {
                    window.CmdUseradd._registerUser(ctx, login, email, pass1, pass2);
                }
            }
        };
        // Live property getters — not snapshots
        Object.defineProperty(ctx, 'currentPath', { get: function() { return currentPath; }, enumerable: true });
        Object.defineProperty(ctx, 'currentUser', { get: function() { return currentUser; }, enumerable: true });
        Object.defineProperty(ctx, 'currentHost', { get: function() { return currentHost; }, enumerable: true });
        Object.defineProperty(ctx, 'currentLang', { get: function() { return currentLang; }, enumerable: true });
        Object.defineProperty(ctx, 'fs', { get: function() { return fs; }, enumerable: true });
        Object.defineProperty(ctx, 'defaultFs', { get: function() { return defaultFs; }, enumerable: true });
        Object.defineProperty(ctx, 'currentUserData', { get: function() { return currentUserData; }, set: function(d) { currentUserData = d; }, enumerable: true });
        Object.defineProperty(ctx, 'history', { get: function() { return history; }, enumerable: true });

        // Handle useradd/adduser state machine
        var useraddHandler = (window.CmdUseradd && window.CmdUseradd.handleState) || (window.CmdAdduser && window.CmdAdduser.handleState);
        if (useraddHandler && (authState === 'register_email' || authState === 'register_pass1' || authState === 'register_pass2' || authState === 'register_wait')) {
            useraddHandler(ctx);
            return;
        }

        // Handle login state machine
        if (authState === 'waiting_for_username' || authState === 'waiting_for_password') {
            if (typeof window.CmdLogin !== 'undefined' && typeof window.CmdLogin.execute === 'function') {
                window.CmdLogin.execute(ctx);
                return;
            }
        }

        // Clear pending output before command execution
        pendingOutput = [];
        // Add command to output
        appendOutput('<span class="prompt">$ </span>' + escapeHtml(trimmed));

        // Execute command through registry
        var cmdName = trimmed.split(' ')[0].toLowerCase();
        if (CommandRegistry[cmdName]) {
            CommandRegistry[cmdName].execute(ctx);
            return;
        } else {
            appendOutput('<span class="error">bash: ' + escapeHtml(cmdName) + ': ' + i18n[currentLang].unknownCmd + '</span>');
            appendOutput('<span class="info">' + i18n[currentLang].helpAvailable + '</span>');
        }
    }
    // Сохранить команду в историю
    function saveToHistory(cmd) {
        if (!cmd) return;
        const trimmed = cmd.trim();
        if (!trimmed) return;
        history.push({ command: trimmed, output: pendingOutput.slice() });
        pendingOutput = [];
        localStorage.setItem('history', JSON.stringify(history));
    }
    function addToHistory(cmd) {
        const trimmed = cmd.trim();
        if (!trimmed) return;
        history.push({ command: trimmed, output: [] });
        localStorage.setItem('history', JSON.stringify(history));
        saveToHistory(trimmed);
    }
    function findPathForDir(dirObj) {
        function findInDir(obj, target, currentPath) {
            if (obj === target) return currentPath;
            if (obj.type === 'dir' && obj.children) {
                for (const name of Object.keys(obj.children)) {
                    const childPath = currentPath ? currentPath + '/' + name : '/' + name;
                    const result = findInDir(obj.children[name], target, childPath);
                    if (result) return result;
                }
            }
            return null;
        }
        return findInDir(fs['/'], dirObj, '/') || currentPath;
    }
    function showHelp() {
        if (commandsCache.length === 0) {
            appendOutput('<span class="warn">' + i18n[currentLang].noCommands + '</span>');
            return;
        }
        let html = '<span class="info">' + i18n[currentLang].commandsTitle + commandsCache.length + i18n[currentLang].commandsCount + '</span><br>';
        const cols = 4;
        const perCol = Math.ceil(commandsCache.length / cols);
        html += '<div style="display:flex;flex-wrap:wrap">';
        for (let row = 0; row < perCol; row++) {
            html += '<div style="flex:25%;min-width:180px">';
            for (let col = 0; col < cols; col++) {
                const idx = col * perCol + row;
                if (idx < commandsCache.length) {
                    const c = commandsCache[idx];
                    html += '<span class="cmd-name">' + escapeHtml(c.name) + '</span>';
                    if (row < perCol - 1 || idx + perCol >= commandsCache.length) {
                        html += '<br>';
                    }
                }
            }
            html += '</div>';
        }
        html += '</div>';
        html += '<span class="info">' + i18n[currentLang].manHint + '</span>';
        appendOutput(html);
    }
    function fetchMan(cmdName) {
        const key = cmdName + '_' + currentLang;
        const encoded = encodeURIComponent(cmdName);
        if (manCache[key]) {
            appendOutput('<pre class="manpage">' + manCache[key] + '</pre>');
            return;
        }
        $.getJSON('/api/man.php?cmd=' + encoded + '&lang=' + currentLang, function(data) {
            if (data.error === 'NOTFOUND') {
                appendOutput('<span class="error">' + i18n[currentLang].manNotFound + ' ' + escapeHtml(cmdName) + '</span>');
            } else if (data.content) {
                const html = data.content
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/\n/g, '<br>');
                manCache[key] = html;
                appendOutput('<pre class="manpage">' + html + '</pre>');
            }
            if (history.length > 0) {
                history[history.length - 1].output = pendingOutput.slice();
                localStorage.setItem('history', JSON.stringify(history));
            }
        }).fail(function() {
            appendOutput('<span class="error">' + i18n[currentLang].manError + '</span>');
            if (history.length > 0) {
                history[history.length - 1].output = pendingOutput.slice();
                localStorage.setItem('history', JSON.stringify(history));
            }
        });
    }
    function hideSuggestions() {
        suggestionsVisible = false;
        suggestionIndex = -1;
    }
    var currentSuggestions = [];
    function showSuggestions(matches) {
        currentSuggestions = matches;
        suggestionsVisible = matches.length > 0;
        suggestionIndex = -1;
    }
    function getFSMatches(prefix) {
        if (prefix.includes('/')) {
            const slashIdx = prefix.lastIndexOf('/');
            const dirPart = prefix.substring(0, slashIdx);
            const searchPrefix = prefix.substring(slashIdx + 1);
            // Empty dirPart means root
            const dir = dirPart === '' ? resolvePath('/') : resolvePath(dirPart);
            if (!dir || dir.type !== 'dir') return [];
            const matches = [];
            for (const name of Object.keys(dir.children || {})) {
                if (name.startsWith(searchPrefix)) {
                    const item = dir.children[name];
                    const suffix = item.type === 'dir' ? '/' : '';
                    matches.push({ name: name + suffix, isDir: item.type === 'dir' });
                }
            }
            return matches;
        }
        const dir = resolvePath(currentPath);
        if (!dir || dir.type !== 'dir') return [];
        const matches = [];
        const children = dir.children || {};
        for (const name of Object.keys(children)) {
            if (name.startsWith(prefix)) {
                const item = children[name];
                const suffix = item.type === 'dir' ? '/' : '';
                matches.push({ name: name + suffix, isDir: item.type === 'dir' });
            }
        }
        return matches;
    }
    const pathAutocompleteCommands = new Set([
        'ls', 'cat', 'echo', 'rm', 'cp', 'mv', 'touch', 'mkdir', 'rmdir',
        'cd', 'head', 'tail', 'grep', 'find', 'chmod', 'chown', 'chgrp',
        'less', 'more', 'sort', 'uniq', 'cut', 'diff', 'comm', 'tee',
        'wc', 'sed', 'awk', 'xargs', 'rsync', 'scp', 'ssh', 'ping',
        'curl', 'wget', 'tar', 'zip', 'unzip', 'ln', 'du', 'stat',
        'file', 'basename', 'dirname', 'readlink'
    ]);
    function autoCompletePath(inputVal) {
        const trimmed = inputVal.replace(/\s+$/, '');
        const parts = trimmed.split(/\s+/);
        if (parts.length < 2) return null;
        const cmdName = parts[0].toLowerCase();
        if (!pathAutocompleteCommands.has(cmdName)) return null;
        let lastArg = parts[parts.length - 1];
        let prefix = '';
        let searchPath = currentPath;
        if (lastArg.startsWith('/')) {
            const slashIdx = lastArg.lastIndexOf('/');
            if (slashIdx === 0) {
                prefix = lastArg.substring(1);
                searchPath = '/';
            } else if (slashIdx > 0) {
                const dirPart = lastArg.substring(0, slashIdx);
                prefix = lastArg.substring(slashIdx + 1);
                searchPath = dirPart;
            } else {
                prefix = lastArg;
            }
        } else if (lastArg.startsWith('~/')) {
            const slashIdx = lastArg.lastIndexOf('/');
            if (slashIdx > 0) {
                const dirPart = lastArg.substring(0, slashIdx);
                prefix = lastArg.substring(slashIdx + 1);
                searchPath = '/home/' + currentUser + '/' + dirPart.slice(2);
            } else {
                prefix = lastArg.slice(2);
                searchPath = '/home/' + currentUser;
            }
        } else {
            const slashIdx = lastArg.lastIndexOf('/');
            if (slashIdx >= 0) {
                prefix = lastArg.substring(slashIdx + 1);
                const dirPart = lastArg.substring(0, slashIdx);
                const dir = resolvePath(dirPart);
                if (dir && dir.type === 'dir') {
                    searchPath = dirPart;
                } else {
                    return null;
                }
            } else {
                prefix = lastArg;
            }
        }
        const searchPrefix = (searchPath.endsWith('/') ? searchPath.slice(0, -1) : searchPath) + '/' + prefix;
        const matches = getFSMatches(searchPrefix);
        if (matches.length === 1) {
            const lastSlashIdx = lastArg.lastIndexOf('/');
            const completedName = matches[0].name;
            if (lastSlashIdx >= 0) {
                parts[parts.length - 1] = lastArg.substring(0, lastSlashIdx + 1) + completedName;
            } else {
                parts[parts.length - 1] = completedName;
            }
            const result = parts.join(' ');
            return result;
        }
        return null;
    }
    function submitCommand(cmd) {
        hideSuggestions();
        input.val('');
        updateCursorPosition();
        executeCommand(cmd);
    }
    input.on('input', function() {
        updateCursorPosition();
    });
    input.on('keydown', function(e) {
        const val = input.val();
        if (e.key === 'Enter') {
            e.preventDefault();
            hideSuggestions();
            executeCommand(val);
            input.val('');
            updateCursorPosition();
            return;
        }
        if (e.key === 'Tab') {
            e.preventDefault();
            if (suggestionsVisible && currentSuggestions.length > 0) {
                suggestionIndex = (suggestionIndex + 1) % currentSuggestions.length;
                const selected = currentSuggestions[suggestionIndex];
                if (selected) {
                    input.val(selected.name + ' ');
                    updateCursorPosition();
                }
            } else {
                const trimmed = val.replace(/\s+$/, '');
                const pathResult = autoCompletePath(trimmed);
                if (pathResult !== null) {
                    input.val(pathResult);
                    updateCursorPosition();
                } else if (trimmed.length > 0) {
                    const matches = commandsCache.filter(function(c) {
                        return c.name.toLowerCase().indexOf(trimmed) === 0;
                    });
                    if (matches.length > 0) {
                        if (matches.length === 1) {
                            const autoComplete = matches[0].name + ' ';
                            input.val(autoComplete);
                            updateCursorPosition();
                        } else {
                            let matchNames = matches.map(m => m.name).join('  ');
                            appendOutput('<span class="info">' + matchNames + '</span>');
                            showSuggestions(matches);
                        }
                    } else {
                        hideSuggestions();
                    }
                }
            }
            return;
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (history.length > 0) {
                historyIndex = Math.max(0, historyIndex - 1);
                const entry = history[historyIndex];
                const cmd = entry.command || '';
                input.val(cmd);
                updateCursorPosition();
            }
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (history.length > 0) {
                historyIndex = Math.min(history.length, historyIndex + 1);
                if (historyIndex >= history.length) {
                    input.val('');
                    updateCursorPosition();
                } else {
                    const entry = history[historyIndex];
                    const cmd = entry.command || '';
                    input.val(cmd);
                    updateCursorPosition();
                }
            }
            return;
        }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            updateCursorPosition();
            return;
        }
        if (e.key === 'Escape') {
            hideSuggestions();
            return;
        }
    });
    clearTerminal();
    }

    initWhenReady();
});

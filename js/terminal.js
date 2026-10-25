/**
 * Linux the Game — jQuery Terminal
 * Эмуляция Linux-терминала с CRT-стилистикой
 */
$(function() {
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
    let currentPath = '/home/user'; // Текущая директория пользователя (абсолютный путь от /)
    let currentUser = 'user';
    let currentHost = 'linux-game';
    let fs = {};
    let defaultFs = null; // Эталонная ФС с сервера
    // Позиционирование курсора через зеркальный span
    function updateCursorPosition() {
        const val = input.val();
        const selStart = input[0].selectionStart || val.length;
        mirror.text(val.substring(0, selStart));
        // requestAnimationFrame — курсор позиционируется после рендеринга
        requestAnimationFrame(function() {
            const mirrorWidth = mirror[0].offsetWidth;
            cursor.css('left', mirrorWidth + 'px');
        });
    }
    // ========== Виртуальная файловая система ==========
    // Загрузка рабочей ФС из localStorage или сервера
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
            // Загружаем с сервера синхронно
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
    // Загрузка эталонной ФС с сервера (отдельно от рабочей)
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
    // Сохранение рабочей ФС в localStorage
    function saveFS() {
        localStorage.setItem('fs_state', JSON.stringify(fs));
    }
    // Восстановление рабочей ФС из эталонной на сервере
    function resetFS() {
        if (defaultFs) {
            fs = JSON.parse(JSON.stringify(defaultFs));
            localStorage.setItem('fs_state', JSON.stringify(fs));
            return true;
        }
        return false;
    }
    function resolvePath(path) {
        if (!fs['/']) return null;
        if (path === '/') return fs['/'];
        if (path === '.') return fs[currentPath] || fs['/'];
        if (path === '..') {
            const parts = currentPath.split('/').filter(Boolean);
            parts.pop();
            const parentPath = '/' + parts.join('/') || '/';
            return fs[parentPath] || fs['/'];
        }
        if (path.startsWith('~/')) path = '/home/user/' + path.slice(2);
        if (!path.startsWith('/')) path = currentPath + '/' + path;
        const parts = path.split('/').filter(Boolean);
        let current = fs['/'];
        for (const part of parts) {
            if (!current || current.type !== 'dir' || !current.children[part]) return null;
            current = current.children[part];
        }
        return current;
    }
    function resolveParentPath(path) {
        // If relative path, resolve from currentPath first
        let resolvedPath = path;
        if (!path.startsWith('/')) {
            resolvedPath = currentPath + '/' + path;
        }
        const parts = resolvedPath.split('/').filter(Boolean);
        const filename = parts.pop();
        const parentPath = '/' + parts.join('/') || '/';
        return { parent: resolvePath(parentPath), filename, parentPath };
    }
    // Экранирование HTML для предотвращения XSS
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
            gameinfoTitle: '═══ Linux the Game — Информация ═══'
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
            gameinfoTitle: '═══ Linux the Game — Info ═══'
        }
    };
    // ========== Переключатель языка ==========
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
            // Deduplicate by command name
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
    // Показать окно gameinfo
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
    // Скрыть окно gameinfo
    function hideGameInfo() {
        $('#gameinfo-overlay').removeClass('active');
        input.focus();
    }
    // Обработчик ESC для закрытия gameinfo
    $(document).on('keydown', function(e) {
        if (e.key === 'Escape') {
            hideGameInfo();
        }
    });
    // Перерисовать man-страницу из кэша
    function renderManFromCache(cmdName) {
        const key = cmdName + '_' + currentLang;
        if (manCache[key]) {
            appendOutput('<pre class="manpage">' + manCache[key] + '</pre>');
            // Добавляем вывод к последней записи в истории (команда man)
            if (history.length > 0) {
                history[history.length - 1].output = pendingOutput.slice();
                localStorage.setItem('history', JSON.stringify(history));
            }
            return true;
        }
        return false;
    }
    // Перерисовать весь output с переводом
    function rerenderOutput(lang) {
        const gameinfoOpen = $('#gameinfo-overlay').hasClass('active');
        output.empty();
        // Не добавляем в pendingOutput при перерисовке
        const welcomeLine = $('<div class="line"></div>');
        welcomeLine.append('<span class="info">~ ' + i18n[lang].welcome + ' ~</span>');
        output.append(welcomeLine);
        const hintLine = $('<div class="line"></div>');
        hintLine.append('<span class="info">' + i18n[lang].helpHint + '</span>');
        output.append(hintLine);
        history.forEach(function(entry) {
            const entryOutput = entry.output;
            // entry.output уже содержит строку команды с $ — не добавляем повторно
            if (entryOutput && entryOutput.length > 0) {
                entryOutput.forEach(function(line) {
                    const lineDiv = $('<div class="line"></div>');
                    lineDiv.append(line);
                    output.append(lineDiv);
                });
            } else {
                // Пустой output (man) — добавляем строку команды вручную
                const cmdLine = $('<div class="line"></div>');
                cmdLine.append('<span class="prompt">$ </span>' + escapeHtml(entry.command));
                output.append(cmdLine);
            }
        });
        // Обновляем состояние gameinfo если нужно
        if (gameinfoOpen) showGameInfo();
    }
    // Обновить заголовок и футер gameinfo
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
        // Перезагружаем команды для нового языка
        $.getJSON('/api/commands.php?lang=' + lang, function(data) {
            commandsCache = data;
            // Перерисовываем весь output на новом языке
            rerenderOutput(lang);
            updateGameInfoHeaderFooter(lang);
        }).fail(function() {
            appendOutput('<span class="error">' + i18n[lang].loadError + '</span>');
        });
    });
    // Инициализация языка
    setLanguage(currentLang);
    // Фокус на терминал
    terminal.on('click', function() {
        input.focus();
    });
    // Автофокус при загрузке
    input.focus();
    // Инициализация позиции курсора
    updateCursorPosition();
    // Загружаем список команд
    loadCommands();
    // Очистка терминала
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
    // Добавление строки вывода
    function appendOutput(text) {
        const line = $('<div class="line"></div>');
        line.append(text);
        output.append(line);
        terminal.scrollTop(terminal[0].scrollHeight);
        // Сохраняем HTML-строку для истории
        pendingOutput.push(line.html());
    }
    // Выполнение команды
    function executeCommand(cmd) {
        const trimmed = cmd.trim();
        if (!trimmed) return;
        // Очищаем pendingOutput перед выполнением команды
        pendingOutput = [];
        // Добавляем команду в вывод
        appendOutput('<span class="prompt">$ </span>' + escapeHtml(trimmed));
        // Обработка специальных команд
        if (trimmed === 'clear') {
            clearTerminal();
            return;
        }
        if (trimmed === 'help' || trimmed === 'commands') {
            showHelp();
            saveToHistory(trimmed);
            return;
        }
        if (trimmed === 'exit') {
            appendOutput('<span class="warn">' + i18n[currentLang].exitMsg + '</span>');
            saveToHistory(trimmed);
            return;
        }
        // Команда gameinfo
        if (trimmed === 'gameinfo') {
            showGameInfo();
            saveToHistory(trimmed);
            return;
        }
        // Команда backupfs — восстановление эталонной ФС
        if (trimmed === 'backupfs') {
            if (resetFS()) {
                appendOutput('<span class="info">Filesystem restored to backup state.</span>');
            } else {
                appendOutput('<span class="error">backupfs: No backup available.</span>');
            }
            saveToHistory(trimmed);
            return;
        }
        // Команда cd
        const cdMatch = trimmed.match(/^cd(\s+(.*))?$/);
        if (cdMatch) {
            const target = cdMatch[2] || '~';
            const dir = resolvePath(target);
            if (!dir) {
                appendOutput('<span class="error">bash: cd: ' + escapeHtml(target) + ': No such file or directory</span>');
            } else if (dir.type !== 'dir') {
                appendOutput('<span class="error">bash: cd: ' + escapeHtml(target) + ': Not a directory</span>');
            } else {
                // Находим путь для директории и обновляем currentPath
                const newPath = findPathForDir(dir);
                if (newPath) currentPath = newPath;
            }
            saveToHistory(trimmed);
            return;
        }
        // Команда pwd
        if (trimmed === 'pwd') {
            appendOutput(currentPath);
            saveToHistory(trimmed);
            return;
        }
        // Команда ls
        const lsMatch = trimmed.match(/^(ls)(\s+([a-zA-Z-]*))?\s*(.*)?$/);
        if (lsMatch) {
            const target = lsMatch[4] || currentPath;
            const dir = resolvePath(target);
            if (!dir) {
                appendOutput('<span class="error">ls: cannot access ' + escapeHtml(target) + '\': No such file or directory</span>');
                saveToHistory(trimmed);
                return;
            } else if (dir.type !== 'dir') {
                appendOutput(escapeHtml(target));
            } else {
                const items = Object.keys(dir.children).map(name => {
                    const item = dir.children[name];
                    const isDir = item.type === 'dir';
                    const prefix = isDir ? '\x1b[34m' : (name.startsWith('.') ? '\x1b[37m' : '');
                    const suffix = isDir ? '/' : '';
                    return { name: name + suffix, isDir, item };
                });
                const showAll = lsMatch[3] && lsMatch[3].includes('a');
                const longFormat = lsMatch[3] && lsMatch[3].includes('l');
                const filtered = showAll ? items : items.filter(i => !i.name.startsWith('.'));
                if (longFormat) {
                    filtered.forEach(item => {
                        const perm = item.item.permissions;
                        const owner = item.item.owner;
                        const size = item.item.type === 'file' ? (item.item.content || '').length : 4096;
                        const typeChar = item.isDir ? 'd' : '-';
                        const permStr = typeChar + perm.slice(1).replace(/7/g, 'rwx').replace(/6/g, 'rw-').replace(/5/g, 'r-x').replace(/4/g, 'r--').replace(/0/g, '---');
                        appendOutput(permStr + ' ' + owner + ' ' + String(size).padStart(8) + ' ' + escapeHtml(item.name));
                    });
                } else {
                    const line = filtered.map(i => escapeHtml(i.name)).join('  ');
                    appendOutput(line || '');
                }
            }
            saveToHistory(trimmed);
            return;
        }
        // Команда cat
        const catMatch = trimmed.match(/^cat\s+(.+)$/);
        if (catMatch) {
            const args = catMatch[1];
            // Проверяем перенаправление: cat > file или cat >> file
            const redirectMatch = args.match(/^(.+)\s*>>\s*(.+)$/);
            const appendMatch = args.match(/^(.+)\s*>\s*(.+)$/);
            if (redirectMatch) {
                // append: cat >> file
                const content = redirectMatch[1];
                const filename = redirectMatch[2].trim();
                const parent = resolveParentPath(filename);
                if (!parent.parent) {
                    appendOutput('<span class="error">cat: ' + filename + ': No such file or directory</span>');
                } else {
                    const existing = parent.parent.children[parent.filename];
                    if (existing && existing.type === 'dir') {
                        appendOutput('<span class="error">cat: ' + filename + ': Is a directory</span>');
                    } else {
                        parent.parent.children[parent.filename] = {
                            type: 'file',
                            permissions: '644',
                            owner: currentUser,
                            content: (existing ? existing.content : '') + content + '\n'
                        };
                    }
                }
                saveFS();
            } else if (appendMatch) {
                // overwrite: cat > file
                const content = appendMatch[1];
                const filename = appendMatch[2].trim();
                const parent = resolveParentPath(filename);
                if (!parent.parent) {
                    appendOutput('<span class="error">cat: ' + filename + ': No such file or directory</span>');
                } else {
                    const existing = parent.parent.children[parent.filename];
                    if (existing && existing.type === 'dir') {
                        appendOutput('<span class="error">cat: ' + filename + ': Is a directory</span>');
                    } else {
                        parent.parent.children[parent.filename] = {
                            type: 'file',
                            permissions: '644',
                            owner: currentUser,
                            content: content + '\n'
                        };
                    }
                }
                saveFS();
            } else {
                // Обычный cat - вывод содержимого
                const files = args.split(/\s+/);
                for (const file of files) {
                    const f = resolvePath(file);
                    if (!f) {
                        appendOutput('<span class="error">cat: ' + escapeHtml(file) + ': No such file or directory</span>');
                    } else if (f.type === 'dir') {
                        appendOutput('<span class="error">cat: ' + escapeHtml(file) + ': Is a directory</span>');
                    } else {
                        appendOutput(escapeHtml(f.content || ''));
                    }
                }
            }
            saveToHistory(trimmed);
            return;
        }
        // Команда mkdir
        const mkdirMatch = trimmed.match(/^mkdir\s+(-p\s+)?(.+)$/);
        if (mkdirMatch) {
            const createParents = mkdirMatch[1];
            const name = mkdirMatch[2];
            const parent = resolveParentPath(name);
            if (!parent.parent) {
                appendOutput('<span class="error">mkdir: cannot create directory ' + escapeHtml(name) + '\': No such file or directory</span>');
                saveToHistory(trimmed);
                return;
            } else if (parent.parent.children[parent.filename]) {
                appendOutput('<span class="error">mkdir: cannot create directory ' + escapeHtml(name) + '\': File exists</span>');
                saveToHistory(trimmed);
                return;
            } else {
                if (createParents) {
                    const parts = name.split('/').filter(Boolean);
                    let current = parent.parent;
                    for (const part of parts) {
                        if (!current.children[part]) {
                            current.children[part] = { type: 'dir', permissions: '755', owner: currentUser, children: {} };
                        }
                        current = current.children[part];
                    }
                } else {
                    parent.parent.children[parent.filename] = { type: 'dir', permissions: '755', owner: currentUser, children: {} };
                }
            }
            saveFS();
            saveToHistory(trimmed);
            return;
        }
        // Команда touch
        const touchMatch = trimmed.match(/^touch\s+(.+)$/);
        if (touchMatch) {
            const name = touchMatch[1];
            const parent = resolveParentPath(name);
            if (!parent.parent) {
                appendOutput('<span class="error">touch: cannot touch ' + escapeHtml(name) + '\': No such file or directory</span>');
                saveToHistory(trimmed);
                return;
            } else {
                parent.parent.children[parent.filename] = parent.parent.children[parent.filename] || { type: 'file', permissions: '644', owner: currentUser, content: '' };
            }
            saveFS();
            saveToHistory(trimmed);
            return;
        }
        // Команда rm
        const rmMatch = trimmed.match(/^rm\s+(-r\s+)?(.+)$/);
        if (rmMatch) {
            const recursive = rmMatch[1];
            const name = rmMatch[2];
            const target = resolvePath(name);
            if (!target) {
                appendOutput('<span class="error">rm: cannot remove ' + escapeHtml(name) + '\': No such file or directory</span>');
                saveToHistory(trimmed);
                return;
            } else if (target.type === 'dir' && !recursive) {
                appendOutput('<span class="error">rm: cannot remove ' + escapeHtml(name) + '\': Is a directory</span>');
                saveToHistory(trimmed);
                return;
            } else {
                const parent = resolveParentPath(name);
                if (parent.parent) delete parent.parent.children[parent.filename];
            }
            saveFS();
            saveToHistory(trimmed);
            return;
        }
        // Команда cp
        const cpMatch = trimmed.match(/^cp\s+(.+)$/);
        if (cpMatch) {
            const args = cpMatch[1].split(/\s+/);
            if (args.length >= 2) {
                const src = resolvePath(args[0]);
                const dest = resolvePath(args[1]);
                if (!src) {
                    appendOutput('<span class="error">cp: cannot stat ' + escapeHtml(args[0]) + '\': No such file or directory</span>');
                    saveToHistory(trimmed);
                    return;
                } else if (src.type === 'file') {
                    const destParent = resolveParentPath(args[1]);
                    if (!destParent.parent) {
                        appendOutput('<span class="error">cp: cannot create regular file ' + escapeHtml(args[1]) + '\': No such file or directory</span>');
                        saveToHistory(trimmed);
                        return;
                    } else {
                        destParent.parent.children[destParent.filename] = { type: 'file', permissions: '644', owner: currentUser, content: src.content };
                    }
                } else if (src.type === 'dir') {
                    appendOutput('<span class="error">cp: omitting directory ' + escapeHtml(args[0]) + '\'</span>');
                }
            }
            saveFS();
            saveToHistory(trimmed);
            return;
        }
        // Команда mv
        const mvMatch = trimmed.match(/^mv\s+(.+)$/);
        if (mvMatch) {
            const args = mvMatch[1].split(/\s+/);
            if (args.length >= 2) {
                const src = resolvePath(args[0]);
                if (!src) {
                    appendOutput('<span class="error">mv: cannot stat ' + escapeHtml(args[0]) + '\': No such file or directory</span>');
                    saveToHistory(trimmed);
                    return;
                } else {
                    const destParent = resolveParentPath(args[1]);
                    if (!destParent.parent) {
                        appendOutput('<span class="error">mv: cannot move to ' + escapeHtml(args[1]) + '\': No such file or directory</span>');
                        saveToHistory(trimmed);
                        return;
                    } else {
                        destParent.parent.children[destParent.filename] = src;
                        const srcParent = resolveParentPath(args[0]);
                        if (srcParent.parent) delete srcParent.parent.children[srcParent.filename];
                    }
                }
            }
            saveFS();
            saveToHistory(trimmed);
            return;
        }
        // Команда whoami
        if (trimmed === 'whoami') {
            appendOutput(currentUser);
            saveToHistory(trimmed);
            return;
        }
        // Команда hostname
        if (trimmed === 'hostname') {
            appendOutput(currentHost);
            saveToHistory(trimmed);
            return;
        }
        // Команда uname
        if (trimmed === 'uname' || trimmed.startsWith('uname -')) {
            appendOutput('Linux the Game 1.0 virtual x86_64 GNU/Linux');
            saveToHistory(trimmed);
            return;
        }
        // Команда echo
        const echoMatch = trimmed.match(/^echo\s+(.+)$/);
        if (echoMatch) {
            let text = echoMatch[1];
            if (text.startsWith('"') && text.endsWith('"')) text = text.slice(1, -1);
            else if (text.startsWith("'") && text.endsWith("'")) text = text.slice(1, -1);
            // Проверяем перенаправление: > file или >> file
            const redirectMatch = text.match(/^(.+)\s*>>\s*(.+)$/);
            const appendMatch = text.match(/^(.+)\s*>\s*(.+)$/);
            if (redirectMatch) {
                // append: echo "text" >> file
                const content = redirectMatch[1];
                const filename = redirectMatch[2].trim();
                const parent = resolveParentPath(filename);
                if (!parent.parent) {
                    appendOutput('<span class="error">bash: ' + filename + ': No such file or directory</span>');
                } else {
                    const existing = parent.parent.children[parent.filename];
                    if (existing && existing.type === 'dir') {
                        appendOutput('<span class="error">bash: ' + filename + ': Is a directory</span>');
                    } else {
                        parent.parent.children[parent.filename] = {
                            type: 'file',
                            permissions: '644',
                            owner: currentUser,
                            content: (existing ? existing.content : '') + content + '\n'
                        };
                    }
                }
                saveFS();
            } else if (appendMatch) {
                // overwrite: echo "text" > file
                const content = appendMatch[1];
                const filename = appendMatch[2].trim();
                const parent = resolveParentPath(filename);
                if (!parent.parent) {
                    appendOutput('<span class="error">bash: ' + filename + ': No such file or directory</span>');
                } else {
                    const existing = parent.parent.children[parent.filename];
                    if (existing && existing.type === 'dir') {
                        appendOutput('<span class="error">bash: ' + filename + ': Is a directory</span>');
                    } else {
                        parent.parent.children[parent.filename] = {
                            type: 'file',
                            permissions: '644',
                            owner: currentUser,
                            content: content + '\n'
                        };
                    }
                }
                saveFS();
            } else {
                appendOutput(escapeHtml(text));
            }
            saveToHistory(trimmed);
            return;
        }
        // Команда date
        if (trimmed === 'date') {
            appendOutput(new Date().toString());
            saveToHistory(trimmed);
            return;
        }
        // Команда lsblk
        if (trimmed === 'lsblk') {
            appendOutput('NAME   SIZE  TYPE\nvda    10G   disk\n├─vda1  1G   part [boot]\n└─vda2  9G   part');
            saveToHistory(trimmed);
            return;
        }
        // Команда df
        if (trimmed === 'df' || trimmed === 'df -h') {
            appendOutput('Filesystem      Size  Used Avail Use% Mounted on\nvda2           9.0G  2.5G  6.0G  30% /');
            saveToHistory(trimmed);
            return;
        }
        // Команда free
        if (trimmed === 'free' || trimmed === 'free -h') {
            appendOutput('              total    used    free    shared  buff/cache   available\nMem:          2048MB   512MB   1024MB   64MB     512MB       1536MB\nSwap:         512MB    0MB     512MB');
            saveToHistory(trimmed);
            return;
        }
        // Команда ps
        if (trimmed === 'ps' || trimmed === 'ps aux') {
            appendOutput('PID   TTY    TIME    CMD\n1     ?      0:00    /sbin/init\n500     ?      0:01    /usr/lib/systemd/systemd-journald\n800     ?      0:00    /usr/sbin/sshd\n1200    pts/0  0:00    bash\n1500    pts/0  0:00    ps aux');
            saveToHistory(trimmed);
            return;
        }
        // Команда top (однократный вывод)
        if (trimmed === 'top') {
            appendOutput('PID USER      PR  NI  VIRT  RES  SHR S  %CPU %MEM    TIME+ COMMAND\n1200 user      20   0  4500 3200 2100 S   0.0  0.2   0:00.05 bash\n1501 user      20   0  1500 1000  800 R   0.0  0.1   0:00.01 top');
            saveToHistory(trimmed);
            return;
        }
        // Команда man — сохраняем с пустым выводом, fetchMan добавит вывод позже
        let mMatch = trimmed.match(/^man\s+(.+)/);
        if (mMatch) {
            const cmdArg = 'man ' + mMatch[1].trim();
            // Сохраняем команду с пустым выводом
            history.push({ command: cmdArg, output: [] });
            localStorage.setItem('history', JSON.stringify(history));
            if (!renderManFromCache(mMatch[1].trim())) {
                fetchMan(mMatch[1].trim());
            }
            return;
        }
        // Неизвестная команда
        appendOutput('<span class="error">bash: ' + escapeHtml(trimmed.split(' ')[0]) + ': ' + i18n[currentLang].unknownCmd + '</span>');
        appendOutput('<span class="info">' + i18n[currentLang].helpAvailable + '</span>');
    }
    // Сохранить команду в историю
    function saveToHistory(cmd) {
        const trimmed = cmd.trim();
        if (!trimmed) return;
        history.push({ command: trimmed, output: pendingOutput.slice() });
        pendingOutput = [];
        localStorage.setItem('history', JSON.stringify(history));
    }
    // Добавить команду в историю (без вывода)
    function addToHistory(cmd) {
        const trimmed = cmd.trim();
        if (!trimmed) return;
        history.push({ command: trimmed, output: [] });
        localStorage.setItem('history', JSON.stringify(history));
        saveToHistory(trimmed);
    }
    // Показать справку (все команды)
    // Find the path string for a resolved directory object
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
        return findInDir(fs['/'], dirObj, '/') || '/home/user';
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
    // Запрос man-страницы
    function fetchMan(cmdName) {
        const key = cmdName + '_' + currentLang;
        const encoded = encodeURIComponent(cmdName);
        // Если есть в кэше — показываем из кэша
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
            // Добавляем вывод к последней записи в истории (команда man)
            if (history.length > 0) {
                history[history.length - 1].output = pendingOutput.slice();
                localStorage.setItem('history', JSON.stringify(history));
            }
        }).fail(function() {
            appendOutput('<span class="error">' + i18n[currentLang].manError + '</span>');
            // Добавляем вывод к последней записи в истории
            if (history.length > 0) {
                history[history.length - 1].output = pendingOutput.slice();
                localStorage.setItem('history', JSON.stringify(history));
            }
        });
    }
    // Скрыть подсказки
    function hideSuggestions() {
        suggestionsVisible = false;
        suggestionIndex = -1;
    }
    // Показать подсказки (без выпадающего списка)
    function showSuggestions(matches) {
        // Autocomplete without dropdown - only used for single-match auto-complete
    }
    // Получить список файлов/каталогов из директории
    function getFSMatches(prefix) {
        // Если prefix содержит '/' — разбиваем на директорию и префикс
        if (prefix.includes('/')) {
            const slashIdx = prefix.lastIndexOf('/');
            const dirPart = prefix.substring(0, slashIdx);
            const searchPrefix = prefix.substring(slashIdx + 1);
            const dir = resolvePath(dirPart);
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
        // Относительный путь от currentPath
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
    // Команды, для которых работает автодополнение путей из ФС
    const pathAutocompleteCommands = new Set([
        'ls', 'cat', 'echo', 'rm', 'cp', 'mv', 'touch', 'mkdir', 'rmdir',
        'cd', 'head', 'tail', 'grep', 'find', 'chmod', 'chown', 'chgrp',
        'less', 'more', 'sort', 'uniq', 'cut', 'diff', 'comm', 'tee',
        'wc', 'sed', 'awk', 'xargs', 'rsync', 'scp', 'ssh', 'ping',
        'curl', 'wget', 'tar', 'zip', 'unzip', 'ln', 'du', 'stat',
        'file', 'basename', 'dirname', 'readlink'
    ]);
    // Автодополнение пути из файловой системы
    function autoCompletePath(inputVal) {
        // Убираем trailing пробелы для корректного парсинга
        const trimmed = inputVal.replace(/\s+$/, '');
        const parts = trimmed.split(/\s+/);
        if (parts.length < 2) return null;
        // Проверяем, что команда поддерживает автодополнение путей
        const cmdName = parts[0].toLowerCase();
        if (!pathAutocompleteCommands.has(cmdName)) return null;
        // Берём последний аргумент — это путь
        let lastArg = parts[parts.length - 1];
        let prefix = '';
        let searchPath = currentPath;
        // Проверяем, абсолютный ли путь
        if (lastArg.startsWith('/')) {
            const slashIdx = lastArg.lastIndexOf('/');
            if (slashIdx === 0) {
                // Путь вида /ho — префикс это всё после первого /
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
                searchPath = '/home/user/' + dirPart.slice(2);
            } else {
                prefix = lastArg.slice(2);
                searchPath = '/home/user';
            }
        } else {
            // Относительный путь
            const slashIdx = lastArg.lastIndexOf('/');
            if (slashIdx >= 0) {
                const dirPart = lastArg.substring(0, slashIdx + 1);
                prefix = lastArg.substring(slashIdx + 1);
                // Проверяем, существует ли путь как абсолютный (без ведущего /)
                const absPath = '/' + lastArg.substring(0, slashIdx);
                const absDir = resolvePath(absPath);
                if (absDir && absDir.type === 'dir') {
                    searchPath = absPath;
                } else {
                    // Пробуем как относительный от currentPath
                    const relPath = currentPath + '/' + dirPart;
                    const relDir = resolvePath(relPath);
                    if (relDir && relDir.type === 'dir') {
                        searchPath = relPath;
                    }
                    // Если ни один не найден — оставляем currentPath и ищем по prefix
                }
            } else {
                prefix = lastArg;
            }
        }
        // Ищем совпадения в ФС
        const searchPrefix = (searchPath.endsWith('/') ? searchPath.slice(0, -1) : searchPath) + '/' + prefix;
        const matches = getFSMatches(searchPrefix);
        if (matches.length === 1) {
            // Заменяем только последнюю часть пути (после последнего /)
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
    // Отправить команду
    function submitCommand(cmd) {
        hideSuggestions();
        input.val('');
        updateCursorPosition();
        executeCommand(cmd);
    }
    // Обновление позиции курсора при вводе
    input.on('input', function() {
        updateCursorPosition();
    });
    // Обработка ввода
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
            if (suggestionsVisible) {
                // Выбираем следующую подсказку
                const items = $('.suggestion-item');
                if (items.length > 0) {
                    suggestionIndex = (suggestionIndex + 1) % items.length;
                    items.removeClass('active').eq(suggestionIndex).addClass('active');
                    const selected = commandsCache[suggestionIndex];
                    if (selected) {
                        input.val(selected.name);
                        updateCursorPosition();
                    }
                }
            } else {
                // Убираем trailing пробелы перед обработкой
                const trimmed = val.replace(/\s+$/, '');
                const pathResult = autoCompletePath(trimmed);
                if (pathResult !== null) {
                    input.val(pathResult);
                    updateCursorPosition();
                } else if (trimmed.length > 0) {
                    // Автодополнение команд
                    const matches = commandsCache.filter(function(c) {
                        return c.name.toLowerCase().indexOf(trimmed) === 0;
                    });
                    if (matches.length > 0) {
                        if (matches.length === 1) {
                            const autoComplete = matches[0].name + ' ';
                            input.val(autoComplete);
                            updateCursorPosition();
                        } else {
                            let matchNames = matches.map(m => m.name).join(', ');
                            appendOutput('<span class="info">' + matchNames + '</span>');
                        }
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
    // Скрываем подсказки при клике вне
    // Приветственное сообщение
    clearTerminal();
});
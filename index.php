<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="theme-color" content="#000000">
    <title>Linux the Game</title>
    <link rel="stylesheet" href="css/terminal.css">
</head>
<body>
    <div id="lang-toggle">
        <button id="btn-ru" class="lang-btn active" data-lang="ru">RU</button>
        <span class="lang-sep">/</span>
        <button id="btn-en" class="lang-btn" data-lang="en">EN</button>
    </div>
    <div id="crt-overlay"></div>
    <div id="glitch-slice"></div>
    <div id="terminal">
        <div id="output"></div>
        <div id="input-line">
            <span id="prompt">$</span>
            <span id="input-wrapper">
                <span id="mirror"></span>
                <span id="cursor"></span>
                <input type="text" id="input" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
            </span>
        </div>
    </div>

    <div id="gameinfo-overlay">
        <div id="gameinfo-box">
            <div id="gameinfo-header">Linux the Game — Информация</div>
            <div id="gameinfo-content">
                <pre id="gameinfo-text"></pre>
            </div>
            <div id="gameinfo-footer">[ESC] — закрыть</div>
        </div>
    </div>

    <script src="https://code.jquery.com/jquery-3.7.1.min.js"
            integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo="
            crossorigin="anonymous"></script>
    <script src="js/terminal.js"></script>
</body>
</html>

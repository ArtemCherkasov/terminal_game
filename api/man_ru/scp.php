<?php
$manual = <<<EOT
ИМЯ
    scp — копирование по SSH

СИНТАКСИС
    scp [ОПЦИИ] ИСТОЧНИК НАЗНАЧЕНИЕ

ОПИСАНИЕ
    Безопасное копирование файлов между хостами.
    -r — рекурсивно
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
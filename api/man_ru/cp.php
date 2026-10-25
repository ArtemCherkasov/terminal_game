<?php
$manual = <<<EOT
ИМЯ
    cp — копировать файлы или каталоги

СИНТАКСИС
    cp [ОПЦИИ]... ИСТОЧНИК НАЗНАЧЕНИЕ

ОПИСАНИЕ
    Копирует файлы и каталоги.
    -r — рекурсивно
    -i — запрос подтверждения
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
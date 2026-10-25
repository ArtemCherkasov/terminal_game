<?php
$manual = <<<EOT
ИМЯ
    chown — сменить владельца файла

СИНТАКСИС
    chown [ОПЦИИ]... ВЛАДЕЛЕЦ[:ГРУППА] ФАЙЛ...

ОПИСАНИЕ
    Изменяет владельца файла.
    -R — рекурсивно
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
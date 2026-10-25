<?php
$manual = <<<EOT
ИМЯ
    rm — удалить файлы или каталоги

СИНТАКСИС
    rm [ОПЦИИ]... ФАЙЛ...

ОПИСАНИЕ
    Удаляет файлы.
    -r — рекурсивно
    -f — без подтверждения
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
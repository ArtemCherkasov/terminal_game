<?php
$manual = <<<EOT
ИМЯ
    uniq — удалить повторяющиеся строки

СИНТАКСИС
    uniq [ОПЦИИ]... [ВХОД [ВЫХОД]]

ОПИСАНИЕ
    Удаляет повторяющиеся строки.
    -d — показать только дубликаты
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
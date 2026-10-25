<?php
$manual = <<<EOT
ИМЯ
    less — постраничный просмотр файла

СИНТАКСИС
    less [ФАЙЛ]...

ОПИСАНИЕ
    Позволяет листать файл вперёд и назад.
    q — выход, Space — вперёд, b — назад
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
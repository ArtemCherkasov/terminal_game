<?php
$manual = <<<EOT
ИМЯ
    clear — очистить терминал

СИНТАКСИС
    clear

ОПИСАНИЕ
    Очищает экран терминала.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
<?php
$manual = <<<EOT
ИМЯ
    w — кто вошёл и что делает

СИНТАКСИС
    w [ПОЛЬЗОВАТЕЛЬ]

ОПИСАНИЕ
    Информация о пользователях и их процессах.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
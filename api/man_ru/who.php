<?php
$manual = <<<EOT
ИМЯ
    who — кто вошёл в систему

СИНТАКСИС
    who [ОПЦИИ]...

ОПИСАНИЕ
    Показывает список активных пользователей.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
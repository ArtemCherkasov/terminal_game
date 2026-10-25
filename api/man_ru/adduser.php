<?php
$manual = <<<EOT
ИМЯ
    adduser — создать пользователя

СИНТАКСИС
    adduser ИМЯ

ОПИСАНИЕ
    Создаёт нового пользователя в системе.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
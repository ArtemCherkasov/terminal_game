<?php
$manual = <<<EOT
ИМЯ
    users — список пользователей в системе

СИНТАКСИС
    users

ОПИСАНИЕ
    Выводит имена вошедших пользователей.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
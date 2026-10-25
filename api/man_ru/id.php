<?php
$manual = <<<EOT
ИМЯ
    id — показать UID и GID

СИНТАКСИС
    id [ПОЛЬЗОВАТЕЛЬ]

ОПИСАНИЕ
    Выводит идентификаторы пользователя и группы.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
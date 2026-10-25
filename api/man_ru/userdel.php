<?php
$manual = <<<EOT
ИМЯ
    userdel — удалить пользователя

СИНТАКСИС
    userdel [ОПЦИИ] ИМЯ

ОПИСАНИЕ
    Удаляет учётную запись пользователя.
    -r — удалить домашний каталог
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
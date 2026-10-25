<?php
$manual = <<<EOT
ИМЯ
    usermod — изменить пользователя

СИНТАКСИС
    usermod [ОПЦИИ] ИМЯ

ОПИСАНИЕ
    Изменяет параметры учётной записи.
    -aG — добавить в группу
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
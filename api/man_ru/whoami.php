<?php
$manual = <<<EOT
ИМЯ
    whoami — имя текущего пользователя

СИНТАКСИС
    whoami

ОПИСАНИЕ
    Показывает имя текущего пользователя.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
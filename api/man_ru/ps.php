<?php
$manual = <<<EOT
ИМЯ
    ps — список процессов

СИНТАКСИС
    ps [ОПЦИИ]...

ОПИСАНИЕ
    Показывает информацию о процессах.
    aux — все процессы пользователей
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
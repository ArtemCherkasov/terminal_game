<?php
$manual = <<<EOT
ИМЯ
    passwd — сменить пароль

СИНТАКСИС
    passwd [ПОЛЬЗОВАТЕЛЬ]

ОПИСАНИЕ
    Изменяет пароль пользователя.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
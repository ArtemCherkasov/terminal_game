<?php
$manual = <<<EOT
ИМЯ
    ssh — подключение по SSH

СИНТАКСИС
    ssh [ОПЦИИ] ПОЛЬЗОВАТЕЛЬ@ХОСТ

ОПИСАНИЕ
    Безопасное подключение к удалённой системе.
    -p ПОРТ — указать порт
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
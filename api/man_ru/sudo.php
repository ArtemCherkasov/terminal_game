<?php
$manual = <<<EOT
ИМЯ
    sudo — выполнить команду от имени другого пользователя

СИНТАКСИС
    sudo [ОПЦИИ]... КОМАНДА

ОПИСАНИЕ
    Выполняет команду с правами root.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
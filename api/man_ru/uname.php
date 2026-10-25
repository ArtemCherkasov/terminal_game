<?php
$manual = <<<EOT
ИМЯ
    uname — информация о системе

СИНТАКСИС
    uname [ОПЦИИ]

ОПИСАНИЕ
    Выводит информацию о ядре и архитектуре.
    -a — вся информация
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
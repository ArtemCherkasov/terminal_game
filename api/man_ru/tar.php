<?php
$manual = <<<EOT
ИМЯ
    tar — архиватор

СИНТАКСИС
    tar [ОПЦИИ]... [ФАЙЛ]...

ОПИСАНИЕ
    Создаёт и распаковывает архивы.
    -c — создать архив
    -x — распаковать
    -f — указать файл архива
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
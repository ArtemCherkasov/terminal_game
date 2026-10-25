<?php
$manual = <<<EOT
ИМЯ
    alias — создать псевдоним команды

СИНТАКСИС
    alias [ИМЯ=ЗНАЧЕНИЕ]

ОПИСАНИЕ
    Создаёт сокращение для команды.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
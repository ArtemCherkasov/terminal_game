<?php
$manual = <<<EOT
ИМЯ
    host — DNS-резолв

СИНТАКСИС
    host ХОСТ

ОПИСАНИЕ
    Простой DNS-запрос, возвращает IP-адрес.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
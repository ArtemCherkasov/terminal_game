<?php
$manual = <<<EOT
ИМЯ
    nslookup — DNS-запрос

СИНТАКСИС
    nslookup ХОСТ

ОПИСАНИЕ
    Запрашивает DNS-записи для указанного хоста.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
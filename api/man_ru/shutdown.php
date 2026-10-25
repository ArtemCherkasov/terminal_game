<?php
$manual = <<<EOT
ИМЯ
    shutdown — выключить систему

СИНТАКСИС
    shutdown [ОПЦИИ] [ВРЕМЯ]

ОПИСАНИЕ
    Выключает или перезагружает систему.
    -h now — выключить сейчас
    -r now — перезагрузить
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
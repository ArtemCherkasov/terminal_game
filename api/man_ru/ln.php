<?php
$manual = <<<EOT
ИМЯ
    ln — создать ссылку

СИНТАКСИС
    ln [ОПЦИИ]... ИСТОЧНИК НАЗНАЧЕНИЕ

ОПИСАНИЕ
    Создаёт жёсткую или символьную ссылку.
    -s — символьная ссылка
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
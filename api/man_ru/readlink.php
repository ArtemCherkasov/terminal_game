<?php
$manual = <<<EOT
ИМЯ
    readlink — прочитать символьную ссылку

СИНТАКСИС
    readlink [ОПЦИИ] ССЫЛКА

ОПИСАНИЕ
    Показывает путь, на который указывает символьная ссылка.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
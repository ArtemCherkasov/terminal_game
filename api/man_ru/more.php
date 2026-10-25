<?php
$manual = <<<EOT
ИМЯ
    more — постраничный просмотр

СИНТАКСИС
    more [ФАЙЛ]...

ОПИСАНИЕ
    Постраничный просмотр файла. Space — далее.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
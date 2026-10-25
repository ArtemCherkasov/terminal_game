<?php
$manual = <<<EOT
ИМЯ
    basename — имя файла из пути

СИНТАКСИС
    basename ПУТЬ

ОПИСАНИЕ
    Выделяет имя файла из полного пути.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
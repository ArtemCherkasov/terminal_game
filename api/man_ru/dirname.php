<?php
$manual = <<<EOT
ИМЯ
    dirname — путь к каталогу

СИНТАКСИС
    dirname ПУТЬ

ОПИСАНИЕ
    Выделяет путь к каталогу из полного пути.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
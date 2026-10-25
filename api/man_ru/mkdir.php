<?php
$manual = <<<EOT
ИМЯ
    mkdir — создать каталог

СИНТАКСИС
    mkdir [ОПЦИИ]... КАТАЛОГ...

ОПИСАНИЕ
    Создаёт один или несколько каталогов.
    -p — создать промежуточные каталоги
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
<?php
$manual = <<<EOT
ИМЯ
    top — диспетчер процессов

СИНТАКСИС
    top [ОПЦИИ]

ОПИСАНИЕ
    Динамический просмотр запущенных процессов. q — выход.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
<?php
$manual = <<<EOT
ИМЯ
    umask — установить маску прав доступа

СИНТАКСИС
    umask [РЕЖИМ]

ОПИСАНИЕ
    Устанавливает маску для новых файлов и каталогов.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
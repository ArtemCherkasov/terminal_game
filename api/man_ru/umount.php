<?php
$manual = <<<EOT
ИМЯ
    umount — размонтировать файловую систему

СИНТАКСИС
    umount [ОПЦИИ] ТОЧКА

ОПИСАНИЕ
    Отмонтирует файловую систему.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
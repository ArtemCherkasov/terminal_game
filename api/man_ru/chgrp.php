<?php
$manual = <<<EOT
ИМЯ
    chgrp — сменить группу файла

СИНТАКСИС
    chgrp [ОПЦИИ]... ГРУППА ФАЙЛ...

ОПИСАНИЕ
    Изменяет группу владельца файла.
    -R — рекурсивно
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
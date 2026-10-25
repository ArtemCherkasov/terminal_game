<?php
$manual = <<<EOT
ИМЯ
    lspci — список PCI-устройств

СИНТАКСИС
    lspci [ОПЦИИ]

ОПИСАНИЕ
    Показывает все PCI-устройства.
    -v — подробно
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
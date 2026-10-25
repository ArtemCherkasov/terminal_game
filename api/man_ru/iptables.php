<?php
$manual = <<<EOT
ИМЯ
    iptables — настройка брандмауэра

СИНТАКСИС
    iptables [ОПЦИИ] ЦЕПОЧКА ПРАВИЛО

ОПИСАНИЕ
    Управление правилами Netfilter.
    -L — список правил
    -A — добавить правило
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
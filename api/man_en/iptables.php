<?php
$manual = <<<EOT
NAME
    iptables — administer the Linux kernel firewall

SYNOPSIS
    iptables [OPTION] CHAIN RULE

DESCRIPTION
    Manage Netfilter rules.
    -L — list rules
    -A — append rule
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);

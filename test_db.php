<?php
require_once __DIR__ . '/api/db.php';
$db = Database::getInstance();
$conn = $db->getConnection();

echo "=== Проверка БД ===\n";

// Проверяем пользователя
$user = $db->getUserByLogin('guest');
echo "getUserByLogin('guest'): " . ($user ? json_encode($user) : "NULL") . "\n";

// Проверяем authenticate
$auth = $db->authenticate('guest', md5('guest'));
echo "authenticate('guest', md5('guest')): " . ($auth ? json_encode($auth) : "NULL") . "\n";

// Прямой запрос
$result = $conn->query("SELECT * FROM users");
echo "\nВсе пользователи:\n";
while ($row = $result->fetch_assoc()) {
    echo "  id=" . $row['id'] . " login=" . $row['login'] . " pass=" . substr($row['pass'],0,8) . "..." . " activity=" . $row['activity'] . "\n";
}

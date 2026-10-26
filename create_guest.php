<?php
// create_guest.php — создаёт тестового пользователя guest/guest
require_once __DIR__ . '/api/db.php';

$db = Database::getInstance();
$conn = $db->getConnection();

$login = 'guest';
$email = 'guest@linuxgame.local';
$pass = md5('guest'); // md5 как в auth.php

// Проверяем, существует ли уже
$existing = $db->getUserByLogin($login);
if ($existing) {
    echo "Пользователь '$login' уже существует (id=" . $existing['id'] . ")\n";
} else {
    // Загружаем дефолтную ФС
    $fsFile = __DIR__ . '/api/fs_default.json';
    $fsJson = file_get_contents($fsFile);
    
    $userId = $db->createUser($login, $email, $pass, $fsJson);
    if ($userId) {
        echo "Пользователь создан: login=guest, password=guest, id=$userId\n";
    } else {
        echo "Ошибка создания пользователя: " . $conn->error . "\n";
    }
}

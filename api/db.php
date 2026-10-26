<?php
/**
 * Linux the Game — MySQL Database Connector
 * Подключение к MySQL и управление пользователями/файловой системой
 */

class Database {
    private static $instance = null;
    private $conn;
    
    private function __construct() {
        $this->conn = new mysqli('localhost', 'root', '', 'linux_game');
        if ($this->conn->connect_error) {
            die(json_encode(['error' => 'DB connection failed: ' . $this->conn->connect_error]));
        }
        $this->conn->set_charset('utf8mb4');
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        return $this->conn;
    }
    
    // Получить пользователя по логину
    public function getUserByLogin($login) {
        $stmt = $this->conn->prepare('SELECT * FROM users WHERE login = ? AND activity = 1');
        $stmt->bind_param('s', $login);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();
        $stmt->close();
        return $user;
    }
    
    // Получить пользователя по email
    public function getUserByEmail($email) {
        $stmt = $this->conn->prepare('SELECT * FROM users WHERE email = ? AND activity = 1');
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();
        $stmt->close();
        return $user;
    }
    
    // Проверить существование пользователя
    public function userExists($login, $email = null) {
        $sql = 'SELECT COUNT(*) as count FROM users WHERE login = ?';
        $params = [$login];
        $types = 's';
        
        if ($email) {
            $sql .= ' OR email = ?';
            $params[] = $email;
            $types .= 's';
        }
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $stmt->close();
        
        return $row['count'] > 0;
    }
    
    // Создать нового пользователя
    public function createUser($login, $email, $pass, $filesystem) {
        $stmt = $this->conn->prepare(
            'INSERT INTO users (login, email, pass, filesystem) VALUES (?, ?, ?, ?)'
        );
        $stmt->bind_param('ssss', $login, $email, $pass, $filesystem);
        $success = $stmt->execute();
        $userId = $this->conn->insert_id;
        $stmt->close();
        
        return $success ? $userId : false;
    }
    
    // Авторизовать пользователя
    public function authenticate($login, $pass) {
        $stmt = $this->conn->prepare('SELECT * FROM users WHERE login = ? AND pass = ? AND activity = 1');
        $stmt->bind_param('ss', $login, $pass);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();
        $stmt->close();
        return $user;
    }
    
    // Получить файловую систему пользователя
    public function getUserFilesystem($userId) {
        $stmt = $this->conn->prepare('SELECT filesystem FROM users WHERE id = ?');
        $stmt->bind_param('i', $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $stmt->close();
        
        if ($row && $row['filesystem']) {
            return json_decode($row['filesystem'], true);
        }
        return null;
    }
    
    // Сохранить файловую систему пользователя
    public function saveUserFilesystem($userId, $filesystem) {
        $fsJson = json_encode($filesystem, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        $stmt = $this->conn->prepare('UPDATE users SET filesystem = ?, date_update = NOW() WHERE id = ?');
        $stmt->bind_param('si', $fsJson, $userId);
        $success = $stmt->execute();
        $stmt->close();
        return $success;
    }
    
    // Обновить дату обновления пользователя
    public function updateUserActivity($userId) {
        $stmt = $this->conn->prepare('UPDATE users SET date_update = NOW() WHERE id = ?');
        $stmt->bind_param('i', $userId);
        $stmt->execute();
        $stmt->close();
    }
}

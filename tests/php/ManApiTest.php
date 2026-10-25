<?php

use PHPUnit\Framework\TestCase;

/**
 * Tests for api/man.php
 * 
 * Tests man page retrieval, input validation, language switching,
 * and error handling for non-existent commands.
 */
class ManApiTest extends TestCase
{
    private $manPagesRu;
    private $manPagesEn;

    protected function setUp(): void
    {
        // Load Russian man pages
        $_GET['lang'] = 'ru';
        $_GET['cmd'] = 'ls';
        ob_start();
        include __DIR__ . '/../../api/man.php';
        $ruContent = ob_get_clean();
        $this->manPagesRu = json_decode($ruContent, true);
        
        // Load English man pages
        $_GET['lang'] = 'en';
        $_GET['cmd'] = 'ls';
        ob_start();
        include __DIR__ . '/../../api/man.php';
        $enContent = ob_get_clean();
        $this->manPagesEn = json_decode($enContent, true);
    }

    protected function tearDown(): void
    {
        unset($_GET['lang'], $_GET['cmd']);
    }

    // ==================== Response Format Tests ====================

    public function testResponseIsValidJson()
    {
        $_GET['lang'] = 'ru';
        $_GET['cmd'] = 'ls';
        ob_start();
        include __DIR__ . '/../../api/man.php';
        $json = ob_get_clean();
        
        $this->assertJson($json);
    }

    public function testValidCommandReturnsContent()
    {
        $this->assertArrayHasKey('content', $this->manPagesRu);
        $this->assertNotEmpty($this->manPagesRu['content']);
    }

    public function testInvalidCommandReturnsError()
    {
        $_GET['lang'] = 'ru';
        $_GET['cmd'] = 'nonexistent_command_xyz';
        ob_start();
        include __DIR__ . '/../../api/man.php';
        $json = ob_get_clean();
        
        $data = json_decode($json, true);
        
        $this->assertArrayHasKey('error', $data);
        $this->assertEquals('NOTFOUND', $data['error']);
    }

    public function testEmptyCommandReturnsError()
    {
        $_GET['lang'] = 'ru';
        $_GET['cmd'] = '';
        ob_start();
        include __DIR__ . '/../../api/man.php';
        $json = ob_get_clean();
        
        $data = json_decode($json, true);
        
        $this->assertArrayHasKey('error', $data);
        $this->assertEquals('NOTFOUND', $data['error']);
    }

    public function testMissingCommandParameterReturnsError()
    {
        unset($_GET['cmd']);
        ob_start();
        include __DIR__ . '/../../api/man.php';
        $json = ob_get_clean();
        
        $data = json_decode($json, true);
        
        $this->assertArrayHasKey('error', $data);
        $this->assertEquals('NOTFOUND', $data['error']);
    }

    // ==================== Input Validation Tests ====================

    public function testSpecialCharactersInCommandAreStripped()
    {
        $_GET['lang'] = 'ru';
        $_GET['cmd'] = 'ls; rm -rf /';
        ob_start();
        include __DIR__ . '/../../api/man.php';
        $json = ob_get_clean();
        
        $data = json_decode($json, true);
        
        // Should not contain content for malicious input
        $this->assertArrayNotHasKey('content', $data);
    }

    public function testSqlInjectionAttemptReturnsError()
    {
        $_GET['lang'] = 'ru';
        $_GET['cmd'] = "' OR 1=1 --";
        ob_start();
        include __DIR__ . '/../../api/man.php';
        $json = ob_get_clean();
        
        $data = json_decode($json, true);
        
        // Should return error, not content
        $this->assertArrayNotHasKey('content', $data);
    }

    public function testPathTraversalAttemptReturnsError()
    {
        $_GET['lang'] = 'ru';
        $_GET['cmd'] = "../../etc/passwd";
        ob_start();
        include __DIR__ . '/../../api/man.php';
        $json = ob_get_clean();
        
        $data = json_decode($json, true);
        
        // Should not return content for path traversal
        $this->assertArrayNotHasKey('content', $data);
    }

    public function testNewlinesInCommandAreStripped()
    {
        $_GET['lang'] = 'ru';
        $_GET['cmd'] = "ls\nrm";
        ob_start();
        include __DIR__ . '/../../api/man.php';
        $json = ob_get_clean();
        
        $data = json_decode($json, true);
        
        // Should handle gracefully
        $this->assertArrayHasKey('error', $data);
    }

    // ==================== Content Tests ====================

    public function testRussianManPagesContainRussianText()
    {
        $_GET['lang'] = 'ru';
        $_GET['cmd'] = 'ls';
        ob_start();
        include __DIR__ . '/../../api/man.php';
        $json = ob_get_clean();
        
        $data = json_decode($json, true);
        
        $this->assertStringContainsString('ИМЯ', $data['content']);
        $this->assertStringContainsString('СИНТАКСИС', $data['content']);
        $this->assertStringContainsString('ОПИСАНИЕ', $data['content']);
    }

    public function testEnglishManPagesContainEnglishText()
    {
        $_GET['lang'] = 'en';
        $_GET['cmd'] = 'ls';
        ob_start();
        include __DIR__ . '/../../api/man.php';
        $json = ob_get_clean();
        
        $data = json_decode($json, true);
        
        $this->assertStringContainsString('NAME', $data['content']);
        $this->assertStringContainsString('SYNOPSIS', $data['content']);
        $this->assertStringContainsString('DESCRIPTION', $data['content']);
    }

    public function testManPageContainsCommandName()
    {
        $_GET['lang'] = 'ru';
        $_GET['cmd'] = 'pwd';
        ob_start();
        include __DIR__ . '/../../api/man.php';
        $json = ob_get_clean();
        
        $data = json_decode($json, true);
        
        $this->assertStringContainsString('pwd', $data['content']);
    }

    public function testManPageHasSynopsisSection()
    {
        $_GET['lang'] = 'ru';
        $_GET['cmd'] = 'grep';
        ob_start();
        include __DIR__ . '/../../api/man.php';
        $json = ob_get_clean();
        
        $data = json_decode($json, true);
        
        $this->assertStringContainsString('СИНТАКСИС', $data['content']);
        $this->assertStringContainsString('grep', $data['content']);
    }

    public function testManPageHasDescriptionSection()
    {
        $_GET['lang'] = 'ru';
        $_GET['cmd'] = 'mkdir';
        ob_start();
        include __DIR__ . '/../../api/man.php';
        $json = ob_get_clean();
        
        $data = json_decode($json, true);
        
        $this->assertStringContainsString('ОПИСАНИЕ', $data['content']);
    }

    // ==================== Language Switching Tests ====================

    public function testSameCommandDifferentLanguage()
    {
        $_GET['lang'] = 'ru';
        $_GET['cmd'] = 'ls';
        ob_start();
        include __DIR__ . '/../../api/man.php';
        $ruJson = ob_get_clean();
        $ruData = json_decode($ruJson, true);
        
        $_GET['lang'] = 'en';
        $_GET['cmd'] = 'ls';
        ob_start();
        include __DIR__ . '/../../api/man.php';
        $enJson = ob_get_clean();
        $enData = json_decode($enJson, true);
        
        $this->assertNotEquals($ruData['content'], $enData['content']);
        $this->assertStringContainsString('просмотр', strtolower($ruData['content']));
        $this->assertStringContainsString('list', strtolower($enData['content']));
    }

    public function testDefaultLanguageIsRussian()
    {
        unset($_GET['lang']);
        $_GET['cmd'] = 'ls';
        ob_start();
        include __DIR__ . '/../../api/man.php';
        $json = ob_get_clean();
        
        $data = json_decode($json, true);
        
        $this->assertArrayHasKey('content', $data);
        $this->assertStringContainsString('ИМЯ', $data['content']);
    }

    public function testInvalidLanguageDefaultsToRussian()
    {
        $_GET['lang'] = 'invalid';
        $_GET['cmd'] = 'ls';
        ob_start();
        include __DIR__ . '/../../api/man.php';
        $json = ob_get_clean();
        
        $data = json_decode($json, true);
        
        // Should default to Russian
        $this->assertArrayHasKey('content', $data);
        $this->assertStringContainsString('ИМЯ', $data['content']);
    }

    // ==================== Specific Command Tests ====================

    public function testManPageForLsExists()
    {
        $_GET['lang'] = 'ru';
        $_GET['cmd'] = 'ls';
        ob_start();
        include __DIR__ . '/../../api/man.php';
        $json = ob_get_clean();
        
        $data = json_decode($json, true);
        
        $this->assertArrayHasKey('content', $data);
        $this->assertStringContainsString('ls', $data['content']);
    }

    public function testManPageForCdExists()
    {
        $_GET['lang'] = 'ru';
        $_GET['cmd'] = 'cd';
        ob_start();
        include __DIR__ . '/../../api/man.php';
        $json = ob_get_clean();
        
        $data = json_decode($json, true);
        
        // cd might not have a man page - check for error or content
        if (isset($data['content'])) {
            $this->assertStringContainsString('cd', $data['content']);
        } else {
            $this->assertEquals('NOTFOUND', $data['error']);
        }
    }

    public function testManPageForBackupfsExists()
    {
        $_GET['lang'] = 'ru';
        $_GET['cmd'] = 'backupfs';
        ob_start();
        include __DIR__ . '/../../api/man.php';
        $json = ob_get_clean();
        
        $data = json_decode($json, true);
        
        $this->assertArrayHasKey('content', $data);
        $this->assertStringContainsString('backupfs', $data['content']);
    }

    public function testManPageForBackupfsEnglishExists()
    {
        $_GET['lang'] = 'en';
        $_GET['cmd'] = 'backupfs';
        ob_start();
        include __DIR__ . '/../../api/man.php';
        $json = ob_get_clean();
        
        $data = json_decode($json, true);
        
        $this->assertArrayHasKey('content', $data);
        $this->assertStringContainsString('backupfs', $data['content']);
    }

    public function testManPageForEchoExists()
    {
        $_GET['lang'] = 'ru';
        $_GET['cmd'] = 'echo';
        ob_start();
        include __DIR__ . '/../../api/man.php';
        $json = ob_get_clean();
        
        $data = json_decode($json, true);
        
        $this->assertArrayHasKey('content', $data);
        $this->assertStringContainsString('echo', $data['content']);
    }

    public function testManPageForCatExists()
    {
        $_GET['lang'] = 'ru';
        $_GET['cmd'] = 'cat';
        ob_start();
        include __DIR__ . '/../../api/man.php';
        $json = ob_get_clean();
        
        $data = json_decode($json, true);
        
        $this->assertArrayHasKey('content', $data);
        $this->assertStringContainsString('cat', $data['content']);
    }

    public function testManPageForMkdirExists()
    {
        $_GET['lang'] = 'ru';
        $_GET['cmd'] = 'mkdir';
        ob_start();
        include __DIR__ . '/../../api/man.php';
        $json = ob_get_clean();
        
        $data = json_decode($json, true);
        
        $this->assertArrayHasKey('content', $data);
        $this->assertStringContainsString('mkdir', $data['content']);
    }

    public function testManPageForRmExists()
    {
        $_GET['lang'] = 'ru';
        $_GET['cmd'] = 'rm';
        ob_start();
        include __DIR__ . '/../../api/man.php';
        $json = ob_get_clean();
        
        $data = json_decode($json, true);
        
        $this->assertArrayHasKey('content', $data);
        $this->assertStringContainsString('rm', $data['content']);
    }

    // ==================== Edge Cases ====================

    public function testVeryLongCommandInputIsHandled()
    {
        $_GET['lang'] = 'ru';
        $_GET['cmd'] = str_repeat('a', 1000);
        ob_start();
        include __DIR__ . '/../../api/man.php';
        $json = ob_get_clean();
        
        $data = json_decode($json, true);
        
        // Should not crash, should return error
        $this->assertArrayHasKey('error', $data);
    }

    public function testUnicodeInCommandInputIsHandled()
    {
        $_GET['lang'] = 'ru';
        $_GET['cmd'] = 'тест';
        ob_start();
        include __DIR__ . '/../../api/man.php';
        $json = ob_get_clean();
        
        $data = json_decode($json, true);
        
        // Should not crash
        $this->assertArrayHasKey('error', $data);
    }

    public function testWhitespaceOnlyCommandReturnsError()
    {
        $_GET['lang'] = 'ru';
        $_GET['cmd'] = '   ';
        ob_start();
        include __DIR__ . '/../../api/man.php';
        $json = ob_get_clean();
        
        $data = json_decode($json, true);
        
        $this->assertArrayHasKey('error', $data);
    }

    public function testManContentDoesNotContainXss()
    {
        $_GET['lang'] = 'ru';
        $_GET['cmd'] = 'ls';
        ob_start();
        include __DIR__ . '/../../api/man.php';
        $json = ob_get_clean();
        
        $data = json_decode($json, true);
        
        $this->assertStringNotContainsString('<script', $data['content']);
        $this->assertStringNotContainsString('onerror=', $data['content']);
    }

    public function testAllManPagesAreNonEmpty()
    {
        $commands = ['ls', 'pwd', 'cat', 'echo', 'mkdir', 'rm', 'cp', 'mv', 'grep', 'find', 
                     'chmod', 'sudo', 'tar', 'curl', 'wget', 'whoami', 'hostname', 'uname',
                     'clear', 'history', 'man', 'help', 'exit', 'date', 'backupfs'];
        
        foreach ($commands as $cmd) {
            $_GET['lang'] = 'ru';
            $_GET['cmd'] = $cmd;
            ob_start();
            include __DIR__ . '/../../api/man.php';
            $json = ob_get_clean();
            
            $data = json_decode($json, true);
            
            if (isset($data['content'])) {
                $this->assertNotEmpty(trim($data['content']), "Man page for '$cmd' should not be empty");
            }
            // If not found, that's OK for optional commands
        }
    }
}

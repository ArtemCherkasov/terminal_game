<?php

use PHPUnit\Framework\TestCase;

/**
 * Tests for api/commands.php
 * 
 * Tests command list structure, translations, uniqueness, and API response format.
 */
class CommandsApiTest extends TestCase
{
    private $commandsData;
    private $commandsRu;
    private $commandsEn;

    protected function setUp(): void
    {
        // Load commands.php and extract data
        $content = file_get_contents(__DIR__ . '/../../api/commands.php');
        
        // Test Russian commands
        $_GET['lang'] = 'ru';
        ob_start();
        include __DIR__ . '/../../api/commands.php';
        $ruJson = ob_get_clean();
        $this->commandsRu = json_decode($ruJson, true);
        
        // Test English commands
        $_GET['lang'] = 'en';
        ob_start();
        include __DIR__ . '/../../api/commands.php';
        $enJson = ob_get_clean();
        $this->commandsEn = json_decode($enJson, true);
    }

    protected function tearDown(): void
    {
        unset($_GET['lang']);
    }

    // ==================== Structure Tests ====================

    public function testResponseIsValidJson()
    {
        $_GET['lang'] = 'ru';
        ob_start();
        include __DIR__ . '/../../api/commands.php';
        $json = ob_get_clean();
        
        $this->assertJson($json, 'Response should be valid JSON');
    }

    public function testResponseIsArray()
    {
        $this->assertIsArray($this->commandsRu);
        $this->assertIsArray($this->commandsEn);
    }

    public function testEachCommandHasRequiredFields()
    {
        foreach ($this->commandsRu as $cmd) {
            $this->assertArrayHasKey('name', $cmd, "Command should have 'name' field");
            $this->assertArrayHasKey('description', $cmd, "Command '{$cmd['name']}' should have 'description' field");
            $this->assertArrayHasKey('man', $cmd, "Command '{$cmd['name']}' should have 'man' field");
        }
    }

    public function testCommandNamesAreStrings()
    {
        foreach ($this->commandsRu as $cmd) {
            $this->assertIsString($cmd['name'], "Command name should be string: {$cmd['name']}");
        }
    }

    public function testDescriptionsAreStrings()
    {
        foreach ($this->commandsRu as $cmd) {
            $this->assertIsString($cmd['description'], "Description for '{$cmd['name']}' should be string");
        }
    }

    public function testManUrlsAreCorrectlyFormatted()
    {
        foreach ($this->commandsRu as $cmd) {
            $expectedManUrl = 'api/man.php?cmd=' . $cmd['name'] . '&lang=ru';
            $this->assertEquals($expectedManUrl, $cmd['man'], "Man URL should be correctly formatted for '{$cmd['name']}'");
        }
    }

    // ==================== Uniqueness Tests ====================

    public function testAllCommandNamesAreUnique()
    {
        $names = array_column($this->commandsRu, 'name');
        $uniqueNames = array_unique($names);
        
        $this->assertCount(
            count($names), 
            $uniqueNames, 
            'All command names should be unique. Found duplicates.'
        );
    }

    public function testNoDuplicateCommandsBetweenLanguages()
    {
        $namesRu = array_column($this->commandsRu, 'name');
        $namesEn = array_column($this->commandsEn, 'name');
        
        $this->assertEquals(
            count($namesRu), 
            count($namesEn), 
            'Both languages should have the same number of commands'
        );
        
        sort($namesRu);
        sort($namesEn);
        
        $this->assertEquals($namesRu, $namesEn, 'Both languages should have identical command names');
    }

    // ==================== Content Tests ====================

    public function testContainsExpectedCoreCommands()
    {
        // Note: 'help' and 'man' are handled specially in terminal.js, not in commands.php
        $coreCommands = ['ls', 'cd', 'pwd', 'cat', 'echo', 'mkdir', 'rm', 'cp', 'mv', 'grep', 'find', 'clear', 'history'];
        $names = array_column($this->commandsRu, 'name');
        
        foreach ($coreCommands as $cmd) {
            $this->assertContains($cmd, $names, "Core command '$cmd' should be present");
        }
    }

    public function testContainsNewCommands()
    {
        $newCommands = ['gameinfo', 'backupfs', 'cd', 'touch'];
        $names = array_column($this->commandsRu, 'name');
        
        foreach ($newCommands as $cmd) {
            $this->assertContains($cmd, $names, "New command '$cmd' should be present");
        }
    }

    public function testCommandCountGreaterThan100()
    {
        $this->assertGreaterThan(
            100, 
            count($this->commandsRu), 
            'Should have more than 100 commands'
        );
    }

    public function testRussianDescriptionsAreNotEmpty()
    {
        foreach ($this->commandsRu as $cmd) {
            $this->assertNotEmpty(trim($cmd['description']), "Russian description for '{$cmd['name']}' should not be empty");
        }
    }

    public function testEnglishDescriptionsAreNotEmpty()
    {
        foreach ($this->commandsEn as $cmd) {
            $this->assertNotEmpty(trim($cmd['description']), "English description for '{$cmd['name']}' should not be empty");
        }
    }

    // ==================== Translation Tests ====================

    public function testTranslationsDifferBetweenLanguages()
    {
        $ruNames = array_column($this->commandsRu, 'name');
        $ruDescriptions = array_combine($ruNames, array_column($this->commandsRu, 'description'));
        $enDescriptions = array_combine(
            array_column($this->commandsEn, 'name'), 
            array_column($this->commandsEn, 'description')
        );
        
        $differentCount = 0;
        foreach ($ruNames as $name) {
            if ($ruDescriptions[$name] !== $enDescriptions[$name]) {
                $differentCount++;
            }
        }
        
        $this->assertGreaterThan(
            count($ruNames) * 0.8, 
            $differentCount, 
            'At least 80% of descriptions should differ between languages'
        );
    }

    public function testSpecificRussianTranslation()
    {
        $names = array_column($this->commandsRu, 'name');
        $idx = array_search('ls', $names);
        
        $this->assertEquals('Просмотр содержимого каталога', $this->commandsRu[$idx]['description']);
    }

    public function testSpecificEnglishTranslation()
    {
        $names = array_column($this->commandsEn, 'name');
        $idx = array_search('ls', $names);
        
        $this->assertEquals('List directory contents', $this->commandsEn[$idx]['description']);
    }

    // ==================== Edge Cases ====================

    public function testDefaultLanguageIsRussian()
    {
        unset($_GET['lang']);
        ob_start();
        include __DIR__ . '/../../api/commands.php';
        $json = ob_get_clean();
        $data = json_decode($json, true);
        
        // Should default to Russian descriptions
        $names = array_column($data, 'name');
        $idx = array_search('ls', $names);
        $this->assertEquals('Просмотр содержимого каталога', $data[$idx]['description']);
    }

    public function testInvalidLanguageDefaultsToEnglish()
    {
        $_GET['lang'] = 'invalid';
        ob_start();
        include __DIR__ . '/../../api/commands.php';
        $json = ob_get_clean();
        $data = json_decode($json, true);
        
        // Should fallback to English
        $names = array_column($data, 'name');
        $idx = array_search('ls', $names);
        $this->assertEquals('List directory contents', $data[$idx]['description']);
    }

    public function testCommandNamesContainOnlyValidCharacters()
    {
        foreach ($this->commandsRu as $cmd) {
            $this->assertMatchesRegularExpression(
                '/^[a-zA-Z0-9_-]+$/', 
                $cmd['name'], 
                "Command name '{$cmd['name']}' contains invalid characters"
            );
        }
    }

    public function testNoHtmlInDescriptions()
    {
        foreach ($this->commandsRu as $cmd) {
            $this->assertStringNotContainsString('<', $cmd['description'], "Description for '{$cmd['name']}' should not contain HTML");
        }
    }
}

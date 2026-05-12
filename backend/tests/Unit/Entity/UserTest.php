<?php

namespace App\Tests\Unit\Entity;

use App\Entity\User;
use PHPUnit\Framework\TestCase;

class UserTest extends TestCase
{
    public function testDefaultRole(): void
    {
        $user = new User();
        $this->assertSame('ROLE_USER', $user->getRole());
    }

    public function testIdIsNullByDefault(): void
    {
        $user = new User();
        $this->assertNull($user->getId());
    }

    public function testGetRolesAlwaysContainsRoleUser(): void
    {
        $user = new User();
        $user->setRole('ROLE_ADMIN');

        $roles = $user->getRoles();

        $this->assertContains('ROLE_USER', $roles);
        $this->assertContains('ROLE_ADMIN', $roles);
    }

    public function testGetRolesDeduplicatesWhenAlreadyRoleUser(): void
    {
        $user = new User();
        $user->setRole('ROLE_USER');

        $roles = $user->getRoles();

        $this->assertCount(1, $roles);
        $this->assertContains('ROLE_USER', $roles);
    }

    public function testSettersAndGetters(): void
    {
        $user = new User();
        $user->setEmail('jean.dupont@example.com')
             ->setNom('Dupont')
             ->setPrenom('Jean')
             ->setPassword('hashed_password')
             ->setRole('ROLE_ADMIN');

        $this->assertSame('jean.dupont@example.com', $user->getEmail());
        $this->assertSame('jean.dupont@example.com', $user->getUserIdentifier());
        $this->assertSame('Dupont', $user->getNom());
        $this->assertSame('Jean', $user->getPrenom());
        $this->assertSame('hashed_password', $user->getPassword());
        $this->assertSame('ROLE_ADMIN', $user->getRole());
    }

    public function testEraseCredentialsDoesNotClearPassword(): void
    {
        $user = new User();
        $user->setPassword('secret');
        $user->eraseCredentials();

        $this->assertSame('secret', $user->getPassword());
    }

    public function testEmptyEmpruntsCollectionByDefault(): void
    {
        $user = new User();
        $this->assertCount(0, $user->getEmprunts());
    }

    public function testUserIdentifierEqualsEmail(): void
    {
        $user = new User();
        $user->setEmail('test@example.com');

        $this->assertSame($user->getEmail(), $user->getUserIdentifier());
    }
}

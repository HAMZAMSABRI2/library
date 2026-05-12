<?php

namespace App\Tests\Functional;

use Doctrine\ORM\Tools\SchemaTool;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

abstract class AbstractApiTestCase extends WebTestCase
{
    protected KernelBrowser $client;
    protected string $adminToken = '';
    protected string $userToken = '';
    protected int $adminUserId = 0;
    protected int $regularUserId = 0;

    private static bool $schemaCreated = false;

    protected function setUp(): void
    {
        parent::setUp();

        $this->client = static::createClient();

        $this->resetDatabase();

        $this->adminToken  = $this->registerUser('admin@test.com',   'Admin123!', 'Martin',  'Alice', 'ROLE_ADMIN');
        $this->userToken   = $this->registerUser('user@test.com',    'User123!',  'Bernard', 'Bob',   'ROLE_USER');

        $em = static::getContainer()->get('doctrine.orm.entity_manager');
        $this->adminUserId   = $em->getRepository(\App\Entity\User::class)->findOneBy(['email' => 'admin@test.com'])->getId();
        $this->regularUserId = $em->getRepository(\App\Entity\User::class)->findOneBy(['email' => 'user@test.com'])->getId();
    }

    private function resetDatabase(): void
    {
        $em = static::getContainer()->get('doctrine.orm.entity_manager');

        if (!self::$schemaCreated) {
            $schemaTool = new SchemaTool($em);
            $metadata   = $em->getMetadataFactory()->getAllMetadata();
            $schemaTool->dropSchema($metadata);
            $schemaTool->createSchema($metadata);
            self::$schemaCreated = true;
        } else {
            $connection = $em->getConnection();
            $connection->executeStatement('SET FOREIGN_KEY_CHECKS=0');
            $connection->executeStatement('TRUNCATE TABLE emprunts');
            $connection->executeStatement('TRUNCATE TABLE livres');
            $connection->executeStatement('TRUNCATE TABLE users');
            $connection->executeStatement('SET FOREIGN_KEY_CHECKS=1');
        }

        $em->clear();
    }

    protected function registerUser(string $email, string $password, string $nom, string $prenom, string $role = 'ROLE_USER'): string
    {
        $this->client->request(
            'POST',
            '/api/auth/register',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(compact('email', 'password', 'nom', 'prenom', 'role'))
        );

        $data = json_decode($this->client->getResponse()->getContent(), true);

        return $data['token'] ?? '';
    }

    protected function jsonRequest(string $method, string $url, ?array $body = null, string $token = ''): Response
    {
        $headers = ['CONTENT_TYPE' => 'application/json'];

        if ($token !== '') {
            $headers['HTTP_AUTHORIZATION'] = "Bearer $token";
        }

        $this->client->request($method, $url, [], [], $headers, $body !== null ? json_encode($body) : null);

        return $this->client->getResponse();
    }

    protected function jsonBody(Response $response): array
    {
        return json_decode($response->getContent(), true) ?? [];
    }

    protected function createLivre(array $overrides = []): array
    {
        static $counter = 0;
        $counter++;

        $data = array_merge([
            'isbn'   => "978-0-00-$counter-" . str_pad($counter, 4, '0', STR_PAD_LEFT),
            'titre'  => "Titre Test $counter",
            'auteur' => 'Auteur Test',
            'stock'  => 3,
        ], $overrides);

        $response = $this->jsonRequest('POST', '/api/livres', $data, $this->adminToken);

        return $this->jsonBody($response);
    }
}

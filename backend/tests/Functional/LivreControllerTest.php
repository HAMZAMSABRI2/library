<?php

namespace App\Tests\Functional;

class LivreControllerTest extends AbstractApiTestCase
{
    // ─── GET /api/livres ──────────────────────────────────────────────────────

    public function testListLivresReturnsEmptyPaginatedResponse(): void
    {
        $response = $this->jsonRequest('GET', '/api/livres', null, $this->userToken);

        $this->assertSame(200, $response->getStatusCode());
        $body = $this->jsonBody($response);
        $this->assertArrayHasKey('data', $body);
        $this->assertArrayHasKey('total', $body);
        $this->assertArrayHasKey('page', $body);
        $this->assertArrayHasKey('limit', $body);
        $this->assertSame([], $body['data']);
        $this->assertSame(0, $body['total']);
    }

    public function testListLivresReturnsPaginatedResults(): void
    {
        $this->createLivre(['titre' => 'Alpha']);
        $this->createLivre(['titre' => 'Beta']);

        $response = $this->jsonRequest('GET', '/api/livres', null, $this->userToken);
        $body     = $this->jsonBody($response);

        $this->assertSame(200, $response->getStatusCode());
        $this->assertCount(2, $body['data']);
        $this->assertSame(2, $body['total']);
    }

    public function testListLivresSupportsSearch(): void
    {
        $this->createLivre(['titre' => 'Les Misérables', 'auteur' => 'Victor Hugo']);
        $this->createLivre(['titre' => 'Notre-Dame de Paris', 'auteur' => 'Victor Hugo']);
        $this->createLivre(['titre' => 'Germinal', 'auteur' => 'Émile Zola']);

        $response = $this->jsonRequest('GET', '/api/livres?q=Victor+Hugo', null, $this->userToken);
        $body     = $this->jsonBody($response);

        $this->assertSame(200, $response->getStatusCode());
        $this->assertCount(2, $body['data']);
    }

    public function testListLivresRequiresAuthentication(): void
    {
        $response = $this->jsonRequest('GET', '/api/livres');

        $this->assertSame(401, $response->getStatusCode());
    }

    public function testListLivresSupportsPagination(): void
    {
        for ($i = 1; $i <= 5; $i++) {
            $this->createLivre(['titre' => "Livre $i"]);
        }

        $response = $this->jsonRequest('GET', '/api/livres?page=1&limit=2', null, $this->userToken);
        $body     = $this->jsonBody($response);

        $this->assertSame(200, $response->getStatusCode());
        $this->assertCount(2, $body['data']);
        $this->assertSame(5, $body['total']);
        $this->assertSame(1, $body['page']);
        $this->assertSame(2, $body['limit']);
    }

    // ─── GET /api/livres/{id} ─────────────────────────────────────────────────

    public function testShowLivreReturnsCorrectData(): void
    {
        $created = $this->createLivre([
            'titre'   => 'Dune',
            'auteur'  => 'Frank Herbert',
            'editeur' => 'Pocket',
            'annee'   => 1965,
        ]);

        $response = $this->jsonRequest('GET', "/api/livres/{$created['id']}", null, $this->userToken);
        $body     = $this->jsonBody($response);

        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame($created['id'], $body['id']);
        $this->assertSame('Dune', $body['titre']);
        $this->assertSame('Frank Herbert', $body['auteur']);
        $this->assertSame('Pocket', $body['editeur']);
        $this->assertSame(1965, $body['annee']);
    }

    public function testShowLivreReturns404ForUnknownId(): void
    {
        $response = $this->jsonRequest('GET', '/api/livres/99999', null, $this->userToken);

        $this->assertSame(404, $response->getStatusCode());
    }

    // ─── POST /api/livres ─────────────────────────────────────────────────────

    public function testCreateLivreReturns201WithAllFields(): void
    {
        $response = $this->jsonRequest('POST', '/api/livres', [
            'isbn'      => '978-0-452-28423-4',
            'titre'     => '1984',
            'auteur'    => 'George Orwell',
            'editeur'   => 'Secker & Warburg',
            'annee'     => 1949,
            'stock'     => 5,
            'image_url' => 'https://example.com/1984.jpg',
        ], $this->adminToken);

        $this->assertSame(201, $response->getStatusCode());
        $body = $this->jsonBody($response);
        $this->assertArrayHasKey('id', $body);
        $this->assertSame('978-0-452-28423-4', $body['isbn']);
        $this->assertSame('1984', $body['titre']);
        $this->assertSame('George Orwell', $body['auteur']);
        $this->assertSame('Secker & Warburg', $body['editeur']);
        $this->assertSame(1949, $body['annee']);
        $this->assertSame(5, $body['stock']);
        $this->assertSame('https://example.com/1984.jpg', $body['image_url']);
    }

    public function testCreateLivreDefaultsStockTo3(): void
    {
        $response = $this->jsonRequest('POST', '/api/livres', [
            'isbn'   => '978-0-00-000001-1',
            'titre'  => 'Sans Stock',
            'auteur' => 'Auteur',
        ], $this->adminToken);

        $body = $this->jsonBody($response);
        $this->assertSame(3, $body['stock']);
    }

    public function testCreateLivreMissingIsbnReturns400(): void
    {
        $response = $this->jsonRequest('POST', '/api/livres', [
            'titre'  => 'Livre Sans ISBN',
            'auteur' => 'Auteur',
        ], $this->adminToken);

        $this->assertSame(400, $response->getStatusCode());
    }

    public function testCreateLivreMissingTitreReturns400(): void
    {
        $response = $this->jsonRequest('POST', '/api/livres', [
            'isbn'   => '978-0-00-000002-2',
            'auteur' => 'Auteur',
        ], $this->adminToken);

        $this->assertSame(400, $response->getStatusCode());
    }

    public function testCreateLivreMissingAuteurReturns400(): void
    {
        $response = $this->jsonRequest('POST', '/api/livres', [
            'isbn'  => '978-0-00-000003-3',
            'titre' => 'Livre Sans Auteur',
        ], $this->adminToken);

        $this->assertSame(400, $response->getStatusCode());
    }

    public function testCreateLivreDuplicateIsbnReturns409(): void
    {
        $this->createLivre(['isbn' => '978-0-00-000004-4', 'titre' => 'Original']);

        $response = $this->jsonRequest('POST', '/api/livres', [
            'isbn'   => '978-0-00-000004-4',
            'titre'  => 'Doublon',
            'auteur' => 'Auteur',
        ], $this->adminToken);

        $this->assertSame(409, $response->getStatusCode());
        $body = $this->jsonBody($response);
        $this->assertArrayHasKey('error', $body);
    }

    // ─── PUT /api/livres/{id} ─────────────────────────────────────────────────

    public function testUpdateLivreModifiesFields(): void
    {
        $livre = $this->createLivre(['titre' => 'Ancien Titre', 'stock' => 3]);

        $response = $this->jsonRequest('PUT', "/api/livres/{$livre['id']}", [
            'titre' => 'Nouveau Titre',
            'stock' => 10,
        ], $this->adminToken);

        $this->assertSame(200, $response->getStatusCode());
        $body = $this->jsonBody($response);
        $this->assertSame('Nouveau Titre', $body['titre']);
        $this->assertSame(10, $body['stock']);
    }

    public function testUpdateLivreWithPatchMethod(): void
    {
        $livre = $this->createLivre(['auteur' => 'Ancien Auteur']);

        $response = $this->jsonRequest('PATCH', "/api/livres/{$livre['id']}", [
            'auteur' => 'Nouvel Auteur',
        ], $this->adminToken);

        $this->assertSame(200, $response->getStatusCode());
        $body = $this->jsonBody($response);
        $this->assertSame('Nouvel Auteur', $body['auteur']);
    }

    public function testUpdateLivreCanSetNullableFieldsToNull(): void
    {
        $livre = $this->createLivre(['editeur' => 'Gallimard', 'annee' => 2000]);

        $response = $this->jsonRequest('PUT', "/api/livres/{$livre['id']}", [
            'editeur' => null,
            'annee'   => null,
        ], $this->adminToken);

        $this->assertSame(200, $response->getStatusCode());
        $body = $this->jsonBody($response);
        $this->assertNull($body['editeur']);
        $this->assertNull($body['annee']);
    }

    public function testUpdateLivreReturns404ForUnknownId(): void
    {
        $response = $this->jsonRequest('PUT', '/api/livres/99999', [
            'titre' => 'Test',
        ], $this->adminToken);

        $this->assertSame(404, $response->getStatusCode());
    }

    // ─── DELETE /api/livres/{id} ──────────────────────────────────────────────

    public function testDeleteLivreReturns204(): void
    {
        $livre = $this->createLivre();

        $response = $this->jsonRequest('DELETE', "/api/livres/{$livre['id']}", null, $this->adminToken);

        $this->assertSame(204, $response->getStatusCode());
    }

    public function testDeleteLivreThenShowReturns404(): void
    {
        $livre = $this->createLivre();

        $this->jsonRequest('DELETE', "/api/livres/{$livre['id']}", null, $this->adminToken);
        $response = $this->jsonRequest('GET', "/api/livres/{$livre['id']}", null, $this->userToken);

        $this->assertSame(404, $response->getStatusCode());
    }

    public function testDeleteLivreReturns404ForUnknownId(): void
    {
        $response = $this->jsonRequest('DELETE', '/api/livres/99999', null, $this->adminToken);

        $this->assertSame(404, $response->getStatusCode());
    }
}

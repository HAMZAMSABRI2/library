<?php

namespace App\Tests\Functional;

class EmpruntControllerTest extends AbstractApiTestCase
{
    private array $livre;

    protected function setUp(): void
    {
        parent::setUp();
        $this->livre = $this->createLivre(['titre' => 'Livre Test Emprunt', 'stock' => 3]);
    }

    // ─── GET /api/emprunts ─────────────────────────────────────────────────────

    public function testListEmpruntsReturnsEmptyResponse(): void
    {
        $response = $this->jsonRequest('GET', '/api/emprunts', null, $this->userToken);
        $body     = $this->jsonBody($response);

        $this->assertSame(200, $response->getStatusCode());
        $this->assertArrayHasKey('data', $body);
        $this->assertSame([], $body['data']);
        $this->assertSame(0, $body['total']);
    }

    public function testListEmpruntsRequiresAuthentication(): void
    {
        $response = $this->jsonRequest('GET', '/api/emprunts');

        $this->assertSame(401, $response->getStatusCode());
    }

    public function testListEmpruntsFiltersByUserId(): void
    {
        $this->createEmprunt($this->regularUserId, $this->livre['id']);

        $response = $this->jsonRequest('GET', "/api/emprunts?user_id={$this->regularUserId}", null, $this->adminToken);
        $body     = $this->jsonBody($response);

        $this->assertSame(200, $response->getStatusCode());
        $this->assertCount(1, $body['data']);
        $this->assertSame($this->regularUserId, $body['data'][0]['user_id']);
    }

    public function testListEmpruntsFiltersByStatut(): void
    {
        $emprunt = $this->createEmprunt($this->regularUserId, $this->livre['id']);
        $this->jsonRequest('PATCH', "/api/emprunts/{$emprunt['id']}/retour", null, $this->adminToken);

        $response = $this->jsonRequest('GET', '/api/emprunts?statut=en_cours', null, $this->adminToken);
        $body     = $this->jsonBody($response);

        $this->assertSame(200, $response->getStatusCode());
        $this->assertCount(0, $body['data']);

        $response = $this->jsonRequest('GET', '/api/emprunts?statut=rendu', null, $this->adminToken);
        $body     = $this->jsonBody($response);
        $this->assertCount(1, $body['data']);
    }

    // ─── GET /api/emprunts/{id} ────────────────────────────────────────────────

    public function testShowEmpruntReturnsCorrectData(): void
    {
        $emprunt = $this->createEmprunt($this->regularUserId, $this->livre['id']);

        $response = $this->jsonRequest('GET', "/api/emprunts/{$emprunt['id']}", null, $this->userToken);
        $body     = $this->jsonBody($response);

        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame($emprunt['id'], $body['id']);
        $this->assertSame($this->regularUserId, $body['user_id']);
        $this->assertSame($this->livre['id'], $body['livre_id']);
        $this->assertSame('en_cours', $body['statut']);
        $this->assertArrayHasKey('date_emprunt', $body);
        $this->assertNull($body['date_retour']);
    }

    public function testShowEmpruntReturns404ForUnknownId(): void
    {
        $response = $this->jsonRequest('GET', '/api/emprunts/99999', null, $this->userToken);

        $this->assertSame(404, $response->getStatusCode());
    }

    // ─── POST /api/emprunts ────────────────────────────────────────────────────

    public function testCreateEmpruntReturns201AndDecrementsStock(): void
    {
        $response = $this->jsonRequest('POST', '/api/emprunts', [
            'user_id'  => $this->regularUserId,
            'livre_id' => $this->livre['id'],
        ], $this->adminToken);

        $this->assertSame(201, $response->getStatusCode());
        $body = $this->jsonBody($response);
        $this->assertSame('en_cours', $body['statut']);
        $this->assertSame($this->regularUserId, $body['user_id']);
        $this->assertSame($this->livre['id'], $body['livre_id']);
        $this->assertNotNull($body['date_emprunt']);
        $this->assertNull($body['date_retour']);

        $livreResponse = $this->jsonRequest('GET', "/api/livres/{$this->livre['id']}", null, $this->userToken);
        $livreBody     = $this->jsonBody($livreResponse);
        $this->assertSame(2, $livreBody['stock']);
    }

    public function testCreateEmpruntMissingUserIdReturns400(): void
    {
        $response = $this->jsonRequest('POST', '/api/emprunts', [
            'livre_id' => $this->livre['id'],
        ], $this->adminToken);

        $this->assertSame(400, $response->getStatusCode());
        $body = $this->jsonBody($response);
        $this->assertArrayHasKey('error', $body);
    }

    public function testCreateEmpruntMissingLivreIdReturns400(): void
    {
        $response = $this->jsonRequest('POST', '/api/emprunts', [
            'user_id' => $this->regularUserId,
        ], $this->adminToken);

        $this->assertSame(400, $response->getStatusCode());
    }

    public function testCreateEmpruntWithUnknownUserReturns404(): void
    {
        $response = $this->jsonRequest('POST', '/api/emprunts', [
            'user_id'  => 99999,
            'livre_id' => $this->livre['id'],
        ], $this->adminToken);

        $this->assertSame(404, $response->getStatusCode());
    }

    public function testCreateEmpruntWithUnknownLivreReturns404(): void
    {
        $response = $this->jsonRequest('POST', '/api/emprunts', [
            'user_id'  => $this->regularUserId,
            'livre_id' => 99999,
        ], $this->adminToken);

        $this->assertSame(404, $response->getStatusCode());
    }

    public function testCreateEmpruntWhenStockZeroReturns400(): void
    {
        $livreVide = $this->createLivre(['titre' => 'Livre Épuisé', 'stock' => 0]);

        $response = $this->jsonRequest('POST', '/api/emprunts', [
            'user_id'  => $this->regularUserId,
            'livre_id' => $livreVide['id'],
        ], $this->adminToken);

        $this->assertSame(400, $response->getStatusCode());
        $body = $this->jsonBody($response);
        $this->assertStringContainsStringIgnoringCase('stock', $body['error']);
    }

    public function testCreateDuplicateEmpruntReturns409(): void
    {
        $this->createEmprunt($this->regularUserId, $this->livre['id']);

        $response = $this->jsonRequest('POST', '/api/emprunts', [
            'user_id'  => $this->regularUserId,
            'livre_id' => $this->livre['id'],
        ], $this->adminToken);

        $this->assertSame(409, $response->getStatusCode());
        $body = $this->jsonBody($response);
        $this->assertArrayHasKey('error', $body);
    }

    // ─── PATCH /api/emprunts/{id}/retour ──────────────────────────────────────

    public function testRetourChangesStatutAndIncrementsStock(): void
    {
        $emprunt = $this->createEmprunt($this->regularUserId, $this->livre['id']);

        $response = $this->jsonRequest('PATCH', "/api/emprunts/{$emprunt['id']}/retour", null, $this->adminToken);
        $body     = $this->jsonBody($response);

        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame('rendu', $body['statut']);
        $this->assertNotNull($body['date_retour']);

        $livreResponse = $this->jsonRequest('GET', "/api/livres/{$this->livre['id']}", null, $this->userToken);
        $livreBody     = $this->jsonBody($livreResponse);
        $this->assertSame(3, $livreBody['stock']);
    }

    public function testRetourAlreadyRenduReturns400(): void
    {
        $emprunt = $this->createEmprunt($this->regularUserId, $this->livre['id']);
        $this->jsonRequest('PATCH', "/api/emprunts/{$emprunt['id']}/retour", null, $this->adminToken);

        $response = $this->jsonRequest('PATCH', "/api/emprunts/{$emprunt['id']}/retour", null, $this->adminToken);

        $this->assertSame(400, $response->getStatusCode());
        $body = $this->jsonBody($response);
        $this->assertArrayHasKey('error', $body);
    }

    public function testRetourReturns404ForUnknownId(): void
    {
        $response = $this->jsonRequest('PATCH', '/api/emprunts/99999/retour', null, $this->adminToken);

        $this->assertSame(404, $response->getStatusCode());
    }

    // ─── DELETE /api/emprunts/{id} ─────────────────────────────────────────────

    public function testDeleteEmpruntEnCoursIncrementsStock(): void
    {
        $emprunt = $this->createEmprunt($this->regularUserId, $this->livre['id']);

        $response = $this->jsonRequest('DELETE', "/api/emprunts/{$emprunt['id']}", null, $this->adminToken);
        $this->assertSame(204, $response->getStatusCode());

        $livreResponse = $this->jsonRequest('GET', "/api/livres/{$this->livre['id']}", null, $this->userToken);
        $livreBody     = $this->jsonBody($livreResponse);
        $this->assertSame(3, $livreBody['stock']);
    }

    public function testDeleteEmpruntRenduDoesNotIncrementStock(): void
    {
        $emprunt = $this->createEmprunt($this->regularUserId, $this->livre['id']);
        $this->jsonRequest('PATCH', "/api/emprunts/{$emprunt['id']}/retour", null, $this->adminToken);

        $livreAfterRetour = $this->jsonBody($this->jsonRequest('GET', "/api/livres/{$this->livre['id']}", null, $this->userToken));
        $stockAfterRetour = $livreAfterRetour['stock'];

        $this->jsonRequest('DELETE', "/api/emprunts/{$emprunt['id']}", null, $this->adminToken);

        $livreAfterDelete = $this->jsonBody($this->jsonRequest('GET', "/api/livres/{$this->livre['id']}", null, $this->userToken));
        $this->assertSame($stockAfterRetour, $livreAfterDelete['stock']);
    }

    public function testDeleteEmpruntReturns404ForUnknownId(): void
    {
        $response = $this->jsonRequest('DELETE', '/api/emprunts/99999', null, $this->adminToken);

        $this->assertSame(404, $response->getStatusCode());
    }

    // ─── Helper ───────────────────────────────────────────────────────────────

    private function createEmprunt(int $userId, int $livreId): array
    {
        $response = $this->jsonRequest('POST', '/api/emprunts', [
            'user_id'  => $userId,
            'livre_id' => $livreId,
        ], $this->adminToken);

        return $this->jsonBody($response);
    }
}

<?php

namespace App\Tests\Unit\Entity;

use App\Entity\Emprunt;
use App\Entity\Livre;
use App\Entity\User;
use PHPUnit\Framework\TestCase;

class EmpruntTest extends TestCase
{
    public function testDefaultStatut(): void
    {
        $emprunt = new Emprunt();
        $this->assertSame('en_cours', $emprunt->getStatut());
    }

    public function testIdIsNullByDefault(): void
    {
        $emprunt = new Emprunt();
        $this->assertNull($emprunt->getId());
    }

    public function testDateEmpruntIsSetOnConstruction(): void
    {
        $before = new \DateTime();
        $emprunt = new Emprunt();
        $after = new \DateTime();

        $this->assertGreaterThanOrEqual($before->getTimestamp(), $emprunt->getDateEmprunt()->getTimestamp());
        $this->assertLessThanOrEqual($after->getTimestamp(), $emprunt->getDateEmprunt()->getTimestamp());
    }

    public function testDateRetourIsNullByDefault(): void
    {
        $emprunt = new Emprunt();
        $this->assertNull($emprunt->getDateRetour());
    }

    public function testSettersAndGetters(): void
    {
        $user = new User();
        $livre = new Livre();
        $dateEmprunt = new \DateTime('2024-01-01');
        $dateRetour = new \DateTime('2024-01-15');

        $emprunt = (new Emprunt())
            ->setUser($user)
            ->setLivre($livre)
            ->setDateEmprunt($dateEmprunt)
            ->setDateRetour($dateRetour)
            ->setStatut('rendu');

        $this->assertSame($user, $emprunt->getUser());
        $this->assertSame($livre, $emprunt->getLivre());
        $this->assertSame($dateEmprunt, $emprunt->getDateEmprunt());
        $this->assertSame($dateRetour, $emprunt->getDateRetour());
        $this->assertSame('rendu', $emprunt->getStatut());
    }

    public function testRetourChangesStatutAndSetsDateRetour(): void
    {
        $emprunt = new Emprunt();
        $this->assertSame('en_cours', $emprunt->getStatut());
        $this->assertNull($emprunt->getDateRetour());

        $emprunt->setStatut('rendu')->setDateRetour(new \DateTime());

        $this->assertSame('rendu', $emprunt->getStatut());
        $this->assertNotNull($emprunt->getDateRetour());
    }

    public function testDateRetourCanBeSetToNull(): void
    {
        $emprunt = (new Emprunt())->setDateRetour(new \DateTime());
        $this->assertNotNull($emprunt->getDateRetour());

        $emprunt->setDateRetour(null);
        $this->assertNull($emprunt->getDateRetour());
    }

    public function testFluentInterface(): void
    {
        $emprunt = new Emprunt();
        $user = new User();
        $livre = new Livre();

        $result = $emprunt->setUser($user)
                          ->setLivre($livre)
                          ->setStatut('rendu')
                          ->setDateRetour(new \DateTime());

        $this->assertInstanceOf(Emprunt::class, $result);
    }
}

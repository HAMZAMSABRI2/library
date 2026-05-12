<?php

namespace App\Tests\Unit\Entity;

use App\Entity\Livre;
use PHPUnit\Framework\TestCase;

class LivreTest extends TestCase
{
    public function testDefaultStock(): void
    {
        $livre = new Livre();
        $this->assertSame(3, $livre->getStock());
    }

    public function testIdIsNullByDefault(): void
    {
        $livre = new Livre();
        $this->assertNull($livre->getId());
    }

    public function testNullableFieldsAreNullByDefault(): void
    {
        $livre = new Livre();
        $this->assertNull($livre->getEditeur());
        $this->assertNull($livre->getAnnee());
        $this->assertNull($livre->getImageUrl());
    }

    public function testSettersAndGetters(): void
    {
        $livre = (new Livre())
            ->setIsbn('978-3-16-148410-0')
            ->setTitre('Le Petit Prince')
            ->setAuteur('Antoine de Saint-Exupéry')
            ->setEditeur('Gallimard')
            ->setAnnee(1943)
            ->setStock(5)
            ->setImageUrl('https://example.com/cover.jpg');

        $this->assertSame('978-3-16-148410-0', $livre->getIsbn());
        $this->assertSame('Le Petit Prince', $livre->getTitre());
        $this->assertSame('Antoine de Saint-Exupéry', $livre->getAuteur());
        $this->assertSame('Gallimard', $livre->getEditeur());
        $this->assertSame(1943, $livre->getAnnee());
        $this->assertSame(5, $livre->getStock());
        $this->assertSame('https://example.com/cover.jpg', $livre->getImageUrl());
    }

    public function testStockDecrement(): void
    {
        $livre = new Livre();
        $this->assertSame(3, $livre->getStock());

        $livre->setStock($livre->getStock() - 1);

        $this->assertSame(2, $livre->getStock());
    }

    public function testStockIncrement(): void
    {
        $livre = (new Livre())->setStock(2);
        $livre->setStock($livre->getStock() + 1);

        $this->assertSame(3, $livre->getStock());
    }

    public function testNullableFieldsCanBeResetToNull(): void
    {
        $livre = (new Livre())
            ->setEditeur('Gallimard')
            ->setAnnee(2000)
            ->setImageUrl('https://example.com/img.jpg');

        $livre->setEditeur(null)->setAnnee(null)->setImageUrl(null);

        $this->assertNull($livre->getEditeur());
        $this->assertNull($livre->getAnnee());
        $this->assertNull($livre->getImageUrl());
    }

    public function testEmptyEmpruntsCollectionByDefault(): void
    {
        $livre = new Livre();
        $this->assertCount(0, $livre->getEmprunts());
    }
}

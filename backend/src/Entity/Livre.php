<?php

namespace App\Entity;

use App\Repository\LivreRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: LivreRepository::class)]
#[ORM\Table(name: 'livres')]
class Livre
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 20, unique: true)]
    private string $isbn;

    #[ORM\Column(length: 300)]
    private string $titre;

    #[ORM\Column(length: 200)]
    private string $auteur;

    #[ORM\Column(length: 200, nullable: true)]
    private ?string $editeur = null;

    #[ORM\Column(type: 'smallint', nullable: true)]
    private ?int $annee = null;

    #[ORM\Column(type: 'smallint')]
    private int $stock = 3;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $imageUrl = null;

    #[ORM\OneToMany(targetEntity: Emprunt::class, mappedBy: 'livre')]
    private Collection $emprunts;

    public function __construct()
    {
        $this->emprunts = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }
    public function getIsbn(): string { return $this->isbn; }
    public function setIsbn(string $isbn): static { $this->isbn = $isbn; return $this; }
    public function getTitre(): string { return $this->titre; }
    public function setTitre(string $titre): static { $this->titre = $titre; return $this; }
    public function getAuteur(): string { return $this->auteur; }
    public function setAuteur(string $auteur): static { $this->auteur = $auteur; return $this; }
    public function getEditeur(): ?string { return $this->editeur; }
    public function setEditeur(?string $editeur): static { $this->editeur = $editeur; return $this; }
    public function getAnnee(): ?int { return $this->annee; }
    public function setAnnee(?int $annee): static { $this->annee = $annee; return $this; }
    public function getStock(): int { return $this->stock; }
    public function setStock(int $stock): static { $this->stock = $stock; return $this; }
    public function getImageUrl(): ?string { return $this->imageUrl; }
    public function setImageUrl(?string $imageUrl): static { $this->imageUrl = $imageUrl; return $this; }
    public function getEmprunts(): Collection { return $this->emprunts; }
}

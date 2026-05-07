<?php

namespace App\Entity;

use App\Repository\EmpruntRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: EmpruntRepository::class)]
#[ORM\Table(name: 'emprunts')]
class Emprunt
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'emprunts')]
    #[ORM\JoinColumn(name: 'user_id', nullable: false, onDelete: 'CASCADE')]
    private User $user;

    #[ORM\ManyToOne(targetEntity: Livre::class, inversedBy: 'emprunts')]
    #[ORM\JoinColumn(name: 'livre_id', nullable: false, onDelete: 'CASCADE')]
    private Livre $livre;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private \DateTimeInterface $dateEmprunt;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $dateRetour = null;

    #[ORM\Column(length: 20)]
    private string $statut = 'en_cours';

    public function __construct()
    {
        $this->dateEmprunt = new \DateTime();
    }

    public function getId(): ?int { return $this->id; }
    public function getUser(): User { return $this->user; }
    public function setUser(User $user): static { $this->user = $user; return $this; }
    public function getLivre(): Livre { return $this->livre; }
    public function setLivre(Livre $livre): static { $this->livre = $livre; return $this; }
    public function getDateEmprunt(): \DateTimeInterface { return $this->dateEmprunt; }
    public function setDateEmprunt(\DateTimeInterface $date): static { $this->dateEmprunt = $date; return $this; }
    public function getDateRetour(): ?\DateTimeInterface { return $this->dateRetour; }
    public function setDateRetour(?\DateTimeInterface $date): static { $this->dateRetour = $date; return $this; }
    public function getStatut(): string { return $this->statut; }
    public function setStatut(string $statut): static { $this->statut = $statut; return $this; }
}

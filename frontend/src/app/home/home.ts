import { Component, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent {
  private sanitizer = inject(DomSanitizer);
  readonly thematiques = [
    {
      title: 'Agroécologie',
      desc: 'Pratiques agricoles durables et résilientes',
      icon: 'leaf',
    },
    {
      title: 'Biodiversité',
      desc: 'Conservation des espèces et des écosystèmes',
      icon: 'paw',
    },
    {
      title: 'Climat',
      desc: 'Changements climatiques et adaptation',
      icon: 'sun',
    },
    {
      title: 'Eau',
      desc: 'Gestion durable des ressources en eau',
      icon: 'drop',
    },
    {
      title: 'Financement climatique',
      desc: 'Financement et investissement climatique',
      icon: 'coin',
    },
    {
      title: 'Terre',
      desc: 'Gestion durable des terres et lutte contre la dégradation',
      icon: 'globe',
    },
  ];

  readonly avantages = [
    {
      title: 'Recherche intelligente',
      desc: 'Posez vos questions en langage naturel et obtenez des réponses pertinentes.',
      icon: 'search',
    },
    {
      title: 'Sources citées',
      desc: 'Chaque réponse inclut les sources documentaires utilisées.',
      icon: 'quote',
    },
    {
      title: 'Multilingue',
      desc: 'Interrogez et recevez des réponses dans la langue de votre choix.',
      icon: 'lang',
    },
    {
      title: 'Sécurisé et confidentiel',
      desc: 'Vos données restent sécurisées et ne quittent jamais votre environnement.',
      icon: 'shield',
    },
  ];

  iconSvg(icon: string): SafeHtml {
    const icons: Record<string, string> = {
      leaf: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1B5E3A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C12 2 7 6 7 12c0 3.3 2.7 6 6 6s6-2.7 6-6c0-6-7-10-7-10z"/><path d="M12 2v18"/><path d="M12 20c-2 0-4 2-4 4h8c0-2-2-4-4-4z"/></svg>',
      paw: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1B5E3A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="10" r="3"/><circle cx="17" cy="10" r="3"/><circle cx="5" cy="17" r="2.5"/><circle cx="19" cy="17" r="2.5"/><path d="M12 12c-2 0-4 2-4 5v3h8v-3c0-3-2-5-4-5z"/></svg>',
      sun: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1B5E3A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>',
      drop: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1B5E3A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C12 2 5 10 5 15c0 3.9 3.1 7 7 7s7-3.1 7-7c0-5-7-13-7-13z"/></svg>',
      coin: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1B5E3A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/><circle cx="12" cy="12" r="3" fill="none"/></svg>',
      globe: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1B5E3A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>',
      search: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1B5E3A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>',
      quote: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1B5E3A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h10M4 18h6"/><path d="M16 12l3 3-3 3"/></svg>',
      lang: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1B5E3A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/><path d="M7 6c1 4 2 8 5 10M17 6c-1 4-2 8-5 10"/></svg>',
      shield: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1B5E3A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    };
    return this.sanitizer.bypassSecurityTrustHtml(icons[icon] || icons['search']);
  }
}

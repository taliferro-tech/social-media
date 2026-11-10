import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

import { SiteFooterComponent } from '../../shared/site-footer/site-footer.component';
import { ShowcaseComponent } from './showcase.component';

/**
 * Public "See it in action" page: the C1 use-case cards and C2 player
 * (design_handoff_16ahead_social_video) on their own, plus the Social
 * explainer. /videos#video-{key} opens straight to a video.
 */
@Component( {
  selector: 'ms-videos',
  standalone: true,
  imports: [RouterLink, SiteFooterComponent, ShowcaseComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { display: flex; flex-direction: column; flex: 1 0 auto; min-width: 0; }
    .page {
      box-sizing: border-box; width: 100%; max-width: 1280px; margin: 0 auto;
      display: flex; flex-direction: column; gap: 40px; padding: 32px 40px 64px;
    }
    .cta { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
    @media (max-width: 900px) { .page { padding: 24px 16px 40px; gap: 28px; } }
  `],
  template: `
    <main class="page">
      <ms-showcase class="is-page" [asPage]="true" />
      <section class="cta">
        <button type="button" class="ms-btn ms-btn--primary ms-btn--54" (click)="showcase()?.getSocial()">Get Social</button>
        <a class="ms-btn ms-btn--54" routerLink="/compare/synthesia">Compare with Synthesia</a>
        <a class="ms-btn ms-btn--ghost ms-btn--54" routerLink="/">What Social does</a>
      </section>
    </main>
    <app-site-footer><a routerLink="/">Social</a><a routerLink="/compare/synthesia">Compare</a><a routerLink="/help">Help</a><a routerLink="/about">About</a></app-site-footer>
  `,
} )
export class VideosComponent {
  readonly showcase = viewChild( ShowcaseComponent );

  constructor () {
    inject( Meta ).updateTag( {
      name: 'description',
      content: 'Watch 16Ahead apps handle a marketing launch, video translation, city communications and eLearning overnight. One-minute videos.',
    } );
  }
}

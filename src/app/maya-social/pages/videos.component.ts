import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef, PLATFORM_ID, computed, inject, signal, viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';

import { SocialAuthService } from '../../services/social-auth.service';
import { SiteFooterComponent } from '../../shared/site-footer/site-footer.component';
import { WriteAccessPromptService } from '../../shared/write-access/write-access-prompt.service';
import { IconComponent } from '../icon.component';
import { MayaSocialState } from '../state';
import { ALL_SHOWCASE_VIDEOS, FEATURED_VIDEO, ShowcaseVideo, USE_CASE_VIDEOS } from './videos.data';

const HASH_PREFIX = '#video-';

/**
 * Public "See it in action" page (design_handoff_16ahead_social_video, C1
 * use-case cards + C2 player overlay). Every card opens the overlay;
 * /videos#video-{key} opens straight to that video so cards can be linked
 * from ads and emails.
 */
@Component( {
  selector: 'ms-videos',
  standalone: true,
  imports: [RouterLink, SiteFooterComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown)': 'onKeydown($event)' },
  styles: [`
    :host { display: flex; flex-direction: column; flex: 1 0 auto; min-width: 0; }
    .page {
      box-sizing: border-box; width: 100%; max-width: 1280px; margin: 0 auto;
      display: flex; flex-direction: column; gap: 40px; padding: 32px 40px 64px;
      transition: filter .2s;
    }
    .page.is-behind { filter: blur(3px); }
    .kick { font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }
    .head { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; }
    .head-text { display: flex; flex-direction: column; gap: 8px; }
    h1 { font-size: 44px; font-weight: 700; letter-spacing: -0.03em; line-height: 1.05; text-wrap: balance; }
    .lead { font-size: 17px; line-height: 1.5; color: var(--muted); }
    .each { font-size: 14px; font-weight: 600; color: var(--muted); white-space: nowrap; }

    /* Shared card bits */
    .card {
      display: flex; flex-direction: column; text-align: left; width: 100%; margin: 0; padding: 0; border: 0;
      background: var(--surface); color: var(--text); border-radius: 28px; overflow: hidden;
      font: inherit; cursor: pointer; box-shadow: none; transform: none; min-width: 0;
    }
    .card:hover { background: var(--surface2); transform: none; }
    .card:focus-visible { outline: 2px solid var(--blue); outline-offset: 3px; }
    .poster { position: relative; display: block; background: #0c0e13; }
    .poster img { display: block; width: 100%; max-width: 100%; height: 100%; object-fit: cover; }
    .poster::after {
      content: ''; position: absolute; inset: 0; pointer-events: none;
      background: linear-gradient(180deg, rgba(12,14,19,0) 45%, rgba(12,14,19,.55) 100%);
    }
    .play {
      position: absolute; left: 50%; top: 50%; z-index: 1; transform: translate(-50%, -50%);
      display: grid; place-items: center; width: 58px; height: 58px; border-radius: 50%;
      background: #fff; color: #0f1115; box-shadow: 0 8px 24px rgba(15,17,21,.25);
    }
    .play svg { width: 22px; height: 22px; margin-left: 3px; fill: currentColor; }
    .dur {
      position: absolute; right: 12px; bottom: 12px; z-index: 1; height: 24px; padding: 0 9px; border-radius: 999px;
      display: inline-flex; align-items: center; background: rgba(15,17,21,.72); color: #fff; font-size: 12px; font-weight: 700;
    }
    .org { font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }
    .title { font-size: 22px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.15; }
    .desc { font-size: 14px; line-height: 1.5; color: var(--muted); }
    .foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: auto; }
    .logos { display: flex; }
    .logos img {
      width: 26px; height: 26px; margin-left: -6px; border-radius: 50%; background: var(--bg);
      box-shadow: 0 0 0 2px var(--surface); object-fit: contain;
    }
    .logos img:first-child { margin-left: 0; }
    .watch { display: inline-flex; align-items: center; gap: 4px; font-size: 14px; font-weight: 700; color: var(--blue-ink); }

    /* Featured explainer */
    .featured { display: grid; grid-template-columns: 1.25fr 1fr; }
    .featured .poster { aspect-ratio: 16 / 9; background: #fff; }
    .featured .poster::after { display: none; }
    .featured .play { background: var(--blue); color: #fff; }
    .featured-body { display: flex; flex-direction: column; gap: 12px; padding: 32px; }
    .featured .title { font-size: 34px; letter-spacing: -0.03em; }
    .featured .desc { font-size: 16px; }

    /* Use-case grid */
    .grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
    .grid .poster { height: 158px; }
    .card-body { display: flex; flex-direction: column; gap: 8px; flex: 1; padding: 18px 20px 20px; }
    .card-body .desc { margin-bottom: 8px; }

    .cta { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }

    /* Overlay (C2) */
    .scrim { position: fixed; inset: 0; z-index: 100; background: rgba(15,17,21,.62); }
    .modal {
      position: fixed; z-index: 101; top: 56px; left: 60px; right: 60px; max-height: calc(100vh - 96px);
      display: grid; grid-template-columns: minmax(0, 1fr) 340px; overflow: hidden;
      background: var(--bg); color: var(--text); border-radius: 32px; box-shadow: 0 40px 120px rgba(15,17,21,.4);
    }
    .stage { display: flex; flex-direction: column; gap: 16px; min-width: 0; padding: 24px; background: #0c0e13; overflow-y: auto; }
    .stage video { display: block; width: 100%; aspect-ratio: 16 / 9; border-radius: 18px; background: #000; }
    .switch { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; }
    .switch button {
      flex: none; height: 38px; min-height: 0; margin: 0; padding: 0 16px; border: 0; border-radius: 999px;
      background: rgba(255,255,255,.1); color: #fff; font: 700 13px/1 var(--font); cursor: pointer; box-shadow: none; transform: none;
    }
    .switch button:hover { background: rgba(255,255,255,.18); transform: none; }
    .switch button.is-on { background: var(--blue); }
    .upnext-label { font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: rgba(255,255,255,.6); }
    .upnext { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
    .upnext button {
      display: flex; flex-direction: column; gap: 6px; margin: 0; padding: 0; border: 0; background: none;
      color: #fff; font: 600 13px/1.3 var(--font); text-align: left; cursor: pointer; box-shadow: none; transform: none;
    }
    .upnext img { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; border-radius: 12px; opacity: .85; }
    .upnext button:hover img { opacity: 1; }
    .switch button:focus-visible, .upnext button:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }

    .side { position: relative; display: flex; flex-direction: column; gap: 12px; padding: 28px 26px 24px; overflow-y: auto; }
    .close {
      position: absolute; top: 18px; right: 18px; display: grid; place-items: center;
      width: 38px; height: 38px; min-height: 0; margin: 0; padding: 0; border: 0; border-radius: 50%;
      background: var(--surface); color: var(--text); cursor: pointer; box-shadow: none; transform: none;
    }
    .close:hover { background: var(--surface2); transform: none; }
    .side .org { padding-right: 48px; }
    .side .title { font-size: 28px; }
    .steps-label { margin-top: 8px; }
    .steps { display: flex; flex-direction: column; margin: 0; padding: 0; list-style: none; }
    .steps li {
      display: grid; grid-template-columns: 30px 1fr; align-items: center; gap: 12px; padding: 10px 0;
      font-size: 14px; line-height: 1.4; box-shadow: 0 -1px 0 var(--surface2);
    }
    .steps li:first-child { box-shadow: none; }
    .steps img { width: 30px; height: 30px; object-fit: contain; }
    .side .ms-btn { margin-top: 8px; }
    .next {
      align-self: flex-start; margin: 0; padding: 0; border: 0; background: none; box-shadow: none; transform: none;
      color: var(--blue-ink); font: 700 14px/1.4 var(--font); cursor: pointer;
    }
    .next:hover { text-decoration: underline; transform: none; }

    @media (max-width: 1100px) {
      .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .modal { left: 24px; right: 24px; top: 32px; max-height: calc(100vh - 64px); }
    }
    @media (max-width: 900px) {
      .page { padding: 24px 16px 40px; gap: 28px; }
      .head { flex-direction: column; align-items: flex-start; gap: 8px; }
      h1 { font-size: 34px; }
      .featured { grid-template-columns: 1fr; }
      .featured-body { padding: 20px; }
      .featured .title { font-size: 26px; }
      /* Mobile: full screen, video on top, steps below. */
      .modal {
        inset: 0; max-height: none; border-radius: 0; grid-template-columns: 1fr; grid-template-rows: auto 1fr;
        overflow-y: auto;
      }
      .stage { padding: 16px; overflow: visible; }
      .stage video { border-radius: 12px; }
      .upnext-label, .upnext { display: none; }
      .side { overflow: visible; padding: 20px 16px 32px; }
      .close { position: fixed; top: 12px; right: 12px; z-index: 2; background: rgba(255,255,255,.92); color: #0f1115; }
    }
    @media (max-width: 560px) {
      .grid { grid-template-columns: 1fr; }
    }
    @media (prefers-reduced-motion: reduce) {
      .page { transition: none; }
    }
  `],
  template: `
    <main class="page" [class.is-behind]="active()" [attr.aria-hidden]="active() ? 'true' : null" [attr.inert]="active() ? '' : null">
      <section class="head">
        <div class="head-text">
          <span class="kick">See it in action</span>
          <h1>Ask at night. Wake up to it done.</h1>
          <p class="lead">Four real jobs, each handled overnight by six 16Ahead apps working together.</p>
        </div>
        <span class="each">Use-case videos are 1 minute each</span>
      </section>

      <button type="button" class="card featured" (click)="open(featured, $event)" [attr.aria-label]="'Watch: ' + featured.title">
        <span class="poster">
          <img [src]="featured.poster" alt="" width="640" height="360" loading="eager" />
          <span class="play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 4.5v15l13-7.5z" /></svg></span>
          <span class="dur">{{ featured.duration }}</span>
        </span>
        <span class="featured-body">
          <span class="org">{{ featured.org }}</span>
          <span class="title">{{ featured.title }}</span>
          <span class="desc">{{ featured.description }}</span>
          <span class="foot"><span class="watch">Watch <ms-icon name="arrow-right" [size]="14" [stroke]="2.75" /></span></span>
        </span>
      </button>

      <section class="grid" aria-label="Use cases">
        @for (uc of useCases; track uc.key) {
          <button type="button" class="card" (click)="open(uc, $event)" [attr.data-cy]="'uc-' + uc.key" [attr.aria-label]="'Watch: ' + uc.title + ', ' + uc.org">
            <span class="poster">
              <img [src]="uc.poster" alt="" width="640" height="360" loading="lazy" />
              <span class="play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 4.5v15l13-7.5z" /></svg></span>
              <span class="dur">{{ uc.duration }}</span>
            </span>
            <span class="card-body">
              <span class="org">{{ uc.org }}</span>
              <span class="title">{{ uc.title }}</span>
              <span class="desc">{{ uc.description }}</span>
              <span class="foot">
                <span class="logos" aria-hidden="true">
                  @for (app of uc.apps; track app.logo) {
                    <img class="brand-mark--light" [src]="'assets/brand/products/png/light/' + app.logo + '-64.png'" [title]="app.name" alt="" />
                    <img class="brand-mark--dark" [src]="'assets/brand/products/png/dark/' + app.logo + '-64.png'" [title]="app.name" alt="" />
                  }
                </span>
                <span class="watch">Watch <ms-icon name="arrow-right" [size]="14" [stroke]="2.75" /></span>
              </span>
            </span>
          </button>
        }
      </section>

      <section class="cta">
        <button type="button" class="ms-btn ms-btn--primary ms-btn--54" (click)="getSocial()">Get Social</button>
        <a class="ms-btn ms-btn--54" routerLink="/">What Social does</a>
      </section>
    </main>

    @if (active(); as v) {
      <div class="scrim" (click)="close()" aria-hidden="true"></div>
      <div #modal class="modal" role="dialog" aria-modal="true" [attr.aria-labelledby]="'vt-' + v.key">
        <div class="stage">
          <video
            #player
            [src]="v.src"
            [poster]="v.posterLg"
            [muted]="muted()"
            (pointerdown)="unmute()"
            (volumechange)="syncMuted()"
            controls playsinline autoplay preload="metadata"
          ></video>
          <div class="switch" role="group" aria-label="Choose a video">
            @for (item of all; track item.key) {
              <button type="button" [class.is-on]="item.key === v.key" [attr.aria-pressed]="item.key === v.key" (click)="select(item)">{{ item.switchLabel }}</button>
            }
          </div>
          <span class="upnext-label">Up next</span>
          <div class="upnext">
            @for (item of upNext(); track item.key) {
              <button type="button" (click)="select(item)"><img [src]="item.poster" alt="" />{{ item.title }}</button>
            }
          </div>
        </div>

        <aside class="side">
          <button type="button" class="close" (click)="close()" aria-label="Close video"><ms-icon name="x" [size]="18" [stroke]="2.75" /></button>
          <span class="org">{{ v.org }}</span>
          <h2 class="title" [id]="'vt-' + v.key">{{ v.title }}</h2>
          <p class="desc">{{ v.description }}</p>
          <span class="kick steps-label">{{ v.stepsLabel }}</span>
          <ol class="steps">
            @for (step of v.steps; track $index) {
              <li>
                <span>
                  <img class="brand-mark--light" [src]="'assets/brand/products/png/light/' + step.app.logo + '-64.png'" [alt]="step.app.name" />
                  <img class="brand-mark--dark" [src]="'assets/brand/products/png/dark/' + step.app.logo + '-64.png'" [alt]="step.app.name" />
                </span>
                <span>{{ step.text }}</span>
              </li>
            }
          </ol>
          <button type="button" class="ms-btn ms-btn--primary ms-btn--50 ms-btn--block" (click)="getSocial()">Get Social</button>
          @if (nextVideo(); as n) {
            <button type="button" class="next" (click)="select(n)">Next: {{ n.title }} →</button>
          }
        </aside>
      </div>
    }

    <app-site-footer><a routerLink="/">Social</a><a routerLink="/help">Help</a><a routerLink="/about">About</a></app-site-footer>
  `,
} )
export class VideosComponent {
  private readonly document = inject( DOCUMENT );
  private readonly isBrowser = isPlatformBrowser( inject( PLATFORM_ID ) );
  private readonly router = inject( Router );
  private readonly auth = inject( SocialAuthService );
  private readonly prompts = inject( WriteAccessPromptService );
  private readonly state = inject( MayaSocialState );

  readonly featured = FEATURED_VIDEO;
  readonly useCases = USE_CASE_VIDEOS;
  readonly all = ALL_SHOWCASE_VIDEOS;

  readonly active = signal<ShowcaseVideo | null>( null );
  /** Autoplays muted; the first click on the video turns sound on. */
  readonly muted = signal( true );

  readonly upNext = computed( () => {
    const current = this.active();
    return current ? this.all.filter( ( v ) => v.key !== current.key ) : [];
  } );
  readonly nextVideo = computed( () => {
    const current = this.active();
    if ( !current ) return null;
    const i = this.all.findIndex( ( v ) => v.key === current.key );
    return this.all[( i + 1 ) % this.all.length];
  } );

  private readonly modal = viewChild<ElementRef<HTMLElement>>( 'modal' );
  private readonly player = viewChild<ElementRef<HTMLVideoElement>>( 'player' );
  /** The card that opened the overlay, so focus returns there on close. */
  private opener: HTMLElement | null = null;

  constructor () {
    inject( Meta ).updateTag( {
      name: 'description',
      content: 'Watch 16Ahead apps handle a marketing launch, video translation, city communications and eLearning overnight. One-minute videos.',
    } );

    if ( this.isBrowser ) {
      // Deep links: /videos#video-translate opens straight to that video.
      const fromHash = this.findByHash( this.document.location.hash );
      if ( fromHash ) queueMicrotask( () => this.show( fromHash ) );
    }

    this.prompts.unlocked$.pipe( filter( Boolean ), takeUntilDestroyed( inject( DestroyRef ) ) ).subscribe( async () => {
      this.prompts.close();
      this.close();
      await this.state.refresh();
      void this.router.navigateByUrl( '/' );
    } );
    inject( DestroyRef ).onDestroy( () => this.lockScroll( false ) );
  }

  open ( video: ShowcaseVideo, event: Event ): void {
    this.opener = event.currentTarget as HTMLElement;
    this.show( video );
  }

  select ( video: ShowcaseVideo ): void {
    this.active.set( video );
    this.setHash( video.key );
  }

  close (): void {
    if ( !this.active() ) return;
    this.active.set( null );
    this.lockScroll( false );
    this.setHash( null );
    const opener = this.opener;
    this.opener = null;
    setTimeout( () => opener?.focus() );
  }

  unmute (): void {
    if ( this.muted() ) this.muted.set( false );
  }

  syncMuted (): void {
    const el = this.player()?.nativeElement;
    if ( el ) this.muted.set( el.muted );
  }

  getSocial (): void {
    this.prompts.open( { state: this.state.signedIn() ? 'browsing' : 'signedOut', action: 'use Social' } );
  }

  onKeydown ( event: KeyboardEvent ): void {
    if ( !this.active() ) return;
    if ( event.key === 'Escape' ) {
      event.preventDefault();
      this.close();
    } else if ( event.key === 'Tab' ) {
      this.trapFocus( event );
    }
  }

  private show ( video: ShowcaseVideo ): void {
    this.active.set( video );
    this.lockScroll( true );
    this.setHash( video.key );
    setTimeout( () => this.modal()?.nativeElement.querySelector<HTMLElement>( '.close' )?.focus() );
  }

  private trapFocus ( event: KeyboardEvent ): void {
    const root = this.modal()?.nativeElement;
    if ( !root ) return;
    const focusable = Array.from(
      root.querySelectorAll<HTMLElement>( 'button, video[controls], a[href], [tabindex]:not([tabindex="-1"])' ),
    ).filter( ( el ) => el.offsetParent !== null );
    if ( !focusable.length ) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const current = this.document.activeElement as HTMLElement | null;
    if ( event.shiftKey && ( current === first || !root.contains( current ) ) ) {
      event.preventDefault();
      last.focus();
    } else if ( !event.shiftKey && ( current === last || !root.contains( current ) ) ) {
      event.preventDefault();
      first.focus();
    }
  }

  private lockScroll ( on: boolean ): void {
    if ( !this.isBrowser ) return;
    this.document.body.style.overflow = on ? 'hidden' : '';
  }

  private setHash ( key: string | null ): void {
    if ( !this.isBrowser ) return;
    const { pathname, search } = this.document.location;
    history.replaceState( history.state, '', `${ pathname }${ search }${ key ? HASH_PREFIX + key : '' }` );
  }

  private findByHash ( hash: string ): ShowcaseVideo | null {
    if ( !hash.startsWith( HASH_PREFIX ) ) return null;
    const key = hash.slice( HASH_PREFIX.length );
    return this.all.find( ( v ) => v.key === key ) ?? null;
  }
}

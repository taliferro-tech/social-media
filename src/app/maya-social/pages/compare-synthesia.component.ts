import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

import { SiteFooterComponent } from '../../shared/site-footer/site-footer.component';
import { IconComponent, IconName } from '../icon.component';
import { ShowcaseComponent } from './showcase.component';

/**
 * Comparison page C1 (design_handoff_16ahead_social_video): 16Ahead Social
 * vs Synthesia. Synthesia is named in text only (no logo, screenshots or
 * brand colours). Ty is checking every Synthesia claim against their
 * current pricing and docs; edit the rows below and COMPARED_AS_OF when a
 * claim changes.
 */

/** Shown in the footnote: when the Synthesia claims were last checked. */
const COMPARED_AS_OF = 'November 2026';

interface Wish {
  icon: IconName;
  title: string;
  complaint: string;
  answer: string;
}

/** ok = green check, no = pink cross, '' = plain text. */
type Mark = 'ok' | 'no' | '';

interface Row {
  feature: string;
  ours: string;
  oursMark: Mark;
  theirs: string;
  theirsMark: Mark;
}

const WISHES: Wish[] = [
  {
    icon: 'infinity',
    title: 'No minute limits',
    complaint: 'Monthly minute caps on lower plans, and reviewers report surprise costs for extra minutes.',
    answer: 'Unlimited videos and minutes. Rendering never uses credits.',
  },
  {
    icon: 'eye',
    title: 'A check you can see',
    complaint: 'Reviewers call content moderation inconsistent and hard to understand.',
    answer: 'A Ready check shows the exact line, the reason and a one-click fix. Nothing is blocked without a reason.',
  },
  {
    icon: 'video',
    title: 'Real people, or none',
    complaint: 'Some buyers say the avatars look fake for customer-facing video.',
    answer: 'Motion graphics, or you recorded once. AI presenters are optional and always labeled.',
  },
  {
    icon: 'calendar',
    title: 'It actually gets posted',
    complaint: 'Built for training videos. Making the video is where it ends.',
    answer: 'Every format, titles and descriptions, scheduled to five channels in your calendar.',
  },
];

const ROWS: Row[] = [
  { feature: 'Built for', ours: 'Marketing and social video that gets posted', oursMark: 'ok', theirs: 'Training and internal communication', theirsMark: '' },
  { feature: 'Video minutes', ours: 'Unlimited on every plan', oursMark: 'ok', theirs: 'Monthly caps on Starter and Creator', theirsMark: 'no' },
  { feature: 'Pricing', ours: 'One flat monthly price', oursMark: 'ok', theirs: 'Plan plus extra minutes or credits', theirsMark: 'no' },
  { feature: 'Before you post', ours: 'Ready check with reasons and fixes', oursMark: 'ok', theirs: 'Moderation reviewers call inconsistent', theirsMark: 'no' },
  { feature: 'Who’s on screen', ours: 'Motion graphics, you, or a labeled AI presenter', oursMark: 'ok', theirs: 'AI avatars, stock or custom', theirsMark: '' },
  { feature: 'Formats', ours: '16:9, 9:16, 4:5 and 1:1 from one edit', oursMark: 'ok', theirs: 'Pick a size per video', theirsMark: '' },
  { feature: 'Titles, descriptions and ad copy', ours: 'Written for each channel', oursMark: 'ok', theirs: 'Not included', theirsMark: 'no' },
  { feature: 'Scheduling and posting', ours: 'Straight to your social calendar', oursMark: 'ok', theirs: 'Export or share a link', theirsMark: 'no' },
  { feature: 'Lifelike AI avatars in 140+ languages', ours: 'Optional add-on', oursMark: '', theirs: 'Their core strength', theirsMark: 'ok' },
];

@Component( {
  selector: 'ms-compare-synthesia',
  standalone: true,
  imports: [RouterLink, SiteFooterComponent, IconComponent, ShowcaseComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { display: flex; flex-direction: column; flex: 1 0 auto; min-width: 0; }
    .page {
      box-sizing: border-box; width: 100%; max-width: 1280px; margin: 0 auto;
      display: flex; flex-direction: column; gap: 64px; padding: 40px 80px 72px;
    }

    /* 1. Hero */
    .hero { display: grid; grid-template-columns: 1.15fr 1fr; gap: 48px; align-items: center; }
    .hero-text { display: flex; flex-direction: column; align-items: flex-start; gap: 22px; }
    .vs {
      padding: 6px 12px; border-radius: 999px; background: var(--t-violet); color: var(--t-violet-fg);
      font-size: 12px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase;
    }
    h1 { font-size: 64px; font-weight: 700; letter-spacing: -0.045em; line-height: 1; text-wrap: balance; }
    .sub { max-width: 560px; font-size: 19px; line-height: 1.5; color: var(--muted); }
    .actions { display: flex; flex-wrap: wrap; gap: 10px; }
    .formats { position: relative; aspect-ratio: 540 / 440; }
    .formats img { position: absolute; display: block; height: auto; max-width: none; object-fit: cover; border-radius: 18px; box-shadow: 0 24px 60px rgba(15,17,21,.22); }
    .f169 { left: 0; top: 4.5%; width: 64%; aspect-ratio: 16 / 9; }
    .f916 { right: 4%; top: 0; width: 34%; aspect-ratio: 9 / 16; }
    .f45 { left: 0; top: 52%; width: 30%; aspect-ratio: 4 / 5; }
    .one-edit {
      position: absolute; left: 34%; top: 72%; display: inline-flex; align-items: center; gap: 6px;
      height: 30px; padding: 0 12px; border-radius: 999px; background: var(--t-green); color: var(--t-green-fg);
      font-size: 13px; font-weight: 700; white-space: nowrap;
    }

    /* 2. Four wishes */
    .section { display: flex; flex-direction: column; gap: 22px; }
    h2 { font-size: 34px; font-weight: 700; letter-spacing: -0.03em; line-height: 1.1; }
    .wishes { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
    .wish { display: flex; flex-direction: column; gap: 14px; padding: 26px; border-radius: 28px; background: var(--surface); }
    .wish-icon { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 14px; background: var(--text); color: var(--bg); }
    .wish h3 { font-size: 22px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.15; }
    .box { display: flex; flex-direction: column; gap: 6px; padding: 14px 16px; border-radius: 16px; font-size: 14px; line-height: 1.45; }
    .box b { font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
    .box.complaint { background: var(--bg); color: var(--muted); }
    .box.complaint b { color: var(--t-pink-fg); }
    .box.answer { background: var(--t-green); color: var(--text); font-weight: 600; }
    .box.answer b { color: var(--t-green-fg); }

    /* 3. Side by side */
    .table { border-radius: 28px; box-shadow: inset 0 0 0 1px var(--surface2); overflow: hidden; scroll-margin-top: 24px; }
    .tr { display: grid; grid-template-columns: 1fr 1.3fr 1.3fr; gap: 16px; align-items: center; padding: 16px 28px; font-size: 15px; }
    .tr:nth-child(odd):not(.th) { background: var(--surface); }
    .tr + .tr { box-shadow: 0 -1px 0 var(--surface2); }
    .th { padding: 22px 28px; font-size: 18px; font-weight: 700; }
    .th .kick { font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }
    .th-ours { display: inline-flex; align-items: center; gap: 10px; }
    .th-ours img { width: 28px; height: 28px; }
    .th-theirs { color: var(--muted); }
    .feature { font-weight: 700; }
    .cell { display: inline-flex; align-items: flex-start; gap: 8px; color: var(--muted); }
    .cell.ok, .cell.no { color: var(--text); }
    .cell.ours.ok { font-weight: 600; }
    .cell.theirs.no { color: var(--muted); }
    .cell ms-icon { margin-top: 2px; }
    .cell.ok ms-icon { color: var(--t-green-fg); }
    .cell.no ms-icon { color: var(--pink); }
    .footnote { margin-top: 12px; font-size: 13px; line-height: 1.5; color: var(--muted); }

    /* 5. When Synthesia is better */
    .better {
      display: flex; align-items: center; justify-content: space-between; gap: 32px;
      padding: 32px; border-radius: 28px; background: var(--surface);
    }
    .better h2 { font-size: 26px; margin-bottom: 10px; }
    .better p { max-width: 860px; font-size: 16px; line-height: 1.55; color: var(--muted); }

    @media (max-width: 1100px) {
      .page { padding: 32px 40px 64px; }
      .wishes { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      h1 { font-size: 52px; }
    }
    @media (max-width: 900px) {
      .page { padding: 24px 16px 48px; gap: 48px; }
      .hero { grid-template-columns: 1fr; gap: 32px; }
      h1 { font-size: 42px; }
      .sub { font-size: 17px; }
      h2 { font-size: 28px; }
      .tr { grid-template-columns: 1fr 1fr; padding: 14px 16px; font-size: 14px; }
      .tr .feature { grid-column: 1 / -1; }
      .th { padding: 16px; font-size: 16px; }
      .th .kick { display: none; }
      .better { flex-direction: column; align-items: flex-start; padding: 24px; }
    }
    @media (max-width: 560px) {
      .wishes { grid-template-columns: 1fr; }
      .formats img { border-radius: 12px; }
      .one-edit { font-size: 12px; height: 26px; }
    }
  `],
  template: `
    <main class="page">
      <section class="hero">
        <div class="hero-text">
          <span class="vs">16Ahead Social vs Synthesia</span>
          <h1>The video maker that also posts it.</h1>
          <p class="sub">Unlimited videos in every format, a check you can actually read, and scheduling to your channels. No minute caps, no top-ups, no fake faces unless you ask for one.</p>
          <div class="actions">
            <button type="button" class="ms-btn ms-btn--primary ms-btn--54" (click)="getSocial()">Get Social</button>
            <a class="ms-btn ms-btn--54" href="#compare" (click)="toTable($event)">See the comparison</a>
          </div>
        </div>
        <div class="formats" aria-label="The same video in 16:9, 9:16 and 4:5">
          <img class="f169" src="video/compare/rescue-169.jpg" alt="16:9 version for YouTube" width="640" height="360" />
          <img class="f916" src="video/compare/rescue-916.jpg" alt="9:16 version for Reels and Shorts" width="360" height="640" />
          <img class="f45" src="video/compare/rescue-45.jpg" alt="4:5 version for feeds and ads" width="432" height="540" />
          <span class="one-edit"><ms-icon name="check" [size]="14" [stroke]="3" />One edit · every format</span>
        </div>
      </section>

      <section class="section" aria-labelledby="wishes-title">
        <h2 id="wishes-title">Four things people wish their video tool did.</h2>
        <div class="wishes">
          @for (wish of wishes; track wish.title) {
            <article class="wish">
              <span class="wish-icon"><ms-icon [name]="wish.icon" [size]="24" [stroke]="2.75" /></span>
              <h3>{{ wish.title }}</h3>
              <p class="box complaint"><b>Common complaint</b>{{ wish.complaint }}</p>
              <p class="box answer"><b>16Ahead Social</b>{{ wish.answer }}</p>
            </article>
          }
        </div>
      </section>

      <ms-showcase [showFeatured]="false" />

      <section aria-labelledby="compare-title">
        <div class="table" id="compare" role="table" aria-labelledby="compare-title">
          <div class="tr th" role="row">
            <span class="kick" role="columnheader" id="compare-title">Side by side</span>
            <span class="th-ours" role="columnheader">
              <img class="brand-mark--light" src="assets/brand/products/svg/light/09-social.svg" alt="" width="28" height="28" />
              <img class="brand-mark--dark" src="assets/brand/products/svg/dark/09-social.svg" alt="" width="28" height="28" />
              16Ahead Social
            </span>
            <span class="th-theirs" role="columnheader">Synthesia</span>
          </div>
          @for (row of rows; track row.feature) {
            <div class="tr" role="row">
              <span class="feature" role="rowheader">{{ row.feature }}</span>
              <span class="cell ours" [class.ok]="row.oursMark === 'ok'" [class.no]="row.oursMark === 'no'" role="cell">
                @if (row.oursMark === 'ok') { <ms-icon name="check" [size]="16" [stroke]="3" /> }
                @if (row.oursMark === 'no') { <ms-icon name="x" [size]="16" [stroke]="3" /> }
                {{ row.ours }}
              </span>
              <span class="cell theirs" [class.ok]="row.theirsMark === 'ok'" [class.no]="row.theirsMark === 'no'" role="cell">
                @if (row.theirsMark === 'ok') { <ms-icon name="check" [size]="16" [stroke]="3" /> }
                @if (row.theirsMark === 'no') { <ms-icon name="x" [size]="16" [stroke]="3" /> }
                {{ row.theirs }}
              </span>
            </div>
          }
        </div>
        <p class="footnote">Based on Synthesia’s public plans and published user reviews as of {{ comparedAsOf }}. Plans change; check synthesia.io for current details.</p>
      </section>

      <section class="better">
        <div>
          <h2>When Synthesia is the better choice</h2>
          <p>If you need lifelike AI presenters speaking dozens of languages for internal training at enterprise scale, Synthesia is built for that. If you need marketing video that gets made, checked and posted every week, that’s 16Ahead Social.</p>
        </div>
        <button type="button" class="ms-btn ms-btn--ink ms-btn--54" (click)="getSocial()">Get Social</button>
      </section>
    </main>

    <app-site-footer><a routerLink="/">Social</a><a routerLink="/videos">Videos</a><a routerLink="/help">Help</a><a routerLink="/about">About</a></app-site-footer>
  `,
} )
export class CompareSynthesiaComponent {
  readonly wishes = WISHES;
  readonly rows = ROWS;
  readonly comparedAsOf = COMPARED_AS_OF;

  private readonly showcase = viewChild( ShowcaseComponent );

  constructor () {
    inject( Meta ).updateTag( {
      name: 'description',
      content: '16Ahead Social vs Synthesia: unlimited videos in every format, a ready check with reasons, and scheduling straight to your social channels.',
    } );
  }

  getSocial (): void {
    this.showcase()?.getSocial();
  }

  /** Scroll to the table without leaving a #compare fragment (the hash is for video links). */
  toTable ( event: Event ): void {
    event.preventDefault();
    document.getElementById( 'compare' )?.scrollIntoView( { behavior: 'smooth', block: 'start' } );
  }
}

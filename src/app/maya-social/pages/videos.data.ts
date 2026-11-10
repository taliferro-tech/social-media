/**
 * The "See it in action" videos (design_handoff_16ahead_social_video, C1/C2).
 * MP4s and posters live in public/video. Step text matches what happens on
 * screen in each video; keep them in sync if a video is re-cut.
 */

export interface ShowcaseApp {
  name: string;
  /** File stem under assets/brand/products/png/{light,dark}/ (add -64.png). */
  logo: string;
}

export interface ShowcaseStep {
  text: string;
  app: ShowcaseApp;
}

export interface ShowcaseVideo {
  /** Used in the URL: /videos#video-{key}. */
  key: string;
  title: string;
  /** Label on the overlay's video switcher. */
  switchLabel: string;
  org: string;
  description: string;
  duration: string;
  src: string;
  poster: string;
  posterLg: string;
  stepsLabel: string;
  steps: ShowcaseStep[];
  /** The distinct apps used, in first-use order (card footer). */
  apps: ShowcaseApp[];
}

const APP = {
  find: { name: 'Find', logo: '11-find' },
  docs: { name: 'Docs', logo: '07-docs' },
  imageCreator: { name: 'Image Creator', logo: '14-image-creator' },
  social: { name: 'Social', logo: '09-social' },
  emailCreator: { name: 'Email Creator', logo: '13-email-creator' },
  pulse: { name: 'Pulse', logo: '08-pulse' },
  outreach: { name: 'Outreach', logo: '05-outreach' },
  moves: { name: 'Moves', logo: '06-moves' },
} satisfies Record<string, ShowcaseApp>;

function video ( v: Omit<ShowcaseVideo, 'apps' | 'src' | 'poster' | 'posterLg' | 'switchLabel'> & { file: string; switchLabel?: string } ): ShowcaseVideo {
  const apps: ShowcaseApp[] = [];
  for ( const step of v.steps ) {
    if ( !apps.includes( step.app ) ) apps.push( step.app );
  }
  const { file, ...rest } = v;
  return {
    ...rest,
    switchLabel: v.switchLabel ?? v.title,
    apps,
    src: `video/${ file }.mp4`,
    poster: `video/posters/${ file }.jpg`,
    posterLg: `video/posters/${ file }-lg.jpg`,
  };
}

/** The product explainer shown above the four use cases. */
export const FEATURED_VIDEO: ShowcaseVideo = video( {
  key: 'social-video',
  file: 'you-need-a-video',
  title: 'You need video every week.',
  switchLabel: 'Video in Social',
  org: '16Ahead Social · Video',
  description: 'Paste a link and get a story built only from your page, every format from one edit, a check you can read, and every channel scheduled.',
  duration: '1:30',
  stepsLabel: 'How it works',
  steps: [
    { text: 'Paste a link and press Make it', app: APP.social },
    { text: 'It writes the story from your page, and shows where every line came from', app: APP.social },
    { text: 'One edit updates every format', app: APP.social },
    { text: 'A ready check gives the exact line, the reason and a one-click fix', app: APP.social },
    { text: 'Titles and descriptions written for each channel, scheduled into your calendar', app: APP.social },
  ],
} );

export const USE_CASE_VIDEOS: ShowcaseVideo[] = [
  video( {
    key: 'marketing',
    file: 'fall-candles',
    title: 'Marketing launch',
    org: 'Ember & Oak · candle shop',
    description: 'Ask for a fall product video at night. Wake up to it made in every format, a launch email designed and five channels scheduled.',
    duration: '1:00',
    stepsLabel: 'What happened overnight',
    steps: [
      { text: 'Researched what fall buyers search for', app: APP.find },
      { text: 'Wrote the script from the product sheet', app: APP.docs },
      { text: 'Shot the product scenes', app: APP.imageCreator },
      { text: 'Made the video in every format', app: APP.social },
      { text: 'Designed the launch email', app: APP.emailCreator },
      { text: 'Scheduled it to five channels', app: APP.social },
      { text: 'Asked viewers what to make next', app: APP.pulse },
    ],
  } ),
  video( {
    key: 'translate',
    file: 'translate',
    title: 'Video translation',
    org: 'Summit Dental · clinic website',
    description: 'Website videos translated into Spanish, Vietnamese and Chinese: voice, captions and on-screen text, checked by bilingual reviewers.',
    duration: '1:00',
    stepsLabel: 'What happened overnight',
    steps: [
      { text: 'Found the top languages patients speak', app: APP.find },
      { text: 'Locked 18 terms that can’t change', app: APP.docs },
      { text: 'Translated 4 videos into 3 languages', app: APP.social },
      { text: 'Bilingual reviewers checked them', app: APP.pulse },
      { text: 'Translated the thumbnails', app: APP.imageCreator },
      { text: 'Added them to 4 pages with a language switcher', app: APP.social },
      { text: 'Emailed patients in their language', app: APP.emailCreator },
    ],
  } ),
  video( {
    key: 'city',
    file: 'announcement',
    title: 'City communications',
    org: 'City of Riverton · public works',
    description: 'A water repair notice in four languages, posted to every city channel, emailed to residents and sent to Main Street businesses.',
    duration: '1:00',
    stepsLabel: 'What happened overnight',
    steps: [
      { text: 'Pulled the facts from the work order', app: APP.docs },
      { text: 'Made the detour map', app: APP.imageCreator },
      { text: 'Made the video in 4 languages', app: APP.social },
      { text: 'Posted it to every city channel', app: APP.social },
      { text: 'Emailed 3,140 affected residents', app: APP.emailCreator },
      { text: 'Contacted Main Street businesses', app: APP.outreach },
      { text: 'Asked residents for questions', app: APP.pulse },
    ],
  } ),
  video( {
    key: 'learn',
    file: 'e-learning',
    title: 'eLearning',
    org: 'Harbor Logistics · new-hire safety',
    description: 'A forklift safety SOP turned into five lessons with quizzes, in each new hire’s language, assigned with due dates and tracked.',
    duration: '1:00',
    stepsLabel: 'What happened overnight',
    steps: [
      { text: 'Turned the SOP into 5 lessons', app: APP.docs },
      { text: 'Drew the diagrams', app: APP.imageCreator },
      { text: 'Made the lesson videos', app: APP.social },
      { text: 'Wrote a quiz for each lesson', app: APP.pulse },
      { text: 'Assigned lessons to the new hires', app: APP.moves },
      { text: 'Sent each hire a welcome email', app: APP.emailCreator },
      { text: 'Set up the progress report', app: APP.docs },
    ],
  } ),
];

export const ALL_SHOWCASE_VIDEOS: ShowcaseVideo[] = [FEATURED_VIDEO, ...USE_CASE_VIDEOS];

import { Injectable, inject } from '@angular/core';
import { Observable, combineLatest, of } from 'rxjs';
import { catchError, filter, map, shareReplay, switchMap, take } from 'rxjs/operators';
import { GetTheAppProductKey } from '@taliferro/ui/platform/get-the-app.model';
import { AccountBillingService } from './account-billing.service';
import { SocialAuthService } from './social-auth.service';

/** Where a visitor stands: browsing signed out, signed in without the app's
 * subscription (browse only), or able to create/edit. */
export type WriteAccessState = 'signedOut' | 'browsing' | 'canWrite';

/**
 * "Browse free, create with the app" (Ty, 2026-09-27): reads
 * /account/summary's `writeAccess` - App Store purchase or master tenant,
 * decided server-side - so the pricing page, the "get the app" banner and
 * disabled actions all agree. Cached per page load; call refresh() after
 * sign-in/out.
 */
@Injectable( { providedIn: 'root' } )
export class WriteAccessService {
  private readonly authService = inject( SocialAuthService );
  private readonly accountBilling = inject( AccountBillingService );
  private cached$: Observable<Record<string, boolean> | null> | null = null;

  state ( product: GetTheAppProductKey ): Observable<WriteAccessState> {
    return this.authService.isLoggedIn().pipe(
      switchMap( ( signedIn ) => {
        if ( !signedIn ) return of<WriteAccessState>( 'signedOut' );
        return this.writeAccess().pipe(
          map( ( access ): WriteAccessState => ( access?.[product] ? 'canWrite' : 'browsing' ) ),
        );
      } ),
    );
  }

  refresh (): void {
    this.cached$ = null;
  }

  private writeAccess (): Observable<Record<string, boolean> | null> {
    if ( !this.cached$ ) {
      // Wait for a real tenant id. Right after an in-page sign-in the
      // tenant stream still replays the signed-out '' until the Firestore
      // lookup lands; taking that first value skipped the request and
      // showed the master tenant "needs a subscription" (2026-11-14).
      this.cached$ = combineLatest( [this.authService.getTenantId(), this.authService.getUser()] ).pipe(
        filter( ( [tenantId, user] ) => !!tenantId && !!user?.uid ),
        take( 1 ),
        switchMap( ( [tenantId, user] ) =>
          this.accountBilling.getSummary( { tenantId, userId: user?.uid ?? '', userEmail: user?.email ?? '' } ) ),
        map( ( res ) => res?.data?.writeAccess ?? null ),
        shareReplay( { bufferSize: 1, refCount: false } ),
      );
    }
    // A failed check reads as "no access" this time but isn't cached, so
    // the next page asks again instead of staying locked until a reload.
    return this.cached$.pipe( catchError( () => {
      this.cached$ = null;
      return of( null );
    } ) );
  }
}

import * as fromRoot from '../../shared/store/index';
import * as fromTeachers from '../../shared/store/teachers';

import { select, Store } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { combineLatest, Observable, of } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

@Injectable()
export class TeacherSelectedGuard implements CanActivate {
  constructor(private store: Store<fromRoot.SharedState>) {
  }

  canActivate(next: ActivatedRouteSnapshot,
              state: RouterStateSnapshot): Observable<boolean> {
    /*
        This route can activate when the selected teacher matches the profile
     */

    return combineLatest(
      this.store.pipe(select(fromRoot.getTeachersLoaded)),
      this.store.pipe(select(fromRoot.getProfile)),
      this.store.pipe(select(fromRoot.getSelectedTeacher))
    ).pipe(
      filter(([ teachersLoaded, p, t ]) => p && p !== null && teachersLoaded),
      tap(([ teachersLoaded, profile, teacher ]) => {
        if (!teacher || teacher.username !== profile.username) {
          this.store.dispatch(new fromTeachers.TeachersSetSelected(profile.username));
        }
      }),
      filter(([ teachersLoaded, p, t ]) => t && t !== null),
      filter(([ teachersLoaded, profile, teacher ]) => {
        if (profile !== null && teacher.username) {
          return profile.username === teacher.username;
        }
        return false;
      }),
      map(() => true)
    );
  }

  canActivateChild(route: ActivatedRouteSnapshot,
                   state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.canActivate(route, state);
  }
}

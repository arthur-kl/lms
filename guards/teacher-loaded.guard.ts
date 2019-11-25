import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, tap } from 'rxjs/operators';

import * as fromRoot from '../../shared/store/index';
import { select, State } from '@ngrx/store';
import { TeachersService } from '../services/teachers.service';

@Injectable({
  providedIn: 'root'
})
export class TeachersLoadedGuard implements CanActivate {

  constructor(private store: State<fromRoot.SharedState>,
              private teachers: TeachersService) {
  }

  canActivate(next: ActivatedRouteSnapshot,
              state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    return this.store.pipe(
      select(fromRoot.getTeachersLoaded),
      tap(loaded => {
        if (!loaded) {
          this.teachers.load();
        }
      }),
      filter(loaded => loaded === true),
    );
  }

  canActivateChild(route: ActivatedRouteSnapshot,
                   state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.canActivate(route, state);
  }
}




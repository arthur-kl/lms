import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, tap } from 'rxjs/operators';

import * as fromRoot from '../../shared/store/index';
import { select, State } from '@ngrx/store';
import { ClassesService } from '../services/classes.service';

@Injectable({
  providedIn: 'root'
})
export class ClassesLoadedGuard implements CanActivate {

  constructor(private store: State<fromRoot.SharedState>,
              private classes: ClassesService) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    return this.store.pipe(
      select(fromRoot.getClassesLoaded),
      tap(loaded => {
        if (!loaded) {
          this.classes.load();
        }
      }),
      filter(loaded => loaded === true),
    );
  }
}




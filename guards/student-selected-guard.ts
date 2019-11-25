import * as fromRoot from '../../shared/store/index';
import * as fromClasses from '../../shared/store/classes';

import { select, Store } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { Student } from '@shared/types';

@Injectable()
export class StudentSelectedGuard implements CanActivate {
  constructor(private store: Store<fromRoot.SharedState>) {
  }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    /*
        This route can activate when the selected student matches the
        code in the url
     */

    return this.store.pipe(
      select(fromRoot.getClassesLoaded),
      filter(loaded => loaded === true),
      switchMap(() => this.store.select(fromRoot.getSelectedStudent)),
      tap((student: Student) => {
        console.log('Current Student is ', student);
        if (!student || student.student_pin !== route.params[ 'student_code' ]) {
          this.store.dispatch(new fromClasses.SelectStudent(route.params[ 'student_code' ]));
        }
      }),
      filter((student: Student) => student && student.student_pin === route.params[ 'student_code' ]),
      map(() => true)
    );


    // return this.store.select(fromRoot.getClassesLoaded)
    //   .pipe(
    //     filter(loaded => loaded === true),
    //     switchMap(() => this.store.select(fromRoot.getSelectedStudent)),
    //     tap(result => console.log(result),
    //     filter((student: Student) => {
    //       if (!student || student.student_pin !== route.params[ 'student_code' ]) {
    //         this.store.dispatch(new fromClasses.SelectStudent(route.params[ 'student_code' ]));
    //       } else {
    //         return true;
    //       }
    //     }),
    //     map((student: Student) => {
    //       if (student && student.student_pin === route.params[ 'student_pin' ]){
    //
    //       }
    //     }));
  }
}

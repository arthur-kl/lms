import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';

import * as fromRoot from '../../shared/store/index';
import * as fromLoading from '../../shared/store/loading';

import { filter, switchMap, tap } from 'rxjs/operators';
import { defer } from 'rxjs';
import { DynamoService } from '../../shared/services/dynamo.service';
import { ProfileService } from '../../shared/services/profile.service';
import { TeachersLoad, TeachersLoaded } from '../../shared/store/teachers';
import { ITeachersService, TeachersSharedService } from '../../shared/services/teachers.service';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

import { Teacher } from '@shared/types';
import { get as getTeacher } from '@shared/database/tables/teachers';

@Injectable({
  providedIn: 'root'
})
export class TeachersService implements ITeachersService {

  constructor(protected store: Store<fromRoot.SharedState>,
              protected profile: ProfileService,
              protected dynamo: DynamoService,
              protected shared: TeachersSharedService) {
  }

  public load() {
    this.store.dispatch(new TeachersLoad());

    if (environment.virginMode) {
      this.store.dispatch(new TeachersLoaded([]));
      return;
    }


    this.store.pipe(
      select(fromRoot.getProfile),
      filter(Boolean), // wait for profile to be loaded before getting past here.
      tap(() => this.store.dispatch(new fromLoading.AddLoadingTeachersMessageModal())),
      switchMap(profile => defer(() => getTeacher(this.dynamo.getDB(), profile.username)))
    ).subscribe(teacher => {
      this.store.dispatch(new TeachersLoaded([teacher]));
      this.store.dispatch(new fromLoading.RemoveLoadingTeachersMessageModal());
    });
  }

  create(teacher: Teacher): Observable<boolean> {
    return this.shared.create(teacher);
  }

  delete(teacher: Teacher): Promise<boolean> {
    return this.shared.delete(teacher);
  }

  getEnrollURL(teacher: Teacher) {
    return this.shared.getEnrollURL(teacher);
  }

  getTeacher(groupName: string, schoolName: string, username: string): Observable<Teacher> {
    return this.shared.getTeacher(groupName, schoolName, username);
  }
}



import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';

import * as fromRoot from '../../shared/store/index';
import * as fromClasses from '../../shared/store/classes';
import * as fromLoading from '../../shared/store/loading';

import { catchError, filter, map, switchMap, take, tap } from 'rxjs/operators';
import { DynamoService } from '../../shared/services/dynamo.service';
import { combineLatest, Observable, of, throwError, defer } from 'rxjs';
import { ClassesSharedService, IClassesService } from '../../shared/services/classes.service';
import { environment } from '../../../environments/environment';
import { AssignmentUtilsService } from '../../shared/services/assignment-utils.service';
import { Cls, FEJRLevelNames, FESLevelNames, IProfile, Module, Student, Teacher, AssignmentSchedulerConfig } from '@shared/types';

import { qryByClass } from '@shared/database/tables/studentAssignments';
import { qryByUsername } from '@shared/database/tables/classes';

@Injectable({
  providedIn: 'root'
})
export class ClassesService implements IClassesService {

  private teacher: Teacher;

  constructor(protected store: Store<fromRoot.SharedState>,
              protected dynamo: DynamoService,
              protected assUtils: AssignmentUtilsService,
              protected shared: ClassesSharedService) {
    combineLatest(
      this.store.select(fromRoot.getProfile),
      this.store.select(fromRoot.getTeachers)
    ).pipe(
      filter(([ profile, teachers ]) => profile && teachers && teachers.length >= 0),
      take(1) // so unsubscribe is not needed
    ).subscribe(
      ([ profile, teachers ]) => {
        this.teacher = teachers.find(t => t.username === profile.username);
      }
    );
  }


  public load() {
    this.store.dispatch(new fromClasses.LoadAction());

    let profile;

    if (environment.virginMode) {
      this.store.dispatch(new fromClasses.LoadSuccessAction([]));
      this.store.dispatch(new fromClasses.LoadClassStudentsSuccessAction([]));
      return;
    }

    this.store.pipe(
      select(fromRoot.getProfile),
      filter(Boolean),
      tap(() => this.store.dispatch(new fromLoading.AddLoadingClassesMessageModal())),
      tap(() => this.store.dispatch(new fromLoading.AddLoadingStudentsMessageModal())),
      tap(() => this.store.dispatch(new fromLoading.AddLoadingStudentAssignmentsMessageModal())),
      tap((p: IProfile) => profile = p),
      switchMap(p => defer(() => qryByUsername(this.dynamo.getDB(), p.username))),
      tap(classes => { // dispatch to update State Store with loaded classes
        this.store.dispatch(new fromClasses.LoadSuccessAction(classes));
        this.store.dispatch(new fromLoading.RemoveLoadingClassesMessageModal());
      }),
      switchMap((classes: Cls[]) => {
        if (classes && classes.length) {
          return this.shared.loadStudentsByClassCodes(
            classes.map(c => c.code)).pipe(map(() => classes)
          );
        } else {
          return of(classes); // keep compiler/code insight happy
        }
      }),
      tap(() => {
        this.store.dispatch(new fromLoading.RemoveLoadingStudentsMessageModal());
      }),
      tap(classes => {
        if (classes && classes.length) {
          Promise.all(classes.map(c => qryByClass(this.dynamo.getDB(), c)))
            .then(results => [].concat.apply([], results))
            .then(sa => {
              this.store.dispatch(new fromClasses.LoadStudentAssignmentsSuccessAction(sa));
              this.store.dispatch(new fromLoading.RemoveLoadingStudentAssignmentsMessageModal());
            });
        } else {
          this.store.dispatch(new fromLoading.RemoveLoadingStudentAssignmentsMessageModal());
        }
      }),
      catchError(err => {
        console.log('Oh noes!!!!');
        this.store.dispatch(new fromClasses.LoadFailedAction(err.message || err));

        // make sure no hanging loading message left
        this.store.dispatch(new fromLoading.RemoveLoadingStudentAssignmentsMessageModal());
        this.store.dispatch(new fromLoading.RemoveLoadingClassesMessageModal());
        this.store.dispatch(new fromLoading.RemoveLoadingStudentsMessageModal());

        return throwError(err);
      }))
      .subscribe(() => {
      });
  }

  create(
      displayName: string,
      icon: string,
      level: FEJRLevelNames| FESLevelNames): Promise<Cls> {
    return this.shared.create(displayName, icon, level);
  }

  delete(cls: Cls): Promise<boolean> {
    return this.shared.delete(cls);
  }

  getClassByCode(code: string): Observable<Cls> {
    return this.shared.getClassByCode(code);
  }

  getClassEnrollURL(cls: Cls): string {
    return this.shared.getClassEnrollURL(cls);
  }

  getStudentsByCode(code: string): Observable<Student[]> {
    return this.shared.getStudentsByCode(code);
  }

  // createStudent(student: Student, cls: Cls): Observable<Student> {
  //   return this.shared.createStudent(student, cls);
  // }

  deleteStudent(student: Student): Promise<boolean> {
    return this.shared.deleteStudent(student);
  }

  setAssignment(cls: Cls, module: Module): Promise<Cls> {
    return this.shared.setAssignment(cls, module);
  }

  unsetAssignment(cls: Cls, module: Module): Observable<Cls> {
    return this.shared.unsetAssignment(cls, module);
  }

  updateAutoAssignmentConfig(cls: Cls, config: AssignmentSchedulerConfig): Promise<Cls> {
    return this.shared.updateAutoAssignmentConfig(cls, config);
  }
}


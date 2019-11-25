import { Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';

import { Router } from '@angular/router';
import { Curriculum } from '../../../shared/types';
import { CurriculumService } from '../../../shared/services/curriculum.service';
import { Observable } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { UtilsService } from '../../../shared/services/utils.service';
import { ProductService } from '../../../shared/services/product.service';
import { map, tap } from 'rxjs/internal/operators';

import { Teacher, Cls, ProductNames, Module } from '@shared/types';

import * as fromRoot from '../../../shared/store';

@Component({
  selector: 'app-classes-list',
  templateUrl: './classes-list.component.html',
  styleUrls: [ './classes-list.component.scss' ]
})
export class ClassesListComponent implements OnInit, OnDestroy {

  public teacher: Teacher;
  public classes: Cls[];
  public curricula: Curriculum[];

  public subscriptions = [];
  public busy: boolean;

  constructor(private store: Store<fromRoot.SharedState>,
              private utils: UtilsService,
              private curriculumService: CurriculumService,
              private router: Router,
              public product: ProductService) {
    this.classes = [];
  }

  ngOnInit() {
    this.busy = true;

    this.subscriptions.push(
      this.product.name$.pipe(
        filter(product => product !== ProductNames.NONE),
        tap(product => this.curricula = this.curriculumService.getCurriculums(product)),
        switchMap(() => this.store.pipe(select(fromRoot.getClasses))),
        map((classes: Cls[]) => {
          if (this.teacher) {
            return classes.filter(c => c.username === this.teacher.username);
          }
          return classes;
        }),
        map(classes => {
          return classes.sort((a, b) => {
            if (a.name.toUpperCase() < b.name.toUpperCase()) {
              return -1;
            }
            if (a.name.toUpperCase() > b.name.toUpperCase()) {
              return 1;
            }
            return 0;
          });
        })
      ).subscribe(classes => {
        this.classes = classes;
      }));

    this.subscriptions.push(
      this.store.pipe(
        select(fromRoot.getSelectedTeacher),
        filter(Boolean)
      ).subscribe(teacher => {
        this.teacher = teacher;
      })
    );

    this.subscriptions.push(
      this.store.pipe(
        select(fromRoot.getClassesLoading)
      ).subscribe(loading => {
        this.busy = loading;
      })
    );

    this.subscriptions.push(
      this.store.pipe(
        select(fromRoot.getClassesLoaded),
        filter(loaded => loaded === true),
        switchMap(() => this.store.select(fromRoot.getClasses))
      ).subscribe(classes => {
        this.classes = classes.sort((a, b) => {
          if (a.name.toUpperCase() < b.name.toUpperCase()) {
            return -1;
          }
          if (a.name.toUpperCase() > b.name.toUpperCase()) {
            return 1;
          }
          return 0;
        });
      })
    );
  }

  getClassLocationName(cls: any): string {
    const curriculum: Curriculum = this.curricula.find(c => c.product === cls.product && c.level === cls.level);
    const module: Module = this.curriculumService.moduleFromLocation(cls.location, curriculum);
    if (module) {
      // console.log('getClassLocationName module = ', module);
      return `Unit ${module.unitName} ${module.classification}`;
    } else {
      return 'New!';
    }

  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  seenInApp$(): Observable<boolean> {
    return this.store.pipe(
      select(fromRoot.getProfile),
      map(user => user && user.lastSeenInAppMS && user.lastSeenInAppMS > 0),
    );
  }

  resendInvite(cls: any) {
    // this.busy = true;
    // this.sms.send(cls.phone, this.classesService.getEnrollURL(cls)).then(() => {
    //   this.busy = false;
    // });
  }

  getClassCount() {
    return this.teacher.stats ? this.teacher.stats.num_classes : 0;
  }

  getStudentCount() {
    return this.teacher.stats ? this.teacher.stats.num_students : 0;
  }

  onClassSelected(cls) {
    this.router.navigate([ '/teacher/class', cls.code, 'course' ]);
  }

  getSelectedSchoolName(): Observable<string> {
      return this.store.pipe(
          select(fromRoot.getSchoolsSelectedSchool),
          map(school => school ? school.name : '')
      );
  }

  getSelectedGroupName(): Observable<string> {
      return this.store.pipe(
          select(fromRoot.getSelectedGroup),
          map(group => group ? group.name : '')
      );
  }

  get disableAddClass(): Observable<boolean> {
    return this.store.pipe(select(fromRoot.isDemoProfile));
  }
}

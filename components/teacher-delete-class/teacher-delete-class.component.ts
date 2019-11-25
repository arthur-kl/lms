import { Component, OnDestroy, OnInit } from '@angular/core';
import { Cls } from '@shared/types';
import { select, Store } from '@ngrx/store';

import * as fromRoot from '../../../shared/store';
import { ClassesService } from '../../services/classes.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-teacher-delete-class',
  templateUrl: 'teacher-delete-class.component.html',
  styleUrls: [ 'teacher-delete-class.component.scss' ]
})
export class TeacherDeleteClassComponent implements OnInit, OnDestroy {

  public cls: Cls;
  public error: string;
  public busy = false;

  private subscriptions = [];

  constructor(private store: Store<fromRoot.SharedState>,
              private classService: ClassesService,
              private router: Router,
              private route: ActivatedRoute) {
  }


  ngOnInit() {
    // select the class
    // The class in the delete class state, see route guards
    this.subscriptions.push(
      this.store.pipe(
        select(fromRoot.getSelectedClass)
      ).subscribe((cls: Cls) => this.cls = cls)
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  goBack(): void {
    this.router.navigate([ '../settings' ], { relativeTo: this.route });
  }

  onDelete() {
    this.classService.delete(this.cls)
      .then(() => {
        this.busy = false;
        this.router.navigate([ '../settings' ]);
      })
      .catch(err => {
        this.busy = false;
        this.error = err.message || err;
      });
  }
}




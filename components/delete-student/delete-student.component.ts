import { Component, OnDestroy, OnInit } from '@angular/core';
import { Cls, Student } from '@shared/types';
import { Store } from '@ngrx/store';

import { ClassesService } from '../../services/classes.service';
import { ActivatedRoute, Router } from '@angular/router';

import * as fromRoot from '../../../shared/store';
import * as fromClasses from '../../../shared/store/classes';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-delete-student',
  templateUrl: './delete-student.component.html',
  styleUrls: [ './delete-student.component.scss' ]
})
export class DeleteStudentComponent implements OnInit, OnDestroy {

  public student: Student;
  public cls: Cls;
  public busy = true;
  public error = false;

  private subscriptions = [];

  constructor(private store: Store<fromRoot.SharedState>,
              private router: Router,
              private route: ActivatedRoute,
              private classService: ClassesService,
              private toastr: ToastrService) {
  }

  ngOnInit() {
    // The selected student
    this.subscriptions.push(
      this.store.select(fromRoot.getSelectedStudent)
        .subscribe((student: Student) => {
          this.student = student;
        })
    );

    // The class in the selected class
    this.subscriptions.push(
      this.store.select(fromRoot.getSelectedClass)
        .subscribe((cls: Cls) => {
          this.cls = cls;
        })
    );

    this.busy = true;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  goBack(): void {
    this.router.navigate([ '../' ], { relativeTo: this.route });
  }

  onDelete() {
    this.busy = true;
    this.store.dispatch(new fromClasses.EditClassAction());
    this.toastr.info('Deleting student...');

    const student = {...this.student};
    this.classService.deleteStudent(student)
      .then(() => {
        this.toastr.clear();
        this.toastr.success('Student deleted', null, { timeOut: 2000});
        this.store.dispatch(new fromClasses.DeleteStudentSuccessAction(student));
        this.router.navigate([ '/teacher/class/detail', student.class_code ]);
        this.busy = false;
      },
      (err: any) => {
        this.store.dispatch(new fromClasses.EditClassFailedAction(err.toString()));
        this.error = true;
        this.busy = false;
      });
  }
}




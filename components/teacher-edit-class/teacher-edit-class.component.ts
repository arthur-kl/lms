import { Component, OnDestroy, OnInit } from '@angular/core';

import { Store, select } from '@ngrx/store';
import { filter } from 'rxjs/operators';
import { DynamoService } from '../../../shared/services/dynamo.service';
import { Cls, AssignmentSchedulerConfig } from '@shared/types';

import * as fromRoot from '../../../shared/store';
import * as fromClasses from '../../../shared/store/classes';

import * as tblClasses from '@shared/database/tables/classes';

import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { MAX_NAME_LEN, MIN_NAME_LEN } from '../../../shared/utils';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-teacher-edit-class',
    templateUrl: 'teacher-edit-class.component.html',
    styleUrls: ['teacher-edit-class.component.scss']
})
export class TeacherEditClassComponent implements OnInit, OnDestroy {
  public cls: Cls;
  public saving: boolean;
  public teacherEditForm: FormGroup;
  public submitted = false;

  private subscriptions = [];

  constructor(
      private store: Store<fromRoot.SharedState>,
      private dynamo: DynamoService,
      private fb: FormBuilder,
      private toastr: ToastrService
  ) {}

  ngOnInit() {
      // The class in the edit class state, see route guards
      this.subscriptions.push(
          this.store
              .pipe(
                  select(fromRoot.getSelectedClass),
                  filter(Boolean)
              )
              .subscribe((cls: Cls) => {
                  this.cls = { ...new Cls(), ...cls};

                  if (
                      typeof this.cls.icon === 'undefined' ||
                      isNaN(parseInt(this.cls.icon, 10))
                  ) {
                      this.cls.icon = '01';
                  }
              })
      );

    this.teacherEditForm = this.fb.group({
      clsName: [ this.cls.name, [
        Validators.required,
        Validators.minLength(MIN_NAME_LEN),
        Validators.maxLength(MAX_NAME_LEN)
      ] ],
      icon: [ this.cls.icon, [ Validators.required ] ],
      autoAssignEnabled: this.cls.auto_assign && this.cls.auto_assign.on || false,
      openCourse: [ { value: false, disabled: true} ],
      homework: null
    });
  }

  get f() {
    return this.teacherEditForm.controls;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  onSaveClass() {
    this.submitted = true;
    if (this.teacherEditForm.valid) {
      this.toastr.info('Saving changes...');
      this.store.dispatch(new fromClasses.EditClassAction());

      const autoAssignEnabled = this.teacherEditForm.value.autoAssignEnabled;
      if (this.cls.auto_assign) {
        this.cls.auto_assign.on = autoAssignEnabled;
      } else {
        this.cls.auto_assign = new AssignmentSchedulerConfig();
        this.cls.auto_assign.on = autoAssignEnabled;
        this.cls.auto_assign.days = [true, true, true, true, true, true];
        this.cls.auto_assign.time = 7;
      }

      tblClasses
        .update(this.dynamo.getDB(), this.cls.username, this.cls.code, {
          clsName: this.teacherEditForm.value.clsName,
          iconId: this.teacherEditForm.value.icon,
          autoAssign: this.cls.auto_assign
        })
        .then(result => {
          this.toastr.clear();
          this.submitted = false;
          this.cls.name = this.teacherEditForm.value.clsName;
          this.cls.icon = this.teacherEditForm.value.icon;
          this.store.dispatch(
            new fromClasses.EditClassSuccessAction(this.cls)
          );
          this.toastr.success('Changes saved', null, { timeOut: 2000} );
        })
        .catch(err => {
          this.submitted = false;
          this.store.dispatch(
            new fromClasses.EditClassFailedAction('failed')
          );
          throw err; // goes to error page
        });
    }
  }

  onSelectIcon(iconID) {
      this.cls.icon = iconID;

      this.teacherEditForm.patchValue({
        icon: iconID
      });
  }

  // qrValue(cls: Cl4ss): string {
  //   return `http://get.study.cat/?code=${cls.code}`;
  // }

  // 01 ... 13
  mascotIds(): string[] {
      return Array.from(Array(13).keys())
          .map(idx => ('00' + idx).slice(-2));
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';

import { Store, select } from '@ngrx/store';
import { filter } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { ClassesService } from '../../services/classes.service';
import { Cls, AssignmentSchedulerConfig } from '@shared/types';
import { FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';

import * as fromRoot from '../../../shared/store';
import * as tblClasses from '@shared/database/tables/classes';
import { ToastrService } from 'ngx-toastr';
import { DynamoService } from '../../../shared/services/dynamo.service';

@Component({
  selector: 'app-class-scheduler-settings',
  templateUrl: './class-scheduler-settings.component.html',
  styleUrls: ['./class-scheduler-settings.component.scss']
})
export class ClassSchedulerSettingsComponent implements OnInit, OnDestroy {

  public cls: Cls;
  public saving: boolean;
  public current_icon: string;
  public scheduleForm: FormGroup;
  public hours = Array.from(
    Array(24).keys(), x => {
      return { txt: `${x.toString().padStart(2, '0')}:00`, val: x }
    }); // {txt: '00:00', val:0}..{txt: '23:00', val: 24 }
  public daysSource =
    ['Monday', 'Tuesday', 'Wednesday',
     'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => {
       return {txt: d, checked: false};
     }); // [ {txt: 'Monday', checked: false}, .... ]
  public afternoon = 16;
  public morning = 7;

  private subscriptions = [];

  constructor(private store: Store<fromRoot.SharedState>,
              private classes: ClassesService,
              private router: Router,
              private toastr: ToastrService,
              private dynamo: DynamoService,
              private fb: FormBuilder) {}

  goBack(): void {
    this.router.navigate([ '../../' ]);
  }

  onChanges() {
  }

  ngOnInit() {

    this.scheduleForm = this.fb.group({
      days: this.fb.array(this.daysSource.map(d => this.fb.control(d.checked))),
      time: [ 'morning' ],
      hourInput: [ null, [Validators.max(24), Validators.min(0)] ]
    });

    this.onChanges();

    this.subscriptions.push(
      this.scheduleForm.get('time').valueChanges.subscribe(value => {
          this.scheduleForm.get('hourInput').setValue(0);
          if (value !== 'custom-time') {
            this.scheduleForm.get('hourInput').reset();
            this.scheduleForm.get('hourInput').disable();
          } else {
            this.scheduleForm.get('hourInput').enable();
          }
        })
    );

    this.subscriptions.push(
      this.store.pipe(
        select(fromRoot.getSelectedClass),
        filter(Boolean)
      ).subscribe((cls: Cls) => {
        this.cls = cls;
        if (cls.auto_assign && cls.auto_assign.on) {
          if (cls.auto_assign.days && cls.auto_assign.days.length ) {
            this.days.controls.forEach((c, i) => {
              if (i <= cls.auto_assign.days.length) {
                c.setValue(cls.auto_assign.days[i]);
              }
            });
          }

          if (cls.auto_assign.time) {
            this.scheduleForm.get('hourInput').setValue(cls.auto_assign.time || 0);
            switch (cls.auto_assign.time) {
              case this.morning:
                this.scheduleForm.get('time').setValue('morning');
                this.scheduleForm.get('hourInput').setValue(0);
                break;
              case this.afternoon:
                this.scheduleForm.get('time').setValue('afternoon');
                this.scheduleForm.get('hourInput').setValue(0);
                break;
              default:
                this.scheduleForm.get('time').setValue('custom-time');
                this.scheduleForm.get('hourInput').setValue(cls.auto_assign.time);
            }
          }
        } else {
          this.scheduleForm.get('hourInput').setValue(0);
        }
      })
    );

    this.subscriptions.push(
      this.store.pipe(
        select(fromRoot.getClassesLoading)
      ).subscribe(loading => this.saving = loading)
    );
  }

  get days(): FormArray {
    return this.scheduleForm.get('days') as FormArray;
  }

  show() {
    console.log(this.scheduleForm.controls.time.value);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  onSave() {
    if (this.scheduleForm.valid) {
      const config = new AssignmentSchedulerConfig();
      config.on = true; // redundant? theres an on/off toggle per day of week.
      config.days = this.days.value;

      switch (this.scheduleForm.get('time').value) {
        case 'morning':
          config.time = 7;
          break;
        case 'afternoon':
          config.time = 16;
          break;
        default:
          config.time = this.scheduleForm.get('hourInput').value;
      }

      this.toastr.info('Saving changes...');
      this.classes.updateAutoAssignmentConfig(
        this.cls,
        config
      ).then(() => this.toastr.info('Changes saved.'));
    }
  }
}


import { Component, OnDestroy, OnInit } from '@angular/core';

import * as fromRoot from '../../../shared/store/index';
import * as fromClasses from '../../../shared/store/classes';
import { Curriculum } from '../../../shared/types';
import { Store } from '@ngrx/store';
import { ClassesService } from '../../services/classes.service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../shared/services/product.service';
import { CurriculumService } from '../../../shared/services/curriculum.service';
import { filter, tap } from 'rxjs/internal/operators';
import { MAX_NAME_LEN, MIN_NAME_LEN } from '../../../shared/utils';
import { Cls, ProductNames } from '@shared/types';
import { ClassExistsError } from '@shared/types/errors';

// import { LoadAction } from '../../../shared/store/classes';

@Component({
  selector: 'app-teacher-class-create',
  templateUrl: 'class-create.component.html',
  styleUrls: [ 'class-create.component.scss' ]
})
export class ClassCreateComponent implements OnInit, OnDestroy {

  // private saving: Observable<boolean>;
  // private error: Observable<any>;
  public busy: boolean;
  public current_icon: number;
  public cls: Cls;
  public classForm: FormGroup;
  public curricula: Curriculum[];
  public exists = false;

  private subscriptions = [];
  private productName: ProductNames;
  public submitted = false;

  constructor(private store: Store<fromRoot.SharedState>,
              private classService: ClassesService,
              private router: Router,
              private route: ActivatedRoute,
              private curriculum: CurriculumService,
              private product: ProductService,
              private fb: FormBuilder) {
  }

  ngOnInit() {
    // watch the loading flag on the classes state in the state store
    // this.saving = this.store.select(fromRoot.getClassesLoading);

    // this.error = this.store.select(fromRoot.getClassesError);

    this.classForm = this.fb.group({
      clsName: [ '', [
        Validators.required,
        Validators.minLength(MIN_NAME_LEN),
        Validators.maxLength(MAX_NAME_LEN)
      ] ],
      level: [ '', [ Validators.required ] ],
      icon: [ '', [ Validators.required ] ]
    });

    this.cls = new Cls();
    this.cls.icon = '01';
    this.current_icon = 1;

    this.subscriptions.push(
      this.product.name$.pipe(
        tap(name => console.log(' Curr name .............', name)),
        filter(name => name !== ProductNames.NONE)
      ).subscribe(
        name => {
          this.productName = name;
          this.curricula = this.curriculum.getCurriculums(name);
        })
    );
  }

  get f() {
    return this.classForm.controls;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  createClass() {
    this.submitted = true;

    if (this.classForm.valid) {
      this.busy = true;

      console.log(this.classForm);
      const icon = '00'.substring(this.current_icon.toString().length) + this.current_icon;

      this.store.dispatch(new fromClasses.LoadAction());
      this.classService.create(
          this.classForm.value.clsName.trim(),
          icon,
          this.classForm.value.level
      ).then(cls => {
          console.log(cls);
          // this.store.dispatch(new AlertsPushAction(new AlertSuccess('Class Created.')));
          // this.store.dispatch(new routerActions.Go({ path: [ '/teacher/class', cls.code ] }));
          this.busy = false;
          this.goBack();
      }).catch(err => {
        if (err instanceof ClassExistsError) {
            this.busy = false;
            this.exists = true;
        } else {
          throw err;
        }
      });
    }
  }

  onSelectIcon(iconID) {
    this.cls.icon = iconID;
    this.current_icon = iconID;

    this.classForm.patchValue({
      'icon': iconID,
    });
  }

  mascotIds(): string[] {
    return Array.from(Array(13).keys())
      .map(idx => ('00' + idx).slice(-2));
  }

  goBack() {
    //  from /class/create ../../ to /
    this.router.navigate([ '../../' ], { relativeTo: this.route });
  }
}

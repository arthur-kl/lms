import { Component, OnDestroy, OnInit } from '@angular/core';
import { ClassesService } from '../../services/classes.service';
import { Store } from '@ngrx/store';

import * as fromRoot from '../../../shared/store';
import { Cls, IProfile } from '@shared/types';
import { ActivatedRoute, Router } from '@angular/router';
import { EnrollService } from '../../../enroll/services/enroll.service';
import { ProductService } from '../../../shared/services/product.service';



@Component({
  selector: 'app-class-invite',
  templateUrl: './class-invite.component.html',
  styleUrls: [ './class-invite.component.scss' ]
})
export class ClassInviteComponent implements OnInit, OnDestroy {

  public cls: Cls;
  public enrollURL: string;
  public profile: IProfile;
  private subscriptions = [];

  constructor(private store: Store<fromRoot.SharedState>,
              private classes: ClassesService,
              private enroll: EnrollService,
              private router: Router,
              private route: ActivatedRoute,
              public product: ProductService) {
  }

  ngOnInit() {
    this.subscriptions.push(
      this.store.select(fromRoot.getSelectedClass)
        .subscribe(cls => {
          this.cls = cls;
          this.enrollURL = this.enroll.getClassInviteLink(this.cls);
        })
    );

    this.subscriptions.push( 
      this.store.select(fromRoot.getProfile)
        .subscribe((profile: IProfile) => {
          this.profile = profile;
        })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  onDoneClick() {
    this.router.navigate(['../..', this.cls.code, 'students'], {relativeTo: this.route});
  }

  showAlert(copiedMsg: string) {
    console.log(copiedMsg);
    window.alert(copiedMsg);
  }
}

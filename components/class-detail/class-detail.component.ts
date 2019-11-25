import { Component, OnDestroy, OnInit, Inject, LOCALE_ID } from '@angular/core';

import { Store, select } from '@ngrx/store';

import * as fromRoot from '../../../shared/store/index';
import { Cls } from '@shared/types';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilsService } from '../../../shared/services/utils.service';
import { map } from 'rxjs/operators';


@Component({
  selector: 'app-class-detail',
  templateUrl: 'class-detail.component.html',
  styleUrls: [ 'class-detail.component.scss' ]
})

export class ClassDetailComponent implements OnInit, OnDestroy {

  public cls: Cls;
  public cls$: Observable<Cls>;

  private subscriptions = [];

  constructor(private store: Store<fromRoot.SharedState>,
              private router: Router,
              private utils: UtilsService,
              private route: ActivatedRoute,
              @Inject(LOCALE_ID) public locale: string
  ) {

    this.utils.setMomentLocale();
  }

  goBack(): void {
    this.router.navigate([ '../../../' ], { relativeTo: this.route });
  }

  ngOnInit() {
    // to give the ui components a way to receive updates on class changes in store
    this.cls$ = this.store.pipe(select(fromRoot.getSelectedClass));

    // Watch the selected class for changes
    // and send updated row events when anything on the selected class changes
    this.subscriptions.push(
      this.cls$.subscribe(cls => {
        this.cls = cls;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  get canShowSettings(): Observable<boolean> {
    return this.store.pipe(select(fromRoot.allowClassSettings));
  }

  get disableInvite(): Observable<boolean> {
    return this.store.pipe(select(fromRoot.isDemoProfile));
  }
}

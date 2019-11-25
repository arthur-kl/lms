import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeacherRoutingModule } from './teacher-routing.module';
import { select, Store, StoreModule } from '@ngrx/store';
import { FormsModule } from '@angular/forms';

import { reducers } from '../shared/store';
import { ClassesListComponent } from './components/classes-list/classes-list.component';
import { SharedModule } from '../shared/shared.module';
import { ClassCreateComponent } from './components/class-create/class-create.component';
import { ClassDetailComponent } from './components/class-detail/class-detail.component';
import { ClassInviteComponent } from './components/class-invite/class-invite.component';
import { TeacherCurriculumComponent } from './components/teacher-curriculum/teacher-curriculum.component';
import { TeacherModuleComponent } from './components/teacher-module/teacher-module.component';
import { ChartsModule } from 'ng2-charts';
import { StudentSelectedGuard } from './guards/student-selected-guard';
import { TeacherDeleteClassComponent } from './components/teacher-delete-class/teacher-delete-class.component';
import { TeacherEditClassComponent } from './components/teacher-edit-class/teacher-edit-class.component';
import { ClipboardModule } from 'ngx-clipboard';
import { DeleteStudentComponent } from './components/delete-student/delete-student.component';
import { RouterModule } from '@angular/router';
import { TeacherSelectedGuard } from './guards/teacher-selected.guard';
import { TeachersLoadedGuard } from './guards/teacher-loaded.guard';

import * as fromRoot from '../shared/store';
import * as fromLoading from '../shared/store/loading';
import { filter, tap } from 'rxjs/operators';
import { ClassSchedulerSettingsComponent } from './components/class-scheduler-settings/class-scheduler-settings.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ChartsModule,
    ClipboardModule,
    RouterModule,
    FormsModule,
    TeacherRoutingModule,
    StoreModule.forFeature('teacher', reducers)
  ],
  declarations: [
    ClassesListComponent,
    ClassCreateComponent,
    ClassDetailComponent,
    ClassInviteComponent,
    DeleteStudentComponent,
    TeacherCurriculumComponent,
    TeacherModuleComponent,
    TeacherDeleteClassComponent,
    TeacherEditClassComponent,
    ClassSchedulerSettingsComponent,
  ],
  providers: [
    StudentSelectedGuard,
    TeachersLoadedGuard,
    TeacherSelectedGuard
  ]
})
export class TeacherModule {
  constructor(private store: Store<fromRoot.SharedState>) {
    this.store.pipe(
      select(fromRoot.getLoadingModalMessages),
      filter(messages => messages.findIndex(m => m === fromLoading.loadingMessages.loadingTeacherModule) >= 0),
      tap(() => this.store.dispatch(new fromLoading.RemoveLoadingTeacherModuleMessageModal()))
    ).subscribe();
  }
}


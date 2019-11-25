import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProfileLoadedGuard } from '../shared/guards/profile-loaded.guard';
import { ClassesListComponent } from './components/classes-list/classes-list.component';
import { ClassCreateComponent } from './components/class-create/class-create.component';
import { ClassesLoadedGuard } from './guards/classes-loaded.guard';
import { ClassDetailComponent } from './components/class-detail/class-detail.component';
import { ClassSelectedGuard } from '../shared/guards/class-selected.guard';
import { ClassInviteComponent } from './components/class-invite/class-invite.component';
import { IsTeacherGuard } from '../shared/guards/IsTeacher.guard';
import { TeacherCurriculumComponent } from './components/teacher-curriculum/teacher-curriculum.component';
import { TeacherModuleComponent } from './components/teacher-module/teacher-module.component';
import { StudentSelectedGuard } from './guards/student-selected-guard';
import { TeacherDeleteClassComponent } from './components/teacher-delete-class/teacher-delete-class.component';
import { TeacherEditClassComponent } from './components/teacher-edit-class/teacher-edit-class.component';
import { HasLocalIdGuard } from '../shared/guards/has-local-id.guard';
import { DeleteStudentComponent } from './components/delete-student/delete-student.component';
import { TeachersLoadedGuard } from './guards/teacher-loaded.guard';
import { TeacherSelectedGuard } from './guards/teacher-selected.guard';
import { StudentEditComponent } from '../shared/components/student-edit/student-edit.component';
import { StudentChangePasswordComponent } from '../shared/components/studen-change-password/student-change-password.component';
import { StudentDetailComponent } from '../shared/components/student-detail/student-detail.component';
import { TeacherEditComponent } from '../shared/components/teacher-edit/teacher-edit.component';
import {ClassSchedulerSettingsComponent} from "./components/class-scheduler-settings/class-scheduler-settings.component";

const routes: Routes = [
  // { path: 'enrol/:grp-name/:school-name/:username', component: EnroleComponent, resolve: { 'teacher': TeacherResolver } },
  {
    path: '',
    canActivateChild: [ HasLocalIdGuard, ProfileLoadedGuard, IsTeacherGuard, TeachersLoadedGuard, TeacherSelectedGuard],
    children: [
      { path: '', component: ClassesListComponent, canActivate: [ ClassesLoadedGuard ] },
      { path: 'class/create', component: ClassCreateComponent },
      {
        path: 'class/:code/students',
        component: ClassDetailComponent,
        canActivate: [ ClassesLoadedGuard, ClassSelectedGuard ]
      },
      {
        path: 'class/:code/invite',
        component: ClassInviteComponent,
        canActivate: [ ClassesLoadedGuard, ClassSelectedGuard ]
      },
      {
        path: 'class/:code/course',
        component: TeacherCurriculumComponent,
        canActivate: [ ClassesLoadedGuard, ClassSelectedGuard ]

      },
      {
        path: 'class/:code/course/:unitName/:moduleName',
        component: TeacherModuleComponent,
        canActivate: [ ClassesLoadedGuard, ClassSelectedGuard ]
      },
      {
        path: 'class/:code/delete',
        component: TeacherDeleteClassComponent,
        canActivate: [ ClassesLoadedGuard, ClassSelectedGuard ]
      },
      {
        path: 'class/:code/settings',
        component: TeacherEditClassComponent,
        canActivate: [ ClassesLoadedGuard, ClassSelectedGuard ]
      },
      {
        path: 'class/:code/scheduler',
        component: ClassSchedulerSettingsComponent,
        canActivate: [ ClassesLoadedGuard, ClassSelectedGuard ]
      },
      {
        path: 'edit',
        component: TeacherEditComponent,
        canActivate: [ TeachersLoadedGuard, TeacherSelectedGuard ]
      },

      // {
      //   path: 'teachers/delete/:username',
      //   component: TeacherDeleteComponent,
      //   canActivate: [ TeachersLoadedGuard, TeacherSelectedGuard ]
      // }
      {
        path: 'class/:code/students/:student_code',
        component: StudentDetailComponent,
        canActivate: [ ClassesLoadedGuard, ClassSelectedGuard, StudentSelectedGuard ]
      },
      {
        path: 'class/:code/students/:student_code/edit',
        component: StudentEditComponent,
        canActivate: [ ClassesLoadedGuard, ClassSelectedGuard, StudentSelectedGuard ]
      },
      {
        path: 'class/:code/students/:student_code/password',
        component: StudentChangePasswordComponent,
        canActivate: [ ClassesLoadedGuard, ClassSelectedGuard, StudentSelectedGuard ]
      },
      {
        path: 'class/:code/students/:student_code/delete',
        component: DeleteStudentComponent,
        canActivate: [ ClassesLoadedGuard, ClassSelectedGuard, StudentSelectedGuard ]
      },

    ]
  },
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})
export class TeacherRoutingModule {
}

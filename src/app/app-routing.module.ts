import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { HabitsComponent } from './habits/habits.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  { path: 'habits', component: HabitsComponent, canActivate: [AuthGuard] },
  { path: 'habits/:id', component: HabitsComponent, canActivate: [AuthGuard] },
  { path: 'habits/:id/:name', component: HabitsComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'habits', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

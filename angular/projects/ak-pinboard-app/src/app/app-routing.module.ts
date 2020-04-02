import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TestPageComponent } from './components/test-page/test-page.component';
import { CharaPageComponent } from './components/chara-page/chara-page.component';
import { OperatorListPageComponent } from './components/operator-list-page/operator-list-page.component';
import { OperatorDetailPageComponent } from './components/operator-detail-page/operator-detail-page.component';


const routes: Routes = [
  {
    path: '',
    redirectTo: '/operators',
    pathMatch: 'full'
  },
  {
    path: 'operators',
    component: OperatorListPageComponent
  },
  {
    path: 'operators/:charId',
    component: OperatorDetailPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }

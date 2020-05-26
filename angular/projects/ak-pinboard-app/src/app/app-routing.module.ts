import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OperatorListPageComponent } from './components/operator-list-page/operator-list-page.component';
import { OperatorDetailPageComponent } from './components/operator-detail-page/operator-detail-page.component';
import { OperatorPartyPageComponent } from './components/operator-party-page/operator-party-page.component';


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
  },
  {
    path: 'party',
    component: OperatorPartyPageComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
